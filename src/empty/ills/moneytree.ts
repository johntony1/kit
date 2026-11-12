// No returns yet: a little tree in a pot with coins for leaves. The coins sway, and one drops off, falls to the floor and grows back, over and over.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const clamp = (x: number) => Math.min(1, Math.max(0, x));
/** a point on the plane that faces us through the trunk: u to the right, z up */
const bb = (u: number, z: number, d = 0): V3 => [u * 0.7071 + d, -u * 0.7071 + d, z];
// the coins: [u, z, radius], back ones first
const COINS: [number, number, number][] = [[0, 32, 4.4], [-8.6, 27, 4.2], [8.4, 27.6, 4.2], [-4.6, 21.4, 4], [3.6, 23.6, 4.4]];
/** a coin that faces us: a darker rim behind for thickness, a bright face, a ring and a bar cut into it */
function coin(p: Pen, at: V3, r: number, turn = 0) {
  if (r < 0.4) return;
  const [x, y] = p.pt(at);
  p.screen((c) => {
    c.fillStyle = "rgb(60,60,60)"; c.beginPath(); c.arc(x + r * 0.24, y + r * 0.14, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#000"; c.lineWidth = 0.6; c.beginPath(); c.arc(x, y, r * 0.64, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 0.9; c.lineCap = "round"; c.beginPath(); c.moveTo(x - Math.sin(turn) * r * 0.32, y - Math.cos(turn) * r * 0.32); c.lineTo(x + Math.sin(turn) * r * 0.32, y + Math.cos(turn) * r * 0.32); c.stroke();
  });
}
/** a branch: a thin lit strip on the plane that faces us */
function branch(p: Pen, u0: number, z0: number, u1: number, z1: number, w: number) {
  p.face([bb(u0 - w, z0), bb(u0 + w, z0), bb(u1 + w * 0.6, z1), bb(u1 - w * 0.6, z1)], 0.3, 0);
}

export const moneytree: Illustration = {
  k: "moneytree", name: "Money tree", title: "No returns yet", body: "Returns on your investments will be added up here as they come in.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1, w = ph * Math.PI * 2;
    p.translate(0, 0, -17);
    p.shadow(0, 0, 20, 10, 0.12);
    // the pot: wider at the top, a rolled rim, dark soil
    const b = 4.6, c = 6.4, H = 8;
    p.face([[-b, b, 0], [b, b, 0], [c, c, H], [-c, c, H]], 0.13, SH.edge, 0.6);
    p.face([[b, b, 0], [b, -b, 0], [c, -c, H], [c, c, H]], SH.right, SH.edge, 0.6);
    p.box(-c - 0.7, -c - 0.7, H, c * 2 + 1.4, c * 2 + 1.4, 2, { top: 0.2, left: 0.16, right: 0.08, lw: 0.55 });
    p.face([[-c + 0.6, -c + 0.6, H + 2.03], [c - 0.6, -c + 0.6, H + 2.03], [c - 0.6, c - 0.6, H + 2.03], [-c + 0.6, c - 0.6, H + 2.03]], 0.03, 0);
    // the trunk and its branches
    branch(p, 0, H + 2, 0, 27, 1);
    const sway = (i: number) => 0.7 * Math.sin(w + i * 1.3);
    COINS.forEach(([u, z], i) => branch(p, 0, i < 3 ? 22 : 16, u + sway(i), z, 0.75));
    branch(p, 0, 14, 9.6, 17.6, 0.7);
    // the coins, swaying
    COINS.forEach(([u, z, r], i) => coin(p, bb(u + sway(i), z + 0.4 * Math.cos(w + i * 2), 0.6), r));
    // the loose one: grows on its twig, hangs, lets go and falls, then is gone
    const grow = clamp(ph / 0.18), fall = clamp((ph - 0.5) / 0.32), gone = clamp((ph - 0.86) / 0.1);
    const z = 16.6 - (16.6 - 3.6) * fall * fall;
    coin(p, bb(10.6 + 2.2 * fall, z, 0.6), 3.7 * grow * (1 - gone), fall * 2.4);
  },
};
