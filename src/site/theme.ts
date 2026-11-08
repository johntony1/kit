// theme.ts: light and dark. The choice is remembered; the change grows out of the switch as a
// circle (View Transitions), or swaps at once where that is not supported or motion is reduced.
export type Theme = "light" | "dark";
const KEY = "effects-theme";
const subs = new Set<() => void>();

/** the site is dark only for now (light mode lives on as a component); a stored choice is ignored */
export const SITE_LIGHT_ENABLED = false;
export function readTheme(): Theme {
  if (!SITE_LIGHT_ENABLED) return "dark";
  try { const v = localStorage.getItem(KEY); if (v === "light" || v === "dark") return v; } catch { /* private mode */ }
  return "dark";
}
let current: Theme = readTheme();
const apply = (t: Theme) => { current = t; document.documentElement.dataset.theme = t; subs.forEach((f) => f()); };
apply(current);

export const theme = {
  get: () => current,
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
  /** switch theme; the circle starts at (x, y) in viewport px */
  set(next: Theme, x = innerWidth - 80, y = 32) {
    if (next === current) return;
    try { localStorage.setItem(KEY, next); } catch { /* private mode */ }
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(next); return; }
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = doc.startViewTransition(() => apply(next));
    vt.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 620, easing: "cubic-bezier(0.2, 0, 0, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => {});
  },
};
