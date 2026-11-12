// Goal thermometer: a fundraising thermometer with a scale and a goal flag at the top. Hover and it fills up to the goal, and a tick pops in.
import { easeInOut, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const S = Math.SQRT1_2;
const pop = (b: number) => (b <= 0 ? 0 : b < 0.65 ? easeInOut(b / 0.65) * 1.18 : 1.18 - 0.18 * easeInOut((b - 0.65) / 0.35));
// a round bright badge with a dark tick, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.04); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.5, y - r * 0.34); g.stroke();
  });
}

export const goalmeter: Illustration = {
  k: "goalmeter", name: "Goal thermometer", title: "No savings goals yet", body: "Set a goal and watch it fill up as you put money aside.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const s = clamp(h * 1.15);
    const lvl = Math.min(35.4, 15 + 19 * (1 - Math.exp(-4.2 * s) * Math.cos(5.5 * s)) + h * Math.sin(t * 2.6) * 0.3);
    p.translate(2, -2, -19);
    p.shadow(0, 0, 21, 9.5, 0.12);
    // the foot, the bulb, the filled part of the tube, the empty glass above it
    p.cylinder(0, 0, 0, 9.5, 2.4, { side: 0.12, top: 0.2 });
    p.cylinder(0, 0, 2.4, 6.6, 6.2, { side: 0.42, top: 0.5 });
    p.cylinder(0, 0, 8.6, 3.8, lvl - 8.6, { side: 0.42, top: 0.55, edge: 0 });
    p.cylinder(0, 0, lvl, 3.8, 36 - lvl, { side: 0.05, top: 0.16 });
    // the scale: bars standing out to the left
    const at = (d: number, z: number): V3 => [-S * d, S * d, z];
    for (let i = 0; i < 5; i++) {
      const z = 12.5 + i * 4.6, d1 = i % 2 ? 8.2 : 10.4;
      p.face([at(5.4, z - 0.5), at(d1, z - 0.5), at(d1, z + 0.5), at(5.4, z + 0.5)], 0.5, 0);
    }
    // the goal: a pennant at the top mark, brighter once the column reaches it
    const k = clamp((lvl - 31) / 3);
    p.face([at(5.4, 33.2), at(5.4, 37.6), at(12.4, 35.4)], 0.22 + 0.5 * k, 1, 0.55);
    const b = clamp((h - 0.7) / 0.3);
    if (b > 0) badge(p, [S * 11, -S * 11, 34], 4.8 * pop(b));
  },
};
