// No buses due: a bus shelter with a roof, a back panel, a bench inside and a round stop sign on its post. Hover and the timetable on the back panel lights up row by row and the sign glows.
import { type Illustration, type Pen, type V3 } from "../dots";

const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
const stroke = (p: Pen, pts: V3[], lw: number, a = 1) => {
  const q = pts.map((v) => p.pt(v));
  p.screen((g) => { g.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`; g.lineWidth = lw; g.lineCap = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const X0 = -11, X1 = 13, Y0 = -5, Y1 = 4, RZ = 21; // the shelter's footprint and the roof's underside
const SX = -16, SY = 2; // the sign post's foot

export const busstop: Illustration = {
  k: "busstop", name: "Bus stop", title: "No buses due", body: "Save a stop and the next buses due there will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const sign = seg(h, 0.65, 1);
    p.translate(0, 0, -14);
    p.shadow(0, 0, 32, 12, 0.12);
    // turned so its open front faces us
    p.rotate("z", -0.72);
    p.translate(-1.5, 0, 0);
    // the kerb slab it stands on
    p.box(X0 - 1, Y0 - 1, 0, X1 - X0 + 2, Y1 - Y0 + 2, 1.4, { top: 0.045, left: 0.2, right: 0.065 });
    // the back panel, its inside face toward us
    p.box(X0, Y0, 1.4, X1 - X0, 1.2, RZ - 1.4, { top: 0.24, left: 0.04, right: 0.065, lw: 0.6 });
    // its frame: a bright rail along the bottom and posts at the ends, the glass between them dark
    const G = Y0 + 1.22;
    p.face([[X0, G, 1.4], [X1, G, 1.4], [X1, G, 3.4], [X0, G, 3.4]], 0.24, 0);
    for (const x of [X0, X1 - 1.6]) p.face([[x, G, 1.4], [x + 1.6, G, 1.4], [x + 1.6, G, RZ], [x, G, RZ]], 0.24, 0);
    // a timetable on the back panel: dark at rest, lit row by row on hover
    const F = Y0 + 1.25, tx0 = X0 + 3, tx1 = X0 + 9.5, tz0 = 10, tz1 = 18;
    p.face([[tx0, F, tz0], [tx1, F, tz0], [tx1, F, tz1], [tx0, F, tz1]], 0.13 + 0.12 * seg(h, 0, 0.15), 0);
    for (let i = 0; i < 3; i++) {
      const k = seg(h, 0.05 + i * 0.18, 0.3 + i * 0.18), z = tz1 - 2 - i * 2.4;
      if (k > 0) p.line([[tx0 + 1.2, F + 0.02, z], [tx0 + 1.2 + (tx1 - tx0 - 2.4) * k * (i === 1 ? 0.6 : 1), F + 0.02, z]], 1, 1);
    }
    // the bench inside, against the back panel
    for (const x of [X0 + 12, X1 - 2.5]) p.box(x, Y0 + 1.6, 1.4, 1.4, 3.4, 5.6, { top: 0.2, left: 0.12, right: 0.065 });
    p.box(X0 + 11, Y0 + 1.2, 7, X1 - X0 - 12.5, 5, 1.6, { top: 0.32, left: 0.15, right: 0.075, lw: 0.6 });
    // the two front posts
    for (const x of [X0, X1 - 1.4]) p.box(x, Y1 - 1.4, 1.4, 1.4, 1.4, RZ - 1.4, { top: 0.24, left: 0.16, right: 0.075, lw: 0.5 });
    // the roof, overhanging
    p.box(X0 - 2, Y0 - 1.5, RZ, X1 - X0 + 4, Y1 - Y0 + 3.5, 1.8, { top: 0.26, left: 0.16, right: 0.07, lw: 0.6 });
    // the stop sign: a post at the side with a round plate facing us
    p.box(SX - 0.8, SY - 0.8, 0, 1.6, 1.6, 30, { top: 0.3, left: 0.18, right: 0.08, lw: 0.5 });
    const C: V3 = [SX, SY + 0.9, 31.5], R = 6;
    p.ringV("y", [C[0], C[1] - 0.6, C[2]], R, 0.05, 1, 0.6);
    p.ringV("y", C, R, 0.3 + 0.15 * sign, 1, 0.7);
    p.ringV("y", [C[0], C[1] + 0.02, C[2]], R - 1.3, 0.05, 0, 0);
    p.ringV("y", [C[0], C[1] + 0.04, C[2]], R - 2.3, 0.3 + 0.15 * sign, 0, 0);
    // a little bus on the plate: a dark body with two light windows
    const Y = C[1] + 0.06, [cx, , cz] = C;
    p.face([[cx - 2.4, Y, cz - 1.6], [cx + 2.4, Y, cz - 1.6], [cx + 2.4, Y, cz + 1.9], [cx - 2.4, Y, cz + 1.9]], 0.04, 0);
    for (const x of [cx - 1.9, cx + 0.3]) p.face([[x, Y + 0.02, cz + 0.2], [x + 1.6, Y + 0.02, cz + 0.2], [x + 1.6, Y + 0.02, cz + 1.3], [x, Y + 0.02, cz + 1.3]], 0.45, 0);
    if (sign > 0) stroke(p, Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [cx + Math.cos(a) * (R + 0.9), C[1], cz + Math.sin(a) * (R + 0.9)] as V3; }), 1.3, sign);
  },
};
