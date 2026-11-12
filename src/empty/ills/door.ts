// No one is here: a door standing ajar in its frame. Hover and it swings wider as light spills out across the floor.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const door: Illustration = {
  k: "door", name: "Open door", title: "No one is here", body: "Invite someone in and they will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.translate(2, -5, -15);
    p.shadow(0, 4, 26, 12, 0.1);
    p.rotate("z", -0.5);
    const th = 0.42 + 0.46 * e + h * Math.sin(t * 1.4) * 0.03;
    // the doorway, dark
    p.clear([[-8.5, -1.5, 0], [8.5, -1.5, 0], [8.5, -1.5, 27.5], [-8.5, -1.5, 27.5]]);
    // the frame: two posts and the lintel
    p.box(-11, -1.5, 0, 2.5, 3, 27.5);
    p.box(8.5, -1.5, 0, 2.5, 3, 27.5);
    p.box(-11, -1.5, 27.5, 22, 3, 2.5);
    // the leaf, hinged on the left post and swinging towards us
    const Z0 = 0.3, Z1 = 27.2, W = 16.6;
    const dx = Math.cos(th), dy = Math.sin(th), nx = Math.sin(th) * 1.2, ny = -Math.cos(th) * 1.2;
    const at = (u: number, z: number, o = 0): V3 => [-8.5 + dx * u - nx * o, 1.5 + dy * u - ny * o, z];
    const E = at(W, 0), H = at(0, 0);
    // light falls out through the gap, across the floor
    if (e > 0.03) p.face([[E[0], E[1], 0.02], [8.5, 1.5, 0.02], [17, 13, 0.02], [E[0] + 6, E[1] + 12, 0.02]], 0.34 * e, 0);
    p.face([[E[0], E[1], Z0], [E[0] + nx, E[1] + ny, Z0], [E[0] + nx, E[1] + ny, Z1], [E[0], E[1], Z1]], 0.065, SH.edge, 0.5);
    p.face([[H[0], H[1], Z1], [E[0], E[1], Z1], [E[0] + nx, E[1] + ny, Z1], [H[0] + nx, H[1] + ny, Z1]], 0.2, SH.edge, 0.5);
    p.face([at(0, Z0), at(W, Z0), at(W, Z1), at(0, Z1)], 0.2, SH.edge, 0.6);
    // two panels and the knob, cut into it
    for (const [a, b] of [[3, 11.5], [15.5, 24.5]]) p.line([at(2.6, a, 0.03), at(W - 2.6, a, 0.03), at(W - 2.6, b, 0.03), at(2.6, b, 0.03), at(2.6, a, 0.03)], SH.edge, 0.6);
    p.dot(at(W - 1.6, 13.5, 0.05), 1, 0);
  },
};
