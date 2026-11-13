// Nothing locked away: a sturdy metal cash box, closed, with a carry handle on top and a big lit keyhole plate on the front. Hover and the lid lifts a little on its hinge and a stack of coins inside rises and glints.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const X = 13, Y = 7.5, H = 12, L = 3.6; // half length, half depth, body height, lid height

// a short stack of coins inside the box: lit faces with dark cuts between them, a four point glint over it
function coins(p: Pen, z: number, glint: number) {
  p.cylinder(0, 0, z - 6, 3.6, 6, { side: 0.2, top: 0.32, edge: 0 });
  for (const dz of [-4.2, -2.4]) p.line(Array.from({ length: 21 }, (_, i) => { const u = -Math.PI / 4 + (i / 20) * Math.PI; return [Math.cos(u) * 3.62, Math.sin(u) * 3.62, z + dz] as V3; }), SH.edge, 0.6);
  if (glint <= 0) return;
  const [x, y] = p.pt([0, 0, z + 2.6]), s = 2.6 * glint;
  p.screen((g) => {
    g.strokeStyle = "#fff"; g.lineWidth = 1.2; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x, y - s); g.lineTo(x, y + s); g.stroke();
  });
}

export const lockbox: Illustration = {
  k: "lockbox", name: "Lockbox", title: "Nothing locked away", body: "Put money aside here and it stays out of your everyday balance until you need it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p: Pen, t, h) {
    const k = ease(clamp(h / 0.6)), a = 0.36 * k + h * Math.sin(t * 2.4) * 0.02;
    const glint = clamp((h - 0.55) / 0.3) * (0.75 + 0.25 * Math.sin(t * 5));
    p.translate(0, 0, -13);
    p.shadow(0, 0, 28, 12, 0.12);
    p.rotate("z", -0.62);
    // the body: the dark inside shows only once the lid lifts, with a stack of coins in it
    p.face([[-X, -Y, H], [X, -Y, H], [X, Y, H], [-X, Y, H]], 0.03, 0);
    if (k > 0.05) coins(p, H - 2 + 3.5 * k, glint);
    p.face([[-X, Y, 0], [X, Y, 0], [X, Y, H], [-X, Y, H]], 0.065, 0);
    p.face([[X, -Y, 0], [X, Y, 0], [X, Y, H], [X, -Y, H]], 0.05, 0);
    p.line([[-X, Y + 0.03, 1.6], [X, Y + 0.03, 1.6], [X + 0.03, -Y, 1.6]], SH.edge, 0.7);
    // the keyhole plate on the front: big and lit, a dark keyhole cut through it
    const f = Y + 0.04;
    p.face([[-4.6, f, 2.8], [4.6, f, 2.8], [4.6, f, 10], [-4.6, f, 10]], 0.3, 0);
    p.ringV("y", [0, f + 0.02, 7.4], 1.5, 0, 0);
    p.clear([[-0.7, f + 0.03, 7.2], [0.7, f + 0.03, 7.2], [1.1, f + 0.03, 4.4], [-1.1, f + 0.03, 4.4]]);
    p.clear(Array.from({ length: 16 }, (_, i) => { const u = (i / 16) * Math.PI * 2; return [Math.cos(u) * 1.4, f + 0.03, 7.4 + Math.sin(u) * 1.4] as V3; }));
    // the lid, hinged along the back edge, with the carry handle on top
    p.push();
    p.rotate("x", a, [0, -Y - 0.5, H]);
    p.box(-X - 0.5, -Y - 0.5, H, X * 2 + 1, Y * 2 + 1, L, { top: 0.22, left: 0.14, right: 0.065, edge: 0 });
    p.line([[-X - 0.5, Y + 0.55, H + L], [X + 0.5, Y + 0.55, H + L], [X + 0.53, -Y - 0.5, H + L]], SH.edge, 0.7);
    // the handle: a bright bent bar with a dark rim, so it stands off the lit lid
    const zt = H + L, hp = [[-7, 0, zt], [-7, 0, zt + 4.6], [7, 0, zt + 4.6], [7, 0, zt]].map((v) => p.pt(v as V3));
    p.box(-8.4, -1.4, zt, 2.8, 2.8, 0.9, { top: 0.32, left: 0.2, right: 0.1, edge: 0 });
    p.box(5.6, -1.4, zt, 2.8, 2.8, 0.9, { top: 0.32, left: 0.2, right: 0.1, edge: 0 });
    p.screen((g) => {
      g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); hp.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.strokeStyle = "#000"; g.lineWidth = 4; g.stroke();
      g.strokeStyle = "#fff"; g.lineWidth = 1.8; g.stroke();
    });
    p.pop();
    // the seam where the lid closes over the body, cut in
    p.line([[-X, Y + 0.06, H], [X, Y + 0.06, H], [X + 0.06, -Y, H]], SH.edge, 0.8);
  },
};
