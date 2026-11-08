/* Slash menu: a task field where typing "/" opens a command menu; picking a command inserts it.
 * Split out of document.tsx (Document input, ported from ~/Documents/Document input field
 * interaction / ChatInput.tsx). The paperclip and attachments live in attach.tsx.
 *
 *   type "/"     slash menu drops in (y -8→0, blur 6→0, scale .98→1, spring 0.28 / 0)   (open)
 *   rows         stagger in 25ms apart (y -4→0, blur 4→0); arrows move the highlight     (tick)
 *   accept       Enter, Tab or click: the command's text is inserted as a green token      (pop)
 *   Esc          menu folds away (y 2, blur 4, 180ms)                                      (close)
 *   typing       each key                                                                  (key)
 *
 * Idle, the field shows a blinking caret and "Type /" so it reads as something to type into. */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type KeyboardEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { play } from "../sound/sound";

const SPRING_CARD = { type: "spring" as const, visualDuration: 0.4, bounce: 0.16 };
const SPRING_DROP = { type: "spring" as const, visualDuration: 0.28, bounce: 0 };
const EASE_CONTEXTUAL = [0.2, 0, 0, 1] as const;

const TOKEN_COLOR = "#34b562";
const MAX_LINES_H = 72;

const T = { text: "#e3e8e3", sub: "#c2cbc4", muted: "#8b968f", faint: "#5d6862" };
const RAISED = "linear-gradient(180deg,#2b2d2b,#242624)";
const RAISED_SHADOW = "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)";
const FOCUS_SHADOW = "inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(0,0,0,.55), 0 0 0 4px rgba(255,255,255,.035), 0 1px 2px rgba(0,0,0,.45), 0 10px 24px -8px rgba(0,0,0,.55)";

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (d: Date) => `${DAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

type Command = { key: string; label: string; hint: string; icon: "date" | "name" | "file"; insert: () => string };
const COMMANDS: Command[] = [
  { key: "today", label: "/today", hint: "Insert today's date", icon: "date", insert: () => formatDate(new Date()) },
  { key: "tomorrow", label: "/tomorrow", hint: "Insert tomorrow", icon: "date", insert: () => formatDate(addDays(new Date(), 1)) },
  { key: "assign", label: "/assign", hint: "Alex Rivera", icon: "name", insert: () => "Alex Rivera" },
  { key: "file", label: "/file", hint: "Attach a document", icon: "file", insert: () => "Brief.pdf" },
];
// natural sizes for fitting: the card and the menu with every row
const CARD_H = 52;
const MENU_H = 10 + COMMANDS.length * 29;
const DROP_GAP = 8;

function getCurrentWord(text: string, caret: number) {
  const left = text.slice(0, caret);
  const startMatch = left.match(/(\S+)$/);
  const start = startMatch ? caret - startMatch[1].length : caret;
  const endMatch = text.slice(caret).match(/^(\S*)/);
  const end = caret + (endMatch ? endMatch[0].length : 0);
  return { word: text.slice(start, end), start, end };
}
function findCommands(word: string): Command[] {
  if (!word.startsWith("/")) return [];
  const w = word.slice(1).toLowerCase();
  return COMMANDS.filter((c) => c.key.startsWith(w));
}

const AVATAR = "linear-gradient(135deg, #bae6fd 0%, #0ea5e9 100%)";

/* ─── tokens ─── */
type Token = { id: string; value: string; start: number };
let tokenIdSeq = 0;
const newTokenId = () => `t${++tokenIdSeq}`;

function diffEdit(prev: string, next: string) {
  let i = 0;
  const minLen = Math.min(prev.length, next.length);
  while (i < minLen && prev[i] === next[i]) i++;
  let j = 0;
  const maxJ = Math.min(prev.length - i, next.length - i);
  while (j < maxJ && prev[prev.length - 1 - j] === next[next.length - 1 - j]) j++;
  return { start: i, deleted: prev.length - i - j, inserted: next.length - i - j };
}
function shiftTokens(tokens: Token[], edit: { start: number; deleted: number; inserted: number }): Token[] {
  const editEnd = edit.start + edit.deleted;
  const delta = edit.inserted - edit.deleted;
  const out: Token[] = [];
  for (const t of tokens) {
    const tEnd = t.start + t.value.length;
    if (editEnd <= t.start) out.push({ ...t, start: t.start + delta });
    else if (edit.start >= tEnd) out.push(t);
  }
  return out;
}
type Segment = { text: string; token?: Token };
function buildSegments(text: string, tokens: Token[]): Segment[] {
  const valid = tokens.filter((t) => text.slice(t.start, t.start + t.value.length) === t.value).sort((a, b) => a.start - b.start);
  const segs: Segment[] = [];
  let i = 0;
  for (const t of valid) {
    if (t.start < i) continue;
    if (t.start > i) segs.push({ text: text.slice(i, t.start) });
    segs.push({ text: t.value, token: t });
    i = t.start + t.value.length;
  }
  if (i < text.length) segs.push({ text: text.slice(i) });
  return segs;
}

function CalendarIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={size} height={size} aria-hidden="true">
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 7h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function ImageIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width={size} height={size} aria-hidden="true">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="6" cy="6" r="1.1" fill="currentColor" />
      <path d="M3 11.5l3-3 2.5 2.5L11 8l2 2v2.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
    </svg>
  );
}

const TEXT_STYLE = { fontSize: 15, lineHeight: "24px", letterSpacing: "-0.09px", fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0" } as const;

const CSS = `
.slash-btn { appearance: none; border: 0; margin: 0; padding: 0; font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.slash-btn:focus-visible { outline: 2px solid rgba(52,181,98,.7); outline-offset: 2px; }
.slash-ta { scrollbar-width: none; }
.slash-ta::-webkit-scrollbar { display: none; }
.slash-ta::placeholder { color: transparent; }
.slash-resize { transition: height 300ms cubic-bezier(0.22, 1, 0.36, 1); will-change: height; }
.slash-row { transition: background-color 150ms ease-out; }
.slash-caret { display: inline-block; width: 1.5px; height: 18px; margin-right: 3px; vertical-align: -3px; background: ${TOKEN_COLOR}; border-radius: 1px; animation: slash-blink 1.06s steps(1) infinite; }
.slash-kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 18px; height: 20px; padding: 0 5px; margin: 0 3px; border-radius: 5px; font-size: 13px; line-height: 20px; color: ${T.sub}; background: rgba(255,255,255,.06); box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); vertical-align: 1px; }
@keyframes slash-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .slash-resize, .slash-row { transition: none !important; } .slash-caret { animation: none; } }`;

function useBox(ref: React.RefObject<HTMLDivElement | null>) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([en]) => setBox({ w: en.contentRect.width, h: en.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return box;
}

export default function SlashMenu({ size = "card" }: { size?: "card" | "big" }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useBox(rootRef);
  // the card sits centred; when the box is too short for the open menu below it, the card is
  // scaled and lifted just enough that the full menu still lands inside the box
  const natH = CARD_H + DROP_GAP + MENU_H;
  const base = size === "big" ? 1.45 : 1;
  const scale = box.h ? Math.max(0.5, Math.min(base, (box.h - 40) / natH)) : base;
  const lift = box.h ? Math.max(0, box.h / 2 + (CARD_H / 2 + DROP_GAP + MENU_H) * scale - (box.h - 12)) : 0;
  const width = Math.min(400, Math.max(240, (box.w || 400) / scale - 48));

  const [value, setValue] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [caret, setCaret] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [wrapperHeight, setWrapperHeight] = useState(24);
  const [dropdownLeft, setDropdownLeft] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const wordMarkerRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const hasText = value.length > 0;

  const currentWord = useMemo(() => getCurrentWord(value, caret), [value, caret]);
  const suggestions = useMemo(() => (!isFocused || dismissed ? [] : findCommands(currentWord.word)), [currentWord.word, isFocused, dismissed]);
  const showDropdown = suggestions.length > 0;
  const segments = useMemo(() => buildSegments(value, tokens), [value, tokens]);

  useEffect(() => { setActiveIdx(0); }, [suggestions.length, currentWord.word]);
  useEffect(() => { setDismissed(false); }, [currentWord.word]);

  useLayoutEffect(() => {
    const el = mirrorRef.current;
    if (!el) return;
    const next = Math.min(MAX_LINES_H, Math.max(24, el.offsetHeight));
    setWrapperHeight((p) => (p === next ? p : next));
  });

  useLayoutEffect(() => {
    if (!showDropdown) return;
    const marker = wordMarkerRef.current;
    const container = containerRef.current;
    if (!marker || !container) return;
    const left = Math.max(0, Math.min((marker.getBoundingClientRect().left - container.getBoundingClientRect().left) / scale, container.offsetWidth - 260));
    setDropdownLeft((p) => (p === left ? p : left));
  });

  const syncMirrorScroll = useCallback(() => { const el = textareaRef.current; if (el) setScrollTop(el.scrollTop); }, []);
  const syncCaret = useCallback(() => {
    const el = textareaRef.current;
    if (el) setCaret(el.selectionStart ?? 0);
    syncMirrorScroll();
  }, [syncMirrorScroll]);

  const handleChange = useCallback((next: string) => {
    const edit = diffEdit(value, next);
    // "/" opening the menu gets the open cue; any other keystroke a key press
    const typedSlash = edit.inserted === 1 && next[edit.start] === "/" && (edit.start === 0 || /\s/.test(next[edit.start - 1]));
    play(typedSlash ? "open" : "key", typedSlash ? {} : { gap: 30 });
    setValue(next);
    setTokens((toks) => shiftTokens(toks, edit));
    queueMicrotask(syncCaret);
  }, [value, syncCaret]);

  const acceptSuggestion = useCallback((c: Command) => {
    const { start, end } = currentWord;
    const insert = c.insert();
    play("pop");
    const next = value.slice(0, start) + insert + " " + value.slice(end);
    const nextCaret = start + insert.length + 1;
    const shifted = shiftTokens(tokens, diffEdit(value, next));
    setValue(next);
    setTokens([...shifted, { id: newTokenId(), value: insert, start }]);
    setDismissed(true);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(nextCaret, nextCaret);
      setCaret(nextCaret);
      setDismissed(false);
      syncMirrorScroll();
    });
  }, [currentWord, value, tokens, syncMirrorScroll]);

  const handleKeyDown = (ev: KeyboardEvent<HTMLTextAreaElement>) => {
    ev.stopPropagation();
    if (showDropdown) {
      if (ev.key === "ArrowDown") { ev.preventDefault(); play("tick", { gap: 40 }); setActiveIdx((i) => (i + 1) % suggestions.length); return; }
      if (ev.key === "ArrowUp") { ev.preventDefault(); play("tick", { gap: 40 }); setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length); return; }
      if (ev.key === "Enter" || ev.key === "Tab") { ev.preventDefault(); acceptSuggestion(suggestions[activeIdx]); return; }
      if (ev.key === "Escape") { ev.preventDefault(); play("close"); setDismissed(true); return; }
    }
    if (ev.key === "Enter" && !ev.nativeEvent.isComposing) ev.preventDefault();
  };

  return (
    <div ref={rootRef} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <style>{CSS}</style>
      <div style={{ transform: `translateY(${-lift}px) scale(${scale})` }}>
        <div ref={containerRef} data-own-click style={{ position: "relative", width, pointerEvents: "auto", color: T.text }}>
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                key="dropdown"
                role="listbox"
                aria-label="Commands"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(6px)", scale: 0.98 }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 2, filter: "blur(4px)", scale: 0.99, transition: { duration: 0.18, ease: EASE_CONTEXTUAL } }}
                transition={SPRING_DROP}
                style={{
                  position: "absolute", left: dropdownLeft, top: (containerRef.current?.offsetHeight ?? CARD_H) + DROP_GAP, transformOrigin: "top left", zIndex: 20,
                  width: 260, maxWidth: "100%", background: RAISED, borderRadius: 12, padding: 5, boxShadow: `${RAISED_SHADOW}, 0 14px 32px -8px rgba(0,0,0,.6)`,
                }}
              >
                <ul style={{ display: "flex", flexDirection: "column", gap: 1, margin: 0, padding: 0 }}>
                  {suggestions.map((c, i) => (
                    <CommandRow key={c.key} command={c} active={i === activeIdx} index={i} reduceMotion={!!reduceMotion}
                      onHover={() => setActiveIdx(i)} onSelect={() => acceptSuggestion(c)} />
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={SPRING_CARD}
            onClick={() => textareaRef.current?.focus()}
            style={{
              position: "relative", background: RAISED, borderRadius: 19, padding: "14px 14px", overflow: "hidden", cursor: "text",
              boxShadow: isFocused ? `${FOCUS_SHADOW}, 0 0 0 1.5px rgba(52,181,98,.45)` : FOCUS_SHADOW, transition: "box-shadow 300ms ease-out",
            }}
          >
            <div className="slash-resize" style={{ position: "relative", width: "100%", overflow: "hidden", height: wrapperHeight }}>
              {!hasText && (
                <span aria-hidden="true" style={{ ...TEXT_STYLE, position: "absolute", top: 0, left: 4, color: T.faint, userSelect: "none", pointerEvents: "none", whiteSpace: "pre" }}>
                  {!isFocused && <span className="slash-caret" />}Type<span className="slash-kbd">/</span>for commands
                </span>
              )}
              <div style={{ transform: `translate3d(0, ${-scrollTop}px, 0)`, willChange: "transform" }}>
                <div ref={mirrorRef} aria-hidden="true" style={{ ...TEXT_STYLE, whiteSpace: "pre-wrap", overflowWrap: "break-word", padding: "0 4px", color: T.text, minHeight: 24 }}>
                  {segments.map((seg, i) => seg.token ? <span key={i} style={{ color: TOKEN_COLOR }}>{seg.text}</span> : <span key={i}>{seg.text}</span>)}
                  {value.endsWith("\n") && "​"}
                </div>
                {showDropdown && (
                  <div aria-hidden="true" style={{ ...TEXT_STYLE, position: "absolute", top: 0, left: 0, right: 0, whiteSpace: "pre-wrap", overflowWrap: "break-word", padding: "0 4px", pointerEvents: "none", visibility: "hidden" }}>
                    {value.slice(0, currentWord.start)}
                    <span ref={wordMarkerRef} style={{ display: "inline-block", width: 0 }} />
                  </div>
                )}
              </div>
              <textarea
                ref={textareaRef}
                className="slash-ta"
                rows={1}
                role="combobox"
                aria-expanded={showDropdown}
                aria-autocomplete="list"
                aria-label="Type / for commands"
                value={value}
                onChange={(ev) => handleChange(ev.target.value)}
                onFocus={() => { setIsFocused(true); syncCaret(); }}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                onKeyUp={syncCaret}
                onClick={syncCaret}
                onSelect={syncCaret}
                onScroll={syncMirrorScroll}
                spellCheck={false}
                autoComplete="off"
                style={{
                  ...TEXT_STYLE, position: "absolute", inset: 0, zIndex: 1, width: "100%", height: "100%", background: "transparent", border: 0,
                  padding: "0 4px", margin: 0, resize: "none", outline: "none", whiteSpace: "pre-wrap", overflowWrap: "break-word",
                  overflowY: "auto", overflowX: "hidden", fontFamily: "inherit",
                  color: "transparent", WebkitTextFillColor: "transparent", caretColor: TOKEN_COLOR,
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── command row ─── */
function CommandRow({ command, active, index, reduceMotion, onHover, onSelect }: {
  command: Command; active: boolean; index: number; reduceMotion: boolean; onHover: () => void; onSelect: () => void;
}) {
  const chip = { width: 20, height: 20, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as const;
  return (
    <motion.li
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: 0.03 + index * 0.025, type: "spring", visualDuration: 0.3, bounce: 0 }}
      style={{ listStyle: "none" }}
    >
      <button type="button" role="option" aria-selected={active} className="slash-btn slash-row"
        onMouseEnter={onHover} onMouseDown={(ev) => ev.preventDefault()} onClick={onSelect}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "5px 8px", borderRadius: 8, textAlign: "left", background: active ? "rgba(255,255,255,.06)" : "transparent" }}>
        {command.icon === "name" ? (
          <span aria-hidden="true" style={{ ...chip, fontSize: 9, fontWeight: 600, color: "#fff", backgroundImage: AVATAR }}>AR</span>
        ) : (
          <span aria-hidden="true" style={{ ...chip, background: "rgba(255,255,255,.06)", color: T.sub, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)" }}>
            {command.icon === "date" ? <CalendarIcon size={11} /> : <ImageIcon size={11} />}
          </span>
        )}
        <span style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: "18px", letterSpacing: "-0.09px", color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{command.label}</span>
        <span style={{ fontSize: 12, lineHeight: "16px", color: T.muted, fontVariantNumeric: "tabular-nums", flexShrink: 0, whiteSpace: "nowrap" }}>{command.hint}</span>
      </button>
    </motion.li>
  );
}
