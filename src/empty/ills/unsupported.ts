// Browser not supported: an old browser window gathering a cobweb in its corner. A little spider lowers itself on its thread and climbs back up, over and over.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const X = 15, Y = 1.2, Z = 27, F = Y + 0.03, BAR = 5; // half width, half thickness, height, the front, the title bar

export const unsupported: Illustration = {
  k: "unsupported", name: "Old browser", title: "Browser not supported", body: "Update your browser or switch to a newer one to keep going.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1, w = Math.PI * 2 * ph;
    p.translate(0, 0, -14);
    p.shadow(0, 2, 26, 10, 0.12);
    p.rotate("z", -0.42);
    const at = (x: number, z: number, d = 0): V3 => [x, F + d, z];
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { top: 0.26, left: 0.13, right: 0.065, lw: 0.8 });
    // the title bar with its three buttons and an address field
    p.face([at(-X, Z - BAR), at(X, Z - BAR), at(X, Z), at(-X, Z)], 0.24, SH.edge, 0.7);
    p.line([at(-X, Z - BAR, 0.02), at(X, Z - BAR, 0.02)], SH.edge, 0.9);
    for (let i = 0; i < 3; i++) p.dot(at(-X + 2.8 + i * 2.8, Z - BAR / 2, 0.02), 0.95, p.ink ? 1 : 0);
    p.clear([at(-2, Z - BAR + 1.4), at(X - 2.4, Z - BAR + 1.4), at(X - 2.4, Z - 1.4), at(-2, Z - 1.4)]);
    // a page that never loaded: a broken picture and a stub line
    p.line([at(-X + 3, 15), at(-X + 12.5, 15), at(-X + 12.5, 6.5), at(-X + 3, 6.5), at(-X + 3, 15)], SH.edge, 1);
    p.line([at(-X + 5.4, 12.9), at(-X + 10.1, 8.6)], SH.edge, 1); p.line([at(-X + 10.1, 12.9), at(-X + 5.4, 8.6)], SH.edge, 1);
    p.line([at(-X + 3, 3.4), at(-X + 13, 3.4)], SH.edge, 1.2);
    // the cobweb in the top right corner of the page
    const cx = X, cz = Z - BAR, spokes = [Math.PI, Math.PI * 1.17, Math.PI * 1.33, Math.PI * 1.5];
    const sp = (a: number, r: number) => at(cx + Math.cos(a) * r, cz + Math.sin(a) * r, 0.02);
    for (const a of spokes) p.line([sp(a, 0), sp(a, 14)], SH.edge, 0.8);
    for (const r of [5, 9, 13]) {
      const web: V3[] = [];
      spokes.forEach((a, i) => {
        web.push(sp(a, r));
        if (i < spokes.length - 1) web.push(sp((a + spokes[i + 1]) / 2, r * 0.86)); // each span sags toward the corner
      });
      p.line(web, SH.edge, 0.8);
    }
    // the spider on its thread, dark against the page
    const sx = X - 10.4, top = cz - 9.3, drop = 4.4 + 3.6 * Math.sin(w), sz = top - drop, d = 0.04, ink = p.ink ? 1 : 0;
    p.line([at(sx, top, d), at(sx, sz, d)], SH.edge, 0.7);
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      const k = 0.5 * Math.sin(w * 3 + i * 1.3 + s), zz = sz + 1.1 - i * 1.1;
      p.line([at(sx, zz, d), at(sx + s * 2.2, zz + 1 + k * 0.6, d), at(sx + s * 3.5, zz - 0.5 + k, d)], SH.edge, 0.8);
    }
    p.dot(at(sx, sz, d), 2.1, ink);
    p.dot(at(sx, sz + 2, d), 1.2, ink);
  },
};
