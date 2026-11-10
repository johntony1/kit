// Empty playlist: a stack of track cards. In turn the top track slides out, drops under the stack and slides back in.
import { easeInOut, type Illustration, type Pen } from "../dots";

const P = 6; // seconds per loop: one step per track
const N = 4; // tracks
const W = 11, D = 7.5; // half width (x), half depth (y)
const T = 1.8, GAP = 3.4; // card thickness, level spacing
const OUT = 13; // how far a track slides out

const clamp = (x: number) => Math.max(0, Math.min(1, x));

/** one track card: a cover, a title, a subtitle and a play button */
function track(p: Pen, j: number, active: boolean, prog: number) {
  p.box(-W, -D, 0, W * 2, D * 2, T, { top: 0.2, left: 0.13, right: 0.07 });
  // the cover: a raised square with a record inside
  p.box(-W + 2, -4, T, 7, 7, 0.6, { top: 0.13, left: 0.16, right: 0.08 });
  p.disc(-W + 5.5, -0.5, T + 0.62, 2.4, 0.24, 1);
  p.disc(-W + 5.5, -0.5, T + 0.64, 0.5, 0.04, 0);
  // title and subtitle
  const L = [9, 6.5, 8, 5.5][j];
  p.line([[-1.2, -2.2, T + 0.02], [-1.2 + L, -2.2, T + 0.02]], 1, 0.8);
  p.line([[-1.2, 0.6, T + 0.02], [-1.2 + L * 0.6, 0.6, T + 0.02]], 1, 0.55);
  // the progress bar along the front
  p.line([[-W + 2, D - 1.6, T + 0.02], [W - 2, D - 1.6, T + 0.02]], 1, 0.55);
  if (active && prog > 0.02) p.box(-W + 2, D - 2.1, T, (W * 2 - 4) * prog, 1, 0.3, { top: 0.34, left: 0.2, right: 0.1 });
  // the play button: a round key with a triangle cut in
  p.cylinder(W - 3.6, -1, T, 1.9, 0.6, { top: active ? 0.34 : 0.2, side: 0.12 });
  const z = T + 0.64, cx = W - 3.6, cy = -1;
  p.line([[cx - 0.6, cy + 0.7, z], [cx - 0.6, cy - 0.9, z], [cx + 0.8, cy - 0.1, z], [cx - 0.6, cy + 0.7, z]], 1, 0.55);
}

export const playlist: Illustration = {
  k: "playlist", name: "Playlist", title: "This playlist is empty", body: "Add a few tracks and they will play in order from here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const S = P / N;
    const n = Math.floor((t % P) / S), u = ((t % P) % S) / S;
    const out = easeInOut(clamp(u / 0.28)), drop = easeInOut(clamp((u - 0.3) / 0.3)), back = easeInOut(clamp((u - 0.62) / 0.3));
    p.translate(-5, 3, -8);
    p.shadow(-3.5, 0, 16, 8, 0.12);
    p.shadow(3.5, 0, 16, 8, 0.12);
    // where the top track slides to: a ghost slot beside the stack
    const zt = (N - 1) * GAP;
    const gx = OUT;
    p.guide([[gx - W, -D, zt + T], [gx + W, -D, zt + T], [gx + W, D, zt + T], [gx - W, D, zt + T], [gx - W, -D, zt + T]]);
    p.guide([[gx + W, D, zt + T], [gx + W, D, zt]]);

    const cards: { j: number; x: number; z: number; moving: boolean }[] = [];
    for (let j = 0; j < N; j++) {
      const L = (j + n) % N;
      if (L === N - 1) {
        // the top track: out, down under the stack, back in
        const x = OUT * (out - back);
        cards.push({ j, x, z: zt * (1 - drop), moving: true });
      } else cards.push({ j, x: 0, z: (L + drop) * GAP, moving: false });
    }
    cards.sort((a, b) => a.z - b.z);
    const top = cards.filter((c) => !c.moving).reduce((a, b) => (b.z > a.z ? b : a));
    for (const c of cards) {
      p.push(); p.translate(c.x, 0, c.z);
      const active = c === top && drop > 0.99 ? true : c.moving && drop < 0.01;
      track(p, c.j, active, active ? (c.moving ? 1 - out : back) : 0);
      p.pop();
    }
    // a note lifts off the playing track
    const k = Math.sin(u * Math.PI);
    if (k > 0.15) {
      const [sx, sy] = p.pt([W - 1, -5, zt + T + 5 + u * 6]);
      p.screen((g) => {
        const n = Math.round(255 * Math.min(1, k * 1.4));
        g.fillStyle = g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = 0.8; g.lineCap = "round";
        g.beginPath(); g.ellipse(sx, sy, 1.3, 1, -0.4, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.moveTo(sx + 1.1, sy); g.lineTo(sx + 1.1, sy - 5); g.quadraticCurveTo(sx + 3.4, sy - 4, sx + 2.8, sy - 2.4); g.stroke();
      });
    }
  },
};
