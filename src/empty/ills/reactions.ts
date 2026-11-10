// No reactions: four emoji tokens standing in a pill shaped tray. One at a time they pop up, wobble and drop back in.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 6; // seconds per loop: a second and a half per token
const R = 4.2, TH = 2; // token radius and thickness
const XS = [-15, -5, 5, 15]; // where the tokens stand along the tray

type P2 = [number, number];
/** a stadium in the floor plane, counter clockwise */
function pill(x0: number, x1: number, r: number): P2[] {
  const pts: P2[] = [];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 12; pts.push([x1 + Math.cos(a) * r, Math.sin(a) * r]); }
  for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (Math.PI * i) / 12; pts.push([x0 + Math.cos(a) * r, Math.sin(a) * r]); }
  return pts;
}

/** a flat shape extruded up from z by th: the walls that face us, then the top */
function slab(p: Pen, pts: P2[], z: number, th: number, top = SH.top) {
  const n = pts.length;
  const walls: { d: number; f: V3[]; k: number }[] = [];
  for (let i = 0; i < n; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n];
    const L = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = (y1 - y0) / L, ny = -(x1 - x0) / L;
    if (nx + ny <= 0) continue;
    const k = SH.right + (SH.left - SH.right) * Math.max(0, Math.min(1, (ny - nx + 1) / 2));
    walls.push({ d: x0 + x1 + y0 + y1, f: [[x0, y0, z], [x1, y1, z], [x1, y1, z + th], [x0, y0, z + th]], k });
  }
  walls.sort((u, v) => u.d - v.d);
  for (const w of walls) p.face(w.f, w.k, L(w.f) > 2.5 ? SH.edge : 0, 0.5);
  p.face(pts.map(([x, y]) => [x, y, z + th] as V3), top, SH.edge, 0.6);
}
const L = (f: V3[]) => Math.hypot(f[1][0] - f[0][0], f[1][1] - f[0][1]);

/** a point on the token's face: u right, v up, in its own plane facing +y */
const on = (u: number, v: number, y = TH / 2 + 0.06): V3 => [u, y, v];
const arc = (cu: number, cv: number, r: number, a0: number, a1: number, n = 10): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return on(cu + Math.cos(a) * r, cv + Math.sin(a) * r); });

/** the faces, cut into the token as lines */
function glyph(p: Pen, kind: number) {
  const lw = 0.7;
  if (kind === 0) { // a smile
    p.dot(on(-1.5, 1.2), 0.75, 0); p.dot(on(1.5, 1.2), 0.75, 0);
    p.line(arc(0, 0.2, 2.2, Math.PI * 1.15, Math.PI * 1.85), SH.edge, lw);
  } else if (kind === 1) { // a heart
    const h: V3[] = [];
    for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2, x = 16 * Math.pow(Math.sin(a), 3), y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); h.push(on(x * 0.15, y * 0.15 + 0.3)); }
    p.line(h, SH.edge, lw);
  } else if (kind === 2) { // a laugh: closed eyes and an open mouth
    p.line(arc(-1.5, 0.9, 0.8, 0.2, Math.PI - 0.2, 6), SH.edge, 0.6); p.line(arc(1.5, 0.9, 0.8, 0.2, Math.PI - 0.2, 6), SH.edge, 0.6);
    p.line([...arc(0, -0.4, 2, Math.PI, Math.PI * 2), on(-2, -0.4)], SH.edge, lw);
  } else { // a star
    const s: V3[] = [];
    for (let i = 0; i <= 10; i++) { const a = Math.PI / 2 + (i / 10) * Math.PI * 2, r = i % 2 ? 1.1 : 2.6; s.push(on(Math.cos(a) * r, Math.sin(a) * r)); }
    p.line(s, SH.edge, lw);
  }
}

export const reactions: Illustration = {
  k: "reactions", name: "Reactions", title: "No one has reacted yet", body: "When people react to your posts, you will see it here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, -8);
    p.scale(1.08);
    p.shadow(-10, 0, 22, 11, 0.12);
    p.shadow(10, 0, 22, 11, 0.12);
    // the tray: a pill with a slot down the middle the tokens stand in
    slab(p, pill(-17, 17, 5.4), 0, 2.6, 0.12);
    p.face(pill(-17.5, 17.5, 1.4).map(([x, y]) => [x, y, 2.62] as V3), 0.03, SH.edge, 0.5);
    // the tokens, back to front (along x is far to near)
    XS.forEach((x, i) => {
      const w = (u * 4 - i + 4) % 4; // 0..1 while this one plays
      const k = w < 1 ? w : 0;
      // up, a short hold at the top, then back down into the slot
      const jump = k <= 0 ? 0 : k < 0.3 ? easeInOut(k / 0.3) : k < 0.62 ? 1 : k < 0.92 ? 1 - easeInOut((k - 0.62) / 0.3) : 0;
      const z = 2.6 + R - 1.2 + jump * 9;
      const sc = 1 + jump * 0.25;
      const wob = k > 0 ? Math.sin(k * Math.PI * 6) * 0.2 * jump : 0;
      p.push();
      p.translate(x, 0, z);
      p.rotate("y", wob);
      p.scale(sc);
      // the edge: rings stacked through the thickness, then the face
      // the rim: the strip of its edge that faces us, as one piece, then the face
      const rim = (a: number, y: number): V3 => [Math.cos(a) * R, y, Math.sin(a) * R];
      const as = Array.from({ length: 21 }, (_, j) => -Math.PI * 0.25 + (Math.PI * j) / 20);
      p.face([...as.map((a) => rim(a, -TH / 2)), ...as.slice().reverse().map((a) => rim(a, TH / 2))], SH.right, SH.edge, 0.5);
      p.ringV("y", [0, TH / 2, 0], R, jump > 0.15 ? 0.34 : 0.24, SH.edge, 0.9);
      glyph(p, i);
      p.pop();
      // a few sparks in the air at the top of the hop
      if (jump > 0.5) {
        const s = (jump - 0.5) * 2;
        for (let j = 0; j < 4; j++) {
          const a = (j / 4) * Math.PI * 2 + 0.5;
          p.dot([x + Math.cos(a) * (R + 2.5 * s) * 0.7, Math.sin(a) * 3, z + Math.sin(a) * (R + 2 + 2 * s)], 0.55, 1);
        }
        p.guide([[x, 0, z - R * sc], [x, 0, 2.7]], true);
      }
    });
  },
};
