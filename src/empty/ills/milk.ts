// No drinks yet: a milk carton beside an empty glass. Hover and the carton leans in while the glass fills with milk.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 6.5, H = 20, G = 6; // the carton: half width, height of the body, height of the gable
const ring = (cx: number, cy: number, z: number, r: number): V3[] => Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

export const milk: Illustration = {
  k: "milk", name: "Milk carton", title: "No drinks yet", body: "Add a drink to the order and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(clamp((h - 0.1) / 0.8));
    p.translate(0, 0, -14);
    p.shadow(-6, 3, 20, 10, 0.12); p.shadow(10, -7, 10, 5, 0.1);
    // the carton, leaning toward the glass while hovered
    p.push();
    p.translate(-6, 3, 0);
    p.rotate("y", 0.12 * ease(clamp(h * 1.6)), [W, 0, 0]);
    p.box(-W, -W, 0, W * 2, W * 2, H, { top: 0.2, left: 0.13, right: 0.065 });
    // the gable: a lit slope toward us, a folded end, and the sealed fin on the ridge
    p.face([[-W, W, H], [W, W, H], [W, 0, H + G], [-W, 0, H + G]], 0.24, SH.edge, 0.55);
    p.face([[W, W, H], [W, -W, H], [W, 0, H + G]], SH.right, SH.edge, 0.55);
    p.face([[-W, 0.05, H + G], [W, 0.05, H + G], [W, 0.05, H + G + 2.8], [-W, 0.05, H + G + 2.8]], 0.32, SH.edge, 0.55);
    // the label: a lit panel on the front with a drop cut out of it
    const y = W + 0.04;
    p.face([[-W + 1.5, y, 4], [W - 1.5, y, 4], [W - 1.5, y, 16], [-W + 1.5, y, 16]], 0.3, 0);
    p.face(Array.from({ length: 21 }, (_, i) => { const a = (i / 20) * Math.PI; return [Math.cos(a) * 2.5, y + 0.04, 8.6 - Math.sin(a) * 2.5] as V3; }).concat([[-1.6, y + 0.04, 11], [0, y + 0.04, 13.6], [1.6, y + 0.04, 11]]), 0.02, 0);
    p.pop();
    // the glass, off to the right: milk rises in it
    const gx = 10, gy = -7, gr = 4.8, gh = 12, lvl = 0.8 + 9.4 * k + (k > 0.05 && k < 1 ? Math.sin(t * 3.4) * 0.15 : 0);
    p.cylinder(gx, gy, 0, gr, gh, { side: 0.08, top: 0.035, lw: 0.55 });
    if (k > 0.02) p.cylinder(gx, gy, 0.6, gr - 0.7, lvl - 0.6, { side: 0.3, top: 0.4, edge: 0 });
    p.face(ring(gx, gy, gh, gr), 0, SH.edge, 0.6);
  },
};
