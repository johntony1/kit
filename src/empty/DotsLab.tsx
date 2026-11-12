// Dev only: #/dots shows every dot illustration at rest and hovered; #/dots/<k> shows one, big.
import { LazyDot } from "./DotArt";
import { THEMES } from "./dots";
import { ILLS } from "./ills";

export default function DotsLab() {
  const only = location.hash.split("/")[2];
  const list = only ? ILLS.filter((i) => i.k === only) : ILLS;
  const size = only ? [640, 560] : [440, 380];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 12, background: "#0b0b0b", minHeight: "100vh" }}>
      {list.length === 0 && <p style={{ color: "#fff" }}>No illustration "{only}". Have: {ILLS.map((i) => i.k).join(", ")}</p>}
      {list.flatMap((ill) => [false, true].map((hv) => (
        <div key={ill.k + hv} data-k={ill.k} data-hover={hv} style={{ width: size[0], height: size[1], position: "relative", borderRadius: 20, background: "#111", display: "grid", placeItems: "center" }}>
          <div style={{ width: size[0] - 40, height: size[1] - 40, position: "relative" }}><LazyDot k={ill.k} hover={hv} theme={THEMES[0]} /></div>
          <span style={{ position: "absolute", left: 12, top: 8, font: "11px monospace", color: "#666" }}>{ill.k} {ill.kind} {hv ? "hovered" : "rest"}</span>
        </div>
      )))}
    </div>
  );
}
