// No compute running: a thick graphics card in three quarter view, two big round fans in its lit shroud, a metal bracket at one end and gold fingers along the bottom. The fans spin round, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4, L = 21, D = 3.5, H = 17; // loop seconds, half length, half thickness, height

// a fan in the shroud's face: a dark well, seven lit blades and a lit hub
function fan(p: Pen, cx: number, cz: number, r: number, spin: number) {
  const y = D + 0.04, at = (a: number, rr: number): V3 => [cx + Math.cos(a) * rr, y, cz + Math.sin(a) * rr];
  p.face(Array.from({ length: 40 }, (_, i) => at((i / 40) * Math.PI * 2, r + 0.9)), 0.3, 0); // a lit ring round the well
  p.clear(Array.from({ length: 40 }, (_, i) => at((i / 40) * Math.PI * 2, r)));
  for (let b = 0; b < 7; b++) {
    const a = spin + (b / 7) * Math.PI * 2, pts: V3[] = [];
    for (let i = 0; i <= 6; i++) { const k = i / 6; pts.push(at(a + k * 0.55, 2.2 + k * (r - 2.8))); }
    for (let i = 6; i >= 0; i--) { const k = i / 6; pts.push(at(a + 0.42 + k * 0.75, 2.2 + k * (r - 2.8))); }
    p.face(pts, 0.32, 0);
  }
  p.face(Array.from({ length: 24 }, (_, i) => at((i / 24) * Math.PI * 2, 2.4)), 0.42, 0);
  p.dot(at(0, 0), 0.7, 0);
}

export const gpu: Illustration = {
  k: "gpu", name: "GPU", title: "No compute running", body: "Start a job and the hardware it runs on will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const spin = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -9);
    p.shadow(0, 2, 30, 13, 0.11);
    p.rotate("z", -0.5);
    // the board underneath, a dark layer behind the shroud, and the gold fingers below it
    p.box(-L + 1, -D - 1.2, 0, L * 2 - 1, 1.2, H, { top: 0.12, left: 0.05, right: 0.05, edge: 0 });
    p.box(-6, -D - 1.1, -2.2, 18, 1, 2.2, { top: 0.3, left: 0.3, right: 0.12, edge: 0 });
    for (let i = 1; i < 12; i++) p.line([[-6 + i * 1.5, -D - 0.08, -2.2], [-6 + i * 1.5, -D - 0.08, 0]], SH.edge, 0.5);
    // the shroud: lit top, lit face, shaded end
    p.box(-L, -D, 0, L * 2, D * 2, H, { top: 0.24, left: 0.2, right: 0.075, edge: 0 });
    p.line([[-L, D + 0.03, 1.4], [L, D + 0.03, 1.4]], SH.edge, 0.6);
    p.line([[-L, D + 0.03, H - 1.4], [L, D + 0.03, H - 1.4]], SH.edge, 0.6);
    fan(p, -9.6, H / 2, 6.6, spin);
    fan(p, 9.6, H / 2, 6.6, spin + 0.3);
    // the bracket at the left end: a tall bright plate
    p.box(-L - 1.4, -D - 1.6, -2.5, 1.4, D * 2 + 2.6, H + 4, { top: 0.3, left: 0.36, right: 0.2, edge: 0 });
  },
};
