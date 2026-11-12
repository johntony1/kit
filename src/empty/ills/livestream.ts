// Nobody is live: a broadcast camera on a tripod. Over it a live dot blinks and signal arcs pulse out to both sides.
import { SH, type Illustration, type V3 } from "../dots";

const P = 2.4; // seconds per loop

export const livestream: Illustration = {
  k: "livestream", name: "Live stream", title: "Nobody is live", body: "When someone you follow goes live, their stream will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 24, 11, 0.1);
    p.rotate("z", -0.5);
    const st = { top: 0.22, left: 0.13, right: 0.07, lw: 0.6 };
    // the tripod: two back legs, the column, the front leg
    const Z = 15;
    p.face([[-9.8, -5, 0], [-8.2, -5, 0], [0.8, 0, Z], [-0.8, 0, Z]], 0.1, SH.edge, 0.5);
    p.face([[8.2, -5, 0], [9.8, -5, 0], [0.8, 0, Z], [-0.8, 0, Z]], 0.1, SH.edge, 0.5);
    p.box(-1.2, -1.2, 10, 2.4, 2.4, 6, st);
    p.face([[-0.9, 9, 0], [0.9, 9, 0], [0.9, 0, Z], [-0.9, 0, Z]], 0.16, SH.edge, 0.5);
    // the camera: the body, a handle on top, the lens hood out front
    p.box(-8.5, -6, 16, 17, 11, 9.5, st);
    p.box(-6, -4, 25.5, 12, 3, 1.8, st);
    p.box(-4.6, 5, 16.6, 9.2, 4.4, 8.2, st);
    const yl = 9.44;
    p.face(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [Math.cos(a) * 3.3, yl, 20.7 + Math.sin(a) * 3.3] as V3; }), 0.03, SH.edge, 0.6);
    p.dot([0.8, yl + 0.02, 21.6], 0.8, 1);
    // the live mark: a dot that blinks, arcs that travel out
    const [sx, sy] = p.pt([0, 0, 35]);
    const on = ph < 0.62 ? 1 : 0.25;
    p.screen((c) => {
      const n0 = Math.round(255 * on);
      c.beginPath(); c.arc(sx, sy, 2.3, 0, Math.PI * 2); c.fillStyle = `rgb(${n0},${n0},${n0})`; c.fill();
      c.lineCap = "round"; c.lineWidth = 1.3;
      for (let i = 0; i < 2; i++) {
        const w = (ph + i / 2) % 1, r = 4.5 + w * 7, n = Math.round(255 * Math.min(1, Math.sin(w * Math.PI) * 1.4));
        c.strokeStyle = `rgb(${n},${n},${n})`;
        c.beginPath(); c.arc(sx, sy, r, -0.75, 0.75); c.stroke();
        c.beginPath(); c.arc(sx, sy, r, Math.PI - 0.75, Math.PI + 0.75); c.stroke();
      }
    });
  },
};
