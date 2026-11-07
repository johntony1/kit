// PageSwap.tsx
// React wrapper for transitions.ts. Give it the page to show; when `page` changes it keeps
// the old one on screen, plays the transition, then lets it go.
//
//   <PageSwap kind="burn" page={route} origin={click} render={(p) => <Page id={p} />} />

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { transition, type TransitionKind, type TransitionOptions } from "./transitions";

export interface PageSwapProps<K extends string | number> {
  kind: TransitionKind;
  page: K;
  render: (page: K) => ReactNode;
  /** where the transition starts, 0..1 (pass the click) */
  origin?: { x: number; y: number };
  options?: Omit<TransitionOptions, "x" | "y">;
  onDone?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function PageSwap<K extends string | number>({ kind, page, render, origin, options, onDone, className, style }: PageSwapProps<K>) {
  const box = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<{ key: K; id: number }[]>([{ key: page, id: 0 }]);
  const els = useRef(new Map<number, HTMLDivElement>());
  const next = useRef(1);
  const busy = useRef(false);

  // a new page arrived: put it under the current one
  if (layers[layers.length - 1].key !== page && !busy.current) {
    busy.current = true;
    setLayers((l) => [...l.slice(-1), { key: page, id: next.current++ }]);
  }

  useLayoutEffect(() => {
    if (layers.length < 2 || !box.current) return;
    const [a, b] = layers;
    const from = els.current.get(a.id), to = els.current.get(b.id);
    if (!from || !to) return;
    let live = true;
    transition(kind, box.current, from, to, { ...options, ...origin }).then(() => {
      if (!live) return;
      busy.current = false;
      setLayers([b]);
      onDone?.();
    });
    return () => { live = false; };
  }, [layers]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={box} className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
      {layers.map((l) => (
        <div key={l.id} ref={(el) => { if (el) els.current.set(l.id, el); else els.current.delete(l.id); }} style={{ position: "absolute", inset: 0 }}>
          {render(l.key)}
        </div>
      ))}
    </div>
  );
}
