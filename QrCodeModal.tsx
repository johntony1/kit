// QrCodeModal.tsx
// deps: framer-motion, qrcode.react

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { QRRipple } from "./QRRipple";
import { TextRipple } from "./TextRipple";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 *    0ms   idle — gradient pill "Show Qr code"
 *          hover: scale 1.0 → 1.02
 *    0ms   [click] layoutId FLIP: pill morphs → card (spring open)
 *  ~200ms  card settled
 *  150ms   white QR panel fades in + slides up (y 10→0, scale 0.96→1)
 *  220ms   action row fades in + slides up
 *   —      [copy] "Copy link" → "Copied" crossfade
 *   —      [close] content fades (80ms) → FLIP: card contracts back to pill
 * ───────────────────────────────────────────────────────── */

/* ─── Timing ────────────────────────────────────────────── */
const TIMING = {
  qrDelay:      0.15,   // QR card enters before spring fully settles
  actionsDelay: 0.22,   // action row enters shortly after
  copiedReset:  2000,
} as const;

/* ─── Springs ───────────────────────────────────────────── */
/* Apple-style duration+bounce.
 * open:  pill → card — slight bounce so it feels alive
 * close: card → pill — snappy, no bounce (decisive contraction)
 * hover: button micro-interaction — crisp, no overshoot
 * content: ease-out-quart for entering content (not spring)
 */
const SPRING = {
  open:    { type: "spring" as const, duration: 0.50, bounce: 0.18 },
  close:   { type: "spring" as const, duration: 0.28, bounce: 0    },
  hover:   { type: "spring" as const, duration: 0.20, bounce: 0    },
  content: { duration: 0.22, ease: [0.165, 0.84, 0.44, 1] as const },
} as const;

/* ─── Dimensions ──────────────────────────────────────────
 *  White card: p-[12px]   QR image: OUTER_W − pad*2 − card*2
 * ─────────────────────────────────────────────────────── */
const CARD_PAD  = 12;
const OUTER_PAD = 6;
const OUTER_W   = 284;
const QR_SIZE   = OUTER_W - OUTER_PAD * 2 - CARD_PAD * 2;  // 248px

const RADIUS    = { button: 9999, modal: 32, card: 28, qr: 18 } as const;
const CONTENT_Y = 10;

/* ─── QR color swatches ──────────────────────────────────
 * Only dark/saturated — light colors lose scan contrast on white bg.
 * ─────────────────────────────────────────────────────── */
const QR_COLORS = [
  { hex: "#1d4ed8", label: "Blue"   },
  { hex: "#7c3aed", label: "Violet" },
  { hex: "#be185d", label: "Pink"   },
  { hex: "#b91c1c", label: "Red"    },
  { hex: "#c2410c", label: "Orange" },
  { hex: "#d97706", label: "Amber"  },
  { hex: "#15803d", label: "Green"  },
  { hex: "#0f766e", label: "Teal"   },
  { hex: "#0369a1", label: "Sky"    },
  { hex: "#1e3a5f", label: "Navy"   },
] as const;

/* ─── Shared inner-button style (Copy + Close + color dot) */
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
      <path d="M14.5 5.5L5.5 14.5M5.5 5.5l9 9" stroke="#5C5C5C" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M16.5 5L8 14.5L3.5 10" stroke="#5C5C5C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Component ─────────────────────────────────────────── */
interface QrCodeModalProps { url?: string; }

export function QrCodeModal({
  url = typeof window !== "undefined" ? window.location.href : "https://example.com",
}: QrCodeModalProps) {
  const [isOpen,          setIsOpen]          = useState(false);
  const [copied,          setCopied]          = useState(false);
  const [qrColor,         setQrColor]         = useState("#1d4ed8");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [rippleTrigger,   setRippleTrigger]   = useState(0);
  const [copyTrigger,     setCopyTrigger]     = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const colorPickerRef     = useRef<HTMLDivElement>(null);

  // Close color picker on outside click
  useEffect(() => {
    if (!colorPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (!colorPickerRef.current?.contains(e.target as Node))
        setColorPickerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [colorPickerOpen]);

  const open  = () => { setIsOpen(true); setRippleTrigger(n => n + 1); };
  const close = () => { setIsOpen(false); setCopied(false); };

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); }
    catch {
      const el = Object.assign(document.createElement("textarea"), { value: url });
      document.body.appendChild(el); el.select();
      document.execCommand("copy"); el.remove();
    }
    setCopied(true);
    setCopyTrigger(n => n + 1);
    setTimeout(() => setCopied(false), TIMING.copiedReset);
  };

  const nm = <T extends object>(t: T): T | { duration: number } =>
    shouldReduceMotion ? { duration: 0.01 } : t;

  const contentT = (delay: number) => nm({ ...SPRING.content, delay });
  const exitFast = nm({ duration: 0.08, ease: "easeIn" as const });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) close();
  };

  const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;

  return (
    <div
      className="relative z-50"
      style={{
        fontFamily:      "'Inter', sans-serif",
        width:           OUTER_W,
        display:         "flex",
        justifyContent:  "center",
        alignItems:      "center",
      }}
      onKeyDown={handleKeyDown}
    >

      {/* popLayout — takes the exiting element out of flow so the entering
          element positions correctly. FLIP still works because layoutId
          captures positions before the DOM swap. initial={false} skips the
          mount animation on first load. */}
      <AnimatePresence mode="popLayout" initial={false}>

        {!isOpen ? (

          /* ── BUTTON ── */
          <motion.button
            key="button"
            layoutId="qr-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0.01 } : {
              layout:   SPRING.close,
              default:  { duration: 0.22, ease: [0.165, 0.84, 0.44, 1] },
            }}
            onClick={open}
            className="flex items-center gap-[6px] px-[14px] select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
            style={{
              borderRadius:        RADIUS.button,
              background:          "linear-gradient(180deg,#fbfbfb 0%,#ececee 100%)",
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.80)",
                "0 0 0 0.5px #e8e8e8",
                "0 1px 2px rgba(0,0,0,0.06)",
                "0 3px 8px rgba(0,0,0,0.05)",
              ].join(", "),
              minHeight:           44,
              overflow:            "clip",
              WebkitAppearance:    "none",
              appearance:          "none" as React.CSSProperties["appearance"],
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

          /* ── MODAL ── */
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
            exit={nm({ opacity: 0, transition: { duration: 0.08, ease: "easeIn" as const } })}
            transition={nm(SPRING.open)}
          >

            {/* White QR card */}
            <motion.div
              className="relative bg-white overflow-hidden shrink-0 w-full flex items-center justify-center"
              style={{
                borderRadius: RADIUS.card,
                padding:      CARD_PAD,
                boxShadow: [
                  "0px 2px 4px 0px rgba(51,51,51,0.06)",
                  "0px 2px 4px 0px rgba(51,51,51,0.04)",
                  "0px 1px 2px 0px rgba(51,51,51,0.04)",
                  "0px 0px 0px 0.5px #ebebeb",
                ].join(", "),
              }}
              initial={{ opacity: 0, scale: 0.96, y: CONTENT_Y }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              exit={{ opacity: 0, transition: exitFast }}
              transition={contentT(TIMING.qrDelay)}
            >
              <QRRipple
                value={url}
                size={QR_SIZE}
                fgColor="#111111"
                bgColor="#ffffff"
                glowColor={qrColor}
                triggerKey={rippleTrigger}
                borderRadius={RADIUS.qr}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow:    "inset 0px -1px 1px -0.5px rgba(51,51,51,0.06)",
                }}
              />
            </motion.div>

            {/* Action row */}
            <motion.div
              className="flex items-center gap-[10px] px-[10px] pb-[10px] w-full shrink-0"
              initial={{ opacity: 0, y: CONTENT_Y * 0.6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: exitFast }}
              transition={contentT(TIMING.actionsDelay)}
            >

              {/* Copy link */}
              <motion.button
                className="flex items-center justify-center gap-[6px] px-[12px] py-[9px] min-w-0 select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                style={{ ...innerPillStyle, flex: "1 0 0", overflow: "visible", WebkitAppearance: "none", appearance: "none" as React.CSSProperties["appearance"] }}
                onClick={copy}
                whileTap={{ scale: 0.97 }}
                aria-label={copied ? "Link copied" : "Copy link"}
                aria-live="polite"
              >
                <TextRipple triggerKey={copyTrigger}>
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
                </TextRipple>
              </motion.button>

              {/* Color picker */}
              <div className="relative shrink-0" ref={colorPickerRef}>
                <AnimatePresence>
                  {colorPickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 6 }}
                      animate={{ opacity: 1, scale: 1,    y: 0 }}
                      exit={{    opacity: 0, scale: 0.92, y: 6 }}
                      transition={{ duration: 0.15, ease: [0.165, 0.84, 0.44, 1] }}
                      style={{
                        position:            "absolute",
                        bottom:              "calc(100% + 10px)",
                        left:                "50%",
                        transform:           "translateX(-50%)",
                        transformOrigin:     "bottom center",
                        background:          "#ffffff",
                        borderRadius:        18,
                        padding:             10,
                        display:             "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap:                 6,
                        zIndex:              20,
                        boxShadow: [
                          "0px 4px 16px rgba(0,0,0,0.12)",
                          "0px 1px 4px rgba(0,0,0,0.06)",
                          "0px 0px 0px 0.5px #e8e8e8",
                        ].join(", "),
                      }}
                    >
                      {QR_COLORS.map(({ hex, label }) => (
                        <motion.button
                          key={hex}
                          aria-label={label}
                          onClick={() => { setQrColor(hex); setColorPickerOpen(false); setRippleTrigger(n => n + 1); }}
                          whileHover={!shouldReduceMotion ? { scale: 1.18 } : {}}
                          whileTap={!shouldReduceMotion   ? { scale: 0.92 } : {}}
                          transition={{ duration: 0.12 }}
                          style={{
                            width:            26,
                            height:           26,
                            borderRadius:     "50%",
                            background:       hex,
                            border:           "none",
                            cursor:           "pointer",
                            outline:          qrColor === hex ? `2px solid ${hex}` : "none",
                            outlineOffset:    2,
                            WebkitAppearance: "none",
                            appearance:       "none" as React.CSSProperties["appearance"],
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  className="shrink-0 rounded-full flex items-center justify-center select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                  style={{ ...innerPillStyle, width: 40, height: 40, WebkitAppearance: "none", appearance: "none" as React.CSSProperties["appearance"] }}
                  onClick={() => setColorPickerOpen(v => !v)}
                  whileTap={!shouldReduceMotion ? { scale: 0.92 } : {}}
                  aria-label="Change QR code color"
                  aria-haspopup="true"
                  aria-expanded={colorPickerOpen}
                >
                  <motion.div
                    className="rounded-full"
                    animate={{ backgroundColor: qrColor }}
                    transition={{ duration: 0.2 }}
                    style={{
                      width:     25,
                      height:    25,
                      boxShadow: [
                        "inset 0px -1px 1px -0.5px rgba(0,0,0,0.20)",
                        "0px 0px 0px 1px rgba(0,0,0,0.12)",
                        "0px 1px 3px rgba(0,0,0,0.12)",
                      ].join(", "),
                    }}
                  />
                </motion.button>
              </div>

              {/* Close */}
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
  );
}

export default QrCodeModal;
