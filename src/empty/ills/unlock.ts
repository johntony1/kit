// Nothing locked: a round padlock standing open, its shackle swung free. Hover and the shackle springs higher and swings wide, and a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const R = 11, T = 4, ZC = 12; // body radius, thickness, height of its centre
const LX = 6, BR = 1.8; // shackle half span, bar radius
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - cl(x), 3);
const back = (x: number) => { const v = cl(x); return 1 + 2.4 * Math.pow(v - 1, 3) + 1.4 * Math.pow(v - 1, 2); };

function shackle(p: Pen, lift: number) {
  const base = ZC + R - 3, top = base + 6 + lift, N = 18;
  const path: V3[] = [[LX, -T / 2, base + lift + 1.5], [LX, -T / 2, top]];
  for (let i = 1; i < N; i++) { const a = (Math.PI * i) / N; path.push([Math.cos(a) * LX, -T / 2, top + Math.sin(a) * LX]); }
  path.push([-LX, -T / 2, top], [-LX, -T / 2, base]);
  if (p.ink) { p.line(path, SH.edge, 1); return; }
  const q = path.map((v) => p.pt(v));
  p.screen((c) => {
    c.lineCap = "round"; c.lineJoin = "round";
    const stroke = (w: number, v: number, dx = 0, dy = 0) => {
      const n = Math.round(v * 255);
      c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = w;
      c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x + dx, y + dy) : c.moveTo(x + dx, y + dy))); c.stroke();
    };
    stroke(BR * 2 + 1.4, 0); stroke(BR * 2, 0.7); stroke(BR * 0.9, 1, -0.55, -0.7);
  });
}
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y); g.lineTo(x - r * 0.1, y + r * 0.35); g.lineTo(x + r * 0.5, y - r * 0.35); g.stroke();
  });
}

export const unlock: Illustration = {
  k: "unlock", name: "Unlocked", title: "Nothing locked", body: "Items you lock will be listed here, and you can unlock them at any time.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 22, 10, 0.12);
    p.rotate("z", -0.42);
    // the shackle behind the body, lifted out of its right hole and turned
    p.push();
    p.rotate("z", -(0.55 + 0.5 * ease((h - 0.3) / 0.7)), [-LX, -T / 2, 0]);
    shackle(p, 2.5 + 3 * back(h * 1.4));
    p.pop();
    // the round body: its rim going back, then the lit face with a keyhole
    for (let d = T; d > 0; d -= 0.4) p.ringV("y", [0, -d, ZC], R, 0.065, 0);
    p.ringV("y", [0, 0, ZC], R, 0.24, SH.edge, 0.6);
    p.ringV("y", [0, 0.03, ZC], R - 2.4, 0.2, SH.edge, 0.6);
    const y = 0.06;
    p.clear(Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return [Math.cos(a) * 2, y, ZC + 1.6 + Math.sin(a) * 2] as V3; }));
    p.clear([[-0.9, y, ZC + 1.6], [0.9, y, ZC + 1.6], [1.3, y, ZC - 4], [-1.3, y, ZC - 4]]);
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) badge(p, [-R + 1, 0, ZC + R + 2], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.15 : 1.15 - 0.15 * ease((b - 0.65) / 0.35)));
  },
};
