// ConfettiPop.tsx
// React wrapper for confetti.ts. Wrap the thing that should pop.
//
//   const card = useRef<HTMLDivElement>(null);
//   <div ref={card} style={{ position: "relative", overflow: "hidden", borderRadius: 20 }}>
//     <ConfettiPop within={card}>   // pops on mount, and every time trigger changes
//       <CheckBadge />
//     </ConfettiPop>
//   </div>

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { confettiPop, type ConfettiOptions } from "./confetti";

export interface ConfettiPopProps extends Omit<ConfettiOptions, "within"> {
  children: ReactNode;
  /** the element the confetti stays inside (clipped by it). Leave out to cover the page */
  within?: RefObject<HTMLElement | null>;
  /** change this to pop again. Any value: a number, a boolean, an id */
  trigger?: unknown;
  /** pop when it first appears. true */
  onMount?: boolean;
}

export function ConfettiPop({ children, within, trigger, onMount = true, ...options }: ConfettiPopProps) {
  const ref = useRef<HTMLDivElement>(null);
  // pop when trigger differs from the last one seen (a fresh symbol means "pop on mount")
  const last = useRef<unknown>(onMount ? Symbol("mount") : trigger);
  const opts = useRef(options);
  opts.current = options;

  useEffect(() => {
    if (Object.is(last.current, trigger) || !ref.current) return;
    const prev = last.current;
    last.current = trigger;
    const stop = confettiPop(ref.current, { ...opts.current, within: within?.current });
    // on unmount (or React's dev remount) stop the burst, and forget it so a remount plays it again
    return () => { stop?.(); last.current = prev; };
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={ref} style={{ display: "inline-flex" }}>{children}</div>;
}
