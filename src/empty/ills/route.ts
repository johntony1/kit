// No route yet: two map pins, a small one where you start and a big one where you are going, joined by a dotted path on the ground. The dots run from one to the other and the far pin bobs.
import { type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const P = 3; // seconds per loop
const D = 3.2;
// a pin's outline: a round head on a point, [x, z]
function drop(cx: number, r: number, ht: number): P2[] {
  const a0 = Math.acos(r / ht), out: P2[] = [[cx, 0]];
  for (let i = 0; i <= 30; i++) { const a = a0 + (i / 30) * (Math.PI * 2 - a0 * 2); out.push([cx + Math.sin(a) * r, ht - Math.cos(a) * r]); }
  return out;
}
const at = (pts: P2[], y: number): V3[] => pts.map(([x, z]) => [x, y, z]);

function pin(p: Pen, cx: number, r: number, ht: number, side: number) {
  const pts = drop(cx, r, ht);
  const step = p.ink ? D : 0.4;
  for (let y = -D; y < -0.05; y += step) p.face(at(pts, y), side, 0);
  p.face(at(pts, 0), 0.3, 0);
  p.clear(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [cx + Math.cos(a) * r * 0.42, 0.04, ht + Math.sin(a) * r * 0.42] as V3; }));
}

export const route: Illustration = {
  k: "route", name: "Route", title: "No route yet", body: "Pick a start and a destination and the way between them will be drawn here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const side = p.ink ? 0.065 : 0.045;
    const AX = -16, BX = 12;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 28, 12, 0.11);
    p.rotate("z", -0.45); // turned to face us
    p.translate(0, -3, 0);
    // a ring on the floor under each pin
    p.disc(AX, 0, 0.02, 4.2, 0.1);
    p.disc(BX, 0, 0.02, 6.4, 0.1);
    // the pins: the start, small, and the destination, big and bobbing
    pin(p, AX, 5.4, 15, side);
    p.push();
    p.translate(0, 0, 1.2 + Math.sin(u * Math.PI * 2) * 1.2);
    pin(p, BX, 9.2, 26, side);
    p.pop();
    // the path: bright dots on the ground swinging out towards us, running from start to end
    const N = 7;
    for (let i = 0; i < N; i++) {
      const k = (i + (u * 2) % 1) / N;
      const x = AX + 3 + (BX - AX - 4) * k, y = 3.5 + Math.sin(k * Math.PI) * 9;
      const fade = Math.min(1, k * N, (1 - k) * N);
      p.disc(x, y, 0.03, 1.7 * (0.5 + 0.5 * fade), 0.3);
    }
  },
};
