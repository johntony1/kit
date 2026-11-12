// QR code: a QR code tile on a little counter stand, facing us. Hover and a scanner frame closes in round it, then a tick pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const M = 2.8, Y = 2.03, X0 = -15.4, ZT = 34.3; // module size, the front plane, the code's left and top edges
// a block of modules: column, row from the top, width, height
const cell = (c: number, r: number, w: number, hh: number): V3[] => {
  const x = X0 + c * M, z = ZT - r * M;
  return [[x, Y, z], [x + w * M, Y, z], [x + w * M, Y, z - hh * M], [x, Y, z - hh * M]];
};
const DATA: [number, number, number, number][] = [
  [6, 6, 2, 2], [9, 6, 2, 1], [10, 8, 1, 1], [6, 9, 1, 2], [8, 9, 2, 2],
];
function finder(p: Pen, c: number, r: number) {
  p.clear(cell(c, r, 5, 5));
  p.face(cell(c + 1, r + 1, 3, 3), 0.3, 0);
  p.clear(cell(c + 1.75, r + 1.75, 1.5, 1.5));
}
function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.5, y - r * 0.36); g.stroke();
  });
}

export const qrcode: Illustration = {
  k: "qrcode", name: "QR code", title: "No codes generated", body: "Generate a code and it will be saved here to download or print.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -18);
    p.shadow(0, 2, 27, 12, 0.12);
    p.rotate("z", -0.62);
    // the stand's foot
    p.box(-11, -5, 0, 22, 11, 2.4, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    // the tile, leaning back a little
    p.rotate("x", 0.1, [0, 0, 2.4]);
    p.box(-16.5, 0, 2.4, 33, 2, 33, { top: 0.12, left: 0.3, right: 0.05, edge: 0 });
    // three bold corner markers and a few big modules, cut into the lit face
    finder(p, 0, 0); finder(p, 6, 0); finder(p, 0, 6);
    for (const [c, r, w, hh] of DATA) p.clear(cell(c, r, w, hh));
    // the scanner frame: four corners that close in
    const k = clamp(h / 0.6);
    if (k > 0) {
      const g = 18.6 + 3.4 * (1 - ease(k)), n = Math.round(255 * Math.min(1, k * 1.6));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const q = ([[sx * (g - 6), Y, 18.9 + sz * g], [sx * g, Y, 18.9 + sz * g], [sx * g, Y, 18.9 + sz * (g - 6)]] as V3[]).map((v) => p.pt(v));
        p.screen((c) => { c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 1.4; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); });
      }
    }
    const b = clamp((h - 0.66) / 0.34);
    if (b > 0) tick(p, [17, Y, 35.4], 4.6 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
