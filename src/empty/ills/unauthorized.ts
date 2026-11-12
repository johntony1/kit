// Sign in to continue: a sign in card standing up, a person mark, two fields and a button. Hover and the fields fill in and the button lights.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

// a bright stroke: lines turn dark in the dot styles, so marks on a dark ground are stroked on the screen
function bright(p: Pen, pts: V3[], lw: number) {
  if (p.ink) { p.line(pts, SH.edge, lw); return; }
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.strokeStyle = "#fff"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

const X = 12.5, T = 0.8, Z = 31;
const cl = (x: number) => Math.max(0, Math.min(1, x));

export const unauthorized: Illustration = {
  k: "unauthorized", name: "Sign in", title: "Sign in to continue", body: "You need to be signed in to see this page. Sign in and we will bring you right back.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 1, 25, 11, 0.12);
    p.rotate("z", -0.42);
    p.rotate("x", 0.08);
    p.box(-X, -T, 0, X * 2, T * 2, Z, { top: 0.2, left: 0.2, right: 0.065 });
    const fy = T + 0.03, fz = fy + 0.03;
    const rect = (z0: number, z1: number, fill: number) => p.face([[-8.5, fy, z0], [8.5, fy, z0], [8.5, fy, z1], [-8.5, fy, z1]], fill, SH.edge, 0.55);
    // the person mark: a dark disc with a head and shoulders
    p.ringV("y", [0, fy, 24.6], 4.2, 0.02, SH.edge, 0.7);
    p.dot([0, fz, 25.8], 1.3, 1);
    bright(p, Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI; return [Math.cos(a) * 2.5, fz, 21.8 + Math.sin(a) * 1.9] as V3; }), 0.9);
    // the name field: a line types in
    const a = cl(h / 0.3), b = cl((h - 0.3) / 0.35), c = easeInOut(cl((h - 0.7) / 0.3));
    rect(13.6, 17.6, 0.02);
    if (a > 0) bright(p, [[-6.6, fz, 15.6], [-6.6 + 9 * a, fz, 15.6]], 1.1);
    // the password field: dots, one at a time
    rect(8, 12, 0.02);
    for (let i = 0; i < 5; i++) if (b * 5 > i + 0.2) p.dot([-6.2 + i * 2.5, fz, 10], 0.85, 1);
    // a caret in whichever field is being filled
    if (h > 0.02 && h < 0.66 && Math.sin(t * 9) > -0.3) {
      const cx = h < 0.3 ? -5.8 + 9 * a : -7.2 + Math.ceil(b * 5) * 2.5 + 0.9, cz = h < 0.3 ? 15.6 : 10;
      bright(p, [[cx, fz, cz - 1.2], [cx, fz, cz + 1.2]], 0.6);
    }
    // the button, lighting up
    rect(2.6, 6.4, 0.1 + 0.26 * c);
    p.line([[-2.2, fz, 4.5], [2.2, fz, 4.5]], SH.edge, 0.9);
    p.line([[0.6, fz, 5.7], [2.3, fz, 4.5], [0.6, fz, 3.3]], SH.edge, 0.9);
  },
};
