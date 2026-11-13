// No parcels waiting: a parcel locker seen from the front, a dark screen strip over a wall of six big doors in two columns. Hover and a lamp lights by one door, then the door swings open on an empty dark cell.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const W = 16, D = 5, H = 40, F = D + 0.03; // half width, half depth, height, the front plane
const G = 1.1; // the gap between doors
const COL = [[-W + 1.4, -G / 2], [G / 2, W - 1.4]]; // each column's x span
const ROW = [[2, 12.2], [12.2 + G, 22.4 + G], [22.4 + 2 * G, 32.6 + 2 * G]]; // each row's z span, bottom up

export const parcellocker: Illustration = {
  k: "parcellocker", name: "Parcel locker", title: "No parcels waiting", body: "When a parcel is ready for pickup it will appear here with its locker code.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -21);
    p.shadow(0, 0, 22, 10, 0.12);
    p.rotate("z", -0.62); // turned so its front faces us
    // the cabinet: a dark front, a lit top, a sparse side
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.2, left: 0.04, right: 0.065, edge: 0 });
    // the screen strip at the top, with a lit line of text
    p.face([[-W, F, 34.6], [W, F, 34.6], [W, F, H], [-W, F, H]], 0.2, 0);
    p.clear([[-W + 1.6, F + 0.02, 35.6], [5, F + 0.02, 35.6], [5, F + 0.02, 38.8], [-W + 1.6, F + 0.02, 38.8]]);
    const lamp = clamp(h / 0.3);
    const open = ease(clamp((h - 0.25) / 0.6));
    for (let c = 0; c < 2; c++) for (let r = 0; r < 3; r++) {
      const [x0, x1] = COL[c], [z0, z1] = ROW[r];
      const hinge = c === 1 && r === 1;
      if (hinge && open > 0) {
        // the empty cell behind the door: dark, its far wall and floor just showing
        p.clear([[x0, F, z0], [x1, F, z0], [x1, F, z1], [x0, F, z1]]);
        p.face([[x0, F, z0], [x1, F, z0], [x1 - 1.6, F - 4, z0 + 1.2], [x0 + 1.6, F - 4, z0 + 1.2]], 0.065, 0);
        p.face([[x1, F, z0], [x1, F, z1], [x1 - 1.6, F - 4, z1 - 1.2], [x1 - 1.6, F - 4, z0 + 1.2]], 0.04, 0);
        // the door swings out on its right hinge toward us
        const a = open * 1.9, w = x1 - x0;
        const e: V3 = [x1 - Math.cos(a) * w, F + Math.sin(a) * w, 0];
        p.face([[x1, F, z0], [e[0], e[1], z0], [e[0], e[1], z1], [x1, F, z1]], a < 1.57 ? 0.24 : 0.12, 0);
        p.face([[e[0], e[1], z1], [x1, F, z1], [x1, F - 0.8, z1], [e[0] - 0.4, e[1] - 0.6, z1]], 0.2, 0);
        continue;
      }
      p.face([[x0, F, z0], [x1, F, z0], [x1, F, z1], [x0, F, z1]], 0.24, 0);
      // a handle as a dark slot on the opening side
      const hx = c === 0 ? x1 - 2 : x0 + 2;
      p.line([[hx, F + 0.02, (z0 + z1) / 2 - 1.8], [hx, F + 0.02, (z0 + z1) / 2 + 1.8]], SH.edge, 1);
    }
    // the screen's text line and the lamp by the chosen door
    const [ax, ay] = p.pt([-W + 3.4, F + 0.04, 37.2]), [bx, by] = p.pt([2, F + 0.04, 37.2]);
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.2; g.lineCap = "round"; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); });
    p.ringV("y", [W - 4.5, F + 0.04, 37.2], 1.5, 0.03, 0);
    if (lamp > 0) p.dot([W - 4.5, F + 0.06, 37.2], 1.4 * ease(lamp), 1);
  },
};
