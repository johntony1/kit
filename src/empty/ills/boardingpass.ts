// Nothing to scan yet: a tall boarding pass standing up, a plane at the top, a perforation with notches, a barcode at the bottom. Hover and a scan line sweeps the barcode and a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const A = -0.62, W = 9.5, ZH = 34, ZP = 11, D = 0.9; // turn, half width, height, perforation height, half thickness
const arc = (cx: number, cz: number, r: number, a0: number, a1: number, n = 5): P2[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; });
const H = Math.PI / 2, r = 1.8, n = 2.2;
// the outline, counter clockwise: rounded corners, a half round notch in each side at the perforation
const CARD: P2[] = [...arc(-W + r, r, r, Math.PI, Math.PI + H), ...arc(W - r, r, r, -H, 0), ...arc(W, ZP, n, -H, -Math.PI * 1.5), ...arc(W - r, ZH - r, r, 0, H), ...arc(-W + r, ZH - r, r, H, Math.PI), ...arc(-W, ZP, n, H, -H)];
// the plane from above, nose to the right (u along, v across)
const PLANE: P2[] = [[7, 0], [5.6, 0.9], [1.4, 0.9], [-1.6, 6.4], [-3.4, 6.4], [-1.8, 0.9], [-4.6, 0.9], [-5.8, 3], [-7, 3], [-6.4, 0]];

function badge(p: Pen, at: V3, rr: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = rr * 0.28; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - rr * 0.45, y + rr * 0.02); g.lineTo(x - rr * 0.1, y + rr * 0.38); g.lineTo(x + rr * 0.5, y - rr * 0.32); g.stroke();
  });
}

export const boardingpass: Illustration = {
  k: "boardingpass", name: "Pass scan", title: "Nothing to scan yet", body: "Check in for a flight and your boarding pass will be ready here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 24, 9, 0.1);
    p.rotate("z", A);
    // the card: the walls we see, then its lit face
    const k = Math.cos(A) + Math.sin(A);
    for (let i = 0; i < CARD.length; i++) {
      const a = CARD[i], b = CARD[(i + 1) % CARD.length], nx = b[1] - a[1], nz = -(b[0] - a[0]);
      if (nx * k + nz > 0.01) p.face([[a[0], -D, a[1]], [b[0], -D, b[1]], [b[0], D, b[1]], [a[0], D, a[1]]], nz > Math.abs(nx) ? 0.22 : 0.065, 0);
    }
    p.face(CARD.map(([x, z]) => [x, D, z] as V3), 0.24, 0);
    const f = (x: number, z: number): V3 => [x, D + 0.04, z];
    // the plane, a dark cut out shape near the top
    const pl = [...PLANE, ...PLANE.slice(1, -1).reverse().map(([u, v]) => [u, -v] as P2)];
    p.face(pl.map(([u, v]) => f(u * 1.05, 26.5 + v * 0.95)), 0.02, 0);
    // a line of detail
    p.line([f(-6.5, 17), f(4, 17)], SH.edge, 0.8);
    // the perforation between the notches
    for (let x = -W + n + 0.8; x < W - n - 0.4; x += 1.9) p.line([f(x, ZP), f(x + 0.9, ZP)], SH.edge, 0.8);
    // the barcode
    const bars = [1.6, 0.8, 0.8, 1.6, 0.8, 1.6, 0.8, 0.8];
    let bx = -6.6;
    for (const w of bars) { p.face([f(bx, 2.8), f(bx + w, 2.8), f(bx + w, 8.2), f(bx, 8.2)], 0.02, 0); bx += w + 1.05; }
    // the scan line: a bright bar, a little wider than the card, sweeping up the barcode and back
    const s = seg(h, 0.05, 0.7);
    if (s > 0 && s < 1) {
      const z = 2.2 + (0.5 - 0.5 * Math.cos(s * Math.PI * 2)) * 6.4, a = p.pt(f(-W - 1.5, z)), b = p.pt(f(W + 1.5, z));
      p.screen((c) => { c.strokeStyle = "#fff"; c.lineWidth = 1.6; c.lineCap = "round"; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); });
    }
    const t = seg(h, 0.68, 1);
    if (t > 0) badge(p, f(W - 1.5, ZH - 1.5), 4.8 * (t < 0.65 ? ease(t / 0.65) * 1.18 : 1.18 - 0.18 * ease((t - 0.65) / 0.35)));
  },
};
