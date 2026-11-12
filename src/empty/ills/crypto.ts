// No crypto yet: a token turning on its edge above a round pad, a six sided mark struck on its face. Pulses run out along the pad's traces as it spins.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PER = 3.2, CR = 10.5, CT = 2.2; // seconds per loop, coin radius and thickness

// a coin standing on its edge above (0, 0), centred at height zc, its face turned to angle f around the vertical
function token(p: Pen, zc: number, f: number) {
  const n: V3 = [Math.cos(f), Math.sin(f), 0], u: V3 = [-Math.sin(f), Math.cos(f), 0];
  const P = (a: number, r: number, off: number): V3 => [u[0] * Math.cos(a) * r + n[0] * off, u[1] * Math.cos(a) * r + n[1] * off, zc + Math.sin(a) * r];
  const disc = (off: number, r = CR) => Array.from({ length: 40 }, (_, i) => P((i / 40) * Math.PI * 2, r, off));
  const side = Math.sign(n[0] + n[1]) || 1; // which face looks at us
  for (let k = 0; k <= 5; k++) p.face(disc(-side * CT / 2 + (side * CT * k) / 5), k === 0 ? 0.12 : SH.right, 0);
  const look = Math.abs(n[0] + n[1]) / Math.SQRT2; // 1 when the face looks straight at us
  p.face(disc(side * CT / 2), look > 0.25 ? 0.22 : 0.13, look > 0.25 ? SH.edge : 0, 0.55);
  if (look > 0.25) {
    const o = side * (CT / 2 + 0.05);
    const ring = disc(o, CR - 1.8);
    p.line([...ring, ring[0]], SH.edge, 0.5);
    // the mark: a hexagon with three spokes to a node
    const hex = Array.from({ length: 7 }, (_, i) => P(Math.PI / 2 + (i * Math.PI) / 3, 5.2, o));
    p.line(hex, SH.edge, 0.85);
    for (const i of [0, 2, 4]) p.line([P(0, 0, o), hex[i]], SH.edge, 0.7);
  }
}

export const crypto: Illustration = {
  k: "crypto", name: "Crypto coin", title: "No crypto yet", body: "Buy or receive a coin and your balance will show here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 26, 13, 0.1);
    // the pad, with a ring cut in its top
    p.cylinder(0, 0, 0, 13, 2.2, { side: 0.12, top: 0.18 });
    p.disc(0, 0, 2.23, 9.5, 0.05, SH.edge);
    // traces running out across the floor, each ending in a node; a pulse rides each one
    const traces: V3[][] = [
      [[13, 3, 0], [18, 3, 0], [21, 6, 0]],
      [[3, 13, 0], [3, 17, 0], [7, 21, 0]],
      [[10, 10, 0], [16, 16, 0]],
    ];
    traces.forEach((tr, i) => {
      for (let j = 0; j < tr.length - 1; j++) {
        // a thin strip rather than a line, so it holds in every style
        const [a, b] = [tr[j], tr[j + 1]], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = (-dy / l) * 0.35, ny = (dx / l) * 0.35;
        p.face([[a[0] + nx, a[1] + ny, 0], [b[0] + nx, b[1] + ny, 0], [b[0] - nx, b[1] - ny, 0], [a[0] - nx, a[1] - ny, 0]], 0.2, 0);
      }
      const end = tr[tr.length - 1];
      const v = (u + i / 3) % 1;
      p.dot(end, 1 + 0.5 * Math.max(0, Math.sin((v - 0.75) * Math.PI * 4)) * (v > 0.75 ? 1 : 0), 1);
      if (v < 0.75) {
        const s = (v / 0.75) * (tr.length - 1), j = Math.min(tr.length - 2, Math.floor(s)), q = s - j;
        p.dot([tr[j][0] + (tr[j + 1][0] - tr[j][0]) * q, tr[j][1] + (tr[j + 1][1] - tr[j][1]) * q, 0], 0.75, 1);
      }
    });
    // the token: half a turn per loop (both faces are the same), bobbing once
    const zc = 2.2 + CR + 4 + Math.sin(u * Math.PI * 2) * 1.2;
    p.guide([[0, 0, 2.2], [0, 0, zc - CR]], true);
    token(p, zc, Math.PI * u + Math.PI / 4);
  },
};
