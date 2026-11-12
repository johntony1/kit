// No jewellery saved: a ring standing upright with a cut stone on top. Hover and the ring hops while glints flash off the stone.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const R = 11.2, RI = 8.3, ZC = 11.8, T = 2.1; // outer and inner radius of the band, its centre height, its half thickness
const band = (y: number): V3[] => {
  const o: V3[] = [], i: V3[] = [];
  for (let k = 0; k <= 48; k++) { const a = (k / 48) * Math.PI * 2; o.push([Math.cos(a) * R, y, ZC + Math.sin(a) * R]); i.push([Math.cos(a) * RI, y, ZC + Math.sin(a) * RI]); }
  return [...o, ...i.reverse()];
};
// the stone's outline from the side, in [x, z] above the band
const STONE: [number, number][] = [[-2.6, 0], [2.6, 0], [7.2, 6], [4.4, 9.4], [-4.4, 9.4], [-7.2, 6]];

// a four point glint, flat to the screen
function glint(p: Pen, at: V3, r: number) {
  if (r < 0.4) return;
  const [x, y] = p.pt(at);
  p.screen((c) => {
    c.fillStyle = "#fff"; c.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, q = i % 2 ? r * 0.3 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
    c.closePath(); c.fill();
  });
}

export const ring: Illustration = {
  k: "ring", name: "Ring", title: "No jewellery saved", body: "Save a piece of jewellery and it will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const hop = Math.sin(Math.min(1, h * 1.6) * Math.PI) * 4 + h * Math.sin(t * 3) * 0.5;
    p.translate(0, 0, -16.5);
    p.shadow(0, 1, 17 - hop * 0.6, 8, 0.12);
    p.rotate("z", -0.6); // turned to face us
    p.translate(0, 0, hop + 0.4);
    p.rotate("y", h * Math.sin(t * 3) * 0.04, [0, 0, 0]);
    // the band: its far face, the metal between, then the lit near face
    p.face(band(-T), 0.065, 0);
    for (let y = -T + 0.5; y < T; y += 0.5) p.face(band(y), 0.11, 0);
    p.face(band(T), 0.24, SH.edge, 0.6);
    // the setting and the stone, standing on top of the band
    const z0 = ZC + R - 0.4, G = T + 0.4;
    p.box(-3.4, -G, z0 - 1, 6.8, G * 2, 1.9, { top: 0.3, left: 0.3, right: 0.1, edge: 0 });
    const st = (y: number) => STONE.map(([x, z]) => [x, y, z0 + 0.9 + z] as V3);
    p.face(st(-G), 0.09, SH.edge, 0.5);
    for (let y = -G + 0.5; y < G; y += 0.5) p.face(st(y), 0.13, 0);
    p.face(st(G), 0.42, SH.edge, 0.6);
    // its facets, cut into the lit face
    const Y = G + 0.04, f = (x: number, z: number): V3 => [x, Y, z0 + 0.9 + z];
    p.line([f(-7.2, 6), f(7.2, 6)], SH.edge, 0.7);
    p.line([f(-4.4, 9.4), f(-2.4, 6), f(0, 9.4), f(2.4, 6), f(4.4, 9.4)], SH.edge, 0.6);
    p.line([f(-2.4, 6), f(0, 0)], SH.edge, 0.6); p.line([f(2.4, 6), f(0, 0)], SH.edge, 0.6);
    // glints off the stone, one after another
    const g = (k: number) => { const v = Math.min(1, Math.max(0, (h - k) / 0.35)); return Math.sin(v * Math.PI * 0.62) / Math.sin(Math.PI * 0.62); };
    glint(p, f(-9.5, 12.5), 5.4 * g(0.3) * (1 + 0.12 * Math.sin(t * 5)));
    glint(p, f(10.5, 7), 3.6 * g(0.5) * (1 + 0.12 * Math.sin(t * 5 + 2)));
    glint(p, f(8, 15.5), 2.6 * g(0.65) * (1 + 0.12 * Math.sin(t * 5 + 4)));
  },
};
