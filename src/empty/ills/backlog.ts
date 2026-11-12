// Backlog is clear: a short pile of work items, the top one showing its checkbox and title. Hover and the pile clears, item by item, until the last one is ticked.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 14, D = 9.5, T = 3.2;
const OFF: [number, number][] = [[0, 0], [1.6, -1.2], [-1.4, 1], [0.8, 0.6]];
// a point on a slab's top from a screen offset (sx right, sy down)
const at = (cx: number, cy: number, z: number, sx: number, sy: number): V3 => [cx + sx / 1.732 + sy, cy + sy - sx / 1.732, z];

function item(p: Pen, i: number, tick: number) {
  const [dx, dy] = OFF[i], z = i * T;
  p.box(-W + dx, -D + dy, z, W * 2, D * 2, T, { top: 0.21, left: 0.12, right: 0.045, lw: 0.6 });
  // a tag on its front edge
  p.line([[-W + dx + 2.5, D + dy + 0.03, z + T / 2], [-W + dx + 8, D + dy + 0.03, z + T / 2]], SH.edge, 0.7);
  // on top: a checkbox, a title and a shorter note
  const zz = z + T + 0.03, cx = -8.5 + dx, cy = -2 + dy, B = 2.1;
  p.face([[cx - B, cy - B, zz], [cx + B, cy - B, zz], [cx + B, cy + B, zz], [cx - B, cy + B, zz]], tick > 0 ? 0.36 : 0.03, SH.edge, 0.6);
  if (tick > 0) {
    const A = at(cx, cy, zz + 0.02, -1.9, -0.1), M = at(cx, cy, zz + 0.02, -0.6, 1), C = at(cx, cy, zz + 0.02, 2.1, -1.1);
    p.line(tick < 0.4 ? [A, M] : [A, M, C], 0, 1);
  }
  p.line([[-4.5 + dx, cy, zz], [9.5 + dx, cy, zz]], SH.edge, 1.1);
  p.line([[-4.5 + dx, cy + 4.6, zz], [4 + dx, cy + 4.6, zz]], SH.edge, 0.6);
}

export const backlog: Illustration = {
  k: "backlog", name: "Backlog", title: "Backlog is clear", body: "Nothing is waiting to be picked up. New items will pile up here as they come in.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(-1, -1, -6 + 4.5 * h);
    p.scale(1.08);
    p.shadow(0.5, 0.5, 34, 17, 0.11);
    for (let i = 0; i < 4; i++) {
      // all but the last slide away in turn and shrink to nothing
      const k = i ? ease(Math.max(0, Math.min(1, (h - (3 - i) * 0.2) / 0.38))) : 0;
      const s = 1 - Math.pow(Math.max(0, (k - 0.45) / 0.55), 2);
      if (s < 0.04) continue;
      p.push();
      p.translate(k * 20, -k * 3, k * 2);
      p.scale(s, [0, 0, i * T + T / 2]);
      item(p, i, i === 0 ? Math.max(0, (h - 0.78) / 0.22) : 0);
      p.pop();
    }
  },
};
