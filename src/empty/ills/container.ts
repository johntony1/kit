// No containers running: a shipping container hangs from a crane hook. Hover and it lowers onto its marked pad.
import { SH, type Illustration } from "../dots";

const L = 14, D = 6, H = 12; // half length (x), half depth (y), height
const LIFT = 12; // how high it hangs at rest

export const container: Illustration = {
  k: "container", name: "Shipping container", title: "No containers running", body: "Start a container and it will show up here with its status and logs.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = h * h * (3 - 2 * h);
    const z0 = 1.2 + LIFT * (1 - k);
    // a little sway while it hangs, settling as it lands
    const sway = Math.sin(t * 2.4) * 0.35 * (1 - k);
    p.translate(0, 0, -19);
    p.shadow(-L / 2 - 1, 0, L + 4, 6, 0.12);
    p.shadow(L / 2 + 1, 0, L + 4, 6, 0.12);
    // the pad: a low lit slab with corner marks cut into it
    p.box(-L - 2, -D - 2, 0, (L + 2) * 2, (D + 2) * 2, 1.2, { top: SH.left });
    const pz = 1.22;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const cx = sx * (L + 0.6), cy = sy * (D + 0.6);
      p.line([[cx - sx * 2.5, cy, pz], [cx, cy, pz], [cx, cy - sy * 2.5, pz]], SH.edge, 0.8);
    }
    // where it lands, and the drop lines from its corners
    p.guide([[-L, -D, pz], [L, -D, pz], [L, D, pz], [-L, D, pz], [-L, -D, pz]], true);
    if (k < 0.98) for (const [x, y] of [[L, -D], [L, D], [-L, D]]) p.guide([[x, y, z0], [x, y, pz]]);

    p.push(); p.translate(sway, 0, 0);
    // the cables to a spreader bar above, and the hook block over it
    const top = z0 + H, bar = top + 6;
    const cable = (x1: number, x2: number) => p.face([[x1 - 0.35, 0, top], [x1 + 0.35, 0, top], [x2 + 0.35, 0, bar], [x2 - 0.35, 0, bar]], SH.top, 0);
    cable(-L + 2, -3); cable(L - 2, 3);
    p.box(-3.5, -1.2, bar, 7, 2.4, 1.8, { top: SH.top });
    p.box(-1.2, -1.2, bar + 1.8, 2.4, 2.4, 3.2, { top: SH.top });
    p.box(-0.4, -0.4, bar + 5, 0.8, 0.8, 9, { top: SH.top, left: SH.left, right: SH.left });

    // the container
    p.box(-L, -D, z0, L * 2, D * 2, H, { top: SH.top, left: SH.left, right: SH.right });
    // corrugation on the long side
    for (let i = 1; i < 10; i++) { const x = -L + i * 2.8; p.line([[x, D + 0.03, z0 + 0.8], [x, D + 0.03, z0 + H - 0.8]], SH.edge, 0.55); }
    // the doors on the end: a centre seam and two lock bars each
    const ex = L + 0.03;
    p.face([[ex, -D + 0.6, z0 + 0.6], [ex, D - 0.6, z0 + 0.6], [ex, D - 0.6, z0 + H - 0.6], [ex, -D + 0.6, z0 + H - 0.6]], SH.left, 0);
    p.line([[ex + 0.01, 0, z0 + 0.6], [ex + 0.01, 0, z0 + H - 0.6]], SH.edge, 0.8);
    for (const y of [-3.8, -1.6, 1.6, 3.8]) p.line([[ex + 0.01, y, z0 + 1.4], [ex + 0.01, y, z0 + H - 1.4]], SH.edge, 0.6);
    p.face([[ex + 0.02, 2.1, z0 + 5], [ex + 0.02, 3.3, z0 + 5], [ex + 0.02, 3.3, z0 + 6.8], [ex + 0.02, 2.1, z0 + 6.8]], 0.32, 0);
    // a label panel on the lit roof
    p.line([[-L + 1.5, -D + 1.5, z0 + H + 0.02], [-L + 1.5, D - 1.5, z0 + H + 0.02]], SH.edge, 0.6);
    p.line([[L - 1.5, -D + 1.5, z0 + H + 0.02], [L - 1.5, D - 1.5, z0 + H + 0.02]], SH.edge, 0.6);
    p.pop();
  },
};
