// No games yet: a game controller lying on the desk. Its face buttons press in turn, each one lighting and rumbling the pad.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const TH = -0.62; // the pad's turn on the floor, so its long side runs across the screen
const H = 3.4; // body height

/** corner cutting: a few passes turn a rough outline into a smooth one */
function smooth(pts: [number, number][], n: number) {
  let q = pts;
  for (let k = 0; k < n; k++) {
    const r: [number, number][] = [];
    for (let i = 0; i < q.length; i++) {
      const [ax, ay] = q[i], [bx, by] = q[(i + 1) % q.length];
      r.push([ax * 0.75 + bx * 0.25, ay * 0.75 + by * 0.25], [ax * 0.25 + bx * 0.75, ay * 0.25 + by * 0.75]);
    }
    q = r;
  }
  return q;
}
const BODY = smooth([
  [-8, -5.5], [8, -5.5], [11.5, -4.2], [13.2, 0], [14, 5.4], [12.6, 9.6], [9.6, 10.2], [7.2, 8], [5.4, 4.8], [-5.4, 4.8], [-7.2, 8], [-9.6, 10.2], [-12.6, 9.6], [-14, 5.4], [-13.2, 0], [-11.5, -4.2],
], 3);
const PAD = [[-1, -3], [1, -3], [1, -1], [3, -1], [3, 1], [1, 1], [1, 3], [-1, 3], [-1, 1], [-3, 1], [-3, -1], [-1, -1]] as [number, number][];

/** a flat shape pushed up from z0 by h: walls shaded by which way they face, then a lit top */
function extrude(p: Pen, pts: [number, number][], z0: number, h: number, top: number, rot: number) {
  const c = Math.cos(rot), s = Math.sin(rot);
  let area = 0;
  for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; area += ax * by - bx * ay; }
  const sg = area > 0 ? 1 : -1;
  const walls: { d: number; f: number; q: V3[] }[] = [];
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
    // the outward normal, turned into the world
    const nx = (by - ay) * sg, ny = -(bx - ax) * sg, wx = nx * c - ny * s, wy = nx * s + ny * c;
    if (wx + wy <= 0) continue;
    const f = wy > wx ? 0.13 : 0.07;
    walls.push({ d: (ax + bx) * (c + s) / 2 + (ay + by) * (c - s) / 2, f, q: [[ax, ay, z0], [bx, by, z0], [bx, by, z0 + h], [ax, ay, z0 + h]] });
  }
  walls.sort((a, b) => a.d - b.d);
  for (const w of walls) p.face(w.q, w.f, 0);
  p.face(pts.map(([x, y]) => [x, y, z0 + h] as V3), top);
}

export const gamepad: Illustration = {
  k: "gamepad", name: "Game controller", title: "No games yet", body: "Pick a game from the store and it will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    // four presses a loop: which button, and how far down
    const step = Math.floor(u * 4), v = (u * 4) % 1;
    const press = v < 0.5 ? Math.sin((v / 0.5) * Math.PI) : 0;
    const rum = press * 0.18 * Math.sin(t * 60);
    p.translate(0, 0, -6);
    p.push();
    p.rotate("z", TH);
    p.shadow(0, 2, 30, 15, 0.12);
    p.pop();
    p.push();
    p.translate(rum, -rum, 0);
    p.rotate("z", TH);
    // shoulder buttons peeking out at the back
    p.box(-11, -6.4, 1.2, 5.5, 1.6, H - 0.6, { top: 0.22, left: 0.13, right: 0.07 });
    p.box(5.5, -6.4, 1.2, 5.5, 1.6, H - 0.6, { top: 0.22, left: 0.13, right: 0.07 });
    extrude(p, BODY, 0, H, 0.2, TH);
    // a seam round the top and the light bar at the back
    p.line([[-4, -3.6, H], [4, -3.6, H]], 1, 0.8);
    // the d pad
    extrude(p, PAD.map(([x, y]) => [x * 0.8 - 8.6, y * 0.8 + 0.6]), H, 0.9, 0.22, TH);
    p.line([[-8.6, -1.2, H + 0.92], [-8.6, 2.4, H + 0.92]], 1, 0.45);
    p.line([[-10.4, 0.6, H + 0.92], [-6.8, 0.6, H + 0.92]], 1, 0.45);
    // start and select
    p.line([[-2.4, 0.4, H], [-0.8, 0.4, H]], 1, 0.9);
    p.line([[0.8, 0.4, H], [2.4, 0.4, H]], 1, 0.9);
    // the sticks: a well and a cap
    for (const [x, y] of [[-4.2, 3.4], [4.2, 3.4]] as [number, number][]) {
      p.disc(x, y, H + 0.02, 2.3, 0.04, 1);
      const wig = x < 0 ? Math.sin(u * Math.PI * 4) * 0.4 : 0;
      p.cylinder(x + wig, y, H, 1.6, 1.3, { top: 0.22, side: 0.13 });
      p.line(Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [x + wig + Math.cos(a) * 0.9, y + Math.sin(a) * 0.9, H + 1.32] as V3; }), 1, 0.45);
    }
    // the face buttons, back to front, the pressed one sinks and lights
    const BTN: [number, number][] = [[8.8, -1.8], [11, 0.4], [6.6, 0.4], [8.8, 2.6]];
    const order = [0, 1, 3, 2]; // which button each step presses
    const pressed = order[step];
    let top: V3 = [0, 0, 0];
    for (const i of [0, 1, 2, 3].sort((a, b) => (BTN[a][0] * 0.17 + BTN[a][1]) - (BTN[b][0] * 0.17 + BTN[b][1]))) {
      const [x, y] = BTN[i], on = i === pressed;
      const dz = on ? press * 0.7 : 0;
      p.cylinder(x, y, H, 1.2, 1 - dz, { top: on && press > 0.3 ? 0.34 : 0.22, side: 0.13 });
      if (on) top = [x, y, H + 1];
    }
    // the button cluster's ring and the line the press rises along
    p.guide(Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [8.8 + Math.cos(a) * 4.2, 0.4 + Math.sin(a) * 4.2, H] as V3; }));
    p.guide([top, [top[0], top[1], top[2] + 7]], true);
    const [sx, sy] = p.pt([top[0], top[1], top[2] + 1.5]);
    p.pop();
    // the press shows: a few sparks over the button
    if (press > 0.3) p.screen((g) => {
      g.strokeStyle = "rgb(255,255,255)"; g.lineWidth = 0.8; g.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const a = -Math.PI / 2 + (i - 1) * 0.7, r0 = 3 + press * 1.5, r1 = r0 + 2;
        g.beginPath(); g.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0); g.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1); g.stroke();
      }
    });
  },
};
