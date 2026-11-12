// No approvals waiting: a rubber stamp standing on a sheet of paper. Hover and it hops forward, presses down and goes home, leaving a ringed tick on the page.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const A: [number, number] = [6, -7], B: [number, number] = [5.5, 5.5]; // home, and where it stamps
const Z = 0.85;
// a point on the page from a screen offset (sx right, sy down)
const at = (cx: number, cy: number, z: number, sx: number, sy: number): V3 => [cx + sx / 1.732 + sy, cy + sy - sx / 1.732, z];

function stamp(p: Pen, x: number, y: number, z: number, squash: number) {
  const r = 1.8 * squash;
  p.cylinder(x, y, z, 6, r, { side: 0.04, top: 0.2 }); // the rubber
  p.cylinder(x, y, z + r, 5, 3, { side: 0.13, top: 0.22 });
  p.cylinder(x, y, z + r + 3, 1.9, 6, { side: 0.045, top: 0.2 });
  p.cylinder(x, y, z + r + 9, 4, 4, { side: 0.14, top: 0.3, lw: 0.6 }); // the knob
}

export const approvals: Illustration = {
  k: "approvals", name: "Approval stamp", title: "No approvals waiting", body: "Requests that need your sign off will wait here until you approve them.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(1, 1, -9);
    p.scale(1.08);
    p.shadow(0, 0, 38, 19, 0.11);
    // the page, with a heading and a few lines
    p.box(-15, -12, 0, 30, 24, Z - 0.05, { top: 0.2, left: 0.13, right: 0.07 });
    p.line([[-11.5, -8, Z], [-3, -8, Z]], SH.edge, 1.2);
    p.line([[-11.5, -4.4, Z], [1, -4.4, Z]], SH.edge, 0.6);
    p.line([[-11.5, -1.4, Z], [-1, -1.4, Z]], SH.edge, 0.6);
    p.line([[-11.5, 1.6, Z], [-4.5, 1.6, Z]], SH.edge, 0.6);
    p.line([[-11.5, 8, Z], [-3.5, 8, Z]], SH.edge, 0.5);
    // out to the mark, a press, and back home
    const go = ease(Math.min(1, h / 0.36)), back = ease(Math.max(0, Math.min(1, (h - 0.52) / 0.44)));
    const k = go - back, air = h < 0.36 ? Math.sin((h / 0.36) * Math.PI) : h > 0.52 ? Math.sin(Math.min(1, (h - 0.52) / 0.44) * Math.PI) : 0;
    const press = h > 0.36 && h < 0.52 ? Math.sin(((h - 0.36) / 0.16) * Math.PI) : 0;
    // the mark it leaves: a ring and a tick
    if (h > 0.44) {
      const ring = (r: number) => Array.from({ length: 37 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return [B[0] + Math.cos(a) * r, B[1] + Math.sin(a) * r, Z] as V3; });
      p.face(ring(5.4), 0.34, SH.edge, 0.8);
      p.line(ring(4.2), 0, 0.6);
      p.line([at(B[0], B[1], Z + 0.02, -2.6, -0.2), at(B[0], B[1], Z + 0.02, -0.8, 1.3), at(B[0], B[1], Z + 0.02, 2.9, -1.5)], 0, 1.1);
    }
    stamp(p, A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, Z + air * 7, 1 - press * 0.35);
  },
};
