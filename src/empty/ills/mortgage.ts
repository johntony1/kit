// No mortgage yet: a small house with a big key lying in front of it. Hover and the key lifts, stands up and turns toward the door, which lights.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 8.5, D = 6.5, HW = 10, RZ = 17.5;

// a key lying in the xy plane: the bow at the origin, the blade along +x
function key(p: Pen, z: number, fill: number, edge: number) {
  const bow: V3[] = Array.from({ length: 28 }, (_, i) => { const a = 0.26 + (i / 27) * (Math.PI * 2 - 0.52); return [Math.cos(a) * 4.6, Math.sin(a) * 4.6, z] as V3; });
  const blade: V3[] = [[4.4, -1.1, z], [17, -1.1, z], [17, 1.1, z], [17, 4, z], [15.2, 4, z], [15.2, 1.1, z], [13.4, 1.1, z], [13.4, 3.2, z], [11.4, 3.2, z], [11.4, 1.1, z], [4.4, 1.1, z]];
  p.face([...bow, ...blade], fill, edge, 0.6);
}

export const mortgage: Illustration = {
  k: "mortgage", name: "House and key", title: "No mortgage yet", body: "Start an application and your home loan will be tracked here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -8);
    p.shadow(0, 2, 30, 15, 0.1);
    const lit = clamp((h - 0.6) / 0.25);
    p.push();
    p.translate(-4, -7, 0);
    // the roof's back slope, then the walls
    p.face([[-W - 1, -D - 1, HW - 0.7], [W + 1, -D - 1, HW - 0.7], [W + 1, 0, RZ], [-W - 1, 0, RZ]], 0.12, SH.edge, 0.55);
    p.box(-W, -D, 0, W * 2, D * 2, HW, { top: 0.02, left: 0.1, right: SH.right });
    p.face([[W, -D, HW], [W, D, HW], [W, 0, RZ - 0.6]], SH.right, SH.edge, 0.55);
    // a window on the side, the door on the front
    p.face([[W + 0.03, -3.6, 3.6], [W + 0.03, 1.2, 3.6], [W + 0.03, 1.2, 8], [W + 0.03, -3.6, 8]], 0.03 + 0.27 * lit, SH.edge, 0.55);
    p.line([[W + 0.05, -1.2, 3.6], [W + 0.05, -1.2, 8]], SH.edge, 0.5);
    p.face([[-2.6, D + 0.03, 0], [2.6, D + 0.03, 0], [2.6, D + 0.03, 8], [-2.6, D + 0.03, 8]], 0.04 + 0.3 * lit, SH.edge, 0.6);
    p.dot([1.5, D + 0.1, 3.8], 0.5, lit > 0.5 ? 0.02 : 1);
    // the front slope, lit, and the roof's end
    const fr = (x: number, u: number): V3 => [x, (D + 1) * (1 - u), HW - 0.7 + (RZ - HW + 0.7) * u];
    p.face([fr(-W - 1, 0), fr(W + 1, 0), fr(W + 1, 1), fr(-W - 1, 1)], SH.top, SH.edge, 0.6);
    p.line([fr(-W - 0.6, 0.5), fr(W + 0.6, 0.5)], SH.edge, 0.5);
    p.face([[W + 1, D + 1, HW - 0.7], [W + 1, 0, RZ], [W + 1, 0, RZ - 1], [W + 1, D + 1, HW - 1.7]], 0.12, SH.edge, 0.5);
    p.box(-3.2, D, 0, 6.4, 1.8, 0.7, { top: 0.24, left: 0.13, right: SH.right });
    p.pop();
    // the key: flat on the ground at rest, lifting and standing up on hover
    const k = ease(clamp(h / 0.7));
    p.push();
    p.translate(-11 + 2 * k, 5.5 + 4 * k, 0.1 + 10 * k + (h > 0.7 ? Math.sin(t * 2.6) * 0.6 : 0));
    p.rotate("z", 0.35 * (1 - k));
    p.rotate("x", (Math.PI / 2) * k);
    key(p, 0, 0.1, 0);
    key(p, 1.1, 0.28, SH.edge);
    p.dot([0, 0, 1.15], 1.9, 0.02);
    p.pop();
  },
};
