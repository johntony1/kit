// No downloads: an arrow drops down into an empty tray, sinks out of sight, and the tray gives a little bounce.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const PERIOD = 2.8, W = 13, D = 10, H = 6; // half width, half depth, wall height of the tray
const ramp = (u: number, a: number, b: number) => Math.max(0, Math.min(1, (u - a) / (b - a)));

export const download: Illustration = {
  k: "download", name: "Download tray", title: "No downloads", body: "Files you download will be saved here for you to open later.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    // the arrow falls in, slows into the tray, sinks and fades; then it all rests for a beat
    const fall = ramp(u, 0, 0.55), g = fall * fall * (3 - 2 * fall);
    const az = 40 - g * 40; // the tip's height
    const fade = 1 - ramp(u, 0.5, 0.66);
    const hit = Math.max(0, Math.sin(ramp(u, 0.5, 0.78) * Math.PI)) * (1 - ramp(u, 0.5, 0.78));
    const sq = hit * 0.9; // the tray squashes a touch on impact
    p.translate(0, 0, -15);
    p.shadow(0, 0, 27, 13, 0.12);
    // the tray: a rim on a low base. The inside first: its floor and the two far walls
    p.box(-W - 1, -D - 1, 0, 2 * W + 2, 2 * D + 2, 1.6, { top: 0.2 });
    p.translate(0, 0, 1.6);
    const h = H - sq;
    p.clear([[-W, -D, 0], [W, -D, 0], [W, D, 0], [-W, D, 0]]);
    p.face([[-W, -D, 0], [W, -D, 0], [W, -D, h], [-W, -D, h]], 0.1, 0); // far wall, facing +y
    p.face([[-W, -D, 0], [-W, D, 0], [-W, D, h], [-W, -D, h]], 0.065, 0); // far wall, facing +x
    // the far rim, behind the arrow
    const rim = (pts: V3[]) => p.face(pts, 0.3, 0);
    rim([[-W - 1, -D - 1, h], [W, -D - 1, h], [W, -D, h], [-W - 1, -D, h]]);
    rim([[-W - 1, -D, h], [-W, -D, h], [-W, D, h], [-W - 1, D, h]]);
    // the arrow: a square shaft over an upside down pyramid head
    if (fade > 0.02) {
      const k = fade;
      const hz = az + 7; // the head's top
      p.face([[0, 0, az], [5.5, -5.5, hz], [5.5, 5.5, hz]], SH.right * k + 0.02, 0);
      p.face([[0, 0, az], [5.5, 5.5, hz], [-5.5, 5.5, hz]], SH.left * k + 0.02, 0);
      p.face([[-5.5, -5.5, hz], [5.5, -5.5, hz], [5.5, 5.5, hz], [-5.5, 5.5, hz]], 0.2 * k + 0.02, 0);
      p.line([[-5.5, 5.5, hz], [5.5, 5.5, hz], [5.5, -5.5, hz]], SH.edge, 0.6);
      p.box(-2.2, -2.2, hz, 4.4, 4.4, 9, { top: 0.28 * k + 0.02, left: SH.left * k + 0.02, right: SH.right * k + 0.02 });
    }
    // the near walls, over the arrow once it is inside, with a lit rim along the top
    rim([[-W - 1, D, h], [W + 1, D, h], [W + 1, D + 1, h], [-W - 1, D + 1, h]]);
    rim([[W, -D - 1, h], [W + 1, -D - 1, h], [W + 1, D + 1, h], [W, D + 1, h]]);
    p.face([[-W - 1, D + 1, 0], [W + 1, D + 1, 0], [W + 1, D + 1, h], [-W - 1, D + 1, h]], SH.left, 0);
    p.face([[W + 1, -D - 1, 0], [W + 1, D + 1, 0], [W + 1, D + 1, h], [W + 1, -D - 1, h]], SH.right, 0);
    // a slot cut along the front, like a handle
    p.line([[-4, D + 1.05, h * 0.55], [4, D + 1.05, h * 0.55]], SH.edge, 1);
    // a puff where it landed
    const pk = ramp(u, 0.5, 0.85);
    if (pk > 0 && pk < 1) for (let i = 0; i < 6; i++) {
      const a = i * 1.05 + 0.4, r = 3 + easeInOut(pk) * 6;
      p.dot([Math.cos(a) * r, Math.sin(a) * r, 2 + pk * 6], 0.6, 1 - pk);
    }
  },
};
