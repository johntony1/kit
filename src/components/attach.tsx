/* Attach: a composer row with a paperclip. Each press adds a sample attachment that animates in.
 * Split out of document.tsx (Document input, ported from ~/Documents/Document input field
 * interaction / ChatInput.tsx). The slash menu lives in slash-menu.tsx.
 *
 *   paperclip    adds a sample attachment (drop)
 *   tile mounts  scale 0.85→1, blur 8→0, y -4→0 (spring 0.42 / 0.18)
 *   uploading    progressive blur clears (12→0), saturation 30→100,
 *                shimmer sweep on top, ring fills clockwise (1400ms)
 *   ready        ring pops into a close button (popLayout, spring 0.32 / 0.32)
 *   close        tile collapses (scale 0.85, opacity 0, blur 6, 180ms) (remove)
 */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { play } from "../sound/sound";

const SPRING_CARD = { type: "spring" as const, visualDuration: 0.4, bounce: 0.16 };
const SPRING_TILE = { type: "spring" as const, visualDuration: 0.42, bounce: 0.18 };
const SPRING_POP = { type: "spring" as const, visualDuration: 0.32, bounce: 0.32 };
const EASE_CONTEXTUAL = [0.2, 0, 0, 1] as const;

const MAX_ATTACHMENTS = 4;
const UPLOAD_DURATION_MS = 1400;
// natural height of the card with a full tray, for fitting
const NAT_H = 124;

const T = { text: "var(--k-text)", sub: "var(--k-text2)", muted: "var(--k-muted)", faint: "var(--at-hint)" };
const RAISED = "var(--k-raised)";
const RAISED_SHADOW = "var(--k-lift)";

type Attachment = {
  id: string; kind: "image" | "doc"; bg?: string; ext?: string; name: string;
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

function ClipIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M13.5 6.5l-5.8 5.8a1.6 1.6 0 002.3 2.3l6-6a3.2 3.2 0 00-4.5-4.5l-6.2 6.2a4.8 4.8 0 006.8 6.8l5.4-5.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TEXT_STYLE = { fontSize: 15, lineHeight: "24px", letterSpacing: "-0.09px", fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0" } as const;

const CSS = `
.attach-root { --at-hint: #5d6862; --at-clip: rgba(255,255,255,.04); --at-clip-hi: rgba(255,255,255,.08);
  --at-ph: linear-gradient(135deg, #2f322f 0%, #3a3d3a 50%, #2b2d2b 100%); --at-doc: linear-gradient(180deg,#363936,#2b2d2b);
  --at-edge: rgba(255,255,255,.06); --at-ext: #34b562; --at-dot: #e3e8e3; --at-dot-ink: #191a19; --at-dot-track: rgba(25,26,25,0.22); }
:root[data-theme="light"] .attach-root { --at-hint: var(--k-muted); --at-clip: oklch(0.22 0.008 264 / 0.05); --at-clip-hi: oklch(0.22 0.008 264 / 0.09);
  --at-ph: linear-gradient(135deg, oklch(0.955 0.003 264) 0%, oklch(0.92 0.004 264) 50%, oklch(0.955 0.003 264) 100%); --at-doc: linear-gradient(180deg, oklch(0.975 0.002 264), oklch(0.945 0.004 264));
  --at-edge: oklch(0.22 0.008 264 / 0.1); --at-ext: oklch(0.52 0.15 150); --at-dot: oklch(0.22 0.008 264); --at-dot-ink: oklch(1 0 0); --at-dot-track: oklch(1 0 0 / 0.3); }
.attach-btn { appearance: none; border: 0; margin: 0; padding: 0; font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.attach-btn:focus-visible { outline: 2px solid rgba(52,181,98,.7); outline-offset: 2px; }
.attach-clip { width: 28px; height: 28px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: var(--at-clip); color: ${T.sub}; transition: background-color 150ms ease-out, color 150ms ease-out, transform 150ms ease-out; position: relative; }
.attach-clip::before { content: ''; position: absolute; inset: -6px; }
.attach-clip:hover { background: var(--at-clip-hi); color: ${T.text}; }
.attach-clip:active { transform: scale(0.92); }
@media (prefers-reduced-motion: reduce) { .attach-clip { transition: none !important; } }`;

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

export default function Attach({ size = "card" }: { size?: "card" | "big" }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useBox(rootRef);
  const base = size === "big" ? 1.45 : 1;
  const scale = box.h ? Math.max(0.5, Math.min(base, (box.h - 24) / NAT_H)) : base;
  const width = Math.min(300, Math.max(220, (box.w || 300) / scale - 48));

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const frameRef = useRef<number | null>(null);
  const sampleIdx = useRef(0);
  const lastAddRef = useRef(0);
  const attachmentsRef = useRef<Attachment[]>([]);
  attachmentsRef.current = attachments;
  const reduceMotion = useReducedMotion();

  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); }, []);

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

  const addSample = useCallback(() => {
    const s = SAMPLES[sampleIdx.current++ % SAMPLES.length];
    play("drop");
    setAttachments((list) => {
      const next = [...list, { ...s, id: newAttachmentId(), status: "uploading" as const, progress: 0, started: performance.now() }];
      while (next.length > MAX_ATTACHMENTS) next.shift();
      return next;
    });
    lastAddRef.current = performance.now();
    if (!frameRef.current) frameRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const removeAttachment = useCallback((id: string) => {
    play("remove");
    setAttachments((list) => list.filter((x) => x.id !== id));
  }, []);

  return (
    <div ref={rootRef} className="attach-root" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <style>{CSS}</style>
      <div style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}>
        <div data-own-click style={{ position: "relative", width, pointerEvents: "auto", color: T.text }}>
          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={SPRING_CARD}
            style={{ position: "relative", background: RAISED, borderRadius: 19, padding: "14px 12px 12px", overflow: "hidden", boxShadow: RAISED_SHADOW }}
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

              <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                <span aria-hidden="true" style={{ ...TEXT_STYLE, flex: 1, minWidth: 0, padding: "0 4px", color: T.faint, userSelect: "none", whiteSpace: "nowrap" }}>
                  Attach a file
                </span>
                <button type="button" className="attach-btn attach-clip" aria-label="Attach a sample file"
                  onClick={(ev) => { ev.stopPropagation(); addSample(); }}>
                  <ClipIcon />
                </button>
              </div>
            </div>
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
      <div style={{ position: "absolute", inset: 0, borderRadius: 4, overflow: "hidden", background: "var(--at-ph)" }} />
      <div style={{
        position: "absolute", inset: 0, borderRadius: 4, overflow: "hidden", boxShadow: "inset 0 0 0 1px var(--at-edge)",
        filter: reduceMotion ? "none" : `blur(${blurPx}px) saturate(${sat})`, transition: "filter 80ms linear", willChange: "filter",
      }}>
        {attachment.kind === "image" ? (
          <div style={{ position: "absolute", inset: 0, background: attachment.bg }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "var(--at-doc)", display: "grid", placeItems: "center" }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
              <path d="M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" fillOpacity=".1" strokeWidth="1.3" strokeLinejoin="round" style={{ fill: "var(--k-text)", stroke: "var(--k-text2)" }} />
              <path d="M14 3v4h4" strokeWidth="1.3" strokeLinejoin="round" style={{ stroke: "var(--k-text2)" }} />
              <path d="M9 12h6M9 15h4" strokeWidth="1.3" strokeLinecap="round" style={{ stroke: "var(--k-muted)" }} />
            </svg>
            <span style={{ position: "absolute", bottom: 2, left: 0, right: 0, textAlign: "center", fontSize: 7, lineHeight: "8px", fontWeight: 700, letterSpacing: ".04em", color: "var(--at-ext)" }}>{attachment.ext}</span>
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
            <motion.button key="close" type="button" className="attach-btn" aria-label={`Remove ${attachment.name}`}
              onClick={(ev) => { ev.stopPropagation(); onRemove(); }}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }} transition={SPRING_POP}
              whileTap={!reduceMotion ? { scale: 0.85 } : undefined}
              style={{ position: "relative", width: 10, height: 10, borderRadius: 999, background: "var(--at-dot)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 1.5px var(--k-surface)" }}>
              <span style={{ position: "absolute", inset: -7 }} />
              <svg viewBox="0 0 12 12" width="5" height="5" fill="none" aria-hidden="true"><path d="M3.25 3.25l5.5 5.5M8.75 3.25l-5.5 5.5" strokeWidth="2" strokeLinecap="round" style={{ stroke: "var(--at-dot-ink)" }} /></svg>
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
      <circle cx="5" cy="5" r="5" style={{ fill: "var(--at-dot)" }} />
      <circle cx="5" cy="5" r={r} fill="none" strokeWidth="1" style={{ stroke: "var(--at-dot-track)" }} />
      <circle cx="5" cy="5" r={r} fill="none" strokeWidth="1" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
        transform="rotate(-90 5 5)" style={{ stroke: "var(--at-dot-ink)", transition: "stroke-dashoffset 80ms linear" }} />
    </svg>
  );
}
