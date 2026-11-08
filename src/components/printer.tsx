/* Printer. Ported from ~/Documents/Printer animation (PrinterAnimation.tsx).
 * Slide the handle (it grows from the left, chevrons revealed) past 82% to print.
 * 500ms later the slip feeds out: 200ms pause, y -488 to 0 over 1.5s power2.out,
 * then a gentle float of 8px every 2s. Print again resets it.
 * Sounds: a detent for each chevron the handle passes, print as the slip starts to
 * feed, chime when it has fed out, tap on Print again.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { play } from "../sound/sound";

type Phase = "idle" | "printing" | "done";

/* ── timing and geometry (verbatim from the source) ── */
const T = { printerDelay: 0.06, feedDelay: 0.2, feedDuration: 1.5, floatY: 8, floatDuration: 2.0 };
const PW = 460;
const BODY_H = Math.round((460 * 273) / 915); // 137
const R_TOP = Math.round((202 * 460) / 915);
const R_LEFT = Math.round((88 * 460) / 915);
const R_W = Math.round((742 * 460) / 915);
const R_H = Math.round((1066 * 460) / 915);
const R_INNER_W = 741;
const R_INNER_H = 1065;
const R_SCALE = R_W / R_INNER_W;
const RECEIPT_INIT_Y = -488;

/* the card shows the printer and the first part of the slip */
const BASE_W = PW;
const BASE_H_CARD = 300;
const BASE_H_BIG = 430; // the big sheet shows more of the slip
const CLIP_TOP = 40; // the slip is hidden above this line (inside the printer body)

/* ── dark tokens ── */
const C = {
  text: "#e3e8e3", sec: "#c2cbc4", muted: "#8b968f", faint: "#5d6862",
  raised: "linear-gradient(180deg,#2b2d2b,#242624)",
  shadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)",
  green: "linear-gradient(180deg,#3cc06b,#22994c)",
};

function useFit(size: "card" | "big", BASE_H: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(size === "big" ? 1.4 : 0.7);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const availH = size === "big" ? h * 0.8 : Math.max(h - 116, h * 0.62);
      const availW = w - (size === "big" ? 200 : 48);
      setS(Math.max(0.2, Math.min(availW / BASE_W, availH / BASE_H, size === "big" ? 1.7 : 1)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size, BASE_H]);
  return { ref, s };
}

/* ── the payslip, laid out at Figma size then scaled ── */
const INK = "#181b25", SUB = "#525866";
function Row({ l, v, strong }: { l: string; v: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", whiteSpace: "nowrap", height: 30.68 }}>
      <p style={{ margin: 0, fontWeight: strong ? 500 : 400, fontSize: 21.48, lineHeight: "30.68px", letterSpacing: "-0.31px", color: strong ? INK : SUB }}>{l}</p>
      <p style={{ margin: 0, fontWeight: strong ? 700 : 500, fontSize: 21.48, lineHeight: "30.68px", letterSpacing: "-0.31px", color: INK }}>{v}</p>
    </div>
  );
}
const Rule = () => <div style={{ height: 1.5, background: "#e1e4ea", flexShrink: 0 }} />;
const Cap = ({ children, end }: { children: string; end?: boolean }) => (
  <p style={{ margin: 0, fontWeight: 500, fontSize: 18.41, lineHeight: "24.55px", letterSpacing: "1.53px", color: SUB, textAlign: end ? "right" : "left" }}>{children}</p>
);
// scalloped edges: 18px bites every 48px along the top and bottom, as in the source's receipt svg
const SCALLOP = [
  "radial-gradient(circle 18px at 50% 8px, transparent 97%, #000 100%) 36.8px 0 / 47.9px 51% repeat-x",
  "radial-gradient(circle 18px at 50% 100%, transparent 97%, #000 100%) 36.8px 100% / 47.9px 51% repeat-x",
].join(", ");

function Payslip() {
  return (
    <div style={{ position: "relative", width: R_INNER_W, height: R_INNER_H, background: "#f4f5f3", borderRadius: 24.5, WebkitMask: SCALLOP, mask: SCALLOP }}>
      <div style={{ position: "absolute", left: 24.55, top: 62, width: 691.9, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontWeight: 500, fontSize: 24.55, lineHeight: "33.75px", letterSpacing: "-0.31px", color: INK }}>Payslip, PS-2026-001</p>
        <div style={{ background: "#fff", border: "1.53px solid #e1e4ea", borderRadius: 6, padding: "6px 12px" }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: 18.41, lineHeight: "24.55px", color: SUB, whiteSpace: "nowrap" }}>Feb 1 to Feb 28, 2026</p>
        </div>
      </div>

      <div style={{ position: "absolute", left: 24.55, top: 123.4, width: 691.9, boxSizing: "border-box", background: "linear-gradient(to bottom, rgba(233,233,255,0.55), rgba(204,229,241,0.55))", borderRadius: 18.41, padding: 24.55, display: "flex", justifyContent: "space-between" }}>
        {[
          { cap: "Employee", a: "Amina Okafor", b: "Senior Software Engineer", c: "EMP-1001" },
          { cap: "Employer", a: "TechVentures Ltd", b: "14 Broad St, Lagos", c: "TIN-0012345678", end: true },
        ].map((p) => (
          <div key={p.cap} style={{ display: "flex", flexDirection: "column", gap: 12.27, width: 260, alignItems: p.end ? "flex-end" : "flex-start", textAlign: p.end ? "right" : "left" }}>
            <Cap end={p.end}>{p.cap}</Cap>
            <div style={{ display: "flex", flexDirection: "column", gap: 6.14, alignItems: p.end ? "flex-end" : "flex-start" }}>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 21.48, lineHeight: "30.68px", color: INK }}>{p.a}</p>
              <p style={{ margin: 0, fontSize: 21.48, lineHeight: "30.68px", color: SUB }}>{p.b}</p>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 18.41, lineHeight: "24.55px", color: SUB }}>{p.c}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 24.55, top: 332, width: 691.9, display: "flex", flexDirection: "column", gap: 12.27 }}>
        <Cap>Earnings</Cap>
        <Row l="Basic Salary" v="₦850,000" />
        <Row l="Housing Allowance" v="₦250,000" />
        <Row l="Transport Allowance" v="₦120,000" />
        <Row l="Overtime" v="₦45,000" />
        <Rule />
        <Row l="Gross Pay" v="₦1,265,000" strong />
        <Rule />
      </div>

      <div style={{ position: "absolute", left: 24.55, top: 620.5, width: 691.9, display: "flex", flexDirection: "column", gap: 12.27 }}>
        <Cap>Statutory Deductions</Cap>
        <Row l="PAYE Tax" v="-₦142,500" />
        <Row l="Pension (Employee 8%)" v="-₦68,000" />
        <Row l="NHF (2.5%)" v="-₦21,250" />
        <Row l="Health Insurance" v="-₦15,000" />
        <Rule />
        <Row l="Total Deductions" v="-₦246,750" strong />
        <Rule />
      </div>

      <div style={{ position: "absolute", left: 24.55, top: 921.1, width: 691.9, boxSizing: "border-box", background: "linear-gradient(174.4deg, rgba(93,208,231,0.2) 25%, rgba(115,0,255,0.18) 106%)", borderRadius: 18.41, padding: 24.55, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontWeight: 500, fontSize: 21.48, lineHeight: "30.68px", color: INK }}>Net Pay</p>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 24.55, lineHeight: "33.75px", color: INK }}>₦1,018,250</p>
      </div>
    </div>
  );
}

/* ── slide to print: the handle stays at left 2px and grows as you drag ── */
const TRACK_W = 326;
const HANDLE_W = 52;
const HANDLE_P = 2;
const SLID_W = TRACK_W - HANDLE_P * 2;
const MAX_GROW = SLID_W - HANDLE_W;
const TRIGGER_GROW = MAX_GROW * 0.82;
const EASE = "cubic-bezier(0.25, 0, 0.35, 1)";

function SlideButton({ onComplete, scale }: { onComplete: () => void; scale: React.RefObject<number> }) {
  const [handleW, setHandleW] = useState(HANDLE_W);
  const [dragging, setDragging] = useState(false);
  const [isSlid, setIsSlid] = useState(false);
  const isDragging = useRef(false);
  const startPtr = useRef(0);
  const startW = useRef(HANDLE_W);
  const triggered = useRef(false);
  const lastStep = useRef(0);

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (triggered.current) return;
    isDragging.current = true;
    setDragging(true);
    startPtr.current = e.clientX;
    startW.current = handleW;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || triggered.current) return;
    const delta = (e.clientX - startPtr.current) / (scale.current || 1); // pointer px to widget px
    const nw = Math.max(HANDLE_W, Math.min(SLID_W, startW.current + delta));
    setHandleW(nw);
    // one detent per chevron (20px glyph + 16px gap) the handle grows past
    const step = Math.floor((nw - HANDLE_W) / 36);
    if (step !== lastStep.current) { lastStep.current = step; play("detent", { gap: 40 }); }
    if (nw - HANDLE_W >= TRIGGER_GROW) {
      isDragging.current = false;
      triggered.current = true;
      setDragging(false);
      setIsSlid(true);
      setTimeout(onComplete, 500);
    }
  };
  const onUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setDragging(false);
    setHandleW(HANDLE_W);
    lastStep.current = 0;
  };

  return (
    <div style={{ position: "relative", width: TRACK_W, height: 44, flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "#1d1f1d", boxShadow: "inset 0 1px 2px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.06), 0 1px 0 rgba(255,255,255,.04)" }} />
      {!isSlid && (
        <p style={{ position: "absolute", inset: 0, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 14, letterSpacing: "-0.084px", lineHeight: "20px", color: C.muted, pointerEvents: "none", whiteSpace: "nowrap" }}>
          Slide to print pay slip
        </p>
      )}
      <div
        role="slider" aria-label="Slide to print pay slip" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(((isSlid ? SLID_W : handleW) - HANDLE_W) / MAX_GROW * 100)} tabIndex={0}
        onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " " || e.key === "ArrowRight") && !triggered.current) { e.preventDefault(); triggered.current = true; setIsSlid(true); setTimeout(onComplete, 500); } }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{
          position: "absolute", top: HANDLE_P, left: HANDLE_P, width: isSlid ? SLID_W : handleW, height: 40,
          borderRadius: 24, overflow: "hidden", background: C.green,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.28), 0 0 0 1px rgba(0,0,0,.45), 0 2px 6px -2px rgba(0,0,0,.5)",
          cursor: triggered.current ? "default" : dragging ? "grabbing" : "grab",
          display: "flex", alignItems: "center", justifyContent: isSlid ? "center" : "flex-start",
          padding: "8px 16px", gap: 16, boxSizing: "border-box", userSelect: "none", touchAction: "none", outline: "none",
          transition: isSlid ? `width 0.42s ${EASE}` : dragging ? "none" : `width 0.3s ${EASE}`,
        }}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }} aria-hidden>
            <path d="M6 6.5l3.5 3.5L6 13.5M10.5 6.5l3.5 3.5-3.5 3.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ))}
      </div>
    </div>
  );
}

const BODY_PATH = "M6.453 37.318C14.594 15.499 38.726 0.953984 61.536 0.895984C108.174 0.776984 154.813 0.878974 201.452 0.885974L480.59 0.896991L730.13 0.891986C771.31 0.888986 812.84 0.670002 854.03 0.959002C860.55 1.005 867.79 2.18498 873.9 4.43398C888.87 9.83798 900.99 21.132 907.42 35.692C915.2 47.969 914.97 85.885 913.63 100.47C913.68 113.99 914.87 170.736 912.15 180.64C910.61 203.777 911.67 245.055 894.29 261.033C879.54 274.596 856.57 272.256 837.84 272.04L837.83 256.793L837.82 245.209L79.047 245.216L79.05 256.901L79.092 272.008C66.206 272.223 52.641 273.578 40.869 268.495C13.146 256.739 13.016 222.537 8.55298 196.177C-2.92702 174.888 1.21802 120.221 1.30902 94.199C0.445022 78.162 -0.093996 51.577 6.453 37.318Z";

export default function Printer({ size = "card" }: { size?: "card" | "big" }) {
  const BASE_H = size === "big" ? BASE_H_BIG : BASE_H_CARD;
  const { ref, s } = useFit(size, BASE_H);
  const scaleRef = useRef(s);
  scaleRef.current = s;
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [run, setRun] = useState(0); // remounts the slider on replay
  const receiptRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (receiptRef.current) gsap.set(receiptRef.current, { y: RECEIPT_INIT_Y });
    return () => { tlRef.current?.kill(); };
  }, []);

  const startPrint = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("printing");
    const el = receiptRef.current;
    if (!el) return;
    tlRef.current?.kill();
    if (reduced) { gsap.set(el, { y: 0 }); setPhase("done"); play("chime"); return; }
    gsap.set(el, { y: RECEIPT_INIT_Y });
    const tl = gsap.timeline({ onComplete: () => setPhase("done") });
    tl.call(() => play("print"), [], T.feedDelay);
    tl.to(el, { y: 0, duration: T.feedDuration, ease: "power2.out" }, T.feedDelay);
    tl.call(() => play("chime"), [], T.feedDelay + T.feedDuration);
    tl.to(el, { y: T.floatY, duration: T.floatDuration, ease: "sine.inOut", yoyo: true, repeat: -1 }, ">0.2");
    tlRef.current = tl;
  }, [phase, reduced]);

  const replay = useCallback(() => {
    tlRef.current?.kill();
    if (receiptRef.current) gsap.set(receiptRef.current, { y: RECEIPT_INIT_Y });
    setRun((r) => r + 1);
    setPhase("idle");
  }, []);

  // the float loop is repeat:-1, so the timeline never completes: flip to done once the feed lands
  useEffect(() => {
    if (phase !== "printing" || reduced) return;
    const id = setTimeout(() => setPhase("done"), (T.feedDelay + T.feedDuration) * 1000);
    return () => clearTimeout(id);
  }, [phase, reduced]);

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <div style={{ width: BASE_W * s, height: BASE_H * s, position: "relative" }}>
        <div data-own-click style={{ pointerEvents: "auto", position: "absolute", left: 0, top: 0, width: BASE_W, height: BASE_H, transform: `scale(${s})`, transformOrigin: "0 0" }}>
          {/* slip: clipped to the widget, fades out at the bottom */}
          <div style={{
            position: "absolute", left: 0, top: CLIP_TOP, width: PW, height: BASE_H - CLIP_TOP, overflow: "hidden", pointerEvents: "none",
            WebkitMaskImage: "linear-gradient(180deg, #000 72%, transparent 100%)", maskImage: "linear-gradient(180deg, #000 72%, transparent 100%)",
          }}>
            <div ref={receiptRef} style={{ position: "absolute", top: R_TOP - CLIP_TOP, left: R_LEFT, width: R_W, height: R_H, filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.45)) drop-shadow(0 3px 8px rgba(0,0,0,0.3))" }}>
              <div style={{ width: R_INNER_W, height: R_INNER_H, transform: `scale(${R_SCALE})`, transformOrigin: "top left" }}>
                <Payslip />
              </div>
            </div>
          </div>

          {/* printer body covers the slip's origin: the slot illusion */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 28, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 22, delay: T.printerDelay }}
            style={{ position: "absolute", top: 0, left: 0, zIndex: 20, lineHeight: 0, filter: "drop-shadow(0 20px 36px rgba(0,0,0,0.5)) drop-shadow(0 4px 10px rgba(0,0,0,0.35))", pointerEvents: "none" }}
          >
            <svg width={PW} height={BODY_H} viewBox="0 0 915 273" fill="none" style={{ display: "block" }} aria-hidden>
              <defs>
                <linearGradient id="printer-body" x1="0" y1="0" x2="0" y2="273" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3a3d3a" />
                  <stop offset="38%" stopColor="#2e312e" />
                  <stop offset="100%" stopColor="#232523" />
                </linearGradient>
                <radialGradient id="printer-satin" cx="50%" cy="18%" rx="39%" ry="29%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
                  <stop offset="36%" stopColor="rgba(255,255,255,0.06)" />
                  <stop offset="68%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
                <linearGradient id="printer-edge" x1="0" y1="0" x2="915" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
                  <stop offset="5%" stopColor="rgba(0,0,0,0)" />
                  <stop offset="95%" stopColor="rgba(0,0,0,0)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
                </linearGradient>
              </defs>
              <path d={BODY_PATH} fill="url(#printer-body)" />
              <path d={BODY_PATH} fill="url(#printer-satin)" />
              <path d={BODY_PATH} fill="url(#printer-edge)" />
              <path d="M12.185 198.952C18.021 204.52 21.809 209.803 29 214.484C51.911 229.399 87.703 224.591 114.766 224.601L228.8 224.578L581.68 224.561L776.5 224.574L826.74 224.712C860.57 224.809 886.81 226.691 906.02 192.246C908.2 188.344 909.55 184.247 912.15 180.64C910.61 203.777 911.67 245.055 894.29 261.033C879.54 274.596 856.57 272.256 837.84 272.04L837.83 256.793L837.82 245.209L79.047 245.216L79.05 256.901L79.092 272.008C66.206 272.223 52.641 273.578 40.869 268.495C13.146 256.739 13.016 222.537 8.55298 196.177L10.074 195.805C11.138 197.159 11.572 197.418 12.185 198.952Z" fill="rgba(0,0,0,0.25)" />
              <path d="M79.05 256.901C70.623 257.056 63.632 258.241 57.038 251.901C47.845 243.062 58.301 234.462 67.603 234.216C85.768 233.736 104.006 233.979 122.182 234.024L230.618 234.086L692.27 234.076L806.7 234.074C820.89 234.074 836.81 233.625 850.99 234.535C856.65 234.897 863.08 242.207 860.14 247.942C855.66 258.055 846.8 257.139 837.83 256.793L837.82 245.209L79.047 245.216L79.05 256.901Z" fill="#050505" />
            </svg>
          </motion.div>

          {/* slider, then Print again */}
          <div style={{ position: "absolute", left: 0, right: 0, top: BODY_H + 58, display: "flex", justifyContent: "center", zIndex: 30 }}>
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <motion.div key={`idle-${run}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
                  <SlideButton onComplete={startPrint} scale={scaleRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {phase === "done" && (
              <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.4, delay: 0.2 }}
                style={{ position: "absolute", left: 0, right: 0, bottom: 6, display: "flex", justifyContent: "center", zIndex: 30 }}>
                <motion.button type="button" onClick={() => { play("tap"); replay(); }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{ fontFamily: "inherit", background: C.raised, boxShadow: C.shadow, border: "none", borderRadius: 999, padding: "9px 22px", fontSize: 12, fontWeight: 500, letterSpacing: "-0.2px", color: C.sec, cursor: "pointer" }}>
                  Print again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
