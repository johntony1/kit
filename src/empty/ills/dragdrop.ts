// Drag something here: a big pointer holding a page up over an empty drop tray, its floor dashed. Hover and the pointer drags the page over, lets go, and it drops into the tray.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export const dragdrop: Illustration = {
  k: "dragdrop", name: "Drag and drop", title: "Drag something here", body: "Drop a file here, or pick one from your computer.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -9);
    p.shadow(0, 0, 30, 15, 0.12);
    const S = 13, H = 3.4, m = 2.4;
    const k1 = ease(Math.min(1, h / 0.55)), k2 = ease(Math.min(1, Math.max(0, (h - 0.55) / 0.3)));
    // the tray: a lit rim round a dark floor, dashed inside
    p.box(-S, -S, 0, S * 2, S * 2, H, { top: 0.24, left: 0.12, right: 0.065, edge: 0 });
    const Z = H + 0.03, I = S - m;
    p.clear([[-I, -I, Z], [I, -I, Z], [I, I, Z], [-I, I, Z]]);
    const q = ([[-I + 1.5, -I + 1.5], [I - 1.5, -I + 1.5], [I - 1.5, I - 1.5], [-I + 1.5, I - 1.5]] as const).map(([x, y]) => p.pt([x, y, Z]));
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.3; g.setLineDash([2.6, 2.2]);
      g.beginPath(); q.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.stroke();
    });
    // the page: held up off to the side, dragged over the tray, then let go into it
    const W = 8, D = 9.5;
    const cx = -9 + 9 * k1, cy = -3 + 3 * k1, pz = 14 - (14 - Z) * k2;
    p.box(cx - W, cy - D, pz, W * 2, D * 2, 1.4, { top: 0.32, left: 0.12, right: 0.065, edge: 0 });
    const top = pz + 1.42;
    const ln = (y: number, x1: number) => p.line([[cx - W + 2.6, cy + y, top], [cx + x1, cy + y, top]] as V3[], 1, 1.1);
    ln(-4.5, W - 2.6); ln(-0.5, W - 2.6); ln(3.5, 1.5);
    // the pointer: a big arrow on the page's near corner, lifting off once the page is let go
    const [px, py] = p.pt([cx + W - 3, cy + D - 3.5, top + 5 * k2]);
    p.screen((g) => {
      const s = 1.25;
      const pts = [[0, 0], [0, 17], [4.2, 13], [7.4, 19.6], [10.2, 18.4], [7.1, 11.9], [12.4, 11.9]];
      g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(px + a * s, py + b * s) : g.moveTo(px + a * s, py + b * s))); g.closePath();
      g.fillStyle = "#fff"; g.fill(); g.strokeStyle = "#000"; g.lineWidth = 1.2; g.lineJoin = "round"; g.stroke();
    });
  },
};
