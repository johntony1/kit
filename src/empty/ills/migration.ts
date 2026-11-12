// No migrations run: a full database on the left, an empty pad on the right and an arrow between them. Hover and the disks hop across one at a time and stack up on the other side.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const R = 7.4, TH = 4.4, STEP = 5.1, LX = -11.5, RX = 11.5;

function disk(p: Pen, x: number, z: number, top: number) {
  p.cylinder(x, 0, z, R, TH, { side: 0.12, top, lw: 0.6 });
  p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 20) * Math.PI; return [x + Math.cos(a) * (R + 0.02), Math.sin(a) * (R + 0.02), z + TH / 2] as V3; }), 0.7, 0.45);
}

function pad(p: Pen, x: number) {
  p.disc(x, 0, 0.03, R + 1.6, 0.06, SH.edge);
  p.disc(x, 0, 0.04, R - 1.6, 0.02, 0);
}

export const migration: Illustration = {
  k: "migration", name: "Migration", title: "No migrations run", body: "Run a migration to move your data to its new shape. Each run will be recorded here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -9);
    p.rotate("z", -0.45);
    p.shadow(LX, 0, 17, 8.5, 0.12); p.shadow(RX, 0, 17, 8.5, 0.12);
    pad(p, LX); pad(p, RX);
    // the arrow on the floor between them
    p.line([[-2.6, 0, 0.05], [2.6, 0, 0.05]], SH.edge, 0.9);
    p.line([[0.6, -2, 0.05], [2.6, 0, 0.05], [0.6, 2, 0.05]], SH.edge, 0.9);
    // disk 0 is the top of the left stack: it goes first and lands at the bottom on the right
    const k = [0, 1, 2].map((i) => ease(cl((h - i * 0.22) / 0.5)));
    for (const i of [2, 1, 0]) if (k[i] <= 0) disk(p, LX, (2 - i) * STEP + 0.05, i === 0 ? 0.26 : 0.2);
    for (const i of [0, 1, 2]) if (k[i] > 0) {
      const z = (2 - i) * STEP + (i * STEP - (2 - i) * STEP) * k[i] + 13 * Math.sin(Math.PI * k[i]);
      disk(p, LX + (RX - LX) * k[i], z + 0.05, 0.26);
    }
  },
};
