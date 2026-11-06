// RippleCanvas.tsx
// React wrapper for ripple.ts. Put it over anything you can turn into an image.
//
//   <Ripple src="/photo.jpg" width={320} height={200} fireOn="click" />
//
//   const ref = useRef<RippleHandle>(null);
//   <Ripple ref={ref} source={canvas} width={248} height={248} />
//   ref.current?.fire();   // fire it when something happens

import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties } from "react";
import { createRipple, type Ripple as RippleApi, type RippleOptions } from "./ripple";

export interface RippleHandle {
  fire(x?: number, y?: number): void;
  refresh(source?: TexImageSource): void;
}

export interface RippleProps extends RippleOptions {
  /** an image URL (needs CORS if it is on another domain) */
  src?: string;
  /** or anything WebGL can read: a canvas, a video, an image, an ImageBitmap */
  source?: TexImageSource | null;
  width: number | string;
  height: number | string;
  /** fire where the pointer is: on "click", on "hover" (enter), or never and call fire() */
  fireOn?: "click" | "hover" | "none";
  /** change this number to fire from the centre */
  trigger?: number;
  radius?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
}

export const Ripple = forwardRef<RippleHandle, RippleProps>(function Ripple(
  { src, source, width, height, fireOn = "none", trigger = 0, radius = 0, className, style, label, ...options },
  ref,
) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<RippleApi | null>(null);
  const opts = useRef(options);
  opts.current = options;

  useImperativeHandle(ref, () => ({
    fire: (x, y) => api.current?.fire(x, y),
    refresh: (s) => api.current?.refresh(s),
  }), []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let gone = false;
    const start = (s: TexImageSource) => {
      if (gone) return;
      api.current = createRipple(el, s, opts.current);
    };
    if (source) start(source);
    else if (src) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => start(img);
      img.src = src;
    }
    return () => {
      gone = true;
      api.current?.destroy();
      api.current = null;
    };
  }, [src, source]);

  // options change without rebuilding the GL context
  useEffect(() => { api.current?.set(options); });

  useEffect(() => { if (trigger > 0) api.current?.fire(); }, [trigger]);

  const at = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    api.current?.fire((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  };

  return (
    <canvas
      ref={canvas}
      role={label ? "img" : undefined}
      aria-label={label}
      className={className}
      onPointerDown={fireOn === "click" ? at : undefined}
      onPointerEnter={fireOn === "hover" ? at : undefined}
      style={{ display: "block", width, height, aspectRatio: typeof width === "number" && typeof height === "number" ? `${width} / ${height}` : undefined, borderRadius: radius, cursor: fireOn === "click" ? "pointer" : undefined, ...style }}
    />
  );
});
