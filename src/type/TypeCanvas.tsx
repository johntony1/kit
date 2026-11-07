// TypeCanvas.tsx
// React wrapper for type-core.ts.
//
//   import { bubble } from "./effects";
//   <TypeCanvas effect={bubble} text="grow" style={{ width: "100%", height: 400 }} />

import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties } from "react";
import { createType, type Effect, type TypeFx, type TypeOptions } from "./type-core";

export interface TypeHandle { fire(x?: number, y?: number): void }

export interface TypeCanvasProps extends Partial<TypeOptions> {
  effect: Effect;
  className?: string;
  style?: CSSProperties;
}

export const TypeCanvas = forwardRef<TypeHandle, TypeCanvasProps>(function TypeCanvas({ effect, className, style, ...options }, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const fx = useRef<TypeFx | null>(null);
  const opts = useRef(options);
  opts.current = options;

  useImperativeHandle(ref, () => ({ fire: (x, y) => fx.current?.fire(x, y) }), []);

  useEffect(() => {
    if (!canvas.current) return;
    fx.current = createType(canvas.current, effect, opts.current);
    return () => { fx.current?.destroy(); fx.current = null; };
  }, [effect]);

  // text, colours and params change without rebuilding
  const key = JSON.stringify(options);
  useEffect(() => { fx.current?.set(opts.current); }, [key]);

  const text = options.text ?? effect.look.text ?? "";
  return <canvas ref={canvas} role="img" aria-label={text.replace(/\n/g, " ")} className={className} style={{ display: "block", width: "100%", height: "100%", ...style }} />;
});
