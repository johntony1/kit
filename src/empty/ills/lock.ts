// No access: a padlock. Hover and the shackle pops up and swings open while the body tips onto its corner.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 9, Y = 4.5, Z = 15; // half width, half depth, height of the body
const LX = 5.6, R = 1.7, LEG = 5; // leg centre, bar radius, straight leg length

const backOut = (h: number) => 1 + 2.4 * Math.pow(h - 1, 3) + 1.4 * Math.pow(h - 1, 2);

/** the shackle: a round bar bent into a U, standing in the y = 0 plane with its legs on the body's top.
 *  lift raises it; the left leg stays in its hole. Drawn as a tube: a dark rim, the bar, then its shine */
function shackle(p: Pen, lift: number) {
  const top = Z + LEG + lift, N = 18;
  const path: V3[] = [[LX, 0, Z + lift + 0.6], [LX, 0, top]];
  for (let i = 1; i < N; i++) { const a = (Math.PI * i) / N; path.push([Math.cos(a) * LX, 0, top + Math.sin(a) * LX]); }
  path.push([-LX, 0, top], [-LX, 0, Z + 0.6]);
  const q = path.map((v) => p.pt(v));
  p.screen((c) => {
    c.lineCap = "round"; c.lineJoin = "round";
    const stroke = (w: number, v: number, dx = 0, dy = 0) => {
      const n = Math.round(v * 255);
      c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = w;
      c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x + dx, y + dy) : c.moveTo(x + dx, y + dy))); c.stroke();
    };
    stroke(R * 2 + 1.4, 0);
    stroke(R * 2, 0.7);
    stroke(R * 0.9, 1, -0.55, -0.7);
  });
}

export const lock: Illustration = {
  k: "lock", name: "Padlock", title: "No access", body: "You don't have permission to view this yet. Ask an admin to give you access.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 21, 10, 0.12);
    // the body tips onto its right corner as the shackle springs
    p.push();
    p.rotate("y", 0.09 * Math.sin(Math.min(1, h * 1.3) * Math.PI * 0.75), [X, 0, 0]);
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { top: 0.22, left: 0.14, right: 0.065 });
    // a lit band round the top and a seam above the base
    const fy = Y + 0.03;
    p.face([[-X, fy, Z - 3.2], [X, fy, Z - 3.2], [X, fy, Z], [-X, fy, Z]], 0.3, 0);
    p.line([[-X, fy, Z - 3.2], [X, fy, Z - 3.2]], SH.edge, 0.6);
    p.line([[-X, fy, 2.2], [X, fy, 2.2]], SH.edge, 0.6);
    p.line([[X + 0.03, -Y, Z - 3.2], [X + 0.03, Y, Z - 3.2]], SH.edge, 0.6);
    // keyhole: a round hole and a slot under it, on a lit escutcheon
    p.ringV("y", [0, fy, 7.6], 3.4, 0.3, 0);
    p.ringV("y", [0, fy + 0.02, 8.4], 1.3, 0, 0);
    p.clear(Array.from({ length: 20 }, (_, i) => { const a = (Math.PI * 2 * i) / 20; return [Math.cos(a) * 1.3, fy + 0.03, 8.4 + Math.sin(a) * 1.3] as V3; }));
    p.clear([[-0.65, fy + 0.03, 8.4], [0.65, fy + 0.03, 8.4], [0.9, fy + 0.03, 5.2], [-0.9, fy + 0.03, 5.2]]);
    // the holes the shackle sits in
    for (const x of [-LX, LX]) p.disc(x, 0, Z + 0.02, 1.9, 0.02);
    if (h > 0.05) p.clear(Array.from({ length: 20 }, (_, i) => { const a = (Math.PI * 2 * i) / 20; return [LX + Math.cos(a) * 1.5, Math.sin(a) * 1.5, Z + 0.04] as V3; }));
    // the shackle: pops up with a little overshoot, then swings open around its left leg
    const lift = 5.5 * backOut(Math.min(1, h * 1.5));
    p.push();
    p.rotate("z", -Math.max(0, h - 0.4) / 0.6 * 0.95, [-LX, 0, 0]);
    shackle(p, lift);
    p.pop();
    p.pop();
  },
};
