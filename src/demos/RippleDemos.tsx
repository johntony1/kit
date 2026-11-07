import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Ripple, type RippleHandle } from "../ripple/RippleCanvas";
import type { RippleOptions } from "../ripple/ripple";
import { createOrb, type Orb } from "./orb";

const PANEL = "#1a1a1a";
const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

/** keeps a source canvas the same pixel size as its box */
function useBox<T extends HTMLElement>(onSize: (w: number, h: number) => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => onSize(Math.round(el.clientWidth * dpr()), Math.round(el.clientHeight * dpr())));
    ro.observe(el);
    return () => ro.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

/* ── The orb: it ripples every time it changes shape ── */
export function OrbRipple({ options, auto = true, rippleRef }: { options?: RippleOptions; auto?: boolean; rippleRef?: React.RefObject<RippleHandle | null> }) {
  const own = useRef<RippleHandle>(null);
  const ref = rippleRef ?? own;
  const autoRef = useRef(auto);
  autoRef.current = auto;
  const [orb, setOrb] = useState<Orb | null>(null);
  const size = useRef<[number, number]>([0, 0]);
  const live = useRef<Orb | null>(null);
  useEffect(() => {
    const o = createOrb({ onMorph: () => { if (autoRef.current) ref.current?.fire(); } });
    o.resize(...size.current);
    live.current = o;
    setOrb(o);
    return () => { live.current = null; o.destroy(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const box = useBox<HTMLDivElement>((w, h) => { size.current = [w, h]; live.current?.resize(w, h); });
  return (
    <div ref={box} className="fill">
      {orb && <Ripple ref={ref} source={orb.canvas} live width="100%" height="100%" glowColor="#7b6cff" intensity={0.07} glow={1.3} {...options} label="A glowing shape that ripples as it changes" />}
    </div>
  );
}

/* ── The QR code it was made for ── */
export function QrRipple({ options, rippleRef, value = "https://qr-code-animatio.vercel.app" }: { options?: RippleOptions; rippleRef?: React.RefObject<RippleHandle | null>; value?: string }) {
  const own = useRef<RippleHandle>(null);
  const ref = rippleRef ?? own;
  const qr = useRef<HTMLCanvasElement>(null);
  const [src, setSrc] = useState<HTMLCanvasElement | null>(null);
  useEffect(() => { setSrc(qr.current); }, []);
  useEffect(() => {
    if (!src) return;
    const id = setTimeout(() => ref.current?.fire(), 500);
    return () => clearTimeout(id);
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="qrTile">
      <QRCodeCanvas ref={qr} value={value} size={400} level="H" marginSize={2} fgColor="#111111" bgColor="#ffffff" style={{ display: "none" }} />
      {src && <Ripple ref={ref} source={src} width={168} height={168} radius={14} fireOn="click" {...options} label="QR code. Click it to ripple." />}
    </div>
  );
}

/* ── Type: click anywhere on the line ── */
export function TypeRipple({ options, rippleRef, text = "Your energy transforms." }: { options?: RippleOptions; rippleRef?: React.RefObject<RippleHandle | null>; text?: string }) {
  const own = useRef<RippleHandle>(null);
  const ref = rippleRef ?? own;
  const [cv] = useState(() => document.createElement("canvas"));
  const draw = () => {
    const c = cv.getContext("2d")!;
    const w = cv.width, h = cv.height;
    c.fillStyle = PANEL;
    c.fillRect(0, 0, w, h);
    const size = Math.min(h * 0.2, w * 0.072);
    c.font = `600 ${size}px Inter, -apple-system, system-ui, sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    const g = c.createLinearGradient(0, h * 0.35, 0, h * 0.65);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#9a9a9a");
    c.fillStyle = g;
    c.letterSpacing = `${-size * 0.03}px`;
    c.fillText(text, w / 2, h / 2);
    ref.current?.refresh();
  };
  const box = useBox<HTMLDivElement>((w, h) => { cv.width = w; cv.height = h; draw(); });
  useEffect(() => { document.fonts?.ready.then(draw); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={box} className="fill">
      <Ripple ref={ref} source={cv} width="100%" height="100%" fireOn="click" glowColor="#ffffff" {...options} label={`${text} Click to ripple.`} />
    </div>
  );
}
