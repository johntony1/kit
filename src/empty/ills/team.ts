// No team members: three plinths, two with a bust and the middle one empty, a dashed outline waiting. Hover and a new member rises into the spot.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

/** a surface of revolution around a vertical axis, in crisp bands like a box: up lit, left dense, right sparse */
function lathe(p: Pen, prof: [number, number][], cx = 0, cy = 0, z0 = 0, N = 28) {
  const strips: { d: number; pts: V3[]; f: number }[] = [];
  for (let i = 0; i < prof.length - 1; i++) {
    const [za, ra] = prof[i], [zb, rb] = prof[i + 1];
    const dz = zb - za, dr = rb - ra, L = Math.hypot(dz, dr) || 1;
    const nr = dz / L, nz = -dr / L;
    for (let j = 0; j < N; j++) {
      const a0 = (j / N) * Math.PI * 2 - 0.01, a1 = ((j + 1) / N) * Math.PI * 2 + 0.01, m = (a0 + a1) / 2;
      const nx = Math.cos(m) * nr, ny = Math.sin(m) * nr;
      if (nx + ny + nz <= 0.02) continue;
      const f = nz > 0.6 ? 0.26 : ny > nx ? 0.2 : 0.065;
      const P = (a: number, r: number, z: number): V3 => [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z0 + z];
      strips.push({ d: Math.cos(m) * (ra + rb) / 2 + Math.sin(m) * (ra + rb) / 2 + (za + zb) / 2, pts: [P(a0, ra, za), P(a1, ra, za), P(a1, rb, zb), P(a0, rb, zb)], f });
    }
  }
  strips.sort((a, b) => a.d - b.d).forEach((s) => p.face(s.pts, s.f, 0));
}

const SHOULDERS: [number, number][] = [[0, 3.5], [1.6, 3.5], [3, 3.25], [4.1, 2.7], [4.9, 1.8], [5.3, 1.05], [6.2, 1]];
const HR = 2.55, HZ = 8.5; // head radius, head centre height
const HEAD: [number, number][] = Array.from({ length: 13 }, (_, i) => { const a = -Math.PI / 2 + (Math.PI * i) / 12; return [HZ + Math.sin(a) * HR, Math.max(0.001, Math.cos(a) * HR)] as [number, number]; });
const PH = 4.6, PW = 4.4; // plinth height, half width

function bust(p: Pen, cx: number, cy: number, z: number) {
  // a dark gap where the bust meets the plinth, so the two read apart
  p.disc(cx, cy, z + 0.02, SHOULDERS[0][1] + 0.5, 0, SH.edge);
  lathe(p, SHOULDERS, cx, cy, z);
  lathe(p, HEAD, cx, cy, z);
  // the chin: a cut along the lower edge of the head, where it sits on the shoulders
  const [hx, hy] = p.pt([cx, cy, z + HZ]);
  p.screen((c) => { c.strokeStyle = "#000"; c.lineWidth = 0.65; c.beginPath(); c.arc(hx, hy, HR * 1.2247, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); });
}
function plinth(p: Pen, cx: number, cy: number) {
  p.box(cx - PW, cy - PW, 0, PW * 2, PW * 2, PH, { top: 0.22, left: 0.14, right: 0.07 });
  // a lit name plate on its front, with a line of text cut out of it
  p.face([[cx - 2.8, cy + PW + 0.03, 1.2], [cx + 2.8, cy + PW + 0.03, 1.2], [cx + 2.8, cy + PW + 0.03, 3.4], [cx - 2.8, cy + PW + 0.03, 3.4]], 0.3, SH.edge, 0.6);
  p.line([[cx - 1.5, cy + PW + 0.06, 2.3], [cx + 1.5, cy + PW + 0.06, 2.3]], SH.edge, 0.6);
}

export const team: Illustration = {
  k: "team", name: "Team", title: "No team members", body: "Invite your teammates and they will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -11);
    p.scale(1.26, [0, 0, 8]);
    p.shadow(0, 0, 30, 9, 0.1);
    const L: V3 = [-9.5, 9.5, 0], M: V3 = [0, 0, 0], Rt: V3 = [9.5, -9.5, 0];
    // all three stand in a row across the screen, so none hides another
    plinth(p, L[0], L[1]); bust(p, L[0], L[1], PH);
    plinth(p, M[0], M[1]);

    // the empty spot: a dashed outline of a bust, fading as the new member arrives
    const k = 1 - Math.min(1, h * 1.8);
    if (k > 0.02) {
      const sc = 1.2247; // a ring of radius r spans r * 1.2247 to each side on screen
      p.screen((c) => {
        const [hx, hy] = p.pt([0, 0, PH + HZ]);
        const side = (sgn: number) => SHOULDERS.map(([z, r]) => { const [x, y] = p.pt([0, 0, PH + z]); return [x + sgn * r * sc, y] as [number, number]; });
        const l = side(-1), r = side(1), [bx, by] = p.pt([0, 0, PH + 0.02]);
        const outline = () => {
          c.beginPath(); l.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
          c.beginPath(); r.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
          c.beginPath(); c.ellipse(bx, by, SHOULDERS[0][1] * sc, SHOULDERS[0][1] * 0.707, 0, 0, Math.PI); c.stroke();
          c.beginPath(); c.arc(hx, hy, HR * sc, 0, Math.PI * 2); c.stroke();
        };
        // a dark bed under the dashes, so they read on the lit plinth top as well as on the dark
        c.strokeStyle = "#000"; c.lineWidth = 2; outline();
        c.strokeStyle = `rgba(255,255,255,${k})`; c.lineWidth = 0.85; c.setLineDash([1.8, 1.3]); c.lineCap = "butt"; outline();
        // a small plus in the middle of the head: the spot is open
        c.setLineDash([]); c.lineWidth = 0.8; c.lineCap = "round";
        c.beginPath(); c.moveTo(hx - 1.3, hy); c.lineTo(hx + 1.3, hy); c.moveTo(hx, hy - 1.3); c.lineTo(hx, hy + 1.3); c.stroke();
      });
    }

    // the new member rises out of the plinth, overshoots a touch and settles
    if (h > 0.01) {
      const e = Math.min(1, h * 1.15);
      const rise = (1 - e) * -14 + Math.sin(Math.min(1, e) * Math.PI) * 1.2;
      // a hatch opens in the plinth top while the figure comes up through it
      if (e < 0.97) p.disc(0, 0, PH + 0.01, 3.9 * Math.min(1, (1 - e) * 8, e * 6), 0.03, SH.edge);
      // only what is above the plinth's top shows: clip below the top's front edges
      const a = p.pt([-PW, PW, PH]), b = p.pt([PW, PW, PH]), d = p.pt([PW, -PW, PH]);
      p.screen((c) => {
        c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.lineTo(d[0], -999); c.lineTo(a[0], -999); c.closePath(); c.clip();
        bust(p, 0, 0, PH + rise);
      });
      // a little sparkle once it has arrived
      const s = Math.max(0, (h - 0.75) / 0.25);
      if (s > 0) for (let i = 0; i < 3; i++) {
        const u = (t * 0.7 + i / 3) % 1, ang = i * 2.1 + 0.4;
        p.dot([Math.cos(ang) * 4.5 + 3, -Math.cos(ang) * 4.5 - 3, PH + 6 + u * 6], 0.75 * Math.sin(u * Math.PI) * s + 0.01, 1);
      }
    }
    plinth(p, Rt[0], Rt[1]); bust(p, Rt[0], Rt[1], PH);
  },
};
