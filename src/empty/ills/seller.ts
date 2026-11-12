// Seller badge: a scalloped rosette with a little shop front on it and two ribbon tails. Hover and it hops and tilts; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const CZ = 19, R = 11.6;

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}
const seal = (y: number): V3[] => Array.from({ length: 96 }, (_, i) => { const a = (i / 96) * Math.PI * 2, q = R + 1.1 * Math.cos(a * 12); return [Math.cos(a) * q, y, CZ + Math.sin(a) * q] as V3; });

export const seller: Illustration = {
  k: "seller", name: "Seller badge", title: "No sellers followed", body: "Follow a seller to see their new listings and offers here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const hop = Math.sin(Math.PI * Math.min(1, h * 1.5)) * 4 + h * (1.5 + 0.6 * Math.sin(t * 2.4));
    p.translate(0, 0, -16);
    p.shadow(0, 0, 20 - h * 3, 8, 0.1);
    p.translate(0, 0, hop);
    p.rotate("z", -0.55);
    p.rotate("y", h * 0.14 * Math.sin(t * 2.4), [0, 0, CZ]);
    // the ribbon tails, behind
    const tail = (s: number): V3[] => ([[s * 1.2, 10], [s * 7.4, 10], [s * 9.6, -1.4], [s * 6, 1.2], [s * 3.6, -2]] as P2[]).map(([x, z]) => [x, -1.2, z] as V3);
    p.face(tail(-1), 0.16, SH.edge, 0.55); p.face(tail(1), 0.1, SH.edge, 0.55);
    // the rosette: its back, then the lit front with a ring
    p.face(seal(-2.4), SH.right, 0); p.face(seal(-1.2), SH.right, 0);
    p.face(seal(0), 0.22, SH.edge, 0.6);
    const Y = 0.04, f = (x: number, z: number): V3 => [x * 1.12, Y, CZ - 0.4 + z * 1.12];
    p.line(Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * 8.8, Y, CZ + Math.sin(a) * 8.8] as V3; }), SH.edge, 0.5);
    // the shop front: an awning with a scalloped edge, the wall, a door and a window
    p.line([f(-4.2, 4.6), f(4.2, 4.6), f(5.6, 1.8), f(-5.6, 1.8), f(-4.2, 4.6)], SH.edge, 0.8);
    p.line(Array.from({ length: 25 }, (_, i) => { const u = i / 24; return f(-5.6 + 11.2 * u, 1.8 - 1.3 * Math.abs(Math.sin(u * Math.PI * 3))); }), SH.edge, 0.7);
    p.line([f(-1.4, 4.6), f(-1.87, 1.8)], SH.edge, 0.5); p.line([f(1.4, 4.6), f(1.87, 1.8)], SH.edge, 0.5);
    p.line([f(-4.6, 0.4), f(-4.6, -5), f(4.6, -5), f(4.6, 0.4)], SH.edge, 0.8);
    p.line([f(0.6, -5), f(0.6, -1.4), f(3, -1.4), f(3, -5)], SH.edge, 0.6);
    p.line([f(-3.2, -1.4), f(-0.9, -1.4), f(-0.9, -3.4), f(-3.2, -3.4), f(-3.2, -1.4)], SH.edge, 0.6);
    // the plus badge pops in at the end
    const b = Math.max(0, (h - 0.6) / 0.4);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [12, 1, CZ + 11], 4.6 * pop);
    }
  },
};
