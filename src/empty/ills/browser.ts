// This page did not load: a browser window holding a broken image, and a round reload button in front of it, its arrow spinning.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const PERIOD = 2.6;
const X0 = -16, X1 = 16, Z0 = 3, Z1 = 27, D = 1.2; // the window (it looks toward +y)
const TB = Z1 - 5.2; // where the toolbar starts

// a point on a plane facing +y
const on = (x: number, z: number, y = D + 0.03): V3 => [x, y, z];
const circ = (cx: number, cz: number, r: number, y: number, n = 32): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3; });

export const browser: Illustration = {
  k: "browser", name: "Browser", title: "This page did not load", body: "Something interrupted the page. Reload it to try again.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    const spin = easeInOut(u) * Math.PI * 2;
    p.translate(0, 0, -15);
    p.rotate("z", -0.5); // face us a little more
    p.shadow(0, 0, 22, 8, 0.12);

    // the window: its top and right edge, then the face
    p.box(X0, -D, Z0, X1 - X0, D * 2, Z1 - Z0, { top: 0.12, left: 0.24, right: SH.right });
    // the toolbar: a dark band with three lit dots and a lit address field
    p.clear([on(X0 + 0.9, TB), on(X1 - 0.9, TB), on(X1 - 0.9, Z1 - 0.9), on(X0 + 0.9, Z1 - 0.9)]);
    for (let i = 0; i < 3; i++) p.face(circ(X0 + 2.8 + i * 2.7, TB + 2.15, 0.95, D + 0.05, 12), 0.24, 0);
    p.face([on(-6.5, TB + 1, D + 0.05), on(X1 - 2.2, TB + 1, D + 0.05), on(X1 - 2.2, Z1 - 1.9, D + 0.05), on(-6.5, Z1 - 1.9, D + 0.05)], 0.24, 0);
    p.line([on(-4.6, TB + 2.15, D + 0.07), on(4, TB + 2.15, D + 0.07)], SH.edge, 0.6);

    // the broken image: a picture frame split by a crack, the right half knocked askew
    const fx0 = -12, fx1 = 3, fz0 = 7.5, fz1 = 18.5;
    const crack: [number, number][] = [[-4.2, fz1], [-5.4, 16], [-3.6, 13.6], [-5.2, 11], [-3.8, 9], [-4.6, fz0]];
    const L = (pts: [number, number][], dx = 0, dz = 0) => p.line(pts.map(([x, z]) => on(x + dx, z + dz, D + 0.06)), SH.edge, 0.8);
    L([crack[0], [fx0, fz1], [fx0, fz0], crack[crack.length - 1]]);
    L([[fx0 + 1.4, fz0 + 1.6], [-8.6, 14], [-6.6, 11.6], [-5, 13.2]]); // a mountain on the left half
    const ox = 1.1, oz = -1.3;
    L([crack[0], [fx1, fz1], [fx1, fz0], crack[crack.length - 1]], ox, oz);
    L([[-4.2, 10.6], [-1.4, 13.4], [0.6, 11.6], [fx1 - 1.2, 12.8]], ox, oz); // and its slope on the right
    p.line([...circ(-0.4 + ox, 16 + oz, 1.25, D + 0.06, 16), circ(-0.4 + ox, 16 + oz, 1.25, D + 0.06, 16)[0]], SH.edge, 0.7); // the sun
    L(crack); L(crack, ox, oz);
    // a couple of lines of text that never arrived
    L([[-12, 4.9], [-3, 4.9]]);

    // the reload button floats in front: a dark ring parts it from the window, then the disc and its arrow
    const bx = 11, bz = 8.6, br = 5.6, by = D + 4;
    p.clear(circ(bx, bz, br + 1.1, by + 1.2, 40));
    for (let i = 0; i <= 5; i++) p.face(circ(bx, bz, br, by - 1.2 + (i / 5) * 1.2, 40), 0.12, 0);
    p.face(circ(bx, bz, br, by + 0.02, 40), 0.24, 0);
    const ar = 2.9, a0 = spin + 0.5, a1 = a0 + 4.9;
    const arc: V3[] = Array.from({ length: 22 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / 21; return [bx + Math.cos(a) * ar, by + 0.05, bz + Math.sin(a) * ar] as V3; });
    p.line(arc, SH.edge, 1);
    // the arrowhead at the end of the arc, pointing on round
    const end = arc[arc.length - 1];
    const ta = a1 + Math.PI / 2, ca = Math.cos(a1), sa = Math.sin(a1); // the way the arc is heading, and outward
    p.clear([
      [end[0] + Math.cos(ta) * 2.1, end[1] + 0.02, end[2] + Math.sin(ta) * 2.1],
      [end[0] + ca * 1.9, end[1] + 0.02, end[2] + sa * 1.9],
      [end[0] - ca * 1.9, end[1] + 0.02, end[2] - sa * 1.9],
    ]);
  },
};
