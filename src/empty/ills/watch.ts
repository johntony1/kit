// No watches saved: a big wristwatch standing upright, a dark dial in a bright case between two halves of a linked strap. Hover and the hands sweep round to a new time; a plus pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const CZ = 21, R = 11, D = 3.4; // dial centre height, case radius, depth
const SW = 6.4; // half width of the strap
const UP: P2[] = [[-SW, CZ + 7], [SW, CZ + 7], [SW - 1.2, 42], [-SW + 1.2, 42]];
const LO: P2[] = [[-SW, CZ - 7], [SW, CZ - 7], [SW - 1.2, 0], [-SW + 1.2, 0]];
const CASE: P2[] = Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * R, CZ + Math.sin(a) * R] as P2; });
const at = (pts: P2[], y: number): V3[] => pts.map(([x, z]) => [x, y, z]);
/** a point on the dial: angle clockwise from twelve, in degrees */
const dial = (deg: number, r: number, y = 0.08): V3 => { const a = (deg * Math.PI) / 180; return [Math.sin(a) * r, y, CZ + Math.cos(a) * r]; };

function badge(p: Pen, pos: V3, r: number) {
  const [x, y] = p.pt(pos);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

// a hand: a bright stroke from the centre, flat to the screen so it stays crisp
function hand(p: Pen, deg: number, len: number, w: number) {
  const [x0, y0] = p.pt(dial(deg, 0)), [x1, y1] = p.pt(dial(deg, len));
  p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });
}

export const watch: Illustration = {
  k: "watch", name: "Wristwatch", title: "No watches saved", body: "Save a watch you like and it will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const side = p.ink ? 0.065 : 0.045;
    p.translate(0, 0, -21);
    p.shadow(0, 0, 17, 8, 0.12);
    p.rotate("z", -0.45); // turned to face us
    p.translate(0, 1.5, 0);
    // the depth: strap and case again and again, stepping back
    const step = p.ink ? D : 0.4;
    for (let y = -D; y < -0.05; y += step) { p.face(at(UP, y), side, 0); p.face(at(LO, y), side, 0); p.face(at(CASE, y), side, 0); }
    // the strap: two bands cut into links, holes in the lower one
    p.face(at(UP, 0), 0.14, 0);
    p.face(at(LO, 0), 0.14, 0);
    for (const z of [33.5, 37.5, 4.5, 8.5]) p.line([[-SW, 0.03, z], [SW, 0.03, z]], SH.edge, 0.8);
    for (const z of [2.3, 6.5, 10.6]) p.dot([0, 0.03, z], 0.9, 0);
    // the crown, then the bright case and the dark dial
    p.box(R - 0.6, -2.6, CZ - 1.6, 2.6, 2.2, 3.2, { top: 0.3, left: 0.3, right: 0.14, edge: 0 });
    p.face(at(CASE, 0), 0.3, 0);
    p.clear(CASE.map(([x, z]) => [x * 0.76, 0.04, CZ + (z - CZ) * 0.76] as V3));
    for (const d of [0, 90, 180, 270]) p.dot(dial(d, R * 0.6), 0.75, 1);
    // the hands: ten past ten at rest, sweeping round to ten to two
    const k = ease(h);
    hand(p, 300 + 120 * k, 4.4, 1.8);
    hand(p, 60 + 600 * k, 6.6, 1.4);
    p.dot(dial(0, 0, 0.1), 1, 1);
    const b = clamp((h - 0.66) / 0.34);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [14, 0, 36], 4.8 * pop);
    }
  },
};
