// ThemeSwitch: a rocker. A tall pill split in two: the sun half and the moon half. The half for the
// theme you are in is pressed in (sunk, darker, its icon dim); the other half stands proud and
// catches the light. In the dark it sits on a green under-glow; in the light it shows a green lip
// along its underside. Click either half, or anywhere on it, to rock it over.
import { useSyncExternalStore } from "react";
import { play } from "../sound/sound";
import { theme } from "./theme";

const Sun = () => (
  <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <circle cx="8" cy="8" r="2.8" fill="currentColor" stroke="none" />
    <path d="M8 1.6v1.5M8 12.9v1.5M1.6 8h1.5M12.9 8h1.5M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1" />
  </svg>
);
const Moon = () => (
  <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true"><path d="M10.9 10.6A5.2 5.2 0 0 1 5.4 2.2a5.6 5.6 0 1 0 8.4 6.3 5.2 5.2 0 0 1-2.9 2.1z" fill="currentColor" /></svg>
);

export function ThemeSwitch() {
  const t = useSyncExternalStore(theme.subscribe, theme.get, () => "dark" as const);
  const dark = t === "dark";
  const flip = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    play(dark ? "on" : "off", { force: false });
    theme.set(dark ? "light" : "dark", r.left + r.width / 2, r.top + r.height / 2);
  };
  return (
    <button type="button" role="switch" aria-checked={dark} aria-label={dark ? "Dark mode. Switch to light" : "Light mode. Switch to dark"} title={dark ? "Dark" : "Light"}
      className={`rocker ${dark ? "isDark" : "isLight"}`} onClick={flip}>
      <span className="rkBody">
        <span className="rkHalf rkTop"><Sun /></span>
        <span className="rkHalf rkBot"><Moon /></span>
      </span>
    </button>
  );
}
