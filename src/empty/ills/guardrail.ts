// No rules set: a roadside guardrail on three posts, a ball resting in front of it. Hover and the ball rolls into the rail, is stopped and rolls back a little; a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.5, y - r * 0.38); g.stroke();
  });
}

export const guardrail: Illustration = {
  k: "guardrail", name: "Guardrails", title: "No rules set", body: "Add a rule to keep answers safe and on topic. Your guardrails will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-1, -4, -9);
    p.scale(1.08);
    p.shadow(0, 2, 30, 13, 0.1);
    const st = { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 };
    // the rail gives a little when it is hit
    const hit = Math.sin(Math.PI * seg(h, 0.46, 0.62)) * 0.9;
    for (const x of [-14, 0, 14]) p.box(x - 1.5, -1.8, 0, 3, 3.4, 11.5, st);
    p.box(-19, 1.6 - hit, 6, 38, 2, 7.5, st);
    const yf = 3.43 - hit;
    p.line([[-19, yf + 0.2, 8.5], [19, yf + 0.2, 8.5]], SH.edge, 0.7);
    p.line([[-19, yf + 0.2, 11], [19, yf + 0.2, 11]], SH.edge, 0.7);
    for (const x of [-14, 0, 14]) p.dot([x, yf + 0.22, 9.75], 0.8, 0);
    // the ball: rolls in, stops against the rail, rolls back a little
    const R = 5.2, y0 = 18, yh = 3.6 + R, y1 = 12;
    const k = seg(h, 0.05, 1);
    const y = k < 0.45 ? y0 - (y0 - yh) * Math.pow(k / 0.45, 2) : yh + (y1 - yh) * ease((k - 0.45) / 0.55);
    const bx = 5;
    p.shadow(bx, y, 7, 3.5, 0.16);
    const [sx, sy] = p.pt([bx, y, R]);
    const roll = (y0 - y) / R + 0.6;
    p.screen((c) => {
      c.beginPath(); c.arc(sx, sy, R, 0, Math.PI * 2); c.fillStyle = "rgb(120,120,120)"; c.fill();
      c.save(); c.beginPath(); c.arc(sx, sy, R, 0, Math.PI * 2); c.clip();
      c.beginPath(); c.arc(sx - 1.6, sy - 1.6, R * 0.95, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill();
      c.restore();
      c.beginPath(); c.arc(sx, sy, R, 0, Math.PI * 2); c.strokeStyle = "#000"; c.lineWidth = 0.6; c.stroke();
      // a stripe that turns as it rolls
      c.beginPath(); c.arc(sx + Math.cos(roll) * R * 0.45, sy + Math.sin(roll) * R * 0.45, 1, 0, Math.PI * 2); c.fillStyle = "#000"; c.fill();
    });
    // the knock: three short marks where it meets the rail
    const kn = seg(h, 0.46, 0.72);
    if (kn > 0 && kn < 1) for (const [dx, dz] of [[-5.5, 3], [-6.5, 0], [5.5, 3]] as [number, number][]) p.line([[bx + dx * (0.7 + kn * 0.3), yf + 2, R + 3 + dz * (0.7 + kn * 0.5)], [bx + dx * (1 + kn * 0.3), yf + 2, R + 3 + dz * (1 + kn * 0.5) + 1]], 1 - kn, 0.8);
    const b = seg(h, 0.7, 1);
    if (b > 0) badge(p, [17, -3, 19], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
