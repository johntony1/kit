/* Sliding tabs. Split out of Segmented tab, ported from johntony1/segmented-tab-animation.
 * A sliding, stretching highlight across the tabs.
 *
 * Tab switch:
 *    0ms   pill springs old → new tab (layoutId, stiffness 440 / damping 38)
 *    0ms   press scale 1 → 0.97, springs back on release
 *  150ms   labels cross-fade soft ↔ strong
 *  180ms   adjacent dividers fade out; far dividers fade in
 *
 * Sound: tick when the tab changes.
 * Every size is in em (1em = 14px at size 1) so the widget scales without
 * putting a CSS transform above the layout animation. */

import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Fragment, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { play } from "../sound/sound";

const e = (px: number) => `${px / 14}em`;

const C = {
  strong: "#e3e8e3",
  soft: "#8b968f",
  faint: "#5d6862",
  divider: "rgba(255,255,255,0.08)",
  raised: "linear-gradient(180deg,#2b2d2b,#242624)",
  raisedShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.45), 0 4px 10px -4px rgba(0,0,0,.4)",
  track: "rgba(0,0,0,0.28)",
  trackShadow: "inset 0 1px 2px rgba(0,0,0,.45), 0 1px 0 rgba(255,255,255,.04)",
};

const INDICATOR_SPRING = { type: "spring" as const, stiffness: 440, damping: 38 };
const PRESS = { scale: 0.97, spring: { type: "spring" as const, stiffness: 500, damping: 20 } };
const TIMING = { label: 0.15, divider: 0.18 };

type TabId = "all" | "draft" | "archived" | "shared";
const TABS: { id: TabId; label: string; px: number }[] = [
  { id: "all", label: "All", px: 12 },
  { id: "draft", label: "Draft", px: 12 },
  { id: "archived", label: "Archived", px: 8 },
  { id: "shared", label: "Shared", px: 8 },
];
const showDivider = (l: TabId | null, r: TabId | null, a: TabId) => a !== l && a !== r;

const TEXT = { fontSize: "1em", lineHeight: e(20), fontWeight: 500, letterSpacing: "-0.006em", whiteSpace: "nowrap" as const };

function Divider({ visible }: { visible: boolean }) {
  return <motion.div aria-hidden animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: TIMING.divider, ease: "easeInOut" }}
    style={{ flexShrink: 0, width: 1, height: e(28), background: C.divider }} />;
}

function Indicator({ radius }: { radius: number }) {
  const reduced = useReducedMotion();
  return <motion.span layoutId="sliding-tabs-indicator" style={{ position: "absolute", inset: 0, background: C.raised, boxShadow: C.raisedShadow, zIndex: 0, borderRadius: e(radius) }}
    transition={reduced ? { duration: 0 } : INDICATOR_SPRING} />;
}

function TabBtn({ id, active, onClick, px, children }: { id: TabId; active: TabId; onClick: () => void; px: number; children: ReactNode }) {
  const on = active === id;
  const reduced = useReducedMotion();
  return (
    <motion.button type="button" role="tab" aria-selected={on} onClick={onClick} className="sliding-tabs-btn"
      whileTap={reduced ? {} : { scale: PRESS.scale }} transition={PRESS.spring}
      style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: `${e(4)} ${e(px)}`, borderRadius: e(16) }}>
      {on && <Indicator radius={16} />}
      <motion.span animate={{ color: on ? C.strong : C.soft }} transition={{ duration: TIMING.label, ease: "easeInOut" }}
        style={{ ...TEXT, position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: e(4), userSelect: "none" }}>
        {children}
      </motion.span>
    </motion.button>
  );
}

const CSS = `
.sliding-tabs-btn { appearance: none; border: 0; background: none; margin: 0; padding: 0; font: inherit; color: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.sliding-tabs-btn:focus-visible { outline: 2px solid rgba(52,181,98,.7); outline-offset: 1px; }
`;

function useBox(ref: React.RefObject<HTMLDivElement | null>) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([en]) => setBox({ w: en.contentRect.width, h: en.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return box;
}

export default function SlidingTabs({ size = "card" }: { size?: "card" | "big" }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const box = useBox(rootRef);
  const uid = useId();
  const [active, setActive] = useState<TabId>("all");

  // the row is ~300px wide at 1em = 14px
  const k = size === "big" ? 1.8 : box.w ? Math.max(0.72, Math.min(1.25, (box.w - 64) / 300)) : 1;
  const onTab = (id: TabId) => { if (id !== active) play("tick"); setActive(id); };

  return (
    <div ref={rootRef} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
      <style>{CSS}</style>
      <LayoutGroup id={uid}>
        <div data-own-click style={{ pointerEvents: "auto", fontSize: 14 * k }}>
          <div role="tablist" aria-label="Content filter"
            style={{ display: "inline-flex", alignItems: "center", gap: e(4), padding: e(4), borderRadius: e(20), background: C.track, boxShadow: C.trackShadow }}>
            {TABS.map((t, i) => (
              <Fragment key={t.id}>
                {i > 0 && <Divider visible={showDivider(TABS[i - 1].id, t.id, active)} />}
                <TabBtn id={t.id} active={active} onClick={() => onTab(t.id)} px={t.px}>{t.label}</TabBtn>
              </Fragment>
            ))}
          </div>
        </div>
      </LayoutGroup>
    </div>
  );
}
