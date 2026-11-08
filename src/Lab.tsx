// Dev only: #/lab/<key> renders a native component in dark tiles at the real bento sizes.
import { NATIVE } from "./site/native";

const BOXES: [string, number, number, "card" | "big"][] = [["2 col tile", 400, 360, "card"], ["3 col tile", 620, 360, "card"], ["short tile", 620, 196, "card"], ["sheet", 1100, 620, "big"]];

export default function Lab({ k }: { k: string }) {
  const C = NATIVE[k];
  if (!C) return <p style={{ color: "#fff", padding: 24 }}>No component "{k}". Have: {Object.keys(NATIVE).join(", ")}</p>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: 16, background: "#121312", minHeight: "100vh" }}>
      {BOXES.map(([label, w, h, size]) => (
        <div key={label} style={{ width: w, height: h, position: "relative", borderRadius: 28, background: "#191a19", boxShadow: "inset 0 1px 0 rgba(255,255,255,.04), 0 0 0 1px rgba(255,255,255,.04)", overflow: "hidden" }}>
          <C size={size} />
          <span style={{ position: "absolute", left: 12, top: 8, font: "11px monospace", color: "#5d6862", pointerEvents: "none" }}>{label} {w}×{h}</span>
        </div>
      ))}
    </div>
  );
}
