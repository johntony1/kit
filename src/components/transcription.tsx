// Voice transcription: a voice note whose waveform plays while its words scroll by, line by line.
// Port of Music transcription / MusicTranscription.tsx, dark. Audio is simulated with a clock.
import { AnimatePresence, MotionConfig, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type Lyric = { time: number; text: string };

const WAVEFORM_WIDTH = 225.333;
const WAVEFORM_INSET_LEFT = 6.8;
const WAVEFORM_HEIGHT = 36;
const LYRIC_LINE_HEIGHT = 32;
const LYRIC_VIEWPORT_WIDTH = 349;

const SPRING = { type: "spring" as const, stiffness: 420, damping: 38, mass: 0.7 };
const FAST_SPRING = { type: "spring" as const, stiffness: 540, damping: 40, mass: 0.6 };
const EASE = [0.2, 0, 0, 1] as const;

const TITLE = "Voice note";
const ARTIST = "Tola Adeyemi";
const DURATION = 22;
const LYRICS: Lyric[] = [
  { time: 0, text: "Hey, quick note before the call." },
  { time: 2.8, text: "I played the new mix last night." },
  { time: 5.9, text: "The chorus finally lands." },
  { time: 8.6, text: "Push the drums a little louder," },
  { time: 11.6, text: "keep the piano dry in verse two." },
  { time: 14.8, text: "I'll send the stems by lunch." },
  { time: 18.2, text: "Talk soon." },
];

// Waveform bars from the source SVG (viewBox 218.53 × 35.47), as heights.
const WAVE = [1.4, 1.4, 4.8, 19.5, 1.6, 10.3, 12.1, 1.5, 17.8, 6.8, 1.5, 17.9, 8.8, 9.8, 27.4, 3.2, 1.4, 23.1, 2.0, 7.1, 19.0, 1.9, 14.2, 11.7, 15.9, 20.4, 7.1, 1.5, 18.4, 4.6, 1.4, 25.0, 3.0, 3.7, 22.0, 2.0, 8.1, 18.6, 1.6, 15.7, 9.9, 1.5, 20.2, 5.9, 1.5, 22.7, 3.5, 1.4, 24.9, 2.6, 3.4, 22.2, 1.9, 11.2, 15.1, 1.7, 17.8, 9.3, 15.3, 11.5, 4.7, 1.4, 12.3, 3.2, 1.4, 9.2, 2.2, 3.0, 11.0, 8.7, 16.8, 13.7, 1.6, 20.0, 9.5, 1.5, 20.9, 5.6, 1.5, 22.3, 12.2, 8.1, 27.1, 2.1, 6.3, 14.3, 1.7, 14.3, 10.1, 1.5, 19.6, 5.5, 1.5, 22.4, 4.6, 1.4, 21.4, 2.8, 3.1, 20.5, 2.0, 11.1, 14.4, 17.0, 20.8, 10.5, 1.5, 19.8, 5.8, 1.4, 22.8, 3.8, 1.4, 23.8, 15.5, 9.5, 10.9, 2.2, 8.8, 11.2, 4.7, 13.5, 7.2, 6.4, 13.0, 9.6, 8.0, 2.5, 1.4, 1.4];
function WaveformSvg() {
  return (
    <svg viewBox="0 0 218.53 35.4704" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block", width: "100%", height: "100%", overflow: "visible" }}>
      {WAVE.map((h, i) => <rect key={i} x={i * 1.6888} y={17.735 - h / 2} width={0.6755} height={h} rx={0.3378} fill="currentColor" />)}
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true" style={{ display: "block", width: "100%", height: "100%", overflow: "visible" }}>
      <path d="M2.63611 15.3639C1.79914 14.5291 1.13539 13.5371 0.683 12.445C0.230611 11.3529 -0.00149971 10.1821 7.29135e-06 9C7.29135e-06 4.0293 4.02931 0 9.00001 0C13.9707 0 18 4.0293 18 9C18 13.9707 13.9707 18 9.00001 18H7.29135e-06L2.63611 15.3639ZM5.40001 9.9C5.40001 10.8548 5.77929 11.7705 6.45442 12.4456C7.12955 13.1207 8.04523 13.5 9.00001 13.5C9.95479 13.5 10.8705 13.1207 11.5456 12.4456C12.2207 11.7705 12.6 10.8548 12.6 9.9H5.40001Z" fill="currentColor" />
    </svg>
  );
}
function CloseCircleIcon() {
  return (
    <svg viewBox="0 0 15 15" fill="none" aria-hidden="true" style={{ display: "block", width: "100%", height: "100%", overflow: "visible" }}>
      <path d="M7.5 15C3.35775 15 0 11.6422 0 7.5C0 3.35775 3.35775 0 7.5 0C11.6422 0 15 3.35775 15 7.5C15 11.6422 11.6422 15 7.5 15ZM7.5 6.4395L5.379 4.31775L4.31775 5.379L6.4395 7.5L4.31775 9.621L5.379 10.6823L7.5 8.5605L9.621 10.6823L10.6823 9.621L8.5605 7.5L10.6823 5.379L9.621 4.31775L7.5 6.4395Z" fill="currentColor" />
    </svg>
  );
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function PlayGlyph({ playing }: { playing: boolean }) {
  const anim = {
    initial: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
    transition: { type: "spring" as const, duration: 0.3, bounce: 0 },
  };
  const st = { width: 12, height: 12, color: "#fff", filter: "drop-shadow(0 1px 1px rgba(0,0,0,.3))" };
  return (
    <AnimatePresence mode="wait" initial={false}>
      {playing ? (
        <motion.svg key="pause" viewBox="0 0 12 12" style={st} {...anim}>
          <rect x="2.5" y="2" width="2.4" height="8" rx="0.6" fill="currentColor" />
          <rect x="7.1" y="2" width="2.4" height="8" rx="0.6" fill="currentColor" />
        </motion.svg>
      ) : (
        <motion.svg key="play" viewBox="0 0 12 12" style={st} {...anim}>
          <path d="M3.5 2.3v7.4c0 .4.4.7.8.5l5.6-3.7a.6.6 0 0 0 0-1L4.3 1.8a.6.6 0 0 0-.8.5Z" fill="currentColor" />
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

function LyricsBlock({ lyrics, currentSeconds, onSeekToLine, height, tabbable }: { lyrics: Lyric[]; currentSeconds: number; onSeekToLine: (s: number) => void; height: number; tabbable: boolean }) {
  const activeIndex = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= currentSeconds) idx = i;
      else break;
    }
    return idx;
  }, [lyrics, currentSeconds]);
  const translateY = -Math.max(0, activeIndex - 1) * LYRIC_LINE_HEIGHT;
  const mask = "linear-gradient(to bottom, transparent 0, #000 12%, #000 76%, transparent 100%)";
  return (
    <div style={{ overflow: "hidden", height, width: LYRIC_VIEWPORT_WIDTH, maskImage: mask, WebkitMaskImage: mask }}>
      <motion.div
        animate={{ y: translateY }}
        transition={{ type: "spring", stiffness: 220, damping: 32, mass: 0.9 }}
        style={{ fontFamily: '"Instrument Sans", inherit', fontWeight: 500, fontSize: 20, letterSpacing: "-0.12px", textWrap: "pretty" } as React.CSSProperties}
      >
        {lyrics.map((line, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;
          return (
            <motion.button
              key={i}
              type="button"
              tabIndex={tabbable ? 0 : -1}
              onClick={() => onSeekToLine(line.time)}
              aria-current={isActive ? "true" : undefined}
              className="transcription-line"
              animate={{ color: isActive ? "#e3e8e3" : isPast ? "#5d6862" : "#8b968f", opacity: isActive ? 1 : isPast ? 0.6 : 0.9, filter: isActive ? "blur(0px)" : "blur(0.2px)" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", background: "transparent", border: 0, margin: "0 -2px", padding: "0 2px", borderRadius: 6, font: "inherit", letterSpacing: "inherit", lineHeight: `${LYRIC_LINE_HEIGHT}px`, whiteSpace: "nowrap", willChange: "color, opacity" }}
            >
              {line.text}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

// ── Fit ────────────────────────────────────────────────────
const NAT_W = 432;
function useFit(size: "card" | "big") {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ s: 0.85, lyricH: 128 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      if (size === "big") {
        const lyricH = 289;
        const natH = 22 + 12 + 32 + lyricH + 12 + 58 + 4;
        return setBox({ lyricH, s: Math.min(1.5, (W - 120) / NAT_W, (H - 100) / natH) });
      }
      const short = H < 260;
      const lyricH = short ? 64 : 128;
      const natH = 22 + 12 + 32 + lyricH + 12 + 58 + 4;
      const avail = short ? H - 24 : H - 116;
      setBox({ lyricH, s: Math.max(0.3, Math.min(1, (W - 40) / NAT_W, avail / natH)) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return [ref, box] as const;
}

export default function Transcription({ size = "card" }: { size?: "card" | "big" }) {
  const reduced = useReducedMotion() ?? false;
  const [rootRef, { s: scale, lyricH }] = useFit(size);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const waveRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const wasPlayingBeforeDragRef = useRef(false);
  const [hovering, setHovering] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const durationSeconds = DURATION;

  const progress = useMotionValue(0);
  const playheadX = useTransform(progress, (p) => WAVEFORM_INSET_LEFT + p * (WAVEFORM_WIDTH - WAVEFORM_INSET_LEFT * 2));
  const playedClipPath = useTransform(progress, (p) => `inset(0 ${(1 - p) * 100}% 0 0)`);
  useMotionValueEvent(progress, "change", (p) => setCurrentSeconds(p * durationSeconds));

  // Simulated audio clock (the original reads audio.currentTime every frame)
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!draggingRef.current) {
        const next = progress.get() + dt / durationSeconds;
        if (next >= 1) {
          setPlaying(false);
          progress.set(0);
          return;
        }
        progress.set(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, progress, durationSeconds]);

  const seekFromPointer = useCallback((clientX: number) => {
    const el = waveRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    progress.set(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  }, [progress]);

  const seekToSeconds = useCallback((seconds: number) => {
    const clamped = Math.max(0, Math.min(durationSeconds, seconds));
    progress.set(clamped / durationSeconds);
    setPlaying(true);
  }, [durationSeconds, progress]);

  const togglePlay = () => setPlaying((p) => !p);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    wasPlayingBeforeDragRef.current = playing;
    setPlaying(false);
    e.currentTarget.setPointerCapture(e.pointerId);
    seekFromPointer(e.clientX);
  };
  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) seekFromPointer(e.clientX);
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    if (wasPlayingBeforeDragRef.current) setPlaying(true);
  };

  const showScan = hovering || playing;
  const dur = reduced ? "0ms" : "300ms";
  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <MotionConfig reducedMotion="user" transformPagePoint={(p) => ({ x: p.x / scaleRef.current, y: p.y / scaleRef.current })}>
      <style>{`.transcription-line:not([aria-current="true"]):hover{color:#c2cbc4 !important}.transcription-line:active{scale:.98}.transcription-line{transition:scale 150ms}.transcription-root button:focus-visible,.transcription-root [role=slider]:focus-visible{outline:2px solid rgba(52,181,98,.55);outline-offset:2px}.transcription-press{transition:transform 150ms}.transcription-press:active{transform:scale(.96)}`}</style>
      <div ref={rootRef} className="transcription-root" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center", paddingTop: 22 }}>
          <div data-own-click="" style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", userSelect: "none", WebkitUserSelect: "none", pointerEvents: "auto" }}>
            {/* Time pill, sits on top of the surface */}
            <AnimatePresence initial={false}>
              {showScan && (
                <motion.div
                  key="time-pill"
                  initial={{ opacity: 0, y: 6, scale: 0.92, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 4, scale: 0.94, filter: "blur(3px)" }}
                  transition={SPRING}
                  style={{ position: "absolute", left: "50%", x: "-50%", top: -22, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px 8px 0 0", padding: "4px 8px", background: "rgba(52,181,98,.16)", pointerEvents: "none", willChange: "transform, opacity, filter" }}
                >
                  <p style={{ margin: 0, fontSize: 12, lineHeight: "18px", letterSpacing: "-0.072px", color: "#e3e8e3", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                    {formatTime(currentSeconds)} / {formatTime(durationSeconds)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Outer shell: padding, background and radius tween on one curve */}
            <div
              style={{
                display: "flex", flexDirection: "column", alignItems: "stretch",
                backgroundColor: expanded ? "rgba(32,33,32,1)" : "rgba(32,33,32,0)",
                boxShadow: expanded ? "inset 0 1px 0 rgba(255,255,255,.05), 0 0 0 1px rgba(255,255,255,.05)" : "inset 0 1px 0 rgba(255,255,255,0), 0 0 0 1px rgba(255,255,255,0)",
                borderRadius: expanded ? 20 : 16,
                padding: expanded ? "12px 4px 4px" : "0px 0px 0px",
                transition: `background-color ${dur} ${ease}, padding ${dur} ${ease}, border-radius ${dur} ${ease}, box-shadow ${dur} ${ease}`,
                willChange: "padding, background-color, border-radius",
              }}
            >
              {/* Lyrics: grid-rows 0fr ↔ 1fr */}
              <div style={{ display: "grid", gridTemplateRows: expanded ? "1fr" : "0fr", transition: `grid-template-rows ${dur} ${ease}` }} aria-hidden={!expanded}>
                <div style={{ overflow: "hidden", minHeight: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", paddingBottom: 12, opacity: expanded ? 1 : 0, transition: `opacity ${dur} ${ease}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 12px 12px" }}>
                      <button
                        type="button"
                        onClick={() => setExpanded(false)}
                        aria-label="Close transcript"
                        tabIndex={expanded ? 0 : -1}
                        className="transcription-press"
                        style={{ position: "relative", width: 20, height: 20, overflow: "hidden", color: "#8b968f", cursor: "pointer", border: "none", background: "transparent", padding: 0, borderRadius: 999 }}
                      >
                        <div style={{ position: "absolute", inset: "12.5%" }}><CloseCircleIcon /></div>
                      </button>
                    </div>
                    <div style={{ padding: "0 16px" }}>
                      <LyricsBlock lyrics={LYRICS} currentSeconds={currentSeconds} onSeekToLine={seekToSeconds} height={lyricH} tabbable={expanded} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Voice note card */}
              <div
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, borderRadius: 16, padding: "8px 12px 8px 8px", background: "linear-gradient(180deg,#2b2d2b,#242624)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={playing ? "Pause" : "Play"}
                      className="transcription-press"
                      style={{ position: "relative", width: 40, height: 40, borderRadius: 999, flexShrink: 0, cursor: "pointer", border: "none", padding: 0, background: "radial-gradient(circle at 30% 25%, #f6c48f 0%, transparent 55%), radial-gradient(circle at 75% 80%, #34b562 0%, transparent 60%), linear-gradient(135deg,#5b4a7d,#1f3a33)", boxShadow: "0 0 0 2px rgba(0,0,0,.35), 0 2px 4px rgba(0,0,0,.4), 0 8px 14px -6px rgba(0,0,0,.5)" }}
                    >
                      <div style={{ position: "absolute", inset: 0, borderRadius: 999, boxShadow: "inset 0 -2.384px 2.384px -1.192px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,.18)" }} />
                      <motion.div
                        style={{ position: "absolute", inset: 0, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
                        animate={{ opacity: hovering || playing ? 1 : 0, backgroundColor: hovering || playing ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0)" }}
                        transition={{ duration: 0.18, ease: EASE }}
                      >
                        <PlayGlyph playing={playing} />
                      </motion.div>
                    </button>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", whiteSpace: "nowrap", fontSize: 12, letterSpacing: "-0.072px", width: 95 }}>
                      <p style={{ margin: 0, fontWeight: 500, lineHeight: "18px", color: "#e3e8e3" }}>{TITLE}</p>
                      <p style={{ margin: 0, lineHeight: "18px", color: "#8b968f" }}>{ARTIST}</p>
                    </div>
                  </div>

                  {/* Waveform: scrub to seek */}
                  <div
                    ref={waveRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    style={{ position: "relative", flexShrink: 0, touchAction: "none", cursor: "pointer", width: WAVEFORM_WIDTH, height: WAVEFORM_HEIGHT, borderRadius: 4 }}
                    role="slider"
                    aria-label="Seek"
                    aria-valuemin={0}
                    aria-valuemax={Math.round(durationSeconds)}
                    aria-valuenow={Math.round(currentSeconds)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      const step = 5 / durationSeconds;
                      if (e.key === "ArrowRight") { e.preventDefault(); progress.set(Math.min(1, progress.get() + step)); }
                      else if (e.key === "ArrowLeft") { e.preventDefault(); progress.set(Math.max(0, progress.get() - step)); }
                      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); togglePlay(); }
                    }}
                  >
                    <motion.div
                      style={{ position: "absolute", left: WAVEFORM_INSET_LEFT, top: 0.27, width: 218.535, height: 35.47 }}
                      animate={{ color: showScan ? "#5d6862" : "#e3e8e3" }}
                      transition={{ duration: 0.2, ease: EASE }}
                    >
                      <WaveformSvg />
                    </motion.div>
                    <motion.div
                      style={{ position: "absolute", pointerEvents: "none", color: "#e3e8e3", left: WAVEFORM_INSET_LEFT, top: 0.27, width: 218.535, height: 35.47, clipPath: playedClipPath }}
                      animate={{ opacity: showScan ? 1 : 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <WaveformSvg />
                    </motion.div>
                    <AnimatePresence>
                      {showScan && (
                        <motion.div
                          key="playhead"
                          initial={{ opacity: 0, scaleY: 0.6 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0, scaleY: 0.7 }}
                          transition={FAST_SPRING}
                          style={{ position: "absolute", top: 0, bottom: 0, left: 0, pointerEvents: "none", x: playheadX, width: 1, marginLeft: -0.5, background: "#34b562", transformOrigin: "center", willChange: "transform" }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Transcript toggle */}
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-label={expanded ? "Hide transcript" : "Show transcript"}
                  aria-expanded={expanded}
                  className="transcription-press"
                  style={{ position: "relative", width: 24, height: 24, overflow: "hidden", flexShrink: 0, cursor: "pointer", border: "none", background: "transparent", padding: 0, borderRadius: 999 }}
                >
                  <motion.div style={{ position: "absolute", inset: "12.5%" }} animate={{ color: expanded ? "#e3e8e3" : "#8b968f" }} transition={{ duration: 0.18 }}>
                    <ChatIcon />
                  </motion.div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
