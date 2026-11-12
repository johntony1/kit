// No labels printed: a small label printer with the corner of a label showing. Hover and a shipping label feeds out, barcode first; the light comes on.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const BARS = [0, 0.7, 1.1, 1.9, 2.6, 3, 3.8, 4.6, 5, 5.7, 6.5, 6.9, 7.7]; // where the barcode's bars sit

export const label: Illustration = {
  k: "label", name: "Shipping label", title: "No labels printed", body: "Buy postage for an order and its label will print from here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(Math.min(1, h * 1.15));
    p.translate(0, -5, -8);
    p.shadow(0, 4, 28, 14, 0.11);
    const W = 10.5, D = 8, H = 12.5;
    // the printer: a block with a lid, a button and a light
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.22, left: 0.13, right: 0.07 });
    p.line([[-W, D + 0.03, H - 3], [W, D + 0.03, H - 3], [W + 0.03, -D, H - 3]], 0.7, 0.45);
    p.face([[-W + 2, -D + 2, H + 0.02], [W - 2, -D + 2, H + 0.02], [W - 2, D - 5, H + 0.02], [-W + 2, D - 5, H + 0.02]], 0.1, 0.7, 0.45); // the window over the roll
    p.disc(W - 3, D - 2.4, H + 0.03, 1.2, 0.4, 0.9);
    p.dot([W - 6.6, D - 2.4, H + 0.03], 0.7, 0.35 + 0.65 * k * (0.75 + 0.25 * Math.sin(t * 5)));
    // the slot along the front
    const Y = D + 0.03, Z = 3.6, X = 7.4;
    p.face([[-X - 0.8, Y, Z - 0.7], [X + 0.8, Y, Z - 0.7], [X + 0.8, Y, Z + 0.9], [-X - 0.8, Y, Z + 0.9]], 0.02, SH.edge, 0.5);
    // the label: it feeds out toward us and sags to the floor
    const L = 6.4 + 9.6 * k; // how much is out
    const zAt = (d: number) => Z - 3.3 * (1 - Math.pow(1 - Math.min(1, d / 9), 2));
    const pt = (x: number, d: number): V3 => [x, D + d, zAt(d) + 0.02];
    const n = 12, a: V3[] = [], b: V3[] = [];
    for (let i = 0; i <= n; i++) { const d = (L * i) / n; a.push([-X, D + d, zAt(d)]); b.push([X, D + d, zAt(d)]); }
    p.face([...a, ...b.reverse()], 0.42, SH.edge, 0.6);
    // what is printed on it, measured back from the leading edge: a barcode, then an address block and a tick box
    const from = (s: number) => L - s; // distance out of the slot for a mark s behind the leading edge
    for (const q of BARS) { const x = -X + 1.4 + q; if (from(4.6) > 0.2) p.line([pt(x, from(1.2)), pt(x, Math.max(0.2, from(4.6)))], 0, q % 1.4 < 0.7 ? 0.7 : 0.45); }
    if (from(2.2) > 0.2) p.face([pt(X - 4.2, from(1.2)), pt(X - 1.2, from(1.2)), pt(X - 1.2, Math.max(0.2, from(4.4))), pt(X - 4.2, Math.max(0.2, from(4.4)))], 0.9, 0);
    for (const [s, w] of [[6.6, 9], [8.2, 12], [9.8, 7]]) if (from(s) > 0.2) p.line([pt(-X + 1.4, from(s)), pt(-X + 1.4 + w, from(s))], 0, 0.6);
    if (from(13) > 0.2) p.line([pt(-X + 1.4, from(12)), pt(X - 1.4, from(12))], 0, 0.9);
  },
};
