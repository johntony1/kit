// No calls: a headset standing on its ear cups, the mic boom curling forward. Sound waves pulse out of the mic.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 1.8; // seconds per loop
const RB = 11.5, ZC = 13, BW = 2.2; // band radius, the band's centre height, half width of the band

type P2 = [number, number];
/** a rounded rectangle in the x-z plane, counter clockwise */
function rrect(x0: number, z0: number, x1: number, z1: number, r: number): P2[] {
  const pts: P2[] = [];
  const corner = (cx: number, cz: number, a0: number) => { for (let i = 0; i <= 5; i++) { const a = a0 + (Math.PI / 2) * (i / 5); pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
  corner(x1 - r, z0 + r, -Math.PI / 2);
  corner(x1 - r, z1 - r, 0);
  corner(x0 + r, z1 - r, Math.PI / 2);
  corner(x0 + r, z0 + r, Math.PI);
  return pts;
}

/** a shape in the x-z plane pushed from y0 to y1: the up and right facing walls, then the front cap */
function pushed(p: Pen, shape: P2[], y0: number, y1: number, front: number) {
  const n = shape.length;
  // group neighbouring walls that share a shade into one face, so a rounded corner reads as one surface
  const shade = (i: number) => {
    const [x0, z0] = shape[i], [x1, z1] = shape[(i + 1) % n];
    const L = Math.hypot(x1 - x0, z1 - z0) || 1;
    const nx = (z1 - z0) / L, nz = -(x1 - x0) / L;
    return nx + nz <= 0 ? -1 : nz > 0.5 ? 0.22 : SH.right;
  };
  let start = 0;
  while (start < n && shade(start) === shade((start + n - 1) % n)) start++;
  start %= n;
  let run: number[] = [];
  const flush = () => {
    if (!run.length) return;
    const k = shade(run[0]);
    if (k > 0) {
      const pts = [...run.map((i) => shape[i]), shape[(run[run.length - 1] + 1) % n]];
      p.face([...pts.map(([x, z]) => [x, y0, z] as V3), ...pts.reverse().map(([x, z]) => [x, y1, z] as V3)], k, SH.edge, 0.5);
    }
    run = [];
  };
  for (let j = 0; j < n; j++) {
    const i = (start + j) % n;
    if (run.length && shade(i) !== shade(run[0])) flush();
    run.push(i);
  }
  flush();
  p.face(shape.map(([x, z]) => [x, y1, z] as V3), front, SH.edge, 0.6);
}

export const calls: Illustration = {
  k: "calls", name: "Headset", title: "No recent calls", body: "Start a call and your recent calls will be listed here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(-3, 3, -14);
    p.shadow(-8, 0, 16, 8, 0.12);
    p.shadow(8, 0, 16, 8, 0.12);
    p.rotate("z", 0.22);

    // the band: an arch over the top, its outer surface in strips, lit where it faces up
    const N = 22;
    const outer = (a: number, y: number): V3 => [Math.cos(a) * (RB + 1.3), y, ZC + Math.sin(a) * (RB + 1.3)];
    const inner = (a: number, y: number): V3 => [Math.cos(a) * (RB - 0.4), y, ZC + Math.sin(a) * (RB - 0.4)];
    // its outer surface, in two pieces: the lit crown, and the shaded right shoulder
    const strip = (a0: number, a1: number): V3[] => {
      const k = Math.max(2, Math.round(((a1 - a0) / Math.PI) * N));
      const as = Array.from({ length: k + 1 }, (_, i) => a0 + ((a1 - a0) * i) / k);
      return [...as.map((a) => outer(a, -BW)), ...as.reverse().map((a) => outer(a, BW))];
    };
    p.face(strip(-Math.PI * 0.03, Math.PI * 0.2), SH.right, SH.edge, 0.5);
    p.face(strip(Math.PI * 0.2, Math.PI * 0.75), 0.22, SH.edge, 0.5);
    // the band's near side, with a padded strip underneath
    const arch: V3[] = [];
    for (let i = 0; i <= N; i++) arch.push(outer((Math.PI * i) / N, BW));
    for (let i = N; i >= 0; i--) arch.push(inner((Math.PI * i) / N, BW));
    p.face(arch, SH.left, SH.edge, 0.55);
    p.line(Array.from({ length: 13 }, (_, i) => inner(Math.PI * 0.2 + (Math.PI * 0.6 * i) / 12, BW + 0.05)), SH.edge, 0.5);

    // the ear cups: rounded blocks at both ends of the band, the far one first
    for (const s of [-1, 1]) {
      const x = s * RB;
      // the slider joining band and cup
      p.box(x - 0.8, -1, ZC - 3, 1.6, 2, 3.2, { top: 0.22, left: 0.13, right: 0.065 });
      pushed(p, rrect(x - 3.4, 0, x + 3.4, ZC - 2.4, 2.8), -3.6, 3.6, SH.left);
      // the cushion seam and a lit badge on the near face
      p.face(rrect(x - 2, 2.4, x + 2, ZC - 4.8, 1.6).map(([a, b]) => [a, 3.64, b] as V3), 0.22, SH.edge, 0.5);
    }

    // the mic boom: from the near cup, curling forward and in toward the middle, a lit strip in the air
    const boom = (k: number): V3 => {
      const a = k * Math.PI * 0.5;
      return [RB - 1.5 - Math.sin(a) * 9, 3.6 + (1 - Math.cos(a)) * 5 + k * 2, 3.2 + k * 1.2];
    };
    const M = 16, wdt = 0.9;
    const top: V3[] = [], bot: V3[] = [];
    for (let i = 0; i <= M; i++) { const q = boom(i / M); top.push([q[0], q[1], q[2] + wdt]); bot.push([q[0], q[1], q[2] - wdt]); }
    p.face([...top, ...bot.reverse()], 0.2, SH.edge, 0.5);
    // the mic: the one accent, a small capsule at the tip
    const tip = boom(1);
    p.cylinder(tip[0], tip[1], tip[2] - 1.8, 1.9, 3.4, { top: 0.34, side: 0.32 });
    // sound waves: arcs pulsing out of the mic, fading as they grow
    const [sx, sy] = p.pt([tip[0], tip[1] + 1.4, tip[2]]);
    p.screen((c) => {
      c.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const w = (u + i / 3) % 1;
        const r = 4 + w * 13, a = Math.sin(w * Math.PI);
        if (a < 0.1) continue;
        const nn = Math.round(255 * Math.min(1, a * 1.2));
        c.strokeStyle = `rgb(${nn},${nn},${nn})`; c.lineWidth = 1.1;
        c.beginPath(); c.arc(sx, sy, r, Math.PI * 0.55, Math.PI * 1.05); c.stroke();
      }
    });
  },
};
