// QrCodeModal.tsx
// deps: framer-motion, qrcode.react

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { QRRipple } from "./QRRipple";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 *    0ms   idle — gradient pill "Show Qr code"
 *          hover: scale 1.0 → 1.03
 *    0ms   [click] pill morphs → #f7f7f7 card (spring 300/25)
 *  ~200ms  card settled
 *  200ms   white QR panel fades in + slides up (y 8→0)
 *  280ms   action row fades in + slides up
 *   —      [copy] "Copy link" → "Copied" crossfade
 *   —      [close] content fades (80ms) → card morphs back to pill
 * ───────────────────────────────────────────────────────── */

/* ─── Timing ────────────────────────────────────────────── */
const TIMING = {
  qrDelay:      0.20,
  actionsDelay: 0.28,
  copiedReset:  2000,
} as const;

/* ─── Springs ───────────────────────────────────────────── */
const SPRING = {
  container: { type: "spring" as const, stiffness: 300, damping: 25 },
  content:   { type: "spring" as const, stiffness: 350, damping: 28 },
  hover:     { type: "spring" as const, stiffness: 400, damping: 20 },
} as const;

/* ─── Dimensions ──────────────────────────────────────────
 *
 *  Outer:      p-6  on all sides
 *  White card: p-12 on all sides  (Figma: p-[12px])
 *  QR image:   fills card content  →  OUTER_W − 12 − 12 − 6 − 6
 *
 * ─────────────────────────────────────────────────────── */
const CARD_PAD  = 12;    // px — matches Figma p-[12px]
const OUTER_PAD = 6;     // px — outer container padding
const OUTER_W   = 284;   // px — total outer width (kept from scale-up)
const QR_SIZE   = OUTER_W - OUTER_PAD * 2 - CARD_PAD * 2;  // 248px

const RADIUS = { button: 9999, modal: 32, card: 28, qr: 18 } as const;
const CONTENT_Y = 10;

/* ─── Shared inner-button style (Copy link + Close) ─────
 * Figma: white base + barely-visible gradient overlay
 * + 0.5px #ebebeb ring + 1px rgba(255,255,255,0.12) border
 * ─────────────────────────────────────────────────────── */
const innerPillStyle: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg,rgba(251,251,251,0.2) 0%,rgba(237,237,239,0.2) 100%),linear-gradient(90deg,#fff 0%,#fff 100%)",
  border:       "1px solid rgba(255,255,255,0.12)",
  boxShadow:    "0px 0px 0px 0.5px #ebebeb",
  borderRadius: 9999,
};

/* ─── Icons ─────────────────────────────────────────────── */
function QrButtonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" stroke="#5C5C5C" strokeWidth="1.5"/>
      <rect x="4.5" y="4.5" width="2" height="2" rx="0.5" fill="#5C5C5C"/>
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" stroke="#5C5C5C" strokeWidth="1.5"/>
      <rect x="13.5" y="4.5" width="2" height="2" rx="0.5" fill="#5C5C5C"/>
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" stroke="#5C5C5C" strokeWidth="1.5"/>
      <rect x="4.5" y="13.5" width="2" height="2" rx="0.5" fill="#5C5C5C"/>
      <rect x="11.5" y="11.5" width="2" height="2" rx="0.4" fill="#5C5C5C"/>
      <rect x="15.5" y="11.5" width="2" height="2" rx="0.4" fill="#5C5C5C"/>
      <rect x="13.5" y="13.5" width="2" height="2" rx="0.4" fill="#5C5C5C"/>
      <rect x="11.5" y="15.5" width="2" height="2" rx="0.4" fill="#5C5C5C"/>
      <rect x="15.5" y="15.5" width="2" height="2" rx="0.4" fill="#5C5C5C"/>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8.333 11.667a3.333 3.333 0 004.714 0l2-2a3.333 3.333 0 00-4.714-4.714l-1 1"
        stroke="#5C5C5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.667 8.333a3.333 3.333 0 00-4.714 0l-2 2a3.333 3.333 0 004.714 4.714l1-1"
        stroke="#5C5C5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M14.5 5.5L5.5 14.5M5.5 5.5l9 9"
        stroke="#5C5C5C" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M16.5 5L8 14.5L3.5 10"
        stroke="#5C5C5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Component ─────────────────────────────────────────── */
interface QrCodeModalProps {
  url?: string;
}

export function QrCodeModal({
  url = typeof window !== "undefined" ? window.location.href : "https://example.com",
}: QrCodeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion  = useReducedMotion();

  const open  = () => setIsOpen(true);
  const close = () => { setIsOpen(false); setCopied(false); };

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); }
    catch {
      const el = Object.assign(document.createElement("textarea"), { value: url });
      document.body.appendChild(el); el.select();
      document.execCommand("copy"); el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), TIMING.copiedReset);
  };

  const nm = <T extends object>(t: T): T | { duration: number } =>
    shouldReduceMotion ? { duration: 0.01 } : t;

  const contentT = (delay: number) => nm({ ...SPRING.content, delay });
  const exitFast = nm({ duration: 0.08 });

  // Close on Escape — web convention for dialogs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) close();
  };

  // Only apply hover scale on pointer devices (not touch)
  const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <>
      {/* ── Shared layout: button ↔ modal ───────────────── */}
      {/* onKeyDown here catches Escape when focus is inside the modal */}
      <div className="relative z-50" style={{ fontFamily: "'Inter', sans-serif" }} onKeyDown={handleKeyDown}>
        <AnimatePresence>

          {!isOpen ? (
            /* ── BUTTON — Figma node 202167:42434 ──
             * Polish layers (bottom → top):
             *   1. Soft lift shadow (near + far) — makes button float off white bg
             *   2. 0.5px #ebebeb ring — defines the edge
             *   3. inset 0 1px 0 white — glass highlight, light hits the top rim
             * appearance: none — strips native <button> border
             * overflow: clip — Figma overflow-clip, no new formatting context
             * minHeight: 44px — Emil: touch target requirement
             */
            <motion.button
              key="button"
              layoutId="qr-container"
              onClick={open}
              className="flex items-center gap-[6px] px-[14px] select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
              style={{
                borderRadius:       RADIUS.button,
                background:         "linear-gradient(180deg,#fbfbfb 0%,#ececee 100%)",
                boxShadow:          [
                  "inset 0 1px 0 rgba(255,255,255,0.80)", // glass top highlight
                  "0 0 0 0.5px #e8e8e8",                  // hairline ring
                  "0 1px 2px rgba(0,0,0,0.06)",           // near shadow
                  "0 3px 8px rgba(0,0,0,0.05)",           // far shadow
                ].join(", "),
                minHeight:          44,
                overflow:           "clip",
                WebkitAppearance:   "none",
                appearance:         "none" as React.CSSProperties["appearance"],
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              }}
              whileHover={(!shouldReduceMotion && canHover) ? {
                scale:     1.02,
                boxShadow: [
                  "inset 0 1px 0 rgba(255,255,255,0.90)",
                  "0 0 0 0.5px #d8d8d8",
                  "0 2px 6px rgba(0,0,0,0.10)",
                  "0 6px 18px rgba(0,0,0,0.07)",
                ].join(", "),
              } : {}}
              whileTap={shouldReduceMotion ? {} : {
                scale:     0.97,
                boxShadow: [
                  "inset 0 1px 0 rgba(255,255,255,0.60)",
                  "0 0 0 0.5px #e0e0e0",
                  "0 1px 1px rgba(0,0,0,0.05)",
                  "0 1px 3px rgba(0,0,0,0.04)",
                ].join(", "),
              }}
              transition={nm(SPRING.hover)}
              aria-haspopup="dialog"
              aria-expanded={false}
              aria-label="Show Qr code"
            >
              <QrButtonIcon />
              <span
                className="text-[14px] font-medium leading-[20px] text-[#5c5c5c] whitespace-nowrap"
                style={{ fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0" }}
              >
                Show Qr code
              </span>
            </motion.button>

          ) : (

            /* ── MODAL — Figma node 202167:42433 ── */
            /*
             * Outer:      bg-[#f7f7f7]  p-[4px]  rounded-[28px]
             *             flex-col  gap-[12px]  items-start  w=211px
             *
             * White card: bg-white  p-[12px]  rounded-[24px]
             *             overflow-clip  shrink-0  w-full
             *
             * Action row: flex  items-center  gap-[8px]
             *             px-[8px]  pb-[8px]  (no top pad — gap handles it)
             *             w-full  shrink-0
             */
            <motion.div
              key="modal"
              layoutId="qr-container"
              role="dialog"
              aria-modal="true"
              aria-label="QR code"
              className="flex flex-col items-start gap-[16px]"
              style={{
                background:   "#f7f7f7",
                borderRadius: RADIUS.modal,
                width:        OUTER_W,
                padding:      OUTER_PAD,
              }}
              transition={nm(SPRING.container)}
            >

              {/* White card — node 202167:40009
               * Outer shadow: multi-layer soft drop + 0.5px #ebebeb ring
               * Inset overlay: bottom inner shadow for depth
               */}
              <motion.div
                className="relative bg-white overflow-hidden shrink-0 w-full flex items-center justify-center"
                style={{
                  borderRadius: RADIUS.card,
                  padding:      CARD_PAD,
                  boxShadow:    [
                    "0px 2px 4px 0px rgba(51,51,51,0.06)",
                    "0px 2px 4px 0px rgba(51,51,51,0.04)",
                    "0px 1px 2px 0px rgba(51,51,51,0.04)",
                    "0px 0px 0px 0.5px #ebebeb",
                  ].join(", "),
                }}
                initial={{ opacity: 0, y: CONTENT_Y }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: CONTENT_Y / 2, transition: exitFast }}
                transition={contentT(TIMING.qrDelay)}
              >
                <QRRipple
                  value={url}
                  size={QR_SIZE}
                  fgColor="#111111"
                  bgColor="#ffffff"
                  borderRadius={RADIUS.qr}
                />
                {/* Inset bottom shadow overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    borderRadius: RADIUS.card,
                    boxShadow:    "inset 0px -1px 1px -0.5px rgba(51,51,51,0.06)",
                  }}
                />
              </motion.div>

              {/* Action row — px-[10px] pb-[10px] (no top padding) */}
              <motion.div
                className="flex items-center gap-[10px] px-[10px] pb-[10px] w-full shrink-0"
                initial={{ opacity: 0, y: CONTENT_Y }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: exitFast }}
                transition={contentT(TIMING.actionsDelay)}
              >

                {/* Copy link — flex-[1_0_0] min-h-px min-w-px */}
                <motion.button
                  className="flex items-center justify-center gap-[6px] px-[12px] py-[9px] min-w-0 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                  style={{ ...innerPillStyle, flex: "1 0 0", overflow: "clip", WebkitAppearance: "none", appearance: "none" as React.CSSProperties["appearance"] }}
                  onClick={copy}
                  whileTap={{ scale: 0.97 }}
                  aria-label={copied ? "Link copied" : "Copy link"}
                  aria-live="polite"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {copied ? (
                      <motion.span key="copied" className="flex items-center gap-[4px]"
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.13 }}>
                        <CheckIcon />
                        <span className="text-[14px] font-medium leading-[20px] text-[#5c5c5c] whitespace-nowrap"
                          style={{ fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0", letterSpacing: "-0.01em" }}>Copied</span>
                      </motion.span>
                    ) : (
                      <motion.span key="copy" className="flex items-center gap-[4px]"
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.13 }}>
                        <LinkIcon />
                        <span className="text-[14px] font-medium leading-[20px] text-[#5c5c5c] whitespace-nowrap"
                          style={{ fontFeatureSettings: "'ss11' 1, 'calt' 0, 'liga' 0", letterSpacing: "-0.01em" }}>Copy link</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Orange avatar — node 202167:42422
                 * Structure: 32×32 white pill container (same ring as other buttons)
                 *            with a 20×20 orange ellipse centered inside (6px margin)
                 * Scaled: 40px container, ~25px orange dot
                 */}
                <div
                  className="shrink-0 rounded-full flex items-center justify-center"
                  style={{ ...innerPillStyle, width: 40, height: 40 }}
                  aria-hidden="true"
                >
                  <div
                    className="rounded-full"
                    style={{
                      width:      25,
                      height:     25,
                      background: "linear-gradient(135deg,#ff8c42 0%,#f76030 100%)",
                      boxShadow:  [
                        "inset 0px -1px 1px -0.5px rgba(247,96,48,0.32)",
                        "0px 0px 0px 1px rgba(247,96,48,0.32)",
                        "0px 1px 1px -0.5px rgba(247,96,48,0.24)",
                        "0px 3px 3px -1.5px rgba(247,96,48,0.16)",
                        "0px 6px 6px -3px rgba(247,96,48,0.10)",
                      ].join(", "),
                    }}
                  />
                </div>

                {/* Close — p-[9px] pill shrink-0 */}
                <motion.button
                  className="flex items-center justify-center p-[9px] shrink-0 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                  style={{ ...innerPillStyle, overflow: "clip", WebkitAppearance: "none", appearance: "none" as React.CSSProperties["appearance"] }}
                  onClick={close}
                  whileTap={{ scale: 0.90 }}
                  aria-label="Close"
                >
                  <XIcon />
                </motion.button>

              </motion.div>
            </motion.div>

          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default QrCodeModal;
