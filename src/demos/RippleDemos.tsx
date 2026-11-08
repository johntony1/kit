import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Ripple, type RippleHandle } from "../ripple/RippleCanvas";
import type { RippleOptions } from "../ripple/ripple";
import { createOrb, type Orb } from "./orb";
import { play } from "../sound/sound";

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

/* ── The orb, frame for frame from the reference. Click it to send a ripple through. ── */
export function OrbRipple({ options, rippleRef, fireOn = "click" }: { options?: RippleOptions; auto?: boolean; rippleRef?: React.RefObject<RippleHandle | null>; fireOn?: "click" | "hover" | "none" }) {
  const own = useRef<RippleHandle>(null);
  const ref = rippleRef ?? own;
  const [orb, setOrb] = useState<Orb | null>(null);
  const size = useRef<[number, number]>([0, 0]);
  const live = useRef<Orb | null>(null);
  const title = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const o = createOrb();
    o.resize(...size.current);
    live.current = o;
    setOrb(o);
    // the end title fades in after the shape melts away, then out before the loop
    let raf = 0;
    const tick = () => {
      const t = o.time();
      const v = Math.min(1, Math.max(0, (t - 14.2) / 0.6)) * (1 - Math.min(1, Math.max(0, (t - 15.5) / 0.4)));
      if (title.current) title.current.style.opacity = String(v);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); live.current = null; o.destroy(); };
  }, []);
  const box = useBox<HTMLDivElement>((w, h) => { size.current = [w, h]; live.current?.resize(w, h); });
  return (
    <div ref={box} className="fill orbFill" onPointerDown={fireOn === "click" ? () => play("bloop") : undefined}>
      {orb && <Ripple ref={ref} source={orb.canvas} live fireOn={fireOn} width="100%" height="100%" glowColor="#7b6cff" intensity={0.07} glow={1.3} {...options} label="A glowing shape that morphs from a sparkle to a circle. Click it to send a ripple through." />}
      <div ref={title} className="orbTitle" aria-hidden="true">Your energy transforms</div>
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
    <div className="qrTile" onPointerDown={() => play("bloop")}>
      <QRCodeCanvas ref={qr} value={value} size={400} level="H" marginSize={2} fgColor="#111111" bgColor="#ffffff" style={{ display: "none" }} />
      {src && <Ripple ref={ref} source={src} width={168} height={168} radius={14} fireOn="click" {...options} label="QR code. Click it to ripple." />}
    </div>
  );
}
