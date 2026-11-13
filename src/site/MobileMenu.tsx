// The menu on phones and tablets: a button in the top bar opens a panel from the right with the
// kinds, the light and dark switch, and the license. On wider windows the kinds sit in the top bar.

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 *    0ms   tap the menu button: its two lines turn into a cross (220ms)
 *    0ms   the scrim fades in (200ms); the panel slides in from the right edge (spring, no bounce)
 *   60ms   the rows follow, 30ms apart, rising 6px as they fade in
 *  close   the panel slides back out, quicker than it came (spring 0.28s); the rows don't stagger
 * ───────────────────────────────────────────────────────── */

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { ThemeToggle } from "./VintageSwitch";

const PANEL_IN = { type: "spring", duration: 0.42, bounce: 0 } as const;
const PANEL_OUT = { type: "spring", duration: 0.28, bounce: 0 } as const;
const ROW = { delay: 0.06, stagger: 0.03 };

export function MenuButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button type="button" className="topPill menuBtn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="kit-menu" onClick={onClick}>
      <span className="menuLines" data-open={open} aria-hidden="true"><i /><i /></span>
    </button>
  );
}

export function MobileMenu<K extends string>({ open, onClose, items, current, onPick, footer }: {
  open: boolean; onClose: () => void;
  items: { k: K; icon: ReactNode }[]; current: K | null; onPick: (k: K) => void;
  footer: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // keep Tab inside the panel while it is open
      if (e.key === "Tab" && panel.current) {
        const f = [...panel.current.querySelectorAll<HTMLElement>("button, a[href]")];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    addEventListener("keydown", esc);
    const sb = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${sb}px`;
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>('[aria-current="true"], button')?.focus({ preventScroll: true }));
    return () => {
      removeEventListener("keydown", esc);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      (opener.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <div className="mmLayer" key="mm">
            <motion.div className="mmScrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.2 } }} exit={{ opacity: 0, transition: { duration: 0.18 } }} />
            <motion.nav id="kit-menu" ref={panel} className="mmPanel" aria-label="Menu"
              initial={{ x: "105%" }} animate={{ x: 0, transition: PANEL_IN }} exit={{ x: "105%", transition: PANEL_OUT }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0, right: 0.6 }}
              onDragEnd={(_, i) => { if (i.offset.x > 80 || i.velocity.x > 500) onClose(); }}>
              <div className="mmHead">
                <span className="mmTitle">Browse</span>
                <button type="button" className="mmClose" aria-label="Close menu" onClick={onClose}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="mmList">
                {items.map((it, i) => (
                  <motion.button key={it.k} type="button" className="mmItem" aria-current={it.k === current ? "true" : undefined}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: ROW.delay + i * ROW.stagger, duration: 0.24, ease: [0.23, 1, 0.32, 1] } }}
                    onClick={() => { onPick(it.k); onClose(); }}>
                    <span className="mmIcon" aria-hidden="true">
                      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">{it.icon}</svg>
                    </span>
                    <span>{it.k}</span>
                    <svg className="mmGo" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </motion.button>
                ))}
              </div>
              <motion.div className="mmFoot" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: ROW.delay + items.length * ROW.stagger, duration: 0.24 } }}>
                {footer}
              </motion.div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

/** the footer of the panel: appearance and the license */
export function MenuFooter() {
  return (
    <>
      <div className="mmRow">
        <span>Appearance</span>
        <ThemeToggle />
      </div>
      <a className="mmRow mmLink" href="/license.txt" target="_blank" rel="noopener">
        <span>License</span>
        <span className="mmMuted">Free to use</span>
      </a>
    </>
  );
}
