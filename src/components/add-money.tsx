/* Add money. Split out of Card funding, ported from ~/Documents/Card funding (CardFunding.tsx).
 * Tap Add money: the wallet lifts out (y -52, scale .93, 320ms), the sheet springs in
 * from below with staggered rows; the amount rolls like an odometer on +/- (or a drag
 * along the stepper). Add or close drops the wallet back in, ready to go again.
 * Sounds: open as the sheet comes in, tick on +/-, detents while dragging the stepper,
 * chime on Add, close on the close button.
 */
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, animate } from "framer-motion";
import { play } from "../sound/sound";

/* ── timings (verbatim from the source) ── */
const IDLE_ROTATE = [1.99, -4.09, 0];
const SD = { top: 0.12, amount: 0.19, stepper: 0.27, button: 0.42 };
const cv = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6, transition: { duration: 0.07 } },
  transition: { duration: 0.24, ease: [0.165, 0.84, 0.44, 1] as const, delay },
});

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
  green: "linear-gradient(180deg,#3cc06b,#22994c)",
};

/* the widget is laid out at the source's size and scaled to fit the card */
const BASE_W = 343;
const BASE_H = 318;
const LIFT = 58; // room above the wallet for the lifted cards

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

function CardBody({ card }: { card: (typeof CARDS)[number] }) {
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
    </div>
  );
}

/* ── odometer digit (0.45s, [0.22,1,0.36,1]) ── */
type Dir = 1 | -1;
const DIGIT: React.CSSProperties = { fontWeight: 500, fontSize: 56, lineHeight: "64px", color: C.text, letterSpacing: "-0.56px", fontVariantNumeric: "tabular-nums" };
function Digit({ char, dir }: { char: string; dir: Dir }) {
  if (!/\d/.test(char)) return <span style={{ ...DIGIT, display: "inline-block", verticalAlign: "bottom" }}>{char}</span>;
  return (
    <span style={{ display: "inline-block", overflow: "hidden", height: 64, verticalAlign: "bottom", position: "relative" }}>
      <AnimatePresence initial={false} mode="popLayout" custom={dir}>
        <motion.span
          key={char}
          custom={dir}
          variants={{
            initial: (d: Dir) => ({ y: d > 0 ? "110%" : "-110%", opacity: 0 }),
            animate: { y: "0%", opacity: 1 },
            exit: (d: Dir) => ({ y: d > 0 ? "-110%" : "110%", opacity: 0 }),
          }}
          initial="initial" animate="animate" exit="exit"
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ ...DIGIT, display: "block" }}
        >{char}</motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ── add money sheet (distilled: amount, fill stepper, proceed) ── */
const MIN = 1, MAX = 200, INSET = 4, FILL_H = 52, THUMB_W = 8;
function Sheet({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const [value, setValue] = useState(69);
  const [dir, setDir] = useState<Dir>(1);
  const prev = useRef(69);
  const track = useRef<HTMLDivElement>(null);
  const fillW = useMotionValue(0);
  const dragging = useRef(false);

  const toFW = useCallback((v: number, tw: number) => INSET + THUMB_W + ((v - MIN) / (MAX - MIN)) * (tw - 2 * INSET - THUMB_W), []);
  useLayoutEffect(() => { if (track.current) fillW.set(toFW(69, track.current.offsetWidth)); }, [fillW, toFW]);

  const change = useCallback((next: number, anim = true) => {
    setDir(next >= prev.current ? 1 : -1);
    prev.current = next;
    setValue(next);
    if (anim && track.current) animate(fillW, toFW(next, track.current.offsetWidth), { type: "spring", visualDuration: 0.3, bounce: 0 });
  }, [fillW, toFW]);

  // drag anywhere on the track; work in fractions so the card's CSS scale does not matter
  const fromPointer = (e: React.PointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    const tw = track.current!.offsetWidth;
    const x = ((e.clientX - r.left) / r.width) * tw;
    const fw = Math.max(INSET + THUMB_W, Math.min(tw - INSET, x + THUMB_W / 2));
    fillW.set(fw);
    const raw = MIN + ((fw - INSET - THUMB_W) / (tw - 2 * INSET - THUMB_W)) * (MAX - MIN);
    const next = Math.max(MIN, Math.min(MAX, Math.round(raw)));
    if (next !== prev.current) { change(next, false); play("detent", { gap: 40 }); }
  };

  const btn: React.CSSProperties = {
    position: "relative", zIndex: 3, width: 40, height: 40, border: "none", background: "transparent", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", color: C.text, flexShrink: 0, padding: 0,
  };

  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 20, background: C.raised, boxShadow: C.shadow, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <motion.div {...cv(SD.top)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative", width: 28, height: 20 }}>
            {CARDS.map((c, i) => (
              <div key={c.id} style={{ position: "absolute", left: i * 3, top: i * 3 - 2, width: 22, height: 14, borderRadius: 3, background: c.color, transform: `rotate(${IDLE_ROTATE[i]}deg)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.45)" }} />
            ))}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.sec, letterSpacing: "-0.08px" }}>Add money</span>
        </div>
        <motion.button type="button" onClick={() => { play("close"); onClose(); }} whileTap={{ scale: 0.88 }} transition={{ type: "spring", visualDuration: 0.2, bounce: 0 }} aria-label="Close"
          style={{ width: 28, height: 28, borderRadius: 999, border: "none", background: "rgba(255,255,255,.06)", boxShadow: "0 0 0 1px rgba(255,255,255,.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, padding: 0 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M10 2L2 10M2 2l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </motion.button>
      </motion.div>

      <motion.div {...cv(SD.amount)} style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, padding: "18px 16px 18px" }}>
        <span style={{ fontWeight: 500, fontSize: 20, lineHeight: "28px", color: C.faint, paddingBottom: 10 }}>$</span>
        <div style={{ display: "flex", alignItems: "flex-end" }} aria-live="polite">
          {value.toFixed(2).split("").map((ch, i) => <Digit key={i} char={ch} dir={dir} />)}
        </div>
      </motion.div>

      <motion.div {...cv(SD.stepper)} style={{ padding: "0 16px" }}>
        <div
          ref={track}
          onPointerDown={(e) => { if ((e.target as HTMLElement).closest("button")) return; dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
          onPointerMove={(e) => { if (dragging.current) fromPointer(e); }}
          onPointerUp={() => { dragging.current = false; }}
          onPointerCancel={() => { dragging.current = false; }}
          style={{
            background: "#1d1f1d", borderRadius: 16, height: FILL_H + 2 * INSET, position: "relative", userSelect: "none", touchAction: "none",
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", cursor: "ew-resize",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.05)",
          }}
        >
          <motion.div style={{ position: "absolute", left: INSET, top: INSET, height: FILL_H, borderRadius: 12, background: C.raised, boxShadow: C.shadow, width: fillW, pointerEvents: "none" }} />
          <motion.button type="button" onClick={() => { if (value > MIN) { play("tick"); change(value - 1); } }} whileTap={{ scale: 0.82 }} transition={{ type: "spring", visualDuration: 0.18, bounce: 0 }} aria-label="Decrease amount" style={btn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 8h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </motion.button>
          <span style={{ position: "relative", zIndex: 3, width: 84, textAlign: "center", fontWeight: 500, fontSize: 18, lineHeight: "28px", color: C.sec, fontVariantNumeric: "tabular-nums", pointerEvents: "none" }}>${value.toFixed(2)}</span>
          <motion.button type="button" onClick={() => { if (value < MAX) { play("tick"); change(value + 1); } }} whileTap={{ scale: 0.82 }} transition={{ type: "spring", visualDuration: 0.18, bounce: 0 }} aria-label="Increase amount" style={btn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </motion.button>
        </div>
      </motion.div>

      <motion.div {...cv(SD.button)} style={{ padding: "14px 16px 16px" }}>
        <motion.button type="button" onClick={() => { play("chime"); onAdd(); }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", visualDuration: 0.2, bounce: 0 }}
          style={{
            width: "100%", height: 40, borderRadius: 999, border: "none", background: C.green, cursor: "pointer", color: "#fff",
            fontSize: 14, fontWeight: 500, letterSpacing: "-0.084px", fontFamily: "inherit",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.28), 0 0 0 1px rgba(0,0,0,.45), 0 2px 6px -2px rgba(0,0,0,.5)",
          }}>
          Add ${value.toFixed(2)}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function AddMoney({ size = "card" }: { size?: "card" | "big" }) {
  const { ref, s } = useFit(size);
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<"idle" | "sheet">("idle");
  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <div style={{ width: BASE_W * s, height: BASE_H * s, position: "relative" }}>
        <div data-own-click style={{ pointerEvents: "auto", position: "absolute", left: 0, top: 0, width: BASE_W, height: BASE_H, transform: `scale(${s})`, transformOrigin: "0 0", color: C.text }}>
          <AnimatePresence initial={false}>
            {stage === "idle" ? (
              <motion.div
                key="wallet"
                style={{ position: "absolute", left: 0, top: LIFT, width: BASE_W, height: 259 }}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -52, scale: 0.93, transition: { duration: 0.32, ease: [0.4, 0, 0.55, 1] } }}
                transition={{ type: "spring", duration: 0.52, bounce: 0.24 }}
              >
                <div style={{ position: "relative", width: BASE_W, height: 259 }}>
                  {/* wallet shell */}
                  <div style={{ position: "absolute", inset: 0, borderRadius: 32, background: C.raised, boxShadow: C.shadow }} />

                  {/* the three cards at rest, same placement and tilt as the source */}
                  <div style={{ position: "absolute", left: 12.74, top: -26.42, width: 315.52, height: 197.885, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, transform: `rotate(${IDLE_ROTATE[0]}deg)` }}>
                    <CardBody card={CARDS[0]} />
                  </div>
                  <div style={{ position: "absolute", left: 9.62, top: 0.12, width: 321.76, height: 208.813, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, transform: `rotate(${IDLE_ROTATE[1]}deg)` }}>
                    <CardBody card={CARDS[1]} />
                  </div>
                  <div style={{ position: "absolute", left: 17, top: 49, width: 309, height: 146, borderRadius: 11.17, overflow: "hidden", zIndex: 3, boxShadow: "0 0.5px 1.4px rgba(0,0,0,.2), 0 0 0 0.5px rgba(255,255,255,0.1)" }}>
                    <CardBody card={CARDS[2]} />
                  </div>

                  {/* frosted pocket, stands in for the source's texture image */}
                  <div aria-hidden style={{
                    position: "absolute", left: 0, right: 0, top: 124, bottom: 0, zIndex: 6, pointerEvents: "none",
                    borderRadius: "8px 8px 32px 32px",
                    background: "linear-gradient(180deg, rgba(44,46,44,.72) 0%, rgba(38,40,38,.97) 34%, #242624 100%)",
                    backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.1)",
                  }} />

                  <motion.div style={{ position: "absolute", left: 0, right: 0, top: 148, zIndex: 7, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
                      <p style={{ margin: 0, fontWeight: 500, fontSize: 18, lineHeight: "24px", letterSpacing: "-0.27px", color: C.text, fontVariantNumeric: "tabular-nums" }}>$98,000</p>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: "16px", color: C.muted }}>Total balance</p>
                    </div>
                    <motion.button type="button" onClick={() => { play("open"); setStage("sheet"); }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", visualDuration: 0.2, bounce: 0 }}
                      style={{
                        height: 32, padding: "0 14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
                        background: "rgba(255,255,255,.08)", color: C.text, fontSize: 13, fontWeight: 500, letterSpacing: "-0.078px",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,.1), 0 0 0 1px rgba(255,255,255,.08), 0 1px 3px rgba(0,0,0,.4)",
                        backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)",
                      }}>
                      Add money
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="sheet"
                style={{ position: "absolute", left: 0, top: 22, width: BASE_W, height: 296 }}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
              >
                <Sheet onClose={() => setStage("idle")} onAdd={() => setStage("idle")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
