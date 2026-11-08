/* Document input: a task input that takes images and documents, with attachments animating in.
 * Ported from ~/Documents/Document input field interaction (ChatInput.tsx).
 *
 *   type "/"     slash menu opens (/file)        accept → file picker
 *   paperclip    adds a sample attachment (works without picking a file)
 *   tile mounts  scale 0.85→1, blur 8→0, y -4→0 (spring 0.42 / 0.18)
 *   uploading    progressive blur clears (12→0), saturation 30→100,
 *                shimmer sweep on top, ring fills clockwise (1400ms)
 *   ready        ring pops into a close button (popLayout, spring 0.32 / 0.32)
 *   close        tile collapses (scale 0.85, opacity 0, blur 6, 180ms)
 *   names/dates  "Al…", "tomorrow", "Friday" suggest; accepted ones are highlighted tokens
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type ChangeEvent, type KeyboardEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from "react";

const SPRING_CARD = { type: "spring" as const, visualDuration: 0.4, bounce: 0.16 };
const SPRING_DROP = { type: "spring" as const, visualDuration: 0.28, bounce: 0 };
const SPRING_TILE = { type: "spring" as const, visualDuration: 0.42, bounce: 0.18 };
const SPRING_POP = { type: "spring" as const, visualDuration: 0.32, bounce: 0.32 };
const EASE_CONTEXTUAL = [0.2, 0, 0, 1] as const;

const MIN_TRIGGER_LEN = 2;
const MAX_RESULTS = 6;
const MAX_ATTACHMENTS = 4;
const TOKEN_COLOR = "#34b562";
const UPLOAD_DURATION_MS = 1400;

const T = { text: "#e3e8e3", sub: "#c2cbc4", muted: "#8b968f", faint: "#5d6862" };
const RAISED = "linear-gradient(180deg,#2b2d2b,#242624)";
const RAISED_SHADOW = "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)";
const FOCUS_SHADOW = "inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px rgba(0,0,0,.55), 0 0 0 4px rgba(255,255,255,.035), 0 1px 2px rgba(0,0,0,.45), 0 10px 24px -8px rgba(0,0,0,.55)";

const NAMES = [
  "Aaron Chen", "Adam Brooks", "Alex Rivera", "Alexander Lee", "Alice Park", "Amelia Garcia", "Andrew Smith", "Anna Patel",
  "Ava Reyes", "Benjamin Cole", "Bella Romano", "Caleb Foster", "Camila Souza", "Carlos Mendez", "Charlie Kim", "Charlotte Wells",
  "Chloe Bennett", "Daniel Kim", "David Nakamura", "Diego Alvarez", "Eleanor Hayes", "Elena Petrova", "Eli Cohen", "Eliza Wright",
  "Emily Carter", "Emma Johnson", "Ethan Brooks", "Eva Lindqvist", "Felix Müller", "Finn O’Connor", "Gabriel Silva", "Grace Liu",
  "Hannah Bauer", "Harper Ross", "Henry Walsh", "Hugo Lefèvre", "Ivy Tanaka", "Isaac Levi", "Isabella Romano", "Jack Murphy",
  "Jacob Stein", "James O’Brien", "Jane Holloway", "Jasmine Khan", "Jason Park", "John Bishop", "Jordan Reyes", "Joseph Diaz",
  "Julia Rossi", "Kai Tanaka", "Kate Sullivan", "Lily Andersen", "Liam Foster", "Lisa Park", "Lucas Moreau", "Luna Vidal",
  "Mateo Vargas", "Maya Iyer", "Mia Russo", "Mira Okafor", "Michael Brennan", "Nathan Greene", "Nina Petrov", "Noah Williams",
  "Nora Eriksen", "Oliver Hart", "Olivia Pearce", "Owen Walsh", "Penelope Cruz", "Peter Marsh", "Quinn Davies", "Rachel Adler",
  "Ruby Sato", "Sam Patel", "Samuel Greene", "Sara Ahmadi", "Sarah Chen", "Sebastian Cruz", "Sofia Martins", "Sophia Bernard",
  "Tara Mehta", "Theo Martin", "Thomas Engel", "Tyler Brooks", "Victoria Yates", "Violet Owens", "William Hayes", "Wyatt Bishop",
  "Yuki Tanaka", "Zara Aslam", "Zoe Whitaker",
] as const;
const RELATIVE_DATES = ["today", "tomorrow", "tonight", "yesterday", "this morning", "this afternoon", "this evening", "this weekend", "next week", "next month"] as const;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDate = (d: Date) => `${DAY_SHORT[d.getDay()]}, ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

function resolveDate(term: string): Date | null {
  const t = term.toLowerCase();
  const now = new Date();
  if (t === "today" || t === "tonight" || t === "this morning" || t === "this afternoon" || t === "this evening") return now;
  if (t === "tomorrow") return addDays(now, 1);
  if (t === "yesterday") return addDays(now, -1);
  if (t === "this weekend") return addDays(now, (6 - now.getDay() + 7) % 7 || 7);
  if (t === "next week") return addDays(now, 7);
  if (t === "next month") return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const idx = DAY_NAMES.findIndex((n) => n.toLowerCase() === t);
  if (idx !== -1) return addDays(now, (idx - now.getDay() + 7) % 7 || 7);
  return null;
}

type Suggestion = { type: "name" | "date" | "command"; key: string; label: string; hint?: string; insert?: string; command?: "file" };
const SLASH_COMMANDS: Suggestion[] = [{ type: "command", key: "cmd-file", label: "/file", hint: "Attach image or document", command: "file" }];

function getCurrentWord(text: string, caret: number) {
  const left = text.slice(0, caret);
  const startMatch = left.match(/(\S+)$/);
  const start = startMatch ? caret - startMatch[1].length : caret;
  const endMatch = text.slice(caret).match(/^(\S*)/);
  const end = caret + (endMatch ? endMatch[0].length : 0);
  return { word: text.slice(start, end), start, end };
}

function findSuggestions(word: string, max: number): Suggestion[] {
  if (word.startsWith("/")) {
    const w = word.slice(1).toLowerCase();
    return SLASH_COMMANDS.filter((c) => (c.command ?? "").startsWith(w));
  }
  if (word.length < MIN_TRIGGER_LEN) return [];
  const w = word.toLowerCase();
  if (/^[A-Z]/.test(word)) {
    const names: Suggestion[] = NAMES.filter((n) => n.toLowerCase().split(/\s+/).some((p) => p.startsWith(w)))
      .map((n) => ({ type: "name", key: `name-${n}`, insert: n, label: n }));
    const days: Suggestion[] = DAY_NAMES.filter((d) => d.toLowerCase().startsWith(w)).map((d) => {
      const r = resolveDate(d); const f = r ? formatDate(r) : d;
      return { type: "date", key: `date-${d}`, insert: f, label: d, hint: f };
    });
    return [...names, ...days].slice(0, max);
  }
  return RELATIVE_DATES.filter((d) => d.startsWith(w)).map((d): Suggestion => {
    const r = resolveDate(d); const f = r ? formatDate(r) : d;
    return { type: "date", key: `date-${d}`, insert: f, label: d, hint: f };
  }).slice(0, max);
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #fda4af 0%, #fb7185 100%)", "linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)",
  "linear-gradient(135deg, #a7f3d0 0%, #10b981 100%)", "linear-gradient(135deg, #bae6fd 0%, #0ea5e9 100%)",
  "linear-gradient(135deg, #ddd6fe 0%, #8b5cf6 100%)", "linear-gradient(135deg, #fbcfe8 0%, #ec4899 100%)",
];
function avatarGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[h];
}
const initials = (n: string) => n.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();

/* ─── tokens ─── */
type Token = { id: string; type: "name" | "date"; value: string; start: number };
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

/* ─── attachments ─── */
type Attachment = {
  id: string; kind: "image" | "doc"; url?: string; bg?: string; ext?: string; name: string;
  status: "uploading" | "ready"; progress: number; started: number;
};
let attachmentIdSeq = 0;
const newAttachmentId = () => `a${++attachmentIdSeq}`;

// sample files for the paperclip, drawn with gradients (no network assets)
const SAMPLES: Pick<Attachment, "kind" | "bg" | "ext" | "name">[] = [
  { kind: "image", name: "Sunset.jpg", bg: "radial-gradient(circle at 70% 72%, #ffd38a 0 13%, transparent 14%), linear-gradient(180deg, #2b1f4d 0%, #b5487a 55%, #f39c5a 78%, #3a2a3f 79%, #1d1826 100%)" },
  { kind: "doc", name: "Brief.pdf", ext: "PDF" },
  { kind: "image", name: "Dunes.jpg", bg: "radial-gradient(ellipse 70% 45% at 22% 100%, #8f4a2a 97%, transparent 100%), radial-gradient(ellipse 85% 58% at 88% 100%, #c06a3a 97%, transparent 100%), radial-gradient(circle at 70% 30%, #fff1c9 0 9%, transparent 10%), linear-gradient(180deg, #ffd9a0 0%, #f2a66a 75%)" },
  { kind: "image", name: "Studio.jpg", bg: "radial-gradient(circle at 35% 40%, #f4f0e6 0 16%, transparent 17%), radial-gradient(circle at 64% 58%, #34b562 0 20%, transparent 21%), linear-gradient(135deg, #3b3f3c, #1e201f)" },
  { kind: "doc", name: "Notes.docx", ext: "DOC" },
];

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
function ClipIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M13.5 6.5l-5.8 5.8a1.6 1.6 0 002.3 2.3l6-6a3.2 3.2 0 00-4.5-4.5l-6.2 6.2a4.8 4.8 0 006.8 6.8l5.4-5.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 11.667 12" width="12" height="12" fill="none" aria-hidden="true">
      <path d="M6.5835 2.871V12H5.0835V2.871L1.0605 6.894L0 5.8335L5.8335 0L11.667 5.8335L10.6065 6.894L6.5835 2.871Z" fill="currentColor" />
    </svg>
  );
}

const TEXT_STYLE = { fontSize: 15, lineHeight: "24px", letterSpacing: "-0.09px", fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0" } as const;

const CSS = `
.document-btn { appearance: none; border: 0; margin: 0; padding: 0; font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.document-btn:focus-visible { outline: 2px solid rgba(52,181,98,.7); outline-offset: 2px; }
.document-clip { width: 28px; height: 28px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: transparent; color: ${T.muted}; transition: background-color 150ms ease-out, color 150ms ease-out; position: relative; }
.document-clip::before { content: ''; position: absolute; inset: -6px; }
.document-clip:hover { background: rgba(255,255,255,.06); color: ${T.text}; }
.document-clip:active { transform: scale(0.92); }
.document-ta { scrollbar-width: none; }
.document-ta::-webkit-scrollbar { display: none; }
.document-ta::placeholder { color: transparent; }
.document-resize { transition: height 300ms cubic-bezier(0.22, 1, 0.36, 1); will-change: height; }
.document-row { transition: background-color 150ms ease-out; }
@media (prefers-reduced-motion: reduce) { .document-resize, .document-clip, .document-row { transition: none !important; } }`;

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

export default function DocumentInput({ size = "card" }: { size?: "card" | "big" }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useBox(rootRef);
  const scale = size === "big" ? 1.45 : 1;
  const width = Math.min(440, Math.max(240, (box.w || 440) / scale - 48));

  const [value, setValue] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [caret, setCaret] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [wrapperHeight, setWrapperHeight] = useState(24);
  const [cardHeight, setCardHeight] = useState(52);
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const wordMarkerRef = useRef<HTMLSpanElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<number | null>(null);
  const sampleIdx = useRef(0);
  const lastAddRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const hasText = value.trim().length > 0;

  // the menu drops below the card: fit as many rows (29px each) as the box has room for
  const maxRows = box.h ? Math.max(1, Math.min(MAX_RESULTS, Math.floor(((box.h / scale - cardHeight) / 2 - 8 - 12) / 29))) : MAX_RESULTS;

  const currentWord = useMemo(() => getCurrentWord(value, caret), [value, caret]);
  const suggestions = useMemo(() => (!isFocused || dismissed ? [] : findSuggestions(currentWord.word, maxRows)), [currentWord.word, isFocused, dismissed, maxRows]);
  const showDropdown = suggestions.length > 0;
  const segments = useMemo(() => buildSegments(value, tokens), [value, tokens]);

  useEffect(() => { setActiveIdx(0); }, [suggestions.length, currentWord.word]);
  useEffect(() => { setDismissed(false); }, [currentWord.word]);
  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); }, []);
  useEffect(() => () => { attachmentsRef.current.forEach((a) => a.url && URL.revokeObjectURL(a.url)); }, []);
  const attachmentsRef = useRef<Attachment[]>([]);
  attachmentsRef.current = attachments;

  useLayoutEffect(() => {
    const el = mirrorRef.current;
    if (!el) return;
    const next = Math.min(250, Math.max(24, el.offsetHeight));
    setWrapperHeight((p) => (p === next ? p : next));
  });
  useLayoutEffect(() => {
    const el = mirrorRef.current;
    const card = cardRef.current;
    if (!el || !card) return;
    const ro = new ResizeObserver(() => {
      const next = Math.min(250, Math.max(24, el.offsetHeight));
      setWrapperHeight((p) => (p === next ? p : next));
      setCardHeight(card.offsetHeight);
    });
    ro.observe(el);
    ro.observe(card);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!showDropdown) return;
    const marker = wordMarkerRef.current;
    const container = containerRef.current;
    if (!marker || !container) return;
    const left = Math.max(0, Math.min((marker.getBoundingClientRect().left - container.getBoundingClientRect().left) / scale, container.offsetWidth - 200));
    const top = container.offsetHeight + 8;
    setDropdownPos((p) => (p.left === left && p.top === top ? p : { left, top }));
  });

  const syncMirrorScroll = useCallback(() => { const el = textareaRef.current; if (el) setScrollTop(el.scrollTop); }, []);
  const syncCaret = useCallback(() => {
    const el = textareaRef.current;
    if (el) setCaret(el.selectionStart ?? 0);
    syncMirrorScroll();
  }, [syncMirrorScroll]);

  const handleChange = useCallback((next: string) => {
    const edit = diffEdit(value, next);
    setValue(next);
    setTokens((toks) => shiftTokens(toks, edit));
    queueMicrotask(syncCaret);
  }, [value, syncCaret]);

  // one frame loop drives every uploading tile (same eased 1400ms progress as the source)
  const tick = useCallback(() => {
    const now = performance.now();
    setAttachments((list) => list.map((a) => {
      if (a.status !== "uploading") return a;
      const p = Math.min(1, (now - a.started) / UPLOAD_DURATION_MS);
      if (p >= 1) return { ...a, progress: 100, status: "ready" };
      return { ...a, progress: Math.round((1 - Math.pow(1 - p, 1.6)) * 100) };
    }));
    const pending = now - lastAddRef.current < UPLOAD_DURATION_MS + 50 || attachmentsRef.current.some((a) => a.status === "uploading" && now - a.started < UPLOAD_DURATION_MS);
    frameRef.current = pending ? requestAnimationFrame(tick) : null;
  }, []);

  const addAttachment = useCallback((a: Omit<Attachment, "id" | "status" | "progress" | "started">) => {
    setAttachments((list) => {
      const next = [...list, { ...a, id: newAttachmentId(), status: "uploading" as const, progress: 0, started: performance.now() }];
      while (next.length > MAX_ATTACHMENTS) { const old = next.shift(); if (old?.url) URL.revokeObjectURL(old.url); }
      return next;
    });
    lastAddRef.current = performance.now();
    if (!frameRef.current) frameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const addSample = useCallback(() => {
    const s = SAMPLES[sampleIdx.current++ % SAMPLES.length];
    addAttachment({ ...s });
  }, [addAttachment]);

  const openFilePicker = useCallback(() => { fileInputRef.current?.click(); }, []);

  const handleFileChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(ev.target.files ?? []);
    ev.target.value = "";
    for (const file of files.slice(0, MAX_ATTACHMENTS)) {
      if (file.type.startsWith("image/")) addAttachment({ kind: "image", url: URL.createObjectURL(file), name: file.name });
      else addAttachment({ kind: "doc", name: file.name, ext: (file.name.split(".").pop() || "FILE").slice(0, 4).toUpperCase() });
    }
  }, [addAttachment]);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((list) => {
      const a = list.find((x) => x.id === id);
      if (a?.url) URL.revokeObjectURL(a.url);
      return list.filter((x) => x.id !== id);
    });
  }, []);

  const acceptSuggestion = useCallback((s: Suggestion) => {
    const { start, end } = currentWord;
    if (s.type === "command") {
      const next = value.slice(0, start) + value.slice(end);
      setTokens(shiftTokens(tokens, diffEdit(value, next)));
      setValue(next);
      setDismissed(true);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) { el.focus(); el.setSelectionRange(start, start); }
        setCaret(start);
        setDismissed(false);
        syncMirrorScroll();
        if (s.command === "file") openFilePicker();
      });
      return;
    }
    const insert = s.insert ?? s.label;
    const next = value.slice(0, start) + insert + " " + value.slice(end);
    const nextCaret = start + insert.length + 1;
    const shifted = shiftTokens(tokens, diffEdit(value, next));
    setValue(next);
    setTokens([...shifted, { id: newTokenId(), type: s.type as "name" | "date", value: insert, start }]);
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
  }, [currentWord, value, tokens, syncMirrorScroll, openFilePicker]);

  const handleSubmit = useCallback(() => {
    if (!hasText && !attachments.length) return;
    setValue("");
    setTokens([]);
    setScrollTop(0);
    attachments.forEach((a) => a.url && URL.revokeObjectURL(a.url));
    setAttachments([]);
    textareaRef.current?.focus();
  }, [hasText, attachments]);

  const handleKeyDown = (ev: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showDropdown) {
      if (ev.key === "ArrowDown") { ev.preventDefault(); setActiveIdx((i) => (i + 1) % suggestions.length); return; }
      if (ev.key === "ArrowUp") { ev.preventDefault(); setActiveIdx((i) => (i - 1 + suggestions.length) % suggestions.length); return; }
      if (ev.key === "Enter" || ev.key === "Tab") { ev.preventDefault(); acceptSuggestion(suggestions[activeIdx]); return; }
      if (ev.key === "Escape") { ev.preventDefault(); setDismissed(true); return; }
    }
    if (ev.key === "Enter" && !ev.shiftKey && !ev.nativeEvent.isComposing) { ev.preventDefault(); handleSubmit(); }
  };

  const submitActive = hasText || (attachments.length > 0 && attachments.every((a) => a.status === "ready"));

  return (
    <div ref={rootRef} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <style>{CSS}</style>
      <div style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}>
        <div ref={containerRef} data-own-click style={{ position: "relative", width, pointerEvents: "auto", color: T.text }}>
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                key="dropdown"
                role="listbox"
                aria-label="Suggestions"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(6px)", scale: 0.98 }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 2, filter: "blur(4px)", scale: 0.99, transition: { duration: 0.18, ease: EASE_CONTEXTUAL } }}
                transition={SPRING_DROP}
                style={{
                  position: "absolute", left: dropdownPos.left, top: dropdownPos.top, transformOrigin: "top left", zIndex: 20,
                  width: 260, maxWidth: "100%", background: RAISED, borderRadius: 12, padding: 5, boxShadow: `${RAISED_SHADOW}, 0 14px 32px -8px rgba(0,0,0,.6)`,
                }}
              >
                <ul style={{ display: "flex", flexDirection: "column", gap: 1, margin: 0, padding: 0 }}>
                  {suggestions.map((s, i) => (
                    <SuggestionRow key={s.key} suggestion={s} active={i === activeIdx} index={i} reduceMotion={!!reduceMotion}
                      onHover={() => setActiveIdx(i)} onSelect={() => acceptSuggestion(s)} />
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: isPressed ? 0.992 : 1 }}
            transition={SPRING_CARD}
            onClick={() => textareaRef.current?.focus()}
            style={{
              position: "relative", background: RAISED, borderRadius: 19, padding: "14px 12px 12px", overflow: "hidden", cursor: "text",
              boxShadow: isFocused ? FOCUS_SHADOW : RAISED_SHADOW, transition: "box-shadow 300ms ease-out",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <AnimatePresence initial={false}>
                {attachments.length > 0 && (
                  <motion.div
                    key="tray"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "3px 0 14px 0", display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <AnimatePresence initial={false} mode="popLayout">
                        {attachments.map((a) => (
                          <AttachmentTile key={a.id} attachment={a} onRemove={() => removeAttachment(a.id)} reduceMotion={!!reduceMotion} />
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, width: "100%" }}>
                <div className="document-resize" style={{ position: "relative", flex: 1, minWidth: 0, overflow: "hidden", height: wrapperHeight }}>
                  {!hasText && (
                    <span aria-hidden="true" style={{ ...TEXT_STYLE, position: "absolute", top: 0, left: 4, color: T.faint, userSelect: "none", pointerEvents: "none", whiteSpace: "pre" }}>
                      Write a new task, or type /
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
                    className="document-ta"
                    rows={1}
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-autocomplete="list"
                    aria-label="Write a new task"
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
                      color: "transparent", WebkitTextFillColor: "transparent", caretColor: T.text,
                    }}
                  />
                </div>

                <button type="button" className="document-btn document-clip" aria-label="Attach a sample file"
                  onClick={(ev) => { ev.stopPropagation(); addSample(); }}>
                  <ClipIcon />
                </button>
                <SubmitButton active={submitActive} onClick={handleSubmit} onPressStart={() => setIsPressed(true)} onPressEnd={() => setIsPressed(false)} reduceMotion={!!reduceMotion} />
              </div>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt,.md,.csv,.key,.pages" onChange={handleFileChange}
              tabIndex={-1} aria-hidden="true" style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── attachment tile ─── */
function AttachmentTile({ attachment, onRemove, reduceMotion, ref }: { attachment: Attachment; onRemove: () => void; reduceMotion: boolean; ref?: React.Ref<HTMLDivElement> }) {
  const isUploading = attachment.status === "uploading";
  const p = attachment.progress;
  const blurPx = isUploading ? Math.max(0, (100 - p) * 0.12) : 0;
  const sat = isUploading ? 0.3 + (p / 100) * 0.7 : 1;
  return (
    <motion.div
      ref={ref}
      layout={!reduceMotion}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.85, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.85, filter: "blur(6px)", transition: { duration: 0.18, ease: EASE_CONTEXTUAL } }}
      transition={SPRING_TILE}
      title={attachment.name}
      style={{ position: "relative", flexShrink: 0, width: 40, height: 40 }}
    >
      <div style={{ position: "absolute", inset: 0, borderRadius: 4, overflow: "hidden", background: "linear-gradient(135deg, #2f322f 0%, #3a3d3a 50%, #2b2d2b 100%)" }} />
      <div style={{
        position: "absolute", inset: 0, borderRadius: 4, overflow: "hidden", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)",
        filter: reduceMotion ? "none" : `blur(${blurPx}px) saturate(${sat})`, transition: "filter 80ms linear", willChange: "filter",
      }}>
        {attachment.kind === "image" ? (
          attachment.url
            ? <img src={attachment.url} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", userSelect: "none" }} />
            : <div style={{ position: "absolute", inset: 0, background: attachment.bg }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#363936,#2b2d2b)", display: "grid", placeItems: "center" }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
              <path d="M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" fill="#e3e8e3" fillOpacity=".1" stroke="#c2cbc4" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M14 3v4h4" stroke="#c2cbc4" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M9 12h6M9 15h4" stroke="#8b968f" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span style={{ position: "absolute", bottom: 2, left: 0, right: 0, textAlign: "center", fontSize: 7, lineHeight: "8px", fontWeight: 700, letterSpacing: ".04em", color: "#34b562" }}>{attachment.ext}</span>
          </div>
        )}
      </div>
      <AnimatePresence>
        {isUploading && !reduceMotion && (
          <motion.div key="shimmer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.25, ease: EASE_CONTEXTUAL }}
            style={{ position: "absolute", inset: 0, borderRadius: 4, overflow: "hidden", pointerEvents: "none" }}>
            <motion.div
              style={{ position: "absolute", top: "-20%", bottom: "-20%", width: "55%", background: "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)", filter: "blur(2px)" }}
              initial={{ x: "-90%" }} animate={{ x: "180%" }} transition={{ duration: 1.05, ease: "linear", repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ position: "absolute", top: -2, right: -3, width: 10, height: 10 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {isUploading ? (
            <motion.div key="prog" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }} transition={SPRING_POP} style={{ display: "block", width: 10, height: 10 }}>
              <ProgressRing progress={p} />
            </motion.div>
          ) : (
            <motion.button key="close" type="button" className="document-btn" aria-label={`Remove ${attachment.name}`}
              onClick={(ev) => { ev.stopPropagation(); onRemove(); }}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }} transition={SPRING_POP}
              whileTap={!reduceMotion ? { scale: 0.85 } : undefined}
              style={{ position: "relative", width: 10, height: 10, borderRadius: 999, background: "#e3e8e3", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 1.5px #242624" }}>
              <span style={{ position: "absolute", inset: -7 }} />
              <svg viewBox="0 0 12 12" width="5" height="5" fill="none" aria-hidden="true"><path d="M3.25 3.25l5.5 5.5M8.75 3.25l-5.5 5.5" stroke="#191a19" strokeWidth="2" strokeLinecap="round" /></svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const r = 3.4;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, progress)) / 100);
  return (
    <svg viewBox="0 0 10 10" style={{ display: "block", width: "100%", height: "100%" }} aria-hidden="true">
      <circle cx="5" cy="5" r="5" fill="#e3e8e3" />
      <circle cx="5" cy="5" r={r} fill="none" stroke="rgba(25,26,25,0.22)" strokeWidth="1" />
      <circle cx="5" cy="5" r={r} fill="none" stroke="#191a19" strokeWidth="1" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        transform="rotate(-90 5 5)" style={{ transition: "stroke-dashoffset 80ms linear" }} />
    </svg>
  );
}

/* ─── suggestion row ─── */
function SuggestionRow({ suggestion, active, index, reduceMotion, onHover, onSelect }: {
  suggestion: Suggestion; active: boolean; index: number; reduceMotion: boolean; onHover: () => void; onSelect: () => void;
}) {
  const chip = { width: 20, height: 20, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as const;
  return (
    <motion.li
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: 0.03 + index * 0.025, type: "spring", visualDuration: 0.3, bounce: 0 }}
      style={{ listStyle: "none" }}
    >
      <button type="button" role="option" aria-selected={active} className="document-btn document-row"
        onMouseEnter={onHover} onMouseDown={(ev) => ev.preventDefault()} onClick={onSelect}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "5px 8px", borderRadius: 8, textAlign: "left", background: active ? "rgba(255,255,255,.06)" : "transparent" }}>
        {suggestion.type === "name" ? (
          <span aria-hidden="true" style={{ ...chip, fontSize: 9, fontWeight: 600, color: "#fff", backgroundImage: avatarGradient(suggestion.label) }}>{initials(suggestion.label)}</span>
        ) : (
          <span aria-hidden="true" style={{ ...chip, background: "rgba(255,255,255,.06)", color: T.sub, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06)" }}>
            {suggestion.type === "date" ? <CalendarIcon size={11} /> : <ImageIcon size={11} />}
          </span>
        )}
        <span style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: "18px", letterSpacing: "-0.09px", color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{suggestion.label}</span>
        {suggestion.hint && <span style={{ fontSize: 12, lineHeight: "16px", color: T.muted, fontVariantNumeric: "tabular-nums", flexShrink: 0, whiteSpace: "nowrap" }}>{suggestion.hint}</span>}
      </button>
    </motion.li>
  );
}

/* ─── submit ─── */
function SubmitButton({ active, onClick, onPressStart, onPressEnd, reduceMotion }: {
  active: boolean; onClick: () => void; onPressStart: () => void; onPressEnd: () => void; reduceMotion: boolean;
}) {
  return (
    <motion.button type="button" className="document-btn" onClick={(ev) => { ev.stopPropagation(); onClick(); }}
      onPointerDown={onPressStart} onPointerUp={onPressEnd} onPointerLeave={onPressEnd} onPointerCancel={onPressEnd}
      disabled={!active} aria-label="Send"
      whileTap={active && !reduceMotion ? { scale: 0.92 } : undefined}
      animate={{ backgroundColor: active ? "#e3e8e3" : "rgba(0,0,0,0.28)", boxShadow: active ? "0 0 0 0px rgba(0,0,0,0)" : "inset 0 1px 2px rgba(0,0,0,0.45)" }}
      transition={{ duration: 0.2, ease: EASE_CONTEXTUAL }}
      style={{ position: "relative", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 9, cursor: active ? "pointer" : "default" }}>
      <motion.span aria-hidden="true" animate={{ color: active ? "#191a19" : T.faint }} transition={{ duration: 0.18, ease: EASE_CONTEXTUAL }}
        style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={active ? "on" : "off"}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            style={{ display: "block", width: 12, height: 12 }}>
            <ArrowUpIcon />
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}
