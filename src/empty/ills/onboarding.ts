// Nothing set up yet: a front door left ajar in a short wall, light showing through, a welcome mat in front. Hover and the door swings open and the light spills out over the mat.
import { SH, type Illustration, type V3 } from "../dots";

// the wall stands in the plane x = 0 and faces +x (down right on screen); it runs back to x = -WT
const WY = 12.5, WT = 2, WH = 28; // wall half length (y), thickness, height
const DY = 5.5, DH = 17; // doorway half width, height
const L = DY * 2 - 0.2; // the door leaf's width

export const onboarding: Illustration = {
  k: "onboarding", name: "Welcome", title: "Let's get you set up", body: "Take the first step and everything you set up will appear here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-3.5, 0, -12);
    p.scale(1.08, [0, 0, 10]);
    p.shadow(4, -7, 15, 8, 0.1); p.shadow(4, 7, 15, 8, 0.1);
    const a = 0.3 + 1.12 * h + h * Math.sin(t * 1.8) * 0.03; // how far the door is open, swinging in
    // the light inside, seen through the doorway
    p.face([[-WT, -DY, 0], [-WT, DY, 0], [-WT, DY, DH], [-WT, -DY, DH]], 0.32, SH.edge, 0.6);
    // the door leaf: hinged at the far side of the doorway, swinging into the room
    const hx = -WT, hy = -DY, dx = -Math.sin(a), dy = Math.cos(a);
    const nx = Math.cos(a), ny = Math.sin(a); // the face toward the doorway
    const T = 0.8, ex = hx + dx * L, ey = hy + dy * L;
    if (dx + dy > 0) p.face([[ex, ey, 0.1], [ex + nx * T, ey + ny * T, 0.1], [ex + nx * T, ey + ny * T, DH - 0.2], [ex, ey, DH - 0.2]], 0.07, SH.edge, 0.55);
    const at = (u: number, z: number): V3 => [hx + dx * u + nx * (T + 0.03), hy + dy * u + ny * (T + 0.03), z];
    p.face([at(0, 0.1), at(L, 0.1), at(L, DH - 0.2), at(0, DH - 0.2)], 0.14, SH.edge, 0.6);
    // two panels and a knob
    for (const [z0, z1] of [[2, 7.4], [9.2, 15]]) p.line([at(1.7, z0), at(L - 1.7, z0), at(L - 1.7, z1), at(1.7, z1), at(1.7, z0)], SH.edge, 0.65);
    p.dot(at(L - 1.3, 8.3), 0.75, 1);
    // the jamb on the far side, inside the doorway
    p.face([[-WT, -DY, 0], [0, -DY, 0], [0, -DY, DH], [-WT, -DY, DH]], 0.13, SH.edge, 0.55);
    // the wall: its top, its near end, and its front with the doorway cut out
    p.face([[-WT, -WY, WH], [0, -WY, WH], [0, WY, WH], [-WT, WY, WH]], 0.22, SH.edge, 0.6);
    p.face([[-WT, WY, 0], [0, WY, 0], [0, WY, WH], [-WT, WY, WH]], 0.13, SH.edge, 0.6);
    p.face([[0, -WY, 0], [0, -DY, 0], [0, -DY, DH], [0, DY, DH], [0, DY, 0], [0, WY, 0], [0, WY, WH], [0, -WY, WH]], SH.right, SH.edge, 0.6);
    // a lamp over the door and a house number plate beside it
    p.box(0, -1.3, DH + 2.6, 1.4, 2.6, 2.6, { top: 0.22, left: 0.24, right: 0.13, lw: 0.55 });
    p.face([[0.03, DY + 2, 10], [0.03, DY + 5, 10], [0.03, DY + 5, 13], [0.03, DY + 2, 13]], 0.24, SH.edge, 0.55);
    p.line([[0.06, DY + 3.5, 10.8], [0.06, DY + 3.5, 12.2]], SH.edge, 0.7);
    // the light spilling out over the ground, longer as the door opens
    const k = Math.sin(a);
    const sp = 3 + 8.5 * k, wd = 2.5 * k;
    p.face([[0.02, -DY, 0.01], [0.02, DY, 0.01], [sp, DY + wd, 0.01], [sp, -DY + wd * 0.2, 0.01]], 0.14, 0);
    // the welcome mat, with a border and a word cut into it
    p.box(3, -5, 0, 7.5, 10, 0.6, { top: 0.24, left: 0.13, right: 0.07, lw: 0.55 });
    const zt = 0.62;
    p.line([[4, -4, zt], [9.5, -4, zt], [9.5, 4, zt], [4, 4, zt], [4, -4, zt]], SH.edge, 0.6);
    p.line([[6.1, -2.4, zt], [6.1, 2.4, zt]], SH.edge, 0.9);
    p.line([[7.6, -1.4, zt], [7.6, 1.4, zt]], SH.edge, 0.6);
    // a dashed path from the mat to the doorway (line style only)
    p.guide([[3, 0, 0.02], [0.4, 0, 0.02]], true);
    // sparkles drifting in the light once it is open
    const s = Math.max(0, (h - 0.5) / 0.5);
    if (s > 0) ([[2, 3, 13], [1.5, -3.5, 7], [6, 6, 5]] as V3[]).forEach((q, i) => p.dot([q[0], q[1], q[2] + Math.sin(t * 1.6 + i * 2) * 0.8], 0.5 + 0.2 * Math.sin(t * 3 + i * 2), s));
  },
};
