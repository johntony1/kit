// Chat composer: "What mood are you in". Port of Music animation / ChatbotIdle.tsx, in light and dark.
// Drag (or tap) the handle to open Recent songs, hover a sleeve to crack it open, tap one for Now playing.
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  animate,
  AnimatePresence,
  MotionConfig,
  type PanInfo,
} from "framer-motion";
import { play } from "../sound/sound";
import { useRef, useState, useEffect, useCallback, useLayoutEffect, type ReactNode, type CSSProperties } from "react";

// ── Spring / timing constants (exact from source) ──────────
const DRAWER_HEIGHT = 195;
const SNAP_SPRING = { type: "spring", stiffness: 380, damping: 40 } as const;
const MOUNT_SPRING = { type: "spring", visualDuration: 0.38, bounce: 0.18 } as const;
const DISC_SPRING = { type: "spring", stiffness: 320, damping: 26 } as const;
const FLIP_SPRING = { type: "spring", stiffness: 260, damping: 26 } as const;
const BTN_SPRING = { type: "spring", visualDuration: 0.16, bounce: 0.4 } as const;
const NP_ENTER_SPRING = { type: "spring", stiffness: 280, damping: 26 } as const;
const PREVIEW_DURATION = 30;

const Z = { back: 0, disc: 1, front: 2 } as const;

// Natural size of the widget (drawer open) for fitting into the card.
const NAT_W = 477;
const NAT_H = 322;

const ALBUMS = [
  { id: 1, title: "Clarity of mind", artist: "Omah Lay", tint: "rgba(120,96,70,0.22)", cover: "radial-gradient(circle at 70% 30%, rgba(255,214,170,.35) 0 18%, transparent 19%), linear-gradient(180deg,#3a3438 0%,#231e1a 100%)" },
  { id: 2, title: "Worship", artist: "Asake", tint: "rgba(70,100,160,0.22)", cover: "radial-gradient(circle at 30% 65%, rgba(160,190,255,.32) 0 22%, transparent 23%), linear-gradient(180deg,#4d556b 0%,#1d2740 100%)" },
  { id: 3, title: "Mofe", artist: "Mavo", tint: "rgba(156,67,28,0.25)", cover: "radial-gradient(ellipse at 50% 110%, rgba(255,190,170,.55) 0 40%, transparent 41%), linear-gradient(180deg,#3f3228 0%,#af806f 100%)" },
  { id: 4, title: "How far", artist: "No 11", tint: "rgba(160,110,20,0.25)", cover: "radial-gradient(circle at 50% 42%, rgba(30,28,22,.55) 0 20%, transparent 21%), linear-gradient(180deg,#3e3c31 0%,#d5b68f 100%)" },
] as const;
type Album = (typeof ALBUMS)[number];

// Waveform (same bars as the source SVG), heights in a 26.6 tall box.
const WAVE = [1.4, 1.4, 4.8, 19.5, 1.6, 10.3, 12.1, 1.5, 17.8, 6.8, 1.5, 17.9, 8.8, 9.8, 27.4, 3.2, 1.4, 23.1, 2.0, 7.1, 19.0, 1.9, 14.2, 11.7, 15.9, 20.4, 7.1, 1.5, 18.4, 4.6, 1.4, 25.0, 3.0, 3.7, 22.0, 2.0, 8.1, 18.6, 1.6, 15.7, 9.9, 1.5, 20.2, 5.9, 1.5, 22.7, 3.5, 1.4, 24.9, 2.6, 3.4, 22.2, 1.9, 11.2, 15.1, 1.7, 17.8, 9.3, 15.3, 11.5, 4.7, 1.4, 12.3, 3.2, 1.4, 9.2, 2.2, 3.0, 11.0, 8.7, 16.8, 13.7, 1.6, 20.0, 9.5, 1.5, 20.9, 5.6, 1.5, 22.3, 12.2, 8.1, 27.1, 2.1, 6.3, 14.3, 1.7, 14.3, 10.1, 1.5, 19.6, 5.5, 1.5, 22.4, 4.6, 1.4, 21.4, 2.8, 3.1, 20.5, 2.0, 11.1, 14.4, 17.0, 20.8, 10.5, 1.5, 19.8, 5.8, 1.4, 22.8, 3.8, 1.4, 23.8, 15.5, 9.5, 10.9, 2.2, 8.8, 11.2, 4.7, 13.5, 7.2, 6.4, 13.0, 9.6, 8.0, 2.5, 1.4, 1.4];
function WaveSvg({ style }: { style?: CSSProperties }) {
  const k = 26.6 / 35.47;
  return (
    <svg viewBox="0 0 236.445 26.6028" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block", ...style }}>
      {WAVE.map((h, i) => {
        const hh = Math.max(0.73, h * k);
        return <rect key={i} x={i * 1.8289} y={13.3 - hh / 2} width={0.7309} height={hh} rx={0.365} style={{ fill: "var(--k-text)" }} />;
      })}
    </svg>
  );
}

// The page theme, for the one colour framer-motion animates (the close button's hover wash).
function useLight() {
  const [light, setLight] = useState(() => typeof document !== "undefined" && document.documentElement.dataset.theme === "light");
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setLight(root.dataset.theme === "light");
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, []);
  return light;
}

// ── Icons ──────────────────────────────────────────────────
function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
      <path d="M7 11.5V2.5M7 2.5L3 6.5M7 2.5L11 6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function MusicAiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6.2 11.3V4.4l6-1.4v6.9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--ch-green)" }} />
      <circle cx="4.9" cy="11.4" r="1.6" style={{ fill: "var(--ch-green)" }} />
      <circle cx="10.9" cy="10" r="1.6" style={{ fill: "var(--ch-green)" }} />
      <path d="M2.6 2.4l.35.9.9.35-.9.35-.35.9-.35-.9-.9-.35.9-.35z" style={{ fill: "var(--ch-green)" }} />
    </svg>
  );
}
function PauseIconImg() {
  return (
    <svg viewBox="0 0 5.83333 8.75" width={5.83333} height={8.75} fill="none" aria-hidden="true" style={{ display: "block", overflow: "visible", flexShrink: 0 }}>
      <rect x={0} y={0} width={0.972222} height={8.75} style={{ fill: "var(--ch-on-ink)" }} />
      <rect x={4.86111} y={0} width={0.972222} height={8.75} style={{ fill: "var(--ch-on-ink)" }} />
    </svg>
  );
}
function PlayIconImg() {
  return (
    <svg viewBox="0 0 7.34671 8.94187" width={7.34671} height={8.94187} fill="none" aria-hidden="true" style={{ display: "block", overflow: "visible", flexShrink: 0 }}>
      <path d="M6.83398 4.4707L0.5 8.42969V0.511719L6.83398 4.4707Z" fill="white" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" focusable="false">
      <path d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5" strokeWidth="1.25" strokeLinecap="round" style={{ stroke: "var(--k-muted)" }} />
    </svg>
  );
}
function KbdHint({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 500, color: "var(--k-text2)", background: "var(--ch-tint)", boxShadow: "inset 0 0 0 1px var(--ch-edge)", borderRadius: 4, padding: "1px 5px", lineHeight: "16px", letterSpacing: "-0.04px" }}>
      {children}
    </span>
  );
}

// ── Waveform progress: two copies, the played one revealed by clip-path ──
function WaveformProgress({ elapsed, total, reduceMotion }: { elapsed: number; total: number; reduceMotion: boolean }) {
  const targetPct = total > 0 ? Math.min(1, elapsed / total) : 0;
  const progress = useMotionValue(0);
  useEffect(() => {
    const c = animate(progress, targetPct, reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 55, damping: 22, mass: 0.6 });
    return () => c.stop();
  }, [targetPct, reduceMotion, progress]);
  const clipPath = useTransform(progress, (v) => `inset(0 ${((1 - v) * 100).toFixed(3)}% 0 0 round 1px)`);
  const abs: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };
  return (
    <div style={{ flex: 1, position: "relative", height: 26, minWidth: 0 }} aria-hidden="true">
      <WaveSvg style={{ ...abs, opacity: 0.2 }} />
      <motion.div style={{ ...abs, clipPath }}>
        <WaveSvg style={abs} />
      </motion.div>
    </div>
  );
}

// ── Vinyl disc ─────────────────────────────────────────────
function VinylDisc({ cover, isSpinning, size = 80, reduceMotion = false }: { cover: string; isSpinning: boolean; size?: number; reduceMotion?: boolean }) {
  const rotation = useMotionValue(0);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  useEffect(() => {
    if (!isSpinning || reduceMotion) return;
    lastRef.current = performance.now();
    const tick = (now: number) => {
      rotation.set(rotation.get() + ((now - lastRef.current) / 1000) * 120);
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isSpinning, reduceMotion, rotation]);
  const s = size, center = s / 2, labelR = s * 0.19, holeR = s * 0.044;
  return (
    <motion.div style={{ rotate: reduceMotion ? 0 : rotation, width: s, height: s, borderRadius: "50%", overflow: "hidden", flexShrink: 0, position: "relative" }} aria-hidden="true">
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#100518" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", backgroundImage: "repeating-radial-gradient(circle,rgba(255,255,255,0) 0,rgba(255,255,255,0) 4.5px,rgba(255,255,255,0.045) 4.5px,rgba(255,255,255,0.045) 5px)" }} />
      <div style={{ position: "absolute", inset: s * 0.15, borderRadius: "50%", background: "conic-gradient(from 0deg,rgba(110,50,200,.28),rgba(50,110,220,.2),rgba(50,185,210,.16),rgba(195,125,55,.2),rgba(205,55,125,.26),rgba(110,50,200,.28))" }} />
      <div style={{ position: "absolute", width: labelR * 2, height: labelR * 2, left: center - labelR, top: center - labelR, borderRadius: "50%", overflow: "hidden", zIndex: 2, boxShadow: "0 0 0 0.75px rgba(255,255,255,0.12)", background: cover, backgroundSize: "cover" }} />
      <div style={{ position: "absolute", width: holeR * 2, height: holeR * 2, left: center - holeR, top: center - holeR, borderRadius: "50%", background: "#0c0e0f", zIndex: 3 }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none", background: "radial-gradient(ellipse at 28% 18%,rgba(255,255,255,0.09) 0%,transparent 55%)" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", pointerEvents: "none", boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.11),0 0.5px 0.5px 0 black" }} />
    </motion.div>
  );
}

// ── Now playing card ───────────────────────────────────────
function NowPlayingCard({ album, isPlaying, elapsed, onPlayPause, onClose, reduceMotion }: { album: Album; isPlaying: boolean; elapsed: number; onPlayPause: () => void; onClose: () => void; reduceMotion: boolean }) {
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const stagger = (i: number) => (reduceMotion ? { duration: 0 } : { ...NP_ENTER_SPRING, delay: i * 0.055 });
  const divider: CSSProperties = { height: 1, background: "var(--k-line)", width: "100%", transformOrigin: "left center" };
  const hint: CSSProperties = { fontSize: 10, color: "var(--k-muted)" };
  const light = useLight();
  return (
    <motion.div
      key="now-playing"
      initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.14, ease: "easeIn" } }}
      transition={NP_ENTER_SPRING}
      style={{ display: "flex", flexDirection: "column", width: "100%", gap: 10, paddingTop: 12, paddingBottom: 12 }}
    >
      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={stagger(0)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 12, paddingRight: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <MusicAiIcon />
          <span style={{ fontSize: 12, color: "var(--k-muted)", letterSpacing: "-0.06px" }}>Now playing...</span>
        </div>
        <motion.button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          whileHover={{ scale: 1.1, background: light ? "rgba(27,29,36,.07)" : "rgba(255,255,255,.07)" }}
          whileTap={{ scale: 0.9 }}
          transition={BTN_SPRING}
          onPointerDown={(e) => e.stopPropagation()}
          style={{ width: 20, height: 20, borderRadius: 6, background: light ? "rgba(27,29,36,0)" : "rgba(255,255,255,0)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: 0 }}
          aria-label="Close now playing"
        >
          <CloseIcon />
        </motion.button>
      </motion.div>

      <motion.div initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={stagger(0.5)} style={divider} />

      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={stagger(1)} style={{ display: "flex", alignItems: "center", paddingLeft: 12, paddingRight: 12, gap: 8 }}>
        <motion.div
          initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={stagger(1.5)}
          style={{ width: 113, height: 45, borderRadius: 10.7, background: "var(--ch-chip)", boxShadow: "inset 0 1px 0 var(--k-hi), 0 0 0 1px var(--k-ring), 0 1px 2px var(--k-shadow)", position: "relative", overflow: "hidden", flexShrink: 0 }}
        >
          <div style={{ position: "absolute", left: 3.65, top: 3.65 }}>
            <VinylDisc cover={album.cover} isSpinning={isPlaying} size={37} reduceMotion={reduceMotion} />
          </div>
          <div style={{ position: "absolute", left: 46, right: 8, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 500, color: "var(--k-text)", letterSpacing: -0.066, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{album.title}</p>
            <p style={{ fontSize: 10, color: "var(--k-muted)", letterSpacing: -0.06, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{album.artist}</p>
          </div>
        </motion.div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 11, color: "var(--k-text2)", fontVariantNumeric: "tabular-nums", flexShrink: 0, letterSpacing: "-0.04px", minWidth: 26 }}>{fmt(elapsed)}</span>
          <WaveformProgress elapsed={elapsed} total={PREVIEW_DURATION} reduceMotion={reduceMotion} />
          <span style={{ fontSize: 11, color: "var(--ch-end)", fontVariantNumeric: "tabular-nums", flexShrink: 0, letterSpacing: "-0.04px", minWidth: 26, textAlign: "right" }}>0:30</span>
        </div>
      </motion.div>

      <motion.div initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={stagger(2)} style={divider} />

      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={stagger(2.5)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 12, paddingRight: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <KbdHint>Space</KbdHint><span style={{ ...hint, marginRight: 6 }}>Pause</span>
          <KbdHint>P</KbdHint><span style={{ ...hint, marginRight: 6 }}>Prev</span>
          <KbdHint>N</KbdHint><span style={hint}>Next</span>
        </div>
        <motion.button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
          onPointerDown={(e) => e.stopPropagation()}
          whileHover={reduceMotion ? {} : { scale: 1.08 }}
          whileTap={reduceMotion ? {} : { scale: 0.88 }}
          transition={BTN_SPRING}
          aria-label={isPlaying ? "Pause" : "Play"}
          style={{
            position: "relative", width: 28, height: 28, borderRadius: 8, padding: 0,
            background: isPlaying ? "var(--ch-on)" : "#34b562",
            boxShadow: isPlaying ? "var(--ch-on-sh)" : "0 0 0 0.75px #2a9a52, inset 0 1px 2px rgba(255,255,255,.16)",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden",
          }}
        >
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: 8, pointerEvents: "none", background: isPlaying ? "var(--ch-on-gloss)" : "linear-gradient(180deg, rgba(255,255,255,0.2) 6.67%, rgba(255,255,255,0) 103.33%)" }} />
          <AnimatePresence mode="wait" initial={false}>
            {isPlaying ? (
              <motion.span key="pause" initial={{ opacity: 0, scale: 0.55, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.55, rotate: 20 }} transition={{ duration: 0.13, ease: "easeOut" }} style={{ display: "flex", position: "relative", zIndex: 1 }}>
                <PauseIconImg />
              </motion.span>
            ) : (
              <motion.span key="play" initial={{ opacity: 0, scale: 0.55, rotate: 20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.55, rotate: -20 }} transition={{ duration: 0.13, ease: "easeOut" }} style={{ display: "flex", position: "relative", zIndex: 1 }}>
                <PlayIconImg />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Album card: folder lid cracks open, disc floats up ─────
function AlbumCard({ album, reduceMotion, onPlay, disabled }: { album: Album; reduceMotion: boolean; onPlay: (a: Album) => void; disabled: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      style={{ width: 100, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start", flexShrink: 0, cursor: "pointer" }}
      onHoverStart={() => { play("slide", { gap: 40 }); setHovered(true); }}
      onHoverEnd={() => setHovered(false)}
      whileTap={reduceMotion ? {} : { scale: 0.93 }}
      transition={BTN_SPRING}
      onClick={() => onPlay(album)}
      role="button"
      aria-label={`Play ${album.title} by ${album.artist}`}
      tabIndex={disabled ? -1 : 0}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onPlay(album); } }}
    >
      <div style={{ position: "relative", width: 100, height: 100, perspective: reduceMotion ? undefined : "380px", perspectiveOrigin: "50% 100%" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 16, pointerEvents: "none", zIndex: Z.back, background: album.tint, boxShadow: "var(--ch-sleeve-sh)" }} />
        <motion.div
          style={{ position: "absolute", left: "50%", top: "50%", translateX: "-50%", translateY: "-50%", zIndex: Z.disc }}
          animate={reduceMotion ? { y: 0 } : hovered ? { y: -34 } : { y: 0 }}
          transition={DISC_SPRING}
        >
          <VinylDisc cover={album.cover} isSpinning={hovered} size={80} reduceMotion={reduceMotion} />
        </motion.div>
        <motion.div
          style={{ position: "absolute", left: 0, width: 100, borderRadius: 16, overflow: "hidden", zIndex: Z.front, transformOrigin: "bottom center", boxShadow: "0 1px 2px var(--ch-drop), inset 0 1px 0 rgba(255,255,255,.12)", background: album.cover }}
          initial={{ top: 4, height: 96, rotateX: 0 }}
          animate={reduceMotion ? { top: 4, height: 96, rotateX: 0 } : hovered ? { top: 11, height: 89, rotateX: -22 } : { top: 4, height: 96, rotateX: 0 }}
          transition={FLIP_SPRING}
        >
          <div style={{ position: "absolute", inset: 0, borderRadius: 16, boxShadow: "inset 0 1px 0 rgba(255,255,255,.14), inset 0 0 0 1px rgba(255,255,255,.06)" }} />
        </motion.div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: 100 }}>
        <p style={{ margin: 0, fontSize: 12, lineHeight: "18px", fontWeight: 500, color: "var(--k-text)", letterSpacing: "-0.072px", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{album.title}</p>
        <p style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: "var(--k-muted)", letterSpacing: "-0.072px" }}>{album.artist}</p>
      </div>
    </motion.div>
  );
}

// ── Fit the widget into whatever card box it lands in ──────
function useFit(size: "card" | "big") {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.76);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      if (size === "big") return setS(Math.min(1.6, (W - 120) / NAT_W, (H - 120) / NAT_H));
      let avail = H - 116;
      if (avail < NAT_H * 0.7) avail = H - 24;
      setS(Math.max(0.3, Math.min(1, (W - 40) / NAT_W, avail / NAT_H)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return [ref, s] as const;
}

export default function Chat({ size = "card" }: { size?: "card" | "big" }) {
  const reduceMotion = useReducedMotion() ?? false;
  const [rootRef, scale] = useFit(size);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const expandedRef = useRef(false);
  const [expanded, setExpanded] = useState(false);

  const drawerProgress = useMotionValue(0);
  const songsHeight = useTransform(drawerProgress, [0, 1], [0, DRAWER_HEIGHT]);
  const songsOpacity = useTransform(drawerProgress, [0, 0.12, 1], [0, 0.5, 1]);
  const songsY = useTransform(drawerProgress, [0, 1], [8, 0]);
  const pillWidth = useTransform(drawerProgress, [0, 1], [40, 28]);
  const pillOpacity = useTransform(drawerProgress, [0, 1], [0.18, 0.32]);

  // Tilt while tugging the card body
  const posX = useMotionValue(0);
  const posY = useMotionValue(0);
  const tiltX = useTransform(posY, [-80, 80], [2.5, -2.5]);
  const tiltY = useTransform(posX, [-80, 80], [-2.5, 2.5]);

  const [playingAlbum, setPlayingAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false); isPlayingRef.current = isPlaying;
  const [elapsed, setElapsed] = useState(0);

  // Simulated preview playback (the original streams a 30 s iTunes preview)
  useEffect(() => {
    if (!isPlaying || !playingAlbum) return;
    const id = setInterval(() => setElapsed((e) => {
      if (e + 1 >= PREVIEW_DURATION) { setIsPlaying(false); return PREVIEW_DURATION; }
      return e + 1;
    }), 1000);
    return () => clearInterval(id);
  }, [isPlaying, playingAlbum]);

  const handlePlayAlbum = useCallback((album: Album) => {
    play("play");
    setPlayingAlbum(album);
    setIsPlaying(true);
    setElapsed(0);
  }, []);
  const handlePlayPause = useCallback(() => {
    play(isPlayingRef.current ? "pause" : "play");
    setIsPlaying((prev) => {
      if (!prev) setElapsed((e) => (e >= PREVIEW_DURATION ? 0 : e));
      return !prev;
    });
  }, []);
  const handleNavigate = useCallback((dir: "prev" | "next") => {
    play("tick");
    setPlayingAlbum((cur) => {
      if (!cur) return cur;
      const idx = ALBUMS.findIndex((a) => a.id === cur.id);
      const n = dir === "next" ? (idx + 1) % ALBUMS.length : (idx - 1 + ALBUMS.length) % ALBUMS.length;
      return ALBUMS[n];
    });
    setIsPlaying(true);
    setElapsed(0);
  }, []);
  const handleClose = useCallback(() => {
    play("close");
    setPlayingAlbum(null);
    setIsPlaying(false);
    setElapsed(0);
  }, []);

  const toggleDrawer = useCallback((open: boolean) => {
    if (open !== expandedRef.current) play(open ? "open" : "close");
    animate(drawerProgress, open ? 1 : 0, reduceMotion ? { duration: 0 } : SNAP_SPRING);
    expandedRef.current = open;
    setExpanded(open);
  }, [drawerProgress, reduceMotion]);

  const onHandlePan = (_: PointerEvent, info: PanInfo) => {
    const base = expandedRef.current ? 1 : 0;
    const delta = -info.offset.y / DRAWER_HEIGHT;
    drawerProgress.set(Math.max(0, Math.min(1, base + delta)));
  };
  const onHandlePanEnd = (_: PointerEvent, info: PanInfo) => {
    const vel = -info.velocity.y / DRAWER_HEIGHT;
    const shouldOpen = vel > 0.8 || (vel > -0.8 && drawerProgress.get() > 0.42);
    toggleDrawer(shouldOpen);
  };

  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim()) return;
    setMessage("");
    textareaRef.current?.focus();
  }, [message]);

  // Space / P / N while the widget has focus (kept local so cards don't fight over keys)
  const onKey = (e: React.KeyboardEvent) => {
    if (!playingAlbum) return;
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "TEXTAREA" || tag === "INPUT") return;
    if (e.key === " ") { e.preventDefault(); handlePlayPause(); }
    if (e.key === "p" || e.key === "P") { e.preventDefault(); handleNavigate("prev"); }
    if (e.key === "n" || e.key === "N") { e.preventDefault(); handleNavigate("next"); }
  };

  return (
    <MotionConfig transformPagePoint={(p) => ({ x: p.x / scaleRef.current, y: p.y / scaleRef.current })}>
      <style>{`.chat-ta::placeholder{color:var(--k-muted);opacity:1}.chat-ta{caret-color:#34b562}.chat-root *:focus-visible{outline:2px solid rgba(52,181,98,.55);outline-offset:2px}
.chat-root{--ch-green:#34b562;--ch-end:#5d6862;--ch-tint:rgba(255,255,255,.06);--ch-edge:rgba(255,255,255,.06);--ch-drop:rgba(0,0,0,.4);
--ch-shell:linear-gradient(178.1deg,#2b2d2b 0.64%,rgba(43,45,43,0.55) 52.61%,rgba(43,45,43,0) 112.36%);--ch-shell-sh:inset 0 1px 0 rgba(255,255,255,.06);--ch-pill:#ffffff;
--ch-chip:linear-gradient(135deg, #2b2d2b 0%, #22303f 100%);
--ch-on:#e3e8e3;--ch-on-ink:#191a19;--ch-on-sh:0 0 0 0.75px rgba(255,255,255,.2), inset 0 1px 2px rgba(255,255,255,.16);--ch-on-gloss:linear-gradient(180deg, rgba(255,255,255,0.5) 6.67%, rgba(255,255,255,0) 103.33%);
--ch-sleeve-sh:inset 1px 0px 2px 3px rgba(255,255,255,0.06),inset 0px 1px 2px 0px rgba(255,255,255,0.14), 0 0 0 1px rgba(255,255,255,.05)}
:root[data-theme="light"] .chat-root{--ch-green:oklch(0.6 0.16 150);--ch-end:var(--k-muted);--ch-tint:oklch(0.22 0.008 264 / 0.05);--ch-edge:oklch(0.22 0.008 264 / 0.09);--ch-drop:oklch(0.22 0.008 264 / 0.2);
--ch-shell:linear-gradient(178.1deg,oklch(0.935 0.004 264) 0.64%,oklch(0.945 0.004 264 / 0.75) 52.61%,oklch(0.955 0.003 264 / 0.4) 112.36%);--ch-shell-sh:inset 0 1px 0 oklch(1 0 0 / 0.7), inset 0 0 0 1px oklch(0.22 0.008 264 / 0.05);--ch-pill:oklch(0.22 0.008 264);
--ch-chip:linear-gradient(135deg, oklch(1 0 0) 0%, oklch(0.95 0.012 250) 100%);
--ch-on:oklch(0.22 0.008 264);--ch-on-ink:oklch(1 0 0);--ch-on-sh:0 0 0 0.75px oklch(0.22 0.008 264), inset 0 1px 2px oklch(1 0 0 / 0.16);--ch-on-gloss:linear-gradient(180deg, oklch(1 0 0 / 0.18) 6.67%, oklch(1 0 0 / 0) 103.33%);
--ch-sleeve-sh:inset 0px 1px 2px 0px oklch(1 0 0 / 0.5), 0 0 0 1px oklch(0.22 0.008 264 / 0.07)}`}</style>
      <div ref={rootRef} className="chat-root" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", perspective: 900 }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center" }}>
          <motion.div
            data-own-click=""
            onKeyDown={onKey}
            drag
            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
            dragElastic={0.35}
            dragTransition={{ bounceStiffness: 280, bounceDamping: 28 }}
            style={{ x: posX, y: posY, rotateX: reduceMotion ? 0 : tiltX, rotateY: reduceMotion ? 0 : tiltY, width: NAT_W, pointerEvents: "auto", userSelect: "none", WebkitUserSelect: "none", transformOrigin: "center center" }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, filter: "blur(2px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={reduceMotion ? { duration: 0 } : MOUNT_SPRING}
            whileDrag={{ cursor: "grabbing" }}
          >
            {/* Outer shell */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "0 2px 2px", borderRadius: 22, width: "100%", background: "var(--ch-shell)", boxShadow: "var(--ch-shell-sh)" }}>
              {/* Handle: drag or tap */}
              <motion.div
                onPan={onHandlePan}
                onPanStart={() => play("slide", { gap: 200 })}
                onPanEnd={onHandlePanEnd}
                onTap={() => toggleDrawer(!expandedRef.current)}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); toggleDrawer(!expandedRef.current); } }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "13px 16px 10px", width: "100%", flexShrink: 0, cursor: "grab", touchAction: "none", borderRadius: 20 }}
                role="button"
                aria-label={expanded ? "Close recent songs" : "Open recent songs"}
                aria-expanded={expanded}
                tabIndex={0}
              >
                <motion.div style={{ height: 3, borderRadius: 999, background: "var(--ch-pill)", width: pillWidth, opacity: pillOpacity }} />
              </motion.div>

              {/* Songs drawer */}
              <motion.div style={{ height: songsHeight, overflow: "hidden", width: "100%", flexShrink: 0 }} aria-hidden={!expanded} {...(!expanded ? { inert: true } : {})}>
                <motion.div style={{ opacity: songsOpacity, y: songsY, display: "flex", flexDirection: "column", gap: 11, alignItems: "flex-start", width: "100%", paddingBottom: 8 }}>
                  <div style={{ padding: "0 12px", width: "100%" }}>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: "16px", color: "var(--k-muted)" }}>Recent songs</p>
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "0 12px", width: "100%", overflow: "visible" }} onPointerDown={(e) => e.stopPropagation()}>
                    {ALBUMS.map((album) => (
                      <AlbumCard key={album.id} album={album} reduceMotion={reduceMotion} onPlay={handlePlayAlbum} disabled={!expanded} />
                    ))}
                  </div>
                </motion.div>
              </motion.div>

              {/* Bottom card: composer ↔ now playing */}
              <div style={{ width: "100%" }}>
                <div style={{ background: "var(--k-raised)", borderRadius: 20, width: "100%", flexShrink: 0, overflow: "hidden", boxShadow: "var(--k-lift)" }}>
                  <AnimatePresence mode="wait" initial={false}>
                    {playingAlbum ? (
                      <NowPlayingCard key="now-playing" album={playingAlbum} isPlaying={isPlaying} elapsed={elapsed} onPlayPause={handlePlayPause} onClose={handleClose} reduceMotion={reduceMotion} />
                    ) : (
                      <motion.div
                        key="idle"
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.12, ease: "easeIn" } }}
                        transition={{ type: "spring", visualDuration: 0.22, bounce: 0.1 }}
                      >
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start", padding: 12, width: "100%", boxSizing: "border-box" }}>
                          <textarea
                            ref={textareaRef}
                            className="chat-ta"
                            value={message}
                            rows={1}
                            spellCheck={false}
                            autoComplete="off"
                            placeholder="What mood are you in"
                            aria-label="What mood are you in"
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                            onPointerDown={(e) => e.stopPropagation()}
                            style={{ width: "100%", resize: "none", outline: "none", border: "none", background: "transparent", padding: 0, margin: 0, lineHeight: "16px", font: "inherit", fontSize: 12, color: "var(--k-text)", userSelect: "text" }}
                          />
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
                            <motion.button
                              type="submit"
                              whileHover={{ scale: 1.07 }}
                              whileTap={{ scale: 0.94 }}
                              transition={BTN_SPRING}
                              aria-label="Send message"
                              onPointerDown={(e) => e.stopPropagation()}
                              style={{ position: "relative", overflow: "hidden", borderRadius: 8, padding: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", border: "none", background: "#34b562", boxShadow: "0 0 0 0.75px #2a9a52, inset 0 1px 2px rgba(255,255,255,0.16), 0 1px 2px var(--ch-drop)", touchAction: "manipulation" }}
                            >
                              <div aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: 8, pointerEvents: "none", background: "linear-gradient(180deg,rgba(255,255,255,0.2) 6.67%,rgba(255,255,255,0) 103.33%)" }} />
                              <div style={{ position: "relative", zIndex: 1, width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ArrowUpIcon />
                              </div>
                            </motion.button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
