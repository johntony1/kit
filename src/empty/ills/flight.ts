// No flights booked: a boarding pass propped up, a little plane waiting at the start of its route. Hover and the plane flies the route to the far dot.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const Y = 0.6, XT = 7.5; // the front of the card, the tear line
const F = (u: number, v: number, o = 0.04): V3 => [u, Y + o, v];
const round = (u: number, v: number, r: number): V3[] => Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return F(u + Math.cos(a) * r, v + Math.sin(a) * r, 0.03); });

export const flight: Illustration = {
  k: "flight", name: "Boarding pass", title: "No flights booked", body: "Book a flight and your boarding pass will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h);
    p.translate(1.5, 0, -12);
    p.shadow(0, 2, 31, 11, 0.1);
    p.scale(1.12);
    p.translate(0, 0, 1.2 * Math.sin(k * Math.PI));
    p.rotate("x", 0.36);
    // the card: a bright face, a darker band along its top
    p.box(-18, -Y, 0, 36, Y * 2, 20, { top: 0.24, left: 0.21, right: 0.07, lw: 0.6 });
    p.face([F(-18, 15.8, 0.02), F(18, 15.8, 0.02), F(18, 20, 0.02), F(-18, 20, 0.02)], p.ink ? 0.3 : 0.07, 0);
    // the tear line and its two notches
    for (let v = 1.8; v < 18.6; v += 1.7) p.line([F(XT, v), F(XT, v + 0.7)], SH.edge, 0.7);
    p.clear(round(XT, 20, 1.5)); p.clear(round(XT, 0, 1.5));
    // details under the route
    p.line([F(-14.5, 3.6), F(-8.5, 3.6)], SH.edge, 1.2);
    p.line([F(-2.5, 3.6), F(3.5, 3.6)], SH.edge, 1.2);
    // the stub: a barcode
    [1.1, 0.6, 1.2, 0.6, 1].forEach((lw, i) => p.line([F(10.2 + i * 1.5, 3.2), F(10.2 + i * 1.5, 12.6)], SH.edge, lw * 0.8));
    // the route: two dots, dashes ahead of the plane, a solid line behind it
    const A = -14, B = 3.5, V = 9.6;
    const u = A + 3.6 + (B - A - 7.2) * k, lift = 1.6 * Math.sin(k * Math.PI) + h * 0.25 * Math.sin(t * 4);
    for (let x = A + 2; x < B - 1.8; x += 1.8) if (x > u + 3.4) p.line([F(x, V), F(x + 0.8, V)], SH.edge, 0.7);
    if (k > 0.03) p.line([F(A + 1.6, V), F(u - 3.4, V + lift * 0.4)], SH.edge, 0.8);
    p.dot(F(A, V), 1.3, 0);
    const b = Math.max(0, (k - 0.8) / 0.2);
    p.line([...round(B, V, 1.4 + 0.4 * b), round(B, V, 1.4 + 0.4 * b)[0]], SH.edge, 0.7);
    if (b > 0) p.dot(F(B, V), 1.1 * b, p.ink ? 1 : 0);
    // the plane, nose along the route
    const a = 0.5 * Math.cos(k * Math.PI) * (k > 0 && k < 1 ? 1 : 0), c = Math.cos(a), s = Math.sin(a);
    const G = (x: number, y: number): V3 => F(u + (x * c - y * s) * 1.25, V + lift + (x * s + y * c) * 1.25, 0.08);
    p.line([G(-2.2, 0), G(2.3, 0)], SH.edge, 1.5);
    p.line([G(-1.3, 2.5), G(0.7, 0), G(-1.3, -2.5)], SH.edge, 1.1);
    p.line([G(-2.9, 1.1), G(-2.1, 0), G(-2.9, -1.1)], SH.edge, 0.9);
  },
};
