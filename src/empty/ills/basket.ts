// Your basket is empty: a hand shopping basket with its handle up. Hover and a small parcel drops in and bounces; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

// height of the parcel above the basket floor: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k < 0.5) return 34 * (1 - Math.pow(k / 0.5, 2));
  if (k < 0.75) { const v = (k - 0.5) / 0.25; return 4 * 4 * v * (1 - v); }
  if (k < 0.9) { const v = (k - 0.75) / 0.15; return 1.2 * 4 * v * (1 - v); }
  return 0;
}

const lerp = (a: V3, c: V3, k: number): V3 => [a[0] + (c[0] - a[0]) * k, a[1] + (c[1] - a[1]) * k, a[2] + (c[2] - a[2]) * k];

export const basket: Illustration = {
  k: "basket", name: "Shopping basket", title: "Your basket is empty", body: "Add a few things you like and they will be kept here until you check out.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 0, 28, 13, 0.11);
    p.rotate("z", -0.5); // turned so its long side faces us
    const H = 13;
    const B = (sx: number, sy: number): V3 => [sx * 10.5, sy * 6, 0];
    const T = (sx: number, sy: number): V3 => [sx * 14, sy * 8.5, H];
    // the inside: the two far walls and the floor, in shade
    p.face([B(-1, -1), B(1, -1), T(1, -1), T(-1, -1)], 0.03, SH.edge, 0.5);
    p.face([B(-1, -1), B(-1, 1), T(-1, 1), T(-1, -1)], 0.045, SH.edge, 0.5);
    p.face([B(-1, -1), B(1, -1), B(1, 1), B(-1, 1)], 0.02, 0);
    // the handle: one arch over the middle, a lit band
    const arch = (rx: number, rz: number): V3[] => Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI; return [Math.cos(a) * rx, 0, H + Math.sin(a) * rz] as V3; });
    p.face([...arch(14, 13), ...arch(11.8, 10.8).reverse()], 0.4, SH.edge, 0.55);
    // the parcel, dropping in
    const k = Math.min(1, h * 1.25);
    if (k > 0.01) {
      const z = 0.4 + drop(k);
      p.box(-5, -3.6, z, 10, 7.2, 10, { top: 0.42, left: 0.3, right: 0.16 });
      p.line([[0, -3.6, z + 10.03], [0, 3.6, z + 10.03], [0, 3.63, z + 6.5]], SH.edge, 0.8); // tape
    }
    // the near walls: dense long side, sparse end, slots cut through as lines
    const near: V3[] = [B(-1, 1), B(1, 1), T(1, 1), T(-1, 1)];
    const end: V3[] = [B(1, -1), B(1, 1), T(1, 1), T(1, -1)];
    p.face(end, SH.right, SH.edge, 0.55);
    p.face(near, 0.13, SH.edge, 0.55);
    for (const q of [0.3, 0.52]) {
      for (let i = 0; i < 6; i++) {
        const a = 0.1 + i * 0.14;
        p.line([lerp(lerp(B(-1, 1), T(-1, 1), q), lerp(B(1, 1), T(1, 1), q), a), lerp(lerp(B(-1, 1), T(-1, 1), q), lerp(B(1, 1), T(1, 1), q), a + 0.09)], SH.edge, 0.75);
      }
      for (let i = 0; i < 3; i++) {
        const a = 0.14 + i * 0.27;
        p.line([lerp(lerp(B(1, 1), T(1, 1), q), lerp(B(1, -1), T(1, -1), q), a), lerp(lerp(B(1, 1), T(1, 1), q), lerp(B(1, -1), T(1, -1), q), a + 0.17)], SH.edge, 0.7);
      }
    }
    // the rim: a lit band round the top of the near walls
    const R = (sx: number, sy: number): V3 => lerp(B(sx, sy), T(sx, sy), 0.8);
    p.face([R(-1, 1), R(1, 1), T(1, 1), T(-1, 1)], 0.3, SH.edge, 0.55);
    p.face([R(1, 1), R(1, -1), T(1, -1), T(1, 1)], 0.16, SH.edge, 0.55);
    // the plus badge pops in once the parcel lands
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [17, -8, 27], 4.6 * pop);
    }
  },
};
