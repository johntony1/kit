// No collection yet: a wooden crate of records standing in their sleeves. Hover and one sleeve lifts out and its record slides into view.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const TALL = [17.5, 16.6, 18, 17, 17.6, 16.4]; // sleeve heights, back to front

export const vinylcrate: Illustration = {
  k: "vinylcrate", name: "Record crate", title: "No collection yet", body: "Add the records you own and start building your collection.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 0, 27, 13.5, 0.11);
    const X = 14, Y = 9.5, Z = 11;
    // the inside of the crate: the two far walls
    p.face([[-X, -Y, 0], [X, -Y, 0], [X, -Y, Z], [-X, -Y, Z]], 0.04, SH.edge, 0.5);
    p.face([[-X, -Y, 0], [-X, Y, 0], [-X, Y, Z], [-X, -Y, Z]], 0.03, SH.edge, 0.5);
    // the sleeves, back to front; the fifth one lifts and gives up its record
    const up = ease(Math.min(1, h / 0.55)), out = ease(Math.min(1, Math.max(0, (h - 0.4) / 0.6)));
    TALL.forEach((tall, i) => {
      const y = -Y + 2 + i * 2.7, pick = i === 4, z = 0.6 + (pick ? 9.5 * up : 0), lean = pick ? 0 : (i % 2 ? 0.5 : -0.4);
      if (pick && out > 0.01) {
        // the record: dark, with grooves and a bright label, turning a little as it comes
        const c: V3 = [-1 + 10.5 * out, y + 0.45, z + tall / 2 + 0.4];
        p.ringV("y", c, 8, 0.035, SH.edge, 0.55);
        p.ringV("y", [c[0], c[1] + 0.02, c[2]], 5.6, 0, 0.5, 0.35);
        p.ringV("y", [c[0], c[1] + 0.03, c[2]], 2.7, 0.5, SH.edge, 0.5);
        const a = t * 1.2 * h;
        p.dot([c[0] + Math.cos(a) * 0.1, c[1] + 0.05, c[2] + Math.sin(a) * 0.1], 0.5, 0);
      }
      p.box(-X + 1.6 + lean, y, z, X * 2 - 3.6, 0.9, tall, { top: 0.3, left: pick ? 0.24 : i % 2 ? 0.05 : 0.14, right: 0.04, lw: 0.55 });
      if (pick) { // a plain cover: a ring and a rule
        p.ringV("y", [-3, y + 0.93, z + tall - 6.5], 3.2, 0, SH.edge, 0.6);
        p.line([[3, y + 0.93, z + tall - 5], [8, y + 0.93, z + tall - 5]], SH.edge, 0.7);
        p.line([[3, y + 0.93, z + tall - 7.4], [6.5, y + 0.93, z + tall - 7.4]], SH.edge, 0.5);
      }
    });
    // the near walls: slats, and a hand hole in the front
    p.face([[-X, Y, 0], [X, Y, 0], [X, Y, Z], [-X, Y, Z]], 0.075, SH.edge, 0.65);
    p.face([[X, -Y, 0], [X, Y, 0], [X, Y, Z], [X, -Y, Z]], 0.045, SH.edge, 0.65);
    for (const z of [3.7, 7.4]) p.line([[-X, Y + 0.03, z], [X, Y + 0.03, z], [X + 0.03, -Y, z]], SH.edge, 0.5);
    p.clear([[-4, Y + 0.04, 8.2], [4, Y + 0.04, 8.2], [4, Y + 0.04, 9.9], [-4, Y + 0.04, 9.9]]);
    for (const x of [-X + 1.5, X - 1.5]) for (const z of [1.8, 5.5, 9.2]) p.dot([x, Y + 0.05, z], 0.4, 0);
  },
};
