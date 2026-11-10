// No achievements yet: a trophy cup on a plinth. A shine sweeps across the cup, then a sparkle twinkles on its rim.
import { SH, easeInOut, type Illustration, type Pen, type V3 } from "../dots";

/** a surface of revolution around a vertical axis, in crisp bands like a box: up lit, left dense, right sparse */
function lathe(p: Pen, prof: [number, number][], z0 = 0, N = 32) {
  const strips: { d: number; pts: V3[]; f: number }[] = [];
  for (let i = 0; i < prof.length - 1; i++) {
    const [za, ra] = prof[i], [zb, rb] = prof[i + 1];
    const dz = zb - za, dr = rb - ra, L = Math.hypot(dz, dr) || 1;
    const nr = dz / L, nz = -dr / L;
    for (let j = 0; j < N; j++) {
      const a0 = (j / N) * Math.PI * 2 - 0.01, a1 = ((j + 1) / N) * Math.PI * 2 + 0.01, m = (a0 + a1) / 2;
      const nx = Math.cos(m) * nr, ny = Math.sin(m) * nr;
      if (nx + ny + nz <= 0.02) continue;
      const f = nz > 0.6 ? 0.26 : ny > nx ? 0.18 : 0.065;
      const P = (a: number, r: number, z: number): V3 => [Math.cos(a) * r, Math.sin(a) * r, z0 + z];
      strips.push({ d: Math.cos(m) * (ra + rb) / 2 + Math.sin(m) * (ra + rb) / 2 + (za + zb) / 2, pts: [P(a0, ra, za), P(a1, ra, za), P(a1, rb, zb), P(a0, rb, zb)], f });
    }
  }
  strips.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.pts, s.f, 0));
}

// the cup's profile from the foot up to the rim: [z, r]
const CUP: [number, number][] = [[0, 4.4], [1.2, 4.4], [1.8, 3], [2.6, 1.8], [3.4, 1.5], [6.4, 1.5], [7.4, 2.4], [8.4, 3.6], [9.6, 4.8], [11.6, 5.8], [14, 6.4], [16.6, 6.7], [18.4, 6.8]];
const RIM = 18.4, RR = 6.8;
const S = Math.SQRT1_2;
/** a point at radius r toward screen right (+1) or left (-1), at height z */
const side = (sgn: number, r: number, z: number): V3 => [sgn * r * S, -sgn * r * S, z];

export const trophy: Illustration = {
  k: "trophy", name: "Trophy", title: "No achievements yet", body: "Reach your first milestone and your badges will be shown off here.",
  kind: "loop", period: 3.4, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % 3.4) / 3.4;
    p.translate(0, 0, -12);
    p.scale(1.1, [0, 0, 12]);
    p.shadow(0, 0, 20, 10, 0.12);
    // the plinth: a wide step and a block with a lit plaque on its front
    p.box(-7, -7, 0, 14, 14, 2.2, { top: 0.22, left: 0.13, right: 0.07 });
    p.box(-5.4, -5.4, 2.2, 10.8, 10.8, 4.2, { top: 0.22, left: 0.13, right: 0.07 });
    p.face([[-3.4, 5.43, 3.3], [3.4, 5.43, 3.3], [3.4, 5.43, 5.5], [-3.4, 5.43, 5.5]], 0.32, SH.edge, 0.6);
    p.line([[-2, 5.46, 4.4], [2, 5.46, 4.4]], SH.edge, 0.6);
    const Z = 6.4; // the foot of the cup
    // a dark gap round the foot, so the cup stands clear of the lit plinth top
    p.disc(0, 0, Z + 0.01, 4.9, 0, SH.edge);
    p.disc(0, 0, Z + 0.01, 4.6, 0, SH.edge);

    // handles: loops either side of the bowl, in the plane facing us
    const handle = (sgn: number) => {
      const pts: V3[] = [], n = 14;
      for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (Math.PI * i) / n; pts.push(side(sgn, 5.8 + Math.cos(a) * 3.6, Z + 13.4 + Math.sin(a) * 3.4)); }
      for (let i = n; i >= 0; i--) { const a = -Math.PI / 2 + (Math.PI * i) / n; pts.push(side(sgn, 5.8 + Math.cos(a) * 2.1, Z + 13.4 + Math.sin(a) * 1.9)); }
      p.face(pts, sgn < 0 ? 0.22 : 0.15, SH.edge, 0.6);
    };
    handle(-1); handle(1);

    lathe(p, CUP, Z);
    // the open top: a lit rim around the dark inside
    p.disc(0, 0, Z + RIM, RR, 0.26, 0);
    p.disc(0, 0, Z + RIM + 0.01, RR - 0.9, 0.03, SH.edge);
    // a seam where the bowl meets the stem
    p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 20; return [Math.cos(a) * 2.95, Math.sin(a) * 2.95, Z + 7.9] as V3; }), SH.edge, 0.6);

    // a star on the front of the bowl
    const [sx, sy] = p.pt([RR * 0.88 * S, RR * 0.88 * S, Z + 13]);
    const star = (c: CanvasRenderingContext2D, x: number, y: number, R: number, r: number) => {
      c.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r : R; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); }
      c.closePath();
    };
    p.screen((c) => { star(c, sx, sy, 3.2, 1.35); c.fillStyle = "#fff"; c.fill(); c.strokeStyle = "#000"; c.lineWidth = 0.7; c.stroke(); });

    // the shine: a bright slanted band with dark edges, sweeping left to right across the cup
    const k = easeInOut(Math.min(1, u / 0.42));
    if (u < 0.42) {
      // the bowl's outline: down the left side, up the right, back along the front of the rim
      const bowl = CUP.filter(([z]) => z >= 6.4);
      const out: [number, number][] = [
        ...bowl.slice().reverse().map(([z, r]) => p.pt(side(-1, r, Z + z))),
        ...bowl.map(([z, r]) => p.pt(side(1, r, Z + z))),
        ...Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 20; return p.pt([Math.cos(a) * RR, Math.sin(a) * RR, Z + RIM]); }),
      ];
      const [cx, cy] = p.pt([0, 0, Z + 11]);
      p.screen((c) => {
        c.beginPath(); out.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath();
        c.clip();
        const x = cx - 16 + k * 32, w = 2.6;
        c.beginPath(); c.moveTo(x - w, cy + 16); c.lineTo(x + w, cy + 16); c.lineTo(x + w + 9, cy - 16); c.lineTo(x - w + 9, cy - 16); c.closePath();
        c.fillStyle = "#fff"; c.fill(); c.strokeStyle = "#000"; c.lineWidth = 0.8; c.stroke();
        // a thinner trailing streak
        const x2 = x - 5.5;
        c.beginPath(); c.moveTo(x2 - 0.8, cy + 16); c.lineTo(x2 + 0.8, cy + 16); c.lineTo(x2 + 9.8, cy - 16); c.lineTo(x2 + 8.2, cy - 16); c.closePath();
        c.fill(); c.stroke();
      });
    }

    // a sparkle on the rim once the shine has passed, and a smaller one off to the side
    const tw = (a: number, b: number) => (u > a && u < b ? Math.sin(((u - a) / (b - a)) * Math.PI) : 0);
    const spark = (at: V3, s: number) => {
      if (s <= 0.02) return;
      const [x, y] = p.pt(at);
      p.screen((c) => {
        c.fillStyle = "#fff"; c.beginPath();
        const L = 3.6 * s, w = 0.75 * s;
        c.moveTo(x, y - L); c.lineTo(x + w, y - w); c.lineTo(x + L, y); c.lineTo(x + w, y + w); c.lineTo(x, y + L); c.lineTo(x - w, y + w); c.lineTo(x - L, y); c.lineTo(x - w, y - w); c.closePath(); c.fill();
      });
    };
    spark(side(1, RR + 0.6, Z + RIM + 1.2), tw(0.4, 0.68));
    spark(side(1, RR + 6, Z + RIM + 5), tw(0.5, 0.74) * 0.65);
    spark(side(-1, RR + 4.5, Z + 7), tw(0.58, 0.82) * 0.55);
  },
};
