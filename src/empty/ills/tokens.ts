// No usage yet: a big six sided token standing on its edge, a star stamped in it, beside a short stack of two more. Hover and it hops while a third token drops onto the stack.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const hex = (r: number, rot = 0): P2[] => Array.from({ length: 6 }, (_, i) => { const a = rot + (i / 6) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r] as P2; });

// a token lying flat: lit top with an inner ring cut in it, six walls shaded by where they face
function lying(p: Pen, cx: number, cy: number, z: number, r: number, hh: number, rot: number, dark = false) {
  const s = hex(r, rot);
  for (let i = 0; i < 6; i++) {
    const [x0, y0] = s[i], [x1, y1] = s[(i + 1) % 6];
    const mx = x0 + x1, my = y0 + y1, l = Math.hypot(mx, my), nx = mx / l, ny = my / l;
    if (nx + ny <= 0) continue;
    const f = 0.065 + 0.065 * Math.max(0, Math.min(1, (ny - nx) * 0.6 + 0.5));
    p.face([[cx + x0, cy + y0, z], [cx + x1, cy + y1, z], [cx + x1, cy + y1, z + hh], [cx + x0, cy + y0, z + hh]], dark ? 0.03 : f, 0);
  }
  const top = s.map(([x, y]) => [cx + x, cy + y, z + hh] as V3);
  p.face(top, dark ? 0.03 : 0.24, 0);
  if (dark) return;
  p.line([...top, top[0]], SH.edge, 0.5);
  const inner = hex(r * 0.6, rot).map(([x, y]) => [cx + x, cy + y, z + hh + 0.02] as V3);
  p.line([...inner, inner[0]], SH.edge, 0.8);
}

// a token standing in the plane y = yF
function standing(p: Pen, r: number, zc: number, yF: number, yB: number) {
  const s = hex(r).map(([x, z]) => [x, z + zc] as P2);
  for (let i = 0; i < 6; i++) {
    const [x0, z0] = s[i], [x1, z1] = s[(i + 1) % 6];
    const nx = x0 + x1, nz = z0 + z1 - 2 * zc;
    if (nx * 0.45 + nz <= 0) continue;
    p.face([[x0, yB, z0], [x1, yB, z1], [x1, yF, z1], [x0, yF, z0]], nz > r ? 0.26 : 0.05, 0);
  }
  const f = s.map(([x, z]) => [x, yF, z] as V3);
  p.face(f, 0.24, 0);
  p.line([...f, f[0]], SH.edge, 0.5);
  const y = yF + 0.03;
  p.clear(Array.from({ length: 10 }, (_, i) => {
    const a = Math.PI / 2 + (i / 10) * Math.PI * 2, q = i % 2 ? r * 0.27 : r * 0.64;
    return [Math.cos(a) * q, y, zc + Math.sin(a) * q] as V3;
  }));
}

function drop(k: number) {
  if (k <= 0) return 30;
  if (k < 0.5) return 30 * (1 - Math.pow(k / 0.5, 2));
  if (k < 0.8) { const v = (k - 0.5) / 0.3; return 4 * 4 * v * (1 - v); }
  return 0;
}

export const tokens: Illustration = {
  k: "tokens", name: "Tokens", title: "No usage yet", body: "Token usage will be counted here once you send your first request.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -14);
    p.shadow(0, 0, 30, 14, 0.12);
    // the standing token, at the back right
    const R = 13;
    p.push();
    p.translate(6, -6, 4.5 * Math.sin(Math.min(1, h * 1.6) * Math.PI));
    p.rotate("z", -0.45);
    p.rotate("y", h * Math.sin(t * 3) * 0.05, [0, 0, 0]);
    standing(p, R, R * 0.866, 2.6, -2.6);
    p.pop();
    // the stack, at the front left
    const cx = -10, cy = 9, r = 9.5;
    lying(p, cx, cy, 0, r, 3.6, 0.2);
    lying(p, cx, cy, 3.6, r - 1, 1, 0.2, true);
    lying(p, cx + 0.6, cy - 0.4, 4.6, r, 3.6, 0.45);
    const k = Math.max(0, (h - 0.3) / 0.7);
    if (k > 0.01) {
      if (drop(k) < 1.5) lying(p, cx, cy, 8.2, r - 1, 1, 0.3, true);
      lying(p, cx - 0.4, cy + 0.3, 9.2 + drop(k), r, 3.6, 0.1);
    }
  },
};
