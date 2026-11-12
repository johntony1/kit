// Nothing to try on: a standing fitting room mirror. A band of light sweeps across the empty glass and a sparkle blinks at its corner.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const RX = 9, RZ = 15.5, CZ = 19.5; // the mirror: half width, half height, height of its middle
const oval = (rx: number, rz: number, y: number): V3[] => Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * rx, y, CZ + Math.sin(a) * rz] as V3; });

export const fitting: Illustration = {
  k: "fitting", name: "Fitting mirror", title: "Nothing to try on", body: "Add a few pieces to your fitting room and see how they look together.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 24, 11, 0.11);
    p.rotate("z", -0.6); // turned to face us
    // the stand: a leg behind and a leg in front on each side, meeting at the pivot
    const leg = (x: number, y: number) => p.face([[x - 0.7, 0, CZ + 1], [x + 0.7, 0, CZ + 1], [x + 0.7, y, 0], [x - 0.7, y, 0]], 0.3, SH.edge, 0.5);
    leg(-RX - 1.6, -6.5); leg(RX + 1.6, -6.5);
    p.line([[-RX - 1.6, -3.2, CZ / 2], [RX + 1.6, -3.2, CZ / 2]], 0.6, 0.6); // the tie bar at the back
    // the mirror, leaning back a little on its pivots
    p.push();
    p.rotate("x", 0.13, [0, 0, CZ]);
    p.face(oval(RX + 1.5, RZ + 1.5, -1.2), SH.right, 0); // its back edge
    p.face(oval(RX + 1.5, RZ + 1.5, 0), 0.36, SH.edge, 0.6); // the frame
    p.face(oval(RX, RZ, 0.03), 0.045, SH.edge, 0.55); // the glass
    // the light: a slanted band crossing the glass, cut to the oval
    const band = (c: number, w: number, fill: number) => {
      const l: V3[] = [], r: V3[] = [];
      for (let i = 0; i <= 30; i++) {
        const z = -RZ + (i / 30) * RZ * 2, e = (RX - 0.4) * Math.sqrt(Math.max(0, 1 - (z * z) / (RZ * RZ)));
        const a = Math.max(-e, c + z * 0.45 - w), b = Math.min(e, c + z * 0.45 + w);
        if (b - a > 0.2) { l.push([a, 0.06, CZ + z]); r.push([b, 0.06, CZ + z]); }
      }
      if (l.length > 1) p.face([...l, ...r.reverse()], fill, 0);
    };
    const s = ease(cl((u - 0.08) / 0.6)), c = -22 + 44 * s, a = Math.sin(cl((u - 0.08) / 0.6) * Math.PI);
    band(-4.5, 1.1, 0.16); band(-1.2, 0.5, 0.16); // two faint streaks that stay
    if (a > 0.02) { band(c, 2.6, 0.2 + 0.6 * a); band(c + 5, 0.8, 0.2 + 0.5 * a); }
    p.pop();
    // the pivots and the near legs
    for (const x of [-RX - 1.6, RX + 1.6]) { leg(x, 6.5); p.dot([x, 0.1, CZ + 0.4], 1.2, 1); }
    // the sparkle at the top corner
    const k = Math.max(0, Math.sin(cl((u - 0.5) / 0.4) * Math.PI));
    if (k > 0.03) {
      const [x, y] = p.pt([RX + 4, 0, CZ + RZ + 1]), r = 4 * k;
      p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 0.8; g.lineCap = "round"; g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke(); });
    }
  },
};
