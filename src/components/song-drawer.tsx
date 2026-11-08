// Song drawer: pull the handle (or tap it) and the Recent songs drawer slides up; pull it back down to close.
// Split out of chat.tsx (Chat composer, port of Music animation / ChatbotIdle.tsx, dark).
// The sleeves here are still; hovering and playing them lives in record-sleeve.tsx.
//
//   handle drag   drawer follows the finger 1:1 (0 → 195 px); release snaps open past 42% or on a flick
//   handle tap    toggles the drawer
//   snap          spring 380 / 40; pill narrows 40 → 28 and brightens as it opens
//   sounds        slide when a drag starts, open / close when the drawer snaps to a new state
import { motion, useMotionValue, useTransform, useReducedMotion, animate, MotionConfig, type PanInfo } from "framer-motion";
import { useRef, useState, useCallback, useLayoutEffect } from "react";
import { play } from "../sound/sound";

// ── Spring / timing constants (exact from source) ──────────
const DRAWER_HEIGHT = 195;
const SNAP_SPRING = { type: "spring", stiffness: 380, damping: 40 } as const;
const MOUNT_SPRING = { type: "spring", visualDuration: 0.38, bounce: 0.18 } as const;

// Natural size of the widget (drawer open) for fitting into the card.
const NAT_W = 477;
const NAT_H = 270;

const ALBUMS = [
  { id: 1, title: "Clarity of mind", artist: "Omah Lay", tint: "rgba(120,96,70,0.22)", cover: "radial-gradient(circle at 70% 30%, rgba(255,214,170,.35) 0 18%, transparent 19%), linear-gradient(180deg,#3a3438 0%,#231e1a 100%)" },
  { id: 2, title: "Worship", artist: "Asake", tint: "rgba(70,100,160,0.22)", cover: "radial-gradient(circle at 30% 65%, rgba(160,190,255,.32) 0 22%, transparent 23%), linear-gradient(180deg,#4d556b 0%,#1d2740 100%)" },
  { id: 3, title: "Mofe", artist: "Mavo", tint: "rgba(156,67,28,0.25)", cover: "radial-gradient(ellipse at 50% 110%, rgba(255,190,170,.55) 0 40%, transparent 41%), linear-gradient(180deg,#3f3228 0%,#af806f 100%)" },
  { id: 4, title: "How far", artist: "No 11", tint: "rgba(160,110,20,0.25)", cover: "radial-gradient(circle at 50% 42%, rgba(30,28,22,.55) 0 20%, transparent 21%), linear-gradient(180deg,#3e3c31 0%,#d5b68f 100%)" },
] as const;
type Album = (typeof ALBUMS)[number];

function MusicAiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6.2 11.3V4.4l6-1.4v6.9" stroke="#34b562" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4.9" cy="11.4" r="1.6" fill="#34b562" />
      <circle cx="10.9" cy="10" r="1.6" fill="#34b562" />
      <path d="M2.6 2.4l.35.9.9.35-.9.35-.35.9-.35-.9-.9-.35.9-.35z" fill="#34b562" />
    </svg>
  );
}

// A closed sleeve, as the album card shows at rest
function Sleeve({ album }: { album: Album }) {
  return (
    <div style={{ width: 100, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start", flexShrink: 0 }}>
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 16, background: album.tint, boxShadow: "inset 1px 0px 2px 3px rgba(255,255,255,0.06),inset 0px 1px 2px 0px rgba(255,255,255,0.14), 0 0 0 1px rgba(255,255,255,.05)" }} />
        <div style={{ position: "absolute", left: 0, top: 4, width: 100, height: 96, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.12)", background: album.cover }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 16, boxShadow: "inset 0 1px 0 rgba(255,255,255,.14), inset 0 0 0 1px rgba(255,255,255,.06)" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: 100 }}>
        <p style={{ margin: 0, fontSize: 12, lineHeight: "18px", fontWeight: 500, color: "#e3e8e3", letterSpacing: "-0.072px", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{album.title}</p>
        <p style={{ margin: 0, fontSize: 12, lineHeight: "18px", color: "#8b968f", letterSpacing: "-0.072px" }}>{album.artist}</p>
      </div>
    </div>
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
      setS(Math.max(0.3, Math.min(1, (W - 40) / NAT_W, (H - 24) / NAT_H)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return [ref, s] as const;
}

export default function SongDrawer({ size = "card" }: { size?: "card" | "big" }) {
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

  return (
    <MotionConfig transformPagePoint={(p) => ({ x: p.x / scaleRef.current, y: p.y / scaleRef.current })}>
      <style>{`.song-drawer-root *:focus-visible{outline:2px solid rgba(52,181,98,.55);outline-offset:2px}`}</style>
      <div ref={rootRef} className="song-drawer-root" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: "center center" }}>
          <motion.div
            data-own-click=""
            style={{ width: NAT_W, pointerEvents: "auto", userSelect: "none", WebkitUserSelect: "none" }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, filter: "blur(2px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={reduceMotion ? { duration: 0 } : MOUNT_SPRING}
          >
            {/* Outer shell */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "0 2px 2px", borderRadius: 22, width: "100%", background: "linear-gradient(178.1deg,#2b2d2b 0.64%,rgba(43,45,43,0.55) 52.61%,rgba(43,45,43,0) 112.36%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)" }}>
              {/* Handle: drag or tap */}
              <motion.div
                onPanStart={() => play("slide", { gap: 200 })}
                onPan={onHandlePan}
                onPanEnd={onHandlePanEnd}
                onTap={() => toggleDrawer(!expandedRef.current)}
                onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); toggleDrawer(!expandedRef.current); } }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "13px 16px 10px", width: "100%", flexShrink: 0, cursor: "grab", touchAction: "none", borderRadius: 20 }}
                role="button"
                aria-label={expanded ? "Close recent songs" : "Open recent songs"}
                aria-expanded={expanded}
                tabIndex={0}
              >
                <motion.div style={{ height: 3, borderRadius: 999, background: "#ffffff", width: pillWidth, opacity: pillOpacity }} />
              </motion.div>

              {/* Songs drawer */}
              <motion.div style={{ height: songsHeight, overflow: "hidden", width: "100%", flexShrink: 0 }} aria-hidden={!expanded}>
                <motion.div style={{ opacity: songsOpacity, y: songsY, display: "flex", flexDirection: "column", gap: 11, alignItems: "flex-start", width: "100%", paddingBottom: 8 }}>
                  <div style={{ padding: "0 12px", width: "100%" }}>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: "16px", color: "#8b968f" }}>Recent songs</p>
                  </div>
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "0 12px", width: "100%" }}>
                    {ALBUMS.map((album) => <Sleeve key={album.id} album={album} />)}
                  </div>
                </motion.div>
              </motion.div>

              {/* Bottom card the drawer slides out of */}
              <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: 12, boxSizing: "border-box", background: "linear-gradient(180deg,#2b2d2b,#242624)", borderRadius: 20, boxShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)" }}>
                <MusicAiIcon />
                <span style={{ fontSize: 12, lineHeight: "16px", color: "#8b968f" }}>What mood are you in</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
