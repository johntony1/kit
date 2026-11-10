// No savings yet: a piggy bank seen side on. A coin drops through the slot on its back; the pig gives a happy little hop.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const RX = 10.5, RY = 12.5, RZ = 10; // the body: an ellipsoid, snout towards +y (the lit left side)
const ZC = 13; // height of the body's centre

/** a face's tone from its normal: lit from above, the +y side mid, the +x side dark */
const ROT = -1.87; // the pig is turned side on: its flank faces the dense left wall, its snout points right
const CR = Math.cos(ROT), SR = Math.sin(ROT);
/** a local direction to world (the turn about z) */
const world = (n: V3): V3 => [n[0] * CR - n[1] * SR, n[0] * SR + n[1] * CR, n[2]];
const toneOf = (n: V3) => { const w = world(n); return w[2] > 0.42 ? SH.top : w[1] >= w[0] ? 0.13 : SH.right; };

/** an ellipsoid drawn as small quads, back to front, each in one of the three face tones */
function blob(p: Pen, c: V3, r: V3, tone = toneOf, nu = 28, nv = 16) {
  const quads: { d: number; pts: V3[]; f: number }[] = [];
  const at = (u: number, v: number): V3 => [c[0] + r[0] * Math.cos(v) * Math.cos(u), c[1] + r[1] * Math.cos(v) * Math.sin(u), c[2] + r[2] * Math.sin(v)];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = (i / nu) * Math.PI * 2, u1 = ((i + 1) / nu) * Math.PI * 2;
    const v0 = -Math.PI / 2 + (j / nv) * Math.PI, v1 = -Math.PI / 2 + ((j + 1) / nv) * Math.PI;
    const um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
    const n: V3 = [Math.cos(vm) * Math.cos(um) / r[0], Math.cos(vm) * Math.sin(um) / r[1], Math.sin(vm) / r[2]];
    const L = Math.hypot(...n); n[0] /= L; n[1] /= L; n[2] /= L;
    const w = world(n);
    if (w[0] + w[1] + w[2] < -0.05) continue; // faces away from us
    const m = at(um, vm);
    // grow each quad a hair about its centre so neighbours overlap with no seams
    const pts = [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)].map((q) => q.map((x, k) => m[k] + (x - m[k]) * 1.12) as V3);
    const mw = world(m);
    quads.push({ d: mw[0] + mw[1] + mw[2], pts, f: tone(n) });
  }
  quads.sort((a, b) => a.d - b.d).forEach((q) => p.face(q.pts, q.f, 0));
}

export const piggy: Illustration = {
  k: "piggy", name: "Piggy bank", title: "No savings yet", body: "Set money aside and watch your savings grow right here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    // the coin: fades in above, falls (gravity), slips into the slot at u = 0.5
    const fall = Math.min(1, Math.max(0, (u - 0.12) / 0.38));
    const cz = ZC + RZ + 12 - fall * fall * 14;
    // the hop after the coin lands
    const hu = Math.max(0, (u - 0.5) / 0.3);
    const hop = hu > 0 && hu < 1 ? Math.sin(hu * Math.PI) * 2.2 : 0;
    const squash = hu > 0 && hu < 0.25 ? Math.sin((hu / 0.25) * Math.PI) * 0.06 : 0;
    p.translate(0, 2, -15);
    p.shadow(0, 0, 22 - hop * 1.5, 11 - hop * 0.7, 0.12);
    p.push();
    p.translate(0, 0, hop);
    // legs: four stubby trotters, drawn in the world frame (back to front) so their shading stays right
    const legs = ([[-6, -6.5], [6, -6.5], [-6, 6.5], [6, 6.5]] as const).map(([x, y]) => world([x, y, 0]));
    legs.sort((a, b) => a[0] + a[1] - b[0] - b[1]).forEach(([x, y]) => p.cylinder(x, y, 0, 2.4, 7, { side: 0.13, top: SH.top, edge: 0 }));
    p.rotate("z", ROT);
    // the curly tail at the back, curling out past the rump
    p.screen((c) => {
      const [x, y] = p.pt([0, -RY + 0.5, ZC + 2]);
      c.strokeStyle = "rgb(235,235,235)"; c.lineWidth = 1.2; c.lineCap = "round";
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - 2, y - 1.5, x - 4, y - 1.2);
      c.arc(x - 4.6, y - 2.6, 1.5, Math.PI * 0.4, Math.PI * -1.3, true);
      c.stroke();
    });
    // the body, squashing a touch as it lands
    blob(p, [0, 0, ZC], [RX * (1 + squash), RY * (1 + squash), RZ * (1 - squash)]);
    // the snout: a short lit drum on the front with two nostrils cut into it
    const sy = RY - 1;
    for (let i = 0; i <= 6; i++) p.ringV("y", [0, sy + i * 0.5, ZC - 1], 4.3, 0.13, 0);
    p.ringV("y", [0, sy + 3.1, ZC - 1], 4.3, 0.26, 0);
    p.dot([-1.5, sy + 3.2, ZC - 1], 1, 0);
    p.dot([1.5, sy + 3.2, ZC - 1], 1, 0);
    // eyes: two cut dots
    p.dot([-3.8, RY * 0.76, ZC + 4.2], 1.1, 0);
    // ears: two solid triangles standing on the head, side on to us, the near one outlined with cuts
    for (const x of [3.6, -3.6]) {
      const e: V3[] = [[x, 2.6, ZC + 8.4], [x, 8, ZC + 6.8], [x, 6.6, ZC + 13.4]];
      p.face(e, x < 0 ? 0.26 : 0.13, 0);
      p.line([...e, e[0]], SH.edge, 0.7);
    }
    // the coin slot on the back: a cut along the spine
    p.line([[-1, -4.2, ZC + RZ - 0.2], [-1, 3.2, ZC + RZ - 0.2]], SH.edge, 1.5);
    p.pop();
    p.rotate("z", ROT);
    // the coin, standing in the plane of the slot, clipped where it passes into the pig
    const k = Math.min(1, u / 0.1);
    if (u < 0.52) p.screen((c) => {
      const top = ZC + RZ + hop;
      const q = ([[-1, -30, top], [-1, 30, top], [-1, 30, top + 60], [-1, -30, top + 60]] as V3[]).map((v) => p.pt(v));
      c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
      for (let i = 3; i > 0; i--) p.ringV("x", [-1 + 0.35 * i, -0.5, cz], 3.6, 0.14 * k, 0);
      p.ringV("x", [-1.05, -0.5, cz], 3.6, 0.3 * k, 0);
      p.ringV("x", [-1.08, -0.5, cz], 2.3, 0, SH.edge, 0.6);
      p.line([[-1.1, -0.5, cz - 1.2], [-1.1, -0.5, cz + 1.2]], SH.edge, 0.7);
    });
    // a sparkle where it went in
    const sk = Math.max(0, 1 - Math.abs(u - 0.58) / 0.1);
    if (sk > 0) for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const r = 3 + easeInOut(Math.min(1, (u - 0.48) / 0.2)) * 4;
      p.dot([-1 + Math.sin(a) * r * 0.5, -0.5 + Math.cos(a) * r, ZC + RZ + hop + 2 + Math.sin(a) * 1.5], 0.8, sk);
    }
  },
};
