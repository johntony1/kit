// Nothing built yet: a snowman of three snowballs with a top hat, a carrot nose and twig arms. Hover and he lifts his hat and waves.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const circle = (cx: number, cv: number, r: number, n = 44): P2[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cv + Math.sin(a) * r]; });
const turn = ([u, v]: P2, [pu, pv]: P2, a: number): P2 => { const c = Math.cos(a), s = Math.sin(a); return [pu + (u - pu) * c - (v - pv) * s, pv + (u - pu) * s + (v - pv) * c]; };

// a snowball: lit, with a shaded crescent on its lower right and a cut rim
function ball(p: Pen, cu: number, cv: number, r: number) {
  const out = circle(cu, cv, r);
  p.face(out.map(B), 0.24, 0);
  const sh: P2[] = [];
  for (let i = 0; i <= 20; i++) { const a = -1.9 + (i / 20) * 2.4; sh.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); }
  for (let i = 20; i >= 0; i--) { const a = -1.9 + (i / 20) * 2.4, f = Math.sin((i / 20) * Math.PI); sh.push([cu + Math.cos(a) * r * 0.98 - 0.32 * r * f, cv + Math.sin(a) * r * 0.98 + 0.22 * r * f]); }
  p.face(sh.map(B), 0.08, 0);
  p.line([...out, out[0]].map(B), SH.edge, 0.6);
}

export const snowman: Illustration = {
  k: "snowman", name: "Snowman", title: "Nothing built yet", body: "Start your first build and it will take shape right here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = easeInOut(h);
    p.translate(0, 0, -25);
    p.shadow(0, 0, 22, 10, 0.12);
    // twig arms: bright strokes out of the middle ball, the right one waves while hovered
    const wave = e * (0.9 + 0.25 * Math.sin(t * 7) * h);
    const armL: P2[] = [[-7, 30], [-19, 35], [-22, 34]], armR: P2[] = [[7, 30], [18, 35], [21, 38.5]];
    const R = armR.map((q) => turn(q, [7, 30], wave * 0.5));
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round"; g.lineJoin = "round";
      for (const arm of [armL, R]) { g.beginPath(); arm.map((q) => p.pt(B(q))).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
      const [fx, fy] = p.pt(B([-16, 34.2])), [gx, gy] = p.pt(B([-15.5, 38]));
      g.beginPath(); g.moveTo(fx, fy); g.lineTo(gx, gy); g.stroke();
    });
    // three snowballs, bottom first
    ball(p, 0, 12, 12);
    ball(p, 0, 29.5, 8.6);
    ball(p, 0, 42, 6.4);
    // buttons
    for (const v of [32, 28, 24]) p.dot(B([-0.6, v]), 0.9, 0);
    // eyes and a carrot nose
    p.dot(B([-2.6, 44]), 1, 0); p.dot(B([1.9, 44]), 1, 0);
    p.face(([[-0.4, 42.4], [-0.4, 40.2], [7.4, 40.8]] as P2[]).map(B), 0.3, SH.edge, 0.5);
    // the top hat: lifted and tipped while hovered
    const lift = 3.2 * e + h * Math.sin(t * 7) * 0.4, tip = -0.35 * e;
    const hat = (q: P2[]) => q.map(([u, v]) => turn([u, v + lift], [0, 47.5 + lift], tip)).map(B);
    p.face(hat([[-4.8, 48.3], [4.8, 48.3], [4.8, 55.5], [-4.8, 55.5]]), 0.22, 0);
    p.face(hat([[1.6, 48.3], [4.8, 48.3], [4.8, 55.5], [1.6, 55.5]]), 0.08, 0);
    p.face(hat([[-4.8, 48.3], [4.8, 48.3], [4.8, 50.3], [-4.8, 50.3]]), 0.04, 0);
    p.face(hat([[-8.4, 47.2], [8.4, 47.2], [8.4, 48.6], [-8.4, 48.6]]), 0.22, 0);
  },
};
