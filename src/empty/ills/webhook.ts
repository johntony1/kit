// No webhooks yet: a hook hangs from a little stand. Hover and a packet drops into it and the hook gives a small swing.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const T = 2.4; // the hook's half thickness (y)
const W = 1.05; // half the hook's stroke
const X0 = 1.5, ZT = 28.5, CZ = 15.5, R = 3.7; // shank x, shank top, bowl centre z, bowl radius
const CX = X0 + R;

/** the hook's centre line in the xz plane: down the shank, round the bowl, up to the tip */
function spine(): [number, number][] {
  const out: [number, number][] = [[X0, ZT], [X0, CZ]];
  for (let i = 1; i <= 16; i++) { const a = Math.PI + (i / 16) * (Math.PI + 0.75); out.push([CX + Math.cos(a) * R, CZ + Math.sin(a) * R]); }
  return out;
}

/** a thick stroke along `pts`, extruded in y: back, the lit thickness, then the front */
function hook(p: Pen) {
  const s = spine(), L: [number, number][] = [], Rt: [number, number][] = [];
  s.forEach((q, i) => {
    const a = s[Math.max(0, i - 1)], b = s[Math.min(s.length - 1, i + 1)];
    const dx = b[0] - a[0], dz = b[1] - a[1], n = Math.hypot(dx, dz) || 1;
    const nx = -dz / n, nz = dx / n;
    L.push([q[0] + nx * W, q[1] + nz * W]); Rt.push([q[0] - nx * W, q[1] - nz * W]);
  });
  const at = (q: [number, number], y: number): V3 => [q[0], y, q[1]];
  const outline = [...L, ...Rt.slice().reverse()];
  p.face(outline.map((q) => at(q, -T)), SH.right, SH.edge, 0.5);
  // the thickness: each strip shaded by which way it faces
  const strips = (side: [number, number][], sign: number) => {
    for (let i = 0; i < side.length - 1; i++) {
      const a = side[i], b = side[i + 1];
      const dx = b[0] - a[0], dz = b[1] - a[1], n = Math.hypot(dx, dz) || 1;
      const nx = (-dz / n) * sign, nz = (dx / n) * sign;
      const fill = nz > 0.5 ? SH.top : nx > 0.3 ? SH.right : SH.left;
      p.face([at(a, -T), at(b, -T), at(b, T), at(a, T)], fill, 0);
    }
  };
  strips(L, 1); strips(Rt, -1);
  // tip cap
  const e = s.length - 1;
  p.face([at(L[e], -T), at(Rt[e], -T), at(Rt[e], T), at(L[e], T)], SH.top, 0);
  return () => {
    p.face(outline.map((q) => at(q, T)), SH.top, SH.edge, 0.55);
    // a groove down the shank and a point at the tip
    p.line([[X0, T + 0.03, ZT - 1.5], [X0, T + 0.03, CZ + 0.5]], SH.edge, 0.6);
  };
}

export const webhook: Illustration = {
  k: "webhook", name: "Webhook", title: "No webhooks yet", body: "Add an endpoint and every event we send it will be caught and listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const d = Math.min(1, h * 1.35); // how far the packet has dropped
        const s = Math.max(0, (h - 0.6) / 0.4);
    const swing = 0.13 * Math.sin(s * Math.PI * 2) * (1 - s);
    p.translate(0.5, 0, -16);
    p.shadow(-8, 0, 15, 8, 0.12);
    p.shadow(CX, 0, 10, 5, 0.08);

    // the stand: a lit base, a post and an arm
    p.box(-13, -5, 0, 10, 10, 2);
    p.line([[-11.5, -3.5, 2.02], [-4.5, -3.5, 2.02], [-4.5, 3.5, 2.02]], SH.edge, 0.55);
    p.box(-10, -1.5, 2, 3, 3, 28.5);
    p.box(-10, -1.5, 30.5, 14, 3, 2.6);
    p.guide([[CX, 0, CZ - R - W], [CX, 0, 0]]);

    p.push(); p.rotate("y", swing, [X0, 0, 30.5]);
    // the link from the arm to the hook
    p.box(X0 - 0.7, -0.7, ZT, 1.4, 1.4, 2);
    const front = hook(p);
    // the packet: a little envelope cube, an accent lid
    // it arcs in from the upper right and drops into the bowl
    const pos = (q: number): V3 => [CX + (1 - q) * 9, 0, CZ - R + W + (1 - q * q) * 15];
    const [px, , bz] = pos(d);
    const pw = 4.4, pd = 3.6, ph = 4;
    if (d < 1) p.guide(Array.from({ length: 9 }, (_, i) => { const q = pos(d + ((1 - d) * i) / 8); return [q[0], 0, q[2] + ph / 2] as V3; }), true);
    p.box(px - pw / 2, -pd / 2, bz, pw, pd, ph, { top: 0.32 });
    p.line([[px - pw / 2 + 0.2, pd / 2 + 0.03, bz + ph - 0.3], [px, pd / 2 + 0.03, bz + 1.6], [px + pw / 2 - 0.2, pd / 2 + 0.03, bz + ph - 0.3]], SH.edge, 0.6);
    front();
    p.pop();

    // a bright tick of light the moment it lands
    if (s > 0 && s < 0.7) {
      const k = 1 - s / 0.7;
      for (let i = 0; i < 4; i++) {
        const a = -0.5 + i * 1.05;
        p.dot([CX + Math.cos(a) * (6 + s * 3), 0, CZ + 3 + Math.sin(a) * 2 + s * 3], 0.7, k > 0.3 ? 1 : 0.6);
      }
    }
  },
};
