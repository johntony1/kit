// Fries: a tapered carton with four straight fries of different heights. Hover and the fries hop in a wave.
import { type Illustration, type V3 } from "../dots";

const D = 3.2, N = 16; // half the carton's depth, steps along its curved lips

export const fries: Illustration = {
  k: "fries", name: "Fries", title: "No sides added", body: "Add a side to your order and it will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -19);
    p.shadow(0, 0, 20, 9, 0.11);
    p.rotate("z", -0.5); // turned so its front faces us
    // the back panel, taller, with an arched top
    const bk: V3[] = [[-8, -D, 0], [8, -D, 0]];
    for (let i = 0; i <= N; i++) { const a = (i / N) * Math.PI; bk.push([12 * Math.cos(a), -D, 21 + 3 * Math.sin(a)]); }
    p.face(bk, 0.05, 0);
    // four fat fries, clearly apart, each a different height
    const fr: [number, number, number][] = [[-7.5, 31, -0.12], [-2.5, 36, -0.04], [2.5, 28.5, 0.04], [7.5, 33.5, 0.12]];
    fr.forEach(([x, top, tilt], i) => {
      const lift = h * (0.8 + 2.6 * Math.max(0, Math.sin(t * 5 - i * 1.1)));
      p.push();
      p.rotate("y", tilt, [x, 0, 8]);
      p.box(x - 1.6, -1.6, 8 + lift, 3.2, 3.2, top - 8, { top: 0.3, left: 0.22, right: 0.07, edge: 0 });
      p.pop();
    });
    // the carton's side and its front with a scooped lip
    p.face([[8, D, 0], [8, -D, 0], [12, -D, 21], [11.5, D, 19]], 0.06, 0);
    const lip: V3[] = Array.from({ length: N + 1 }, (_, i) => { const a = (i / N) * Math.PI; return [11.5 * Math.cos(a), D, 19 - 3.8 * Math.sin(a)] as V3; });
    p.face([[-8, D, 0], [8, D, 0], ...lip], 0.16, 0);
    p.line(lip.map(([x, y, z]) => [x, y + 0.03, z] as V3), 1, 0.9);
    // a round mark on the front
    p.line(Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [Math.cos(a) * 3.2, D + 0.03, 7 + Math.sin(a) * 3.2] as V3; }), 1, 0.85);
  },
};
