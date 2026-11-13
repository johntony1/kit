// Nothing wrapped yet: a big roll of striped wrapping paper lying on its side with a bow sitting on top, its loose sheet unrolled flat toward us. Hover and the roll rolls back, laying out more paper, and the bow gives a little hop.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const L = 16, R = 7.5; // the roll: half length, radius

export const giftwrap: Illustration = {
  k: "giftwrap", name: "Gift wrap", title: "Nothing wrapped yet", body: "Choose gift wrap at checkout and the orders to wrap will line up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(h);
    p.translate(0, 0, -12);
    p.shadow(0, 2, 26, 12, 0.12);
    p.rotate("z", -0.32); // turned so the roll lies across, its end toward us
    const yb = -4 - 6 * k; // where the roll sits: it rolls back on hover
    const spin = (6 * k) / R;
    // the loose sheet: a short lit tongue from under the roll toward us
    const y1 = yb + R + 5 + 4 * k;
    p.face([[-L + 0.8, yb, 0.05], [L - 0.8, yb, 0.05], [L - 0.8, y1, 0.05], [-L + 0.8, y1, 0.05]], 0.2, 0);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) {
      const x = -L + 3.5 + i * 6.6 + (j % 2) * 3.3, y = yb + R + 2 + j * 4.5;
      if (y < y1 - 1) p.dot([x, y, 0.08], 0.85, 0);
    }
    // the roll: its round body as a lit top and a denser front, dark stripes winding round it
    const CZ = R;
    const at = (x: number, a: number, r = R): V3 => [x, yb + Math.cos(a) * r, CZ + Math.sin(a) * r];
    const band = (a0: number, a1: number, f: number) => {
      const pts: V3[] = [];
      for (let i = 0; i <= 8; i++) pts.push(at(-L, a0 + ((a1 - a0) * i) / 8));
      for (let i = 8; i >= 0; i--) pts.push(at(L, a0 + ((a1 - a0) * i) / 8));
      p.face(pts, f, 0);
    };
    band(-1.2, 0.75, 0.065);
    band(0.75, 2.2, 0.13);
    // the pattern: thin stripes winding round the roll, turning as it rolls
    for (let i = 0; i < 6; i++) {
      const pts: V3[] = [];
      for (let j = 0; j <= 12; j++) {
        const a = -1.2 + (3.4 * j) / 12, x = -L + 1 + ((i * 6.2 + (a + spin) * 3) % 31);
        if (x < -L + 0.6 || x > L - 0.6) { if (pts.length > 1) break; pts.length = 0; continue; }
        pts.push(at(x, a, R + 0.04));
      }
      if (pts.length > 1) p.line(pts, 1, 1);
    }
    // the right end: a lit disc with the paper's spiral cut into it, a dark core
    const ring = (r: number): V3[] => Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return at(L, a, r); });
    p.face(ring(R), 0.24, 0);
    p.line(Array.from({ length: 50 }, (_, i) => { const a = (i / 49) * Math.PI * 4 + spin, r = 2 + (i / 49) * 4.6; return at(L + 0.02, a, r); }), SH.edge, 0.7);
    p.face(ring(1.6).map(([x, y, z]) => [x + 0.04, y, z] as V3), 0.02, 0);
    // the bow on top of the roll: two loops and a knot, hopping on hover
    const hop = Math.sin(Math.min(1, Math.max(0, (h - 0.45) / 0.4)) * Math.PI) * 3;
    const bz = CZ + R - 0.5 + hop, by = yb;
    const loop = (s: number, f: number, grow: number, y: number) => p.face(Array.from({ length: 25 }, (_, i) => {
      const a = -Math.PI / 2 + (i / 24) * Math.PI, r = 9.5 * Math.pow(Math.cos(a), 0.8) + grow, d = 0.55 + a * 0.6;
      return [s * Math.cos(d) * r, by + y, bz + 1 + Math.sin(d) * r] as V3;
    }), f, 0);
    loop(-1, 0.02, 1.1, 0.4); loop(1, 0.02, 1.1, 0.4);
    loop(-1, 0.3, 0, 0.5); loop(1, 0.3, 0, 0.5);
    p.line(Array.from({ length: 13 }, (_, i) => { const a = -Math.PI / 2 + (i / 12) * Math.PI, r = 5 * Math.pow(Math.cos(a), 0.8), d = 0.55 + a * 0.6; return [-Math.cos(d) * r, by + 0.6, bz + 1 + Math.sin(d) * r] as V3; }), SH.edge, 0.7);
    p.line(Array.from({ length: 13 }, (_, i) => { const a = -Math.PI / 2 + (i / 12) * Math.PI, r = 5 * Math.pow(Math.cos(a), 0.8), d = 0.55 + a * 0.6; return [Math.cos(d) * r, by + 0.6, bz + 1 + Math.sin(d) * r] as V3; }), SH.edge, 0.7);
    p.ringV("y", [0, by + 0.8, bz + 1], 2.8, 0.03, 0);
    p.ringV("y", [0, by + 0.9, bz + 1], 2.2, 0.45, 0);
  },
};
