// SIM card: a SIM card resting in its tray, the gold chip face up. Hover and the card lifts out of the tray and its chip lights up.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const W = 8.5, D = 11.5, C = 5, TH = 1.6; // half width, half depth, clipped corner, thickness

export const simcard: Illustration = {
  k: "simcard", name: "SIM card", title: "No SIM installed", body: "Insert a SIM or add an eSIM to get this device connected.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const lift = 9 * back(clamp(h / 0.75)) + h * Math.sin(t * 2.8) * 0.7;
    p.translate(0, 2, -5);
    p.shadow(0, 0, 30, 15, 0.1);
    // the tray: a thin frame with a dark bed, and the end plate that sits flush with the phone
    p.box(-W - 2, -D - 2, 0, W * 2 + 4, D * 2 + 4, 1.6, { top: 0.2, left: 0.12, right: 0.065 });
    p.clear([[-W - 0.4, -D - 0.4, 1.62], [W + 0.4, -D - 0.4, 1.62], [W + 0.4, D + 0.4, 1.62], [-W - 0.4, D + 0.4, 1.62]]);
    p.box(-W - 3.4, D + 2, -0.6, W * 2 + 6.8, 2.6, 3.6, { top: 0.26, left: 0.16, right: 0.08 });
    p.dot([W - 0.5, D + 4.63, 1.2], 0.75, 0); // the pin hole
    if (h > 0.05) for (const [x, y] of [[-W, D], [W, D], [W, -D + C]]) p.guide([[x, y, 1.6], [x, y, 1.6 + lift]], true);
    // the card
    p.push();
    p.translate(0, 0, 1 + lift);
    const top: V3[] = [[-W, -D, TH], [W - C, -D, TH], [W, -D + C, TH], [W, D, TH], [-W, D, TH]];
    p.face([[-W, D, 0], [W, D, 0], [W, D, TH], [-W, D, TH]], 0.14, SH.edge, 0.5);
    p.face([[W, -D + C, 0], [W, D, 0], [W, D, TH], [W, -D + C, TH]], 0.075, SH.edge, 0.5);
    p.face(top, 0.22, SH.edge, 0.6);
    // the chip: a dark seat, a bright pad, cut into contacts
    const Z = TH + 0.03, cw = 5.4, cd = 6.6, glow = clamp((h - 0.5) / 0.3);
    p.clear([[-cw - 0.9, -cd - 0.9 + 1, Z], [cw + 0.9, -cd - 0.9 + 1, Z], [cw + 0.9, cd + 0.9 + 1, Z], [-cw - 0.9, cd + 0.9 + 1, Z]]);
    p.face([[-cw, -cd + 1, Z], [cw, -cd + 1, Z], [cw, cd + 1, Z], [-cw, cd + 1, Z]], 0.34 + 0.66 * glow, 0);
    const L = (a: [number, number], b: [number, number]) => p.line([[a[0], a[1] + 1, Z + 0.02], [b[0], b[1] + 1, Z + 0.02]], SH.edge, 0.7);
    L([-1.8, -cd], [-1.8, cd]); L([1.8, -cd], [1.8, cd]);
    L([-cw, -2.2], [-1.8, -2.2]); L([-cw, 2.2], [-1.8, 2.2]); L([1.8, -2.2], [cw, -2.2]); L([1.8, 2.2], [cw, 2.2]);
    p.pop();
  },
};
