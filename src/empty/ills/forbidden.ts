// No access: a round no entry sign on a post with a weighted base. Hover and the sign is knocked, wobbling on its post before it settles.
import { SH, type Illustration, type V3 } from "../dots";

const R = 11, ZC = 27; // the sign's radius and the height of its centre

export const forbidden: Illustration = {
  k: "forbidden", name: "No entry", title: "You don't have access", body: "Ask an admin of this workspace to invite you, then try again.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 18, 9, 0.12);
    // a dashed keep out ring on the floor, in the line style
    p.guide(Array.from({ length: 49 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return [Math.cos(a) * 10.5, Math.sin(a) * 10.5, 0] as V3; }));
    // the weighted base and the post
    p.cylinder(0, 0, 0, 7, 2.6, { top: SH.top, side: SH.left });
    p.cylinder(0, 0, 2.6, 4.2, 1.2, { top: 0.24, side: SH.left });
    p.box(-1, -1, 3.8, 2, 2, ZC - 6, { top: 0.25, left: SH.left, right: SH.right });
    // a wobble every 1.8 s while hovered, dying away
    const u = (t % 1.8) / 1.8, env = h * Math.exp(-2.6 * u);
    const yaw = 0.55 * env * Math.sin(Math.PI * 2 * 2.5 * u);
    p.push();
    // the sign turns to face us square on
    p.rotate("z", yaw - Math.PI / 4, [0, 0, 0]);
    p.rotate("x", 0.12 * env * Math.sin(Math.PI * 2 * 2.5 * u - 0.8), [0, 0, ZC - R]);
    // the clamp on the post, then the disc: a dark rim behind, the lit face in front
    p.box(-1.6, -0.2, ZC - 3, 3.2, 1.5, 6, { top: 0.25, left: 0.16, right: SH.right });
    p.ringV("y", [0.6, 1.1, ZC + 0.3], R, SH.right, SH.edge, 0.55);
    p.ringV("y", [0, 2.5, ZC], R, SH.top, SH.edge, 0.6);
    // an inner rim, cut into the face
    p.ringV("y", [0, 2.52, ZC], R - 1.6, 0, SH.edge, 0.55);
    // the bar across: the one bright mark
    const bar: V3[] = [[-6.5, 2.56, ZC - 1.8], [6.5, 2.56, ZC - 1.8], [6.5, 2.56, ZC + 1.8], [-6.5, 2.56, ZC + 1.8]];
    p.face(bar, 1, SH.edge, 0.7);
    // the dot styles show no face outlines: cut the bar's edge in as a gap
    if (!p.ink) p.line([...bar, bar[0]], SH.edge, 1);
    p.pop();
  },
};
