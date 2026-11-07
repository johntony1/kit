// ConfettiPop.tsx
// React wrapper for confetti.ts. Wrap the thing that should pop.
//
//   <ConfettiPop trigger={done}>        // pops every time trigger changes (and on mount)
//     <CheckBadge />
//   </ConfettiPop>

import { useEffect, useRef, type ReactNode } from "react";
import { confettiPop, type ConfettiOptions } from "./confetti";

export interface ConfettiPopProps extends ConfettiOptions {
  children: ReactNode;
  /** change this to pop again. Any value: a number, a boolean, an id */
  trigger?: unknown;
  /** pop when it first appears. true */
  onMount?: boolean;
}

export function ConfettiPop({ children, trigger, onMount = true, ...options }: ConfettiPopProps) {
  const ref = useRef<HTMLDivElement>(null);
  // pop when trigger differs from the last one seen (a fresh symbol means "pop on mount")
  const last = useRef<unknown>(onMount ? Symbol("mount") : trigger);
  const opts = useRef(options);
  opts.current = options;

  useEffect(() => {
    if (Object.is(last.current, trigger) || !ref.current) return;
    last.current = trigger;
    confettiPop(ref.current, opts.current);
  }, [trigger]);

  return <div ref={ref} style={{ display: "inline-flex" }}>{children}</div>;
}
