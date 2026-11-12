// No new notifications: an app tile with a chat mark and an empty badge ring on its corner. Hover and a bright dot drops into the ring with a bounce and a 1 on it.
import { SH, type Illustration, type V3 } from "../dots";

const S = 12.5, T = 4.5, RR = 5.5; // half size of the tile, its thickness, corner radius
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));

/** a rounded square standing in the plane y */
const tile = (y: number): V3[] => {
  const out: V3[] = [];
  const c: [number, number, number][] = [[S - RR, S - RR, 0], [-(S - RR), S - RR, 0.5], [-(S - RR), -(S - RR), 1], [S - RR, -(S - RR), 1.5]];
  for (const [x, z, q] of c) for (let i = 0; i <= 6; i++) { const a = (q + i / 12) * Math.PI; out.push([x + Math.cos(a) * RR, y, S + z + Math.sin(a) * RR]); }
  return out;
};
/** the dot's height above its seat: a fall, a bounce, a smaller bounce, rest */
function drop(k: number) {
  if (k <= 0) return 30;
  if (k < 0.45) return 30 * (1 - Math.pow(k / 0.45, 2));
  if (k < 0.72) { const v = (k - 0.45) / 0.27; return 4 * 4 * v * (1 - v); }
  if (k < 0.88) { const v = (k - 0.72) / 0.16; return 1.2 * 4 * v * (1 - v); }
  return 0;
}

export const badgedot: Illustration = {
  k: "badgedot", name: "Badge dot", title: "No new notifications", body: "You are all caught up. New notifications will show a dot here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-1, 1, -14);
    p.scale(1.1);
    p.shadow(0, -1, 24, 11, 0.12);
    p.rotate("z", -0.5);
    const k = seg(h, 0.05, 0.85), z = drop(k);
    // the tile squashes a touch when the dot lands
    const hit = Math.max(0, 1 - Math.abs(k - 0.45) / 0.12);
    p.translate(0, 0, -hit * 0.8);
    // the tile: its thickness as stacked copies, then the lit front
    for (let y = -T; y < 0; y += 0.5) p.face(tile(y), y < -T + 0.4 ? SH.right : 0.1, 0);
    p.face(tile(-T), 0, SH.edge, 0.5);
    p.face(tile(0), 0.22, SH.edge, 0.6);
    // a chat bubble cut in the front, with three dots
    const y = 0.04;
    p.line([[-6.5, y, 9], [-6.5, y, 17.5], [6.5, y, 17.5], [6.5, y, 9], [-1, y, 9], [-4.4, y, 5.8], [-4.4, y, 9], [-6.5, y, 9]], SH.edge, 0.9);
    for (const x of [-3.2, 0, 3.2]) p.dot([x, y, 13.2], 0.75, 0);
    // the badge seat on the top right corner: an empty dark ring
    const C: V3 = [S - 1.2, 1.2, S * 2 - 1.2];
    const seat = p.pt(C);
    p.screen((g) => { g.beginPath(); g.arc(seat[0], seat[1], 6.2, 0, Math.PI * 2); g.strokeStyle = "rgb(230,230,230)"; g.lineWidth = 1.2; g.stroke(); });
    p.ringV("y", C, 5.6, 0.04, SH.edge, 0.7);
    // the dot: drops in, bounces, then a ripple spreads from it
    if (k > 0) {
      const [x, yy] = p.pt([C[0], C[1] + 0.4, C[2] + z]);
      p.screen((g) => {
        g.beginPath(); g.arc(x, yy, 4.6, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = 1; g.lineCap = "round"; g.lineJoin = "round";
        g.beginPath(); g.moveTo(x - 1.1, yy - 1.3); g.lineTo(x + 0.2, yy - 2.4); g.lineTo(x + 0.2, yy + 2.4); g.stroke();
        const r = seg(h, 0.6, 1);
        if (r > 0) {
          const u = (t * 0.8) % 1, v = Math.round(255 * r * (1 - u));
          g.strokeStyle = `rgb(${v},${v},${v})`; g.lineWidth = 0.9;
          g.beginPath(); g.arc(x, yy, 6 + u * 6, 0, Math.PI * 2); g.stroke();
        }
      });
    }
  },
};
