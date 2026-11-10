// No budget yet: a glass savings jar with a few coins in it. Hover and coins drop through the lid one after another as the level rises.
import { SH, type Illustration, type V3 } from "../dots";

const R = 9.5, H = 20; // jar radius and glass height
const LR = 7.4, LH = 3; // lid radius and height

/** the front half of a horizontal circle, the half facing us */
const front = (r: number, z: number): V3[] =>
  Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 20; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
const ring = (cx: number, cy: number, r: number, z: number): V3[] =>
  Array.from({ length: 33 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

export const budget: Illustration = {
  k: "budget", name: "Savings jar", title: "No budget set", body: "Set a monthly budget and watch your savings fill up here as you go.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 25, 12, 0.12);
    // the glass: a sparse wall, so the coins inside read through it
    p.cylinder(0, 0, 0, R, H, { side: SH.right, top: 0.03 });
    // the coins inside: a dense column with a lit top, rising with hover
    const lvl = 4.5 + 9 * h;
    p.cylinder(0, 0, 0.4, R - 0.9, lvl, { side: 0.13, top: 0.24 });
    // the coins' edges, cut round the column
    for (let z = 0.4 + 1.5; z < lvl; z += 1.5) p.line(front(R - 0.9, z), SH.edge, 0.55);
    // a few coins lying on top of the pile
    for (const [cx, cy] of [[-3, -2.5], [2.8, -1.5], [0, 3.5], [-4.2, 2.6], [4, 3.6]] as [number, number][]) {
      p.line(ring(cx, cy, 2, lvl + 0.42), SH.edge, 0.55);
    }
    // measure marks on the glass, right side
    for (let i = 1; i <= 4; i++) {
      const z = i * 3.8, a = Math.PI * 0.08;
      p.line([[Math.cos(a) * (R + 0.05), Math.sin(a) * (R + 0.05), z], [Math.cos(a - 0.22) * (R + 0.05), Math.sin(a - 0.22) * (R + 0.05), z]], SH.edge, 0.6);
    }
    // a glint down the glass, left side
    p.line([[Math.cos(1.95) * (R + 0.05), Math.sin(1.95) * (R + 0.05), 4], [Math.cos(1.95) * (R + 0.05), Math.sin(1.95) * (R + 0.05), H - 3]], SH.edge, 0.8);
    // the shoulder and the lid
    p.cylinder(0, 0, H, LR + 0.8, 0.8, { side: 0.12, top: 0.18 });
    p.cylinder(0, 0, H + 0.8, LR, LH, { side: 0.12, top: 0.22 });
    for (let i = 1; i < 6; i++) {
      const a = -Math.PI / 4 + (Math.PI * i) / 6;
      p.line([[Math.cos(a) * LR, Math.sin(a) * LR, H + 1.2], [Math.cos(a) * LR, Math.sin(a) * LR, H + LH + 0.4]], SH.edge, 0.55);
    }
    // the slot in the lid
    const zl = H + 0.8 + LH + 0.03;
    p.face([[-3.2, -0.55, zl], [3.2, -0.55, zl], [3.2, 0.55, zl], [-3.2, 0.55, zl]], 0.02, SH.edge, 0.5);
    // the coin: waits over the slot at rest, then drops in again and again while hovered
    const u = h > 0.05 ? (t * 0.9) % 1 : 0;
    const top = zl + 13;
    const z = top - (top - zl + 2.6) * u * u;
    // dashed drop line from the coin to the slot
    p.guide([[0, 0, zl + 0.1], [0, 0, top - 2.8]], true);
    // clip the coin where it passes into the slot
    const disc = (y: number, r: number): V3[] => Array.from({ length: 30 }, (_, i) => {
      const a = (i / 30) * Math.PI * 2;
      return [Math.cos(a) * r, y, Math.max(zl, z + Math.sin(a) * r)] as V3;
    });
    if (z + 2.4 > zl + 0.3) {
      for (let k = 0; k < 3; k++) p.face(disc(-0.4 + k * 0.3, 2.6), 0.13, 0);
      p.face(disc(0.5, 2.6), 0.34, SH.edge, 0.5);
      if (z - 1.7 > zl) p.ringV("y", [0, 0.55, z], 1.7, 0.34, SH.edge, 0.5);
    }
    // sparkles over the jar as it fills
    if (h > 0.3) for (let i = 0; i < 3; i++) {
      const v = (t * 0.5 + i / 3) % 1;
      p.dot([-7 + i * 6, 5, zl + 2 + v * 6], 0.8, (h - 0.3) * 1.4 * Math.sin(v * Math.PI));
    }
  },
};
