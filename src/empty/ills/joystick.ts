// Joystick: an arcade stick on a chunky base with two round buttons. The stick circles its gate and the buttons press in turn.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3; // seconds per circle of the stick
const TOP = 7; // the top of the base
const SX = -4, SY = -3; // where the stick stands

/** a strip between two points that always faces the viewer */
function rod(p: Pen, a: V3, b: V3, w: number, fill: number) {
  const [ax, ay] = p.pt(a), [bx, by] = p.pt(b), l = Math.hypot(bx - ax, by - ay) || 1;
  const nx = (-(by - ay) / l) * w * 0.5, ny = ((bx - ax) / l) * w * 0.5;
  const o = (q: V3, s: number): V3 => [q[0] + (s * nx) / 1.732, q[1] - (s * nx) / 1.732, q[2] - s * ny];
  p.face([o(a, 1), o(b, 1), o(b, -1), o(a, -1)], fill, 0);
}
const circ = (x: number, y: number, z: number, r: number): V3[] => Array.from({ length: 32 }, (_, i) => [x + Math.cos((i / 32) * Math.PI * 2) * r, y + Math.sin((i / 32) * Math.PI * 2) * r, z] as V3);
/** a ball: a circle facing the viewer */
const ball = (c: V3, r: number): V3[] => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2, k = (Math.cos(a) * r) / 1.732; return [c[0] + k, c[1] - k, c[2] + Math.sin(a) * r] as V3; });

export const joystick: Illustration = {
  k: "joystick", name: "Joystick", title: "No players yet", body: "Invite someone to play and they will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, ang = u * Math.PI * 2;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 32, 16, 0.12);
    p.box(-14, -12, 0, 28, 24, 1.6, { top: 0.2, left: 0.16, right: 0.08 });
    p.box(-13, -11, 1.6, 26, 22, TOP - 1.6, { top: 0.2, left: 0.12, right: 0.065 });
    // two buttons, pressed one after the other
    ([[7.5, -5, 0], [5, 4.5, 0.5]] as [number, number, number][]).forEach(([x, y, ph]) => {
      const down = Math.max(0, Math.sin((u * 2 + ph) * Math.PI * 2)) ** 2;
      p.clear(circ(x, y, TOP + 0.02, 3.9));
      p.cylinder(x, y, TOP + 0.5, 2.7, 1.5 - 1.1 * down, { side: 0.2, top: 0.3 + 0.5 * down, edge: 1 });
    });
    // the stick: a collar, a shaft leaning round its gate, a ball on top
    p.clear(circ(SX, SY, TOP + 0.02, 4.6));
    const tilt = 0.4, L = 15;
    const tip: V3 = [SX + Math.sin(tilt) * Math.cos(ang) * L, SY + Math.sin(tilt) * Math.sin(ang) * L, TOP + 1 + Math.cos(tilt) * L];
    rod(p, [SX, SY, TOP], tip, 2.2, 0.3);
    p.face(ball(tip, 5), 0.34, 1, 0.7);
    p.dot([tip[0] - 0.9, tip[1] + 0.9, tip[2] + 2], 1.1, 1);
  },
};
