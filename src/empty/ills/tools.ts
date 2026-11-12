// No tools connected: a toolbox, shut, its handle folded on the lid. Hover and the lid swings open and a spanner and a screwdriver rise out of it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 15, D = 7, BH = 11, LH = 3.6; // half width, half depth, body height, lid height

/** screen winding: > 0 when a face listed counter clockwise round its outward normal looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s > 0;
};
// a box that may be turned any way: every face that looks at us is drawn
function solid(p: Pen, x: number, y: number, z: number, X: number, Y: number, Z: number, under: number) {
  const faces: [V3[], number][] = [
    [[[x, Y, z], [X, Y, z], [X, y, z], [x, y, z]], under],
    [[[X, y, z], [X, y, Z], [x, y, Z], [x, y, z]], 0.1],
    [[[x, y, Z], [x, Y, Z], [x, Y, z], [x, y, z]], SH.right],
    [[[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]], p.ink ? SH.top : 0.06],
    [[[x, Y, z], [x, Y, Z], [X, Y, Z], [X, Y, z]], SH.left],
    [[[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]], SH.right],
  ];
  for (const [pts, fill] of faces) if (facing(p, pts)) p.face(pts, fill, SH.edge, 0.55);
}

export const tools: Illustration = {
  k: "tools", name: "Toolbox", title: "No tools connected", body: "Connect a tool and the assistant can use it to search, fetch and get work done.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 0, 28, 13, 0.12);
    p.rotate("z", -0.45);
    const a = ease(clamp(h / 0.55)) * 1.85, open = a > 0.9;
    const lid = () => {
      p.push();
      p.rotate("x", a, [0, -D, BH]);
      const handle = () => {
        p.box(-8, -1.4, BH + LH, 2.2, 2.8, 4.6, { top: 0.24, left: 0.2, lw: 0.5 }); p.box(5.8, -1.4, BH + LH, 2.2, 2.8, 4.6, { top: 0.24, left: 0.2, lw: 0.5 });
        p.box(-8, -1.4, BH + LH + 4.6, 16, 2.8, 2.2, { top: 0.24, left: 0.2, lw: 0.5 });
      };
      if (a < 0.6) { solid(p, -W, -D, BH, W, D, BH + LH, 0.045); handle(); } else solid(p, -W, -D, BH, W, D, BH + LH, 0.045);
      // the latches' upper halves, on the lid's front
      if (a < 0.6) for (const x of [-9.5, 9.5]) p.face([[x - 1.4, D + 0.03, BH + 0.4], [x + 1.4, D + 0.03, BH + 0.4], [x + 1.4, D + 0.03, BH + 2.4], [x - 1.4, D + 0.03, BH + 2.4]], 0.3, SH.edge, 0.5);
      p.pop();
    };
    if (open) lid();
    // the body: open once the lid is up
    p.box(-W, -D, 0, 2 * W, 2 * D, BH, { open: a > 0.25 });
    p.line([[-W, D + 0.03, 5.2], [W, D + 0.03, 5.2]], SH.edge, 0.45);
    for (const x of [-9.5, 9.5]) p.face([[x - 1.4, D + 0.03, BH - 2.6], [x + 1.4, D + 0.03, BH - 2.6], [x + 1.4, D + 0.03, BH - 0.4], [x - 1.4, D + 0.03, BH - 0.4]], 0.3, SH.edge, 0.5);
    // the tools: they rise from inside, so only what clears the front wall is drawn
    const k = ease(clamp((h - 0.4) / 0.6)), LO = BH - 5;
    if (k > 0.02) {
      const bob = Math.sin(t * 2.2) * 0.4 * k;
      // a spanner: a shaft and an open jaw
      const st = LO + 16 * k + bob, sx = -5.5;
      p.face([[sx - 1.1, 0, LO], [sx + 1.1, 0, LO], [sx + 1.1, 0, st], [sx - 1.1, 0, st]], 0.3, SH.edge, 0.5);
      p.ringV("y", [sx, 0, st + 1.6], 3.1, 0.3, SH.edge, 0.5);
      p.clear([[sx - 1.1, 0.02, st + 1.4], [sx + 1.1, 0.02, st + 1.4], [sx + 1.4, 0.02, st + 5.2], [sx - 1.4, 0.02, st + 5.2]]);
      // a screwdriver, handle up
      const dt = LO + 12 * k - bob, dx = 5.5;
      if (dt - 5 > LO) p.face([[dx - 0.5, 0, LO], [dx + 0.5, 0, LO], [dx + 0.5, 0, dt - 5], [dx - 0.5, 0, dt - 5]], 0.3, SH.edge, 0.4);
      p.face([[dx - 1.7, 0, Math.max(LO, dt - 5)], [dx + 1.7, 0, Math.max(LO, dt - 5)], [dx + 1.7, 0, dt + 1], [dx - 1.7, 0, dt + 1]], 0.3, SH.edge, 0.5);
      p.line([[dx, 0.02, Math.max(LO, dt - 4)], [dx, 0.02, dt]], SH.edge, 0.6);
    }
    if (!open) lid();
  },
};
