// Nothing to recycle: a round recycling bin with the three chasing arrows on its front. Hover and a crumpled sheet drops in and bounces on the rim before falling inside.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const R = 11, H = 24, N = 48;
const ring = (z: number, r = R): V3[] => Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z] as V3; });

/** the side of the bin facing us, slightly flared toward the top */
function side(p: Pen) {
  const lo = ring(0, R - 1.2), hi = ring(H), s: V3[] = [];
  for (let i = 0; i <= N / 2; i++) s.push(lo[(i + N - N / 8) % N]);
  for (let i = N / 2; i >= 0; i--) s.push(hi[(i + N - N / 8) % N]);
  p.face(s, 0.2, 0);
}

// the ball's height above the rim: drops, bounces once off the rim, then falls inside
function drop(k: number) {
  if (k < 0.4) return 22 * (1 - Math.pow(k / 0.4, 2));
  if (k < 0.65) { const v = (k - 0.4) / 0.25; return 5 * 4 * v * (1 - v); }
  return -16 * Math.pow((k - 0.65) / 0.35, 2);
}

export const recyclebin: Illustration = {
  k: "recyclebin", name: "Recycle bin", title: "Nothing to recycle", body: "Items you remove will wait here for a while before they are gone for good.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 26, 13, 0.12);
    // the opening: a lit rim round a dark inside
    const o = ring(H, R + 0.8), i = ring(H, R - 1.2);
    p.face([...o, o[0], i[0], ...i.slice().reverse()], 0.3, 0);
    p.face(i, 0.02, 0);
    // the crumpled sheet: falls past the rim into the bin, hidden by the front wall once inside
    if (h > 0.02) {
      const z = H + 3.2 + drop(Math.min(1, h * 1.15));
      const [x, y] = p.pt([2, 2, z]);
      p.screen((c) => {
        c.beginPath(); c.arc(x, y, 3.4, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill();
        c.strokeStyle = "#000"; c.lineWidth = 0.6; c.lineJoin = "round";
        c.beginPath(); c.moveTo(x - 2.4, y - 0.6); c.lineTo(x - 0.4, y + 0.6); c.lineTo(x + 0.6, y - 1.6); c.lineTo(x + 2.2, y + 0.8); c.stroke();
        c.beginPath(); c.moveTo(x - 1.2, y + 1.8); c.lineTo(x + 0.4, y + 1.2); c.stroke();
      });
    }
    side(p);
    // the front rim again, so the ball sinks behind it
    const fr: V3[] = Array.from({ length: 25 }, (_, k) => { const a = (3 * Math.PI) / 4 - (k / 24) * Math.PI; return [Math.cos(a) * (R + 0.8), Math.sin(a) * (R + 0.8), H] as V3; });
    const fi = fr.map(([x, y, z]) => [x * (R - 1.2) / (R + 0.8), y * (R - 1.2) / (R + 0.8), z] as V3);
    p.face([...fr, ...fi.slice().reverse()], 0.3, 0);
    p.line(ring(H - 2.2, R - 0.1).slice(N - N / 8).concat(ring(H - 2.2, R - 0.1).slice(0, N / 2 - N / 8 + 1)), SH.edge, 0.6);
    // the recycling mark: three arrows chasing round a triangle, on a plane touching the front
    const ux = Math.SQRT1_2, c0 = R * Math.SQRT1_2, zc = 10.5;
    const at = (u: number, v: number): V3 => [c0 + u * ux + 0.4, c0 - u * ux + 0.4, zc + v];
    const tri: [number, number][] = [[0, 6], [6, -4], [-6, -4]];
    for (let k = 0; k < 3; k++) {
      const [ax, ay] = tri[k], [bx, by] = tri[(k + 1) % 3];
      const s0 = 0.18, s1 = 0.78, L = Math.hypot(bx - ax, by - ay), dx = (bx - ax) / L, dy = (by - ay) / L;
      const ex = ax + (bx - ax) * s1, ey = ay + (by - ay) * s1;
      p.line([at(ax + (bx - ax) * s0, ay + (by - ay) * s0), at(ex, ey)], SH.edge, 1.2);
      // the arrowhead at its end
      p.line([at(ex - dx * 2 - dy * 1.6, ey - dy * 2 + dx * 1.6), at(ex + dx * 0.4, ey + dy * 0.4), at(ex - dx * 2 + dy * 1.6, ey - dy * 2 - dx * 1.6)], SH.edge, 1.1);
    }
  },
};
