// No holidays planned: a striped hammock slung between two posts. Hover and it starts to swing gently.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const glow = (p: Pen, pts: V3[], lw = 1) => {
  const q = pts.map((a) => p.pt(a));
  p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = lw; g.lineCap = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const PX = 19, HZ = 21, FX = 12.5, C = Math.cos(-0.45), S = Math.sin(-0.45); // the posts, the hooks' height, the cloth's half length

export const hammock: Illustration = {
  k: "hammock", name: "Hammock", title: "No holidays planned", body: "Plan a break and your getaways will be waiting here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const sw = ease(h) * (0.28 + 0.1 * Math.sin(t * 2.4)); // the swing about the line through the hooks
    // the cloth: sagging along its length, its edges curled up
    const W = (x: number) => 7.5 * (1 - 0.55 * (x / FX) ** 2);
    const cloth = (x: number, s: number): V3 => {
      const y = s * W(x), z = 7.5 + 7 * (x / FX) ** 2 + 0.08 * y * y;
      const dy = y, dz = z - HZ, c = Math.cos(sw), sn = Math.sin(sw);
      return [x, dy * c - dz * sn, HZ + dy * sn + dz * c];
    };
    p.translate(0, 0, -11);
    p.scale(1.05);
    p.rotate("z", -0.45);
    p.shadow(0, 0, 32, 12, 0.12);
    // the far post
    const post = (x: number) => {
      p.box(x - 1.6, -2.2, 0, 3.2, 4.4, 1, { top: 0.22, left: 0.12, right: 0.065 });
      p.box(x - 1.5, -1.5, 1, 3, 3, HZ + 2.5, { top: 0.28, left: 0.16, right: 0.075, lw: 0.55 });
    };
    post(-PX);
    // the ropes at the far end fan out from the hook
    const fan = (sg: number) => { for (const s of [-1, -0.33, 0.33, 1]) glow(p, [[sg * (PX - 1.4), 0, HZ], cloth(sg * FX, s)], 0.9); };
    fan(-1);
    // the cloth, in bands along its length, drawn far to near
    const NX = 26, NS = 8, qs: { q: V3[]; f: number; d: number }[] = [];
    for (let i = 0; i < NX; i++) for (let j = 0; j < NS; j++) {
      const x0 = -FX + (2 * FX * i) / NX, x1 = -FX + (2 * FX * (i + 1)) / NX, s0 = -1 + (2 * j) / NS, s1 = -1 + (2 * (j + 1)) / NS;
      const q = [cloth(x0, s0), cloth(x1, s0), cloth(x1, s1), cloth(x0, s1)];
      const d = q.reduce((a, v) => a + v[0] * (C + S) + v[1] * (C - S) + v[2], 0) / 4; // depth after the turn
      qs.push({ q, f: j % 2 ? 0.12 : 0.32, d });
    }
    qs.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.q, s.f, 0));
    // its hems, and the spreader bars at each end
    for (const s of [-1, 1]) p.line(Array.from({ length: NX + 1 }, (_, i) => cloth(-FX + (2 * FX * i) / NX, s)), 1, 0.6);
    for (const x of [-FX, FX]) glow(p, [cloth(x, -1.15), cloth(x, 1.15)], 1.6);
    fan(1);
    post(PX);
  },
};
