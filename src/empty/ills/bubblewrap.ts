// Nothing packed yet: a square sheet of bubble wrap tilted toward us, a grid of big round bubbles, its near corner curling up. The bubbles pop in a wave across the sheet, then puff back up.
import { type Illustration, type Pen } from "../dots";

const P = 3.6; // seconds per loop
const S = 15; // half size of the sheet
const N = 4, GAP = 7.4, R = 3; // bubbles per side, spacing, bubble radius
const C = 9; // how far the curled corner reaches along each edge

// a bubble: a dark rim, then a lit dome; popped it is a dark pocket with a scrap of flat plastic in it
function bubble(p: Pen, x: number, y: number, up: number) {
  p.disc(x, y, 0.62, R + 0.75, 0.02, 0);
  if (up < 0.1) { p.disc(x + 0.5, y + 0.5, 0.66, R * 0.4, 0.22, 0); return; }
  p.cylinder(x, y, 0.6, R, 1.5 * up, { side: 0.16, top: 0.3, edge: 0 });
  p.cylinder(x - 0.3, y - 0.3, 0.6 + 1.5 * up, R * 0.62, 0.7 * up, { side: 0.26, top: 0.45, edge: 0 });
}

export const bubblewrap: Illustration = {
  k: "bubblewrap", name: "Bubble wrap", title: "Nothing packed yet", body: "Items waiting to be packed will show up here, ready to wrap and send.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -6);
    p.shadow(0, 0, 30, 15, 0.12);
    // tilt the sheet so its far edge lifts toward us: turn, tip about the screen horizontal, turn back
    p.rotate("z", -Math.PI / 4);
    p.rotate("x", -0.5);
    p.rotate("z", Math.PI / 4);
    // the sheet, its near corner cut away where it curls up
    const z = 0.6;
    p.face([[-S, -S, z], [S, -S, z], [S, S - C, z], [S - C, S, z], [-S, S, z]], 0.13, 0);
    p.face([[-S, S, 0], [S - C, S, 0], [S - C, S, z], [-S, S, z]], 0.14, 0);
    p.face([[S, -S, 0], [S, S - C, 0], [S, S - C, z], [S, -S, z]], 0.06, 0);
    // the pop wave runs corner to corner, and a moment later each bubble puffs back up in the same order
    const pos = (i: number) => -((N - 1) * GAP) / 2 + i * GAP;
    const cells: [number, number][] = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (i + j < 2 * N - 2) cells.push([i, j]);
    cells.sort((a, b) => a[0] + a[1] - b[0] - b[1]);
    for (const [i, j] of cells) {
      const at = 0.42 + (i + j) * 0.05, v = u - at;
      bubble(p, pos(i), pos(j), v < 0 ? 1 : v < 0.2 ? 0 : Math.min(1, (v - 0.2) / 0.06));
    }
    // the curled corner: a flap rolled up and back over the sheet, its underside showing
    const a: [number, number, number] = [S, S - C, z], b: [number, number, number] = [S - C, S, z];
    const tip: [number, number, number] = [S - C * 0.62, S - C * 0.62, z + 7];
    const mid: [number, number, number] = [S - C * 0.2, S - C * 0.2, z + 4.2];
    p.face([a, mid, tip, b], 0.24, 0);
    p.face([a, mid, b], 0.12, 0);
  },
};
