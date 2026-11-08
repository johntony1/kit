/* Card fan. Split out of Card funding, ported from ~/Documents/Card funding (CardFunding.tsx).
 * Hover the wallet: Naira springs first (0ms), Dollar 60ms, Euro 120ms, cards fan
 * wider and tilt in 3D toward the pointer (GSAP quickTo) with a shimmer. On touch,
 * a tap fans them and a second tap puts them back.
 * Sound: fan as the pointer enters (the hover is the interaction), at most every 400ms.
 */
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { play } from "../sound/sound";

/* ── springs and timings (verbatim from the source) ── */
const SPRINGS = {
  hover: { type: "spring" as const, visualDuration: 0.5, bounce: 0.7 },
  settle: { type: "spring" as const, visualDuration: 0.5, bounce: 0.2 },
};
const IDLE_ROTATE = [1.99, -4.09, 0];
const HOVER_ROTATE = [6, -9, 0];
const HOVER_LIFT = [
  { y: -22, scale: 0.9 },
  { y: -36, scale: 0.88 },
  { y: -50, scale: 0.86 },
];
const HOVER_DELAY = [0.12, 0.06, 0];
const HOVER = {
  wallet: { maxTilt: 4, duration: 0.5 },
  cards: [
    { maxX: 5, maxY: 7, duration: 0.55 },
    { maxX: 9, maxY: 12, duration: 0.45 },
    { maxX: 14, maxY: 18, duration: 0.35 },
  ],
  shimmerOpacity: 0.28,
  resetDuration: 0.7,
  resetEase: "elastic.out(1, 0.5)",
};
const CARDS = [
  { id: "euro", label: "Euro", symbol: "€", amount: "50,000", color: "#f02d55" },
  { id: "dollar", label: "Dollar", symbol: "$", amount: "50,000", color: "#2cac4d" },
  { id: "naira", label: "Naira", symbol: "₦", amount: "50,000", color: "#f5841e" },
];

/* ── dark tokens ── */
const C = {
  text: "#e3e8e3", sec: "#c2cbc4", muted: "#8b968f", faint: "#5d6862",
  raised: "linear-gradient(180deg,#2b2d2b,#242624)",
  shadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)",
};

/* the widget is laid out at the source's size and scaled to fit the card */
const BASE_W = 343;
const LIFT = 58; // room above the wallet for the lifted cards
const BASE_H = LIFT + 259;

function useFit(size: "card" | "big") {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(size === "big" ? 1.5 : 0.6);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const availH = size === "big" ? h * 0.78 : Math.max(h - 116, h * 0.62);
      const availW = w - (size === "big" ? 160 : 48);
      setS(Math.max(0.2, Math.min(availW / BASE_W, availH / BASE_H, size === "big" ? 2.2 : 1)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);
  return { ref, s };
}

function CardBody({ card, shimmerRef }: { card: (typeof CARDS)[number]; shimmerRef: (el: HTMLDivElement | null) => void }) {
  const label: React.CSSProperties = {
    position: "absolute", top: 14, margin: 0, fontWeight: 700, fontSize: 14, lineHeight: "20px",
    color: "#fff", letterSpacing: "-0.3px", textShadow: "0 1px 3px rgba(0,0,0,0.25)",
  };
  return (
    <div style={{ width: 309.202, height: 187.257, background: card.color, borderRadius: 11.17, overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <div aria-hidden style={{
        position: "absolute", inset: 0, borderRadius: 11.17, pointerEvents: "none",
        boxShadow: "inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(255,255,255,0.12), inset 2px 0 8px rgba(255,255,255,0.08), inset -2px 0 8px rgba(255,255,255,0.08), inset 0 0 28px rgba(255,255,255,0.06)",
      }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(150deg, rgba(255,255,255,0.18) 0%, transparent 45%)" }} />
      <p style={{ ...label, left: 16 }}>{card.label}</p>
      <p style={{ ...label, right: 16, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{card.symbol}{card.amount}</p>
      <div ref={shimmerRef} aria-hidden style={{
        position: "absolute", inset: 0, opacity: 0, pointerEvents: "none", mixBlendMode: "overlay", transition: "opacity 0.3s ease",
        background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.3) 50%, transparent 80%)",
      }} />
    </div>
  );
}

export default function CardFan({ size = "card" }: { size?: "card" | "big" }) {
  const { ref, s } = useFit(size);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);

  const deckRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const shimmerRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const qX = useRef<(gsap.QuickToFunc | null)[]>([null, null, null]);
  const qY = useRef<(gsap.QuickToFunc | null)[]>([null, null, null]);

  useLayoutEffect(() => {
    if (reduced) return;
    wrapperRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { transformPerspective: 900 });
      qX.current[i] = gsap.quickTo(el, "rotateY", { duration: HOVER.cards[i].duration, ease: "power3.out" });
      qY.current[i] = gsap.quickTo(el, "rotateX", { duration: HOVER.cards[i].duration, ease: "power3.out" });
    });
  }, [reduced]);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = deckRef.current?.getBoundingClientRect();
    if (!r) return;
    const dx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const dy = ((e.clientY - r.top) / r.height - 0.5) * 2;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    gsap.to(deckRef.current, { rotateX: -dy * HOVER.wallet.maxTilt, rotateY: dx * HOVER.wallet.maxTilt, duration: HOVER.wallet.duration, ease: "power2.out", transformPerspective: 1200 });
    wrapperRefs.current.forEach((el, i) => {
      if (!el) return;
      const cfg = HOVER.cards[i];
      qX.current[i]?.(dx * cfg.maxY);
      qY.current[i]?.(-dy * cfg.maxX);
      const sh = shimmerRefs.current[i];
      if (sh) {
        sh.style.background = `linear-gradient(${angle + 90}deg, transparent 15%, rgba(255,255,255,${HOVER.shimmerOpacity}) 50%, transparent 85%)`;
        sh.style.opacity = "1";
      }
    });
  }, [reduced]);

  // the hover is the interaction, so the fan gets its sound on entry (gapped so a jittery pointer is quiet)
  const onEnter = useCallback(() => {
    if (hoveredRef.current) return;
    hoveredRef.current = true;
    play("fan", { gap: 400 });
    if (!reduced) setHovered(true);
  }, [reduced]);
  const onLeave = useCallback(() => {
    hoveredRef.current = false;
    setHovered(false);
    if (reduced) return;
    wrapperRefs.current.forEach((el) => { if (el) gsap.to(el, { rotateX: 0, rotateY: 0, duration: HOVER.resetDuration, ease: HOVER.resetEase }); });
    shimmerRefs.current.forEach((sh) => { if (sh) sh.style.opacity = "0"; });
    if (deckRef.current) gsap.to(deckRef.current, { rotateX: 0, rotateY: 0, duration: HOVER.resetDuration, ease: HOVER.resetEase });
  }, [reduced]);

  const cardAnimate = (i: number) => hovered
    ? { y: HOVER_LIFT[i].y, scale: HOVER_LIFT[i].scale, rotate: HOVER_ROTATE[i] }
    : { y: 0, scale: 1, rotate: IDLE_ROTATE[i] };
  const cardTransition = (i: number) => (hovered ? { ...SPRINGS.hover, delay: HOVER_DELAY[i] } : SPRINGS.settle);

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <div style={{ width: BASE_W * s, height: BASE_H * s, position: "relative" }}>
        <div data-own-click style={{ pointerEvents: "auto", position: "absolute", left: 0, top: 0, width: BASE_W, height: BASE_H, transform: `scale(${s})`, transformOrigin: "0 0", color: C.text }}>
          <motion.div
            style={{ position: "absolute", left: 0, top: LIFT, width: BASE_W, height: 259 }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.52, bounce: 0.24 }}
          >
            <div ref={deckRef} onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave}
              onPointerDown={(e) => { if (e.pointerType !== "mouse") (hoveredRef.current ? onLeave : onEnter)(); }}
              style={{ position: "relative", width: BASE_W, height: 259, cursor: "pointer" }}>
              {/* wallet shell */}
              <div style={{ position: "absolute", inset: 0, borderRadius: 32, background: C.raised, boxShadow: C.shadow }} />

              <motion.div style={{ position: "absolute", left: 12.74, top: -26.42, width: 315.52, height: 197.885, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}
                initial={{ rotate: IDLE_ROTATE[0] }} animate={cardAnimate(0)} transition={cardTransition(0)}>
                <div ref={(el) => { wrapperRefs.current[0] = el; }} style={{ flexShrink: 0 }}>
                  <CardBody card={CARDS[0]} shimmerRef={(el) => { shimmerRefs.current[0] = el; }} />
                </div>
              </motion.div>

              <motion.div style={{ position: "absolute", left: 9.62, top: 0.12, width: 321.76, height: 208.813, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
                initial={{ rotate: IDLE_ROTATE[1] }} animate={cardAnimate(1)} transition={cardTransition(1)}>
                <div ref={(el) => { wrapperRefs.current[1] = el; }} style={{ flexShrink: 0 }}>
                  <CardBody card={CARDS[1]} shimmerRef={(el) => { shimmerRefs.current[1] = el; }} />
                </div>
              </motion.div>

              <motion.div
                style={{ position: "absolute", left: 17, top: 49, width: 309, borderRadius: 11.17, overflow: "hidden", zIndex: 3, boxShadow: "0 0.5px 1.4px rgba(0,0,0,.2), 0 0 0 0.5px rgba(255,255,255,0.1)" }}
                animate={hovered ? { height: 146, y: HOVER_LIFT[2].y, scale: HOVER_LIFT[2].scale, rotate: HOVER_ROTATE[2] } : { height: 146, y: 0, scale: 1, rotate: IDLE_ROTATE[2] }}
                transition={cardTransition(2)}
              >
                <div ref={(el) => { wrapperRefs.current[2] = el; }}>
                  <CardBody card={CARDS[2]} shimmerRef={(el) => { shimmerRefs.current[2] = el; }} />
                </div>
              </motion.div>

              {/* frosted pocket, stands in for the source's texture image */}
              <div aria-hidden style={{
                position: "absolute", left: 0, right: 0, top: 124, bottom: 0, zIndex: 6, pointerEvents: "none",
                borderRadius: "8px 8px 32px 32px",
                background: "linear-gradient(180deg, rgba(44,46,44,.72) 0%, rgba(38,40,38,.97) 34%, #242624 100%)",
                backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.1)",
              }} />

              <motion.div style={{ position: "absolute", left: 0, right: 0, top: 168, zIndex: 7, display: "flex", flexDirection: "column", alignItems: "center" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 18, lineHeight: "24px", letterSpacing: "-0.27px", color: C.text, fontVariantNumeric: "tabular-nums" }}>$98,000</p>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: "16px", color: C.muted }}>Total balance</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
