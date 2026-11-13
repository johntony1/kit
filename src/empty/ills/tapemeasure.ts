// Nothing measured yet: a chunky tape measure, a rounded case with a cut bevel round its face and a belt clip, a short run of tape and its hook poking out. Hover and the tape runs out along the floor, ticks and all, and catches on its hook.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const S = 10, TH = 4.2; // half size of the case face, half thickness of the case

export const tapemeasure: Illustration = {
  k: "tapemeasure", name: "Tape measure", title: "Nothing measured yet", body: "Take your first measurement and it will be recorded here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-4, -3, -10);
    p.shadow(4, 3, 20, 9, 0.1);
    p.rotate("z", -0.5);
    // the case stands on its edge, its round cornered face toward us (+y), the tape leaving at the bottom right along +x
    const cz = S + 0.5;
    const outline = (y: number, k = 0): V3[] => {
      const pts: V3[] = [], r = 4.2 - k, s = S - k;
      const corners: [number, number, number][] = [[s - r, s - r, 0], [-(s - r), s - r, 0.5], [-(s - r), -(s - r), 1], [s - r, -(s - r), 1.5]];
      for (const [x, z, q] of corners) for (let i = 0; i <= 6; i++) { const a = (q + i / 12) * Math.PI; pts.push([x + Math.cos(a) * r, y, cz + z + Math.sin(a) * r]); }
      return pts;
    };
    // its body: the far face, then the walls between the faces, lit on top and shaded on the right
    const back = outline(-TH), front = outline(TH);
    for (let i = 0; i < front.length; i++) {
      const a = front[i], b = front[(i + 1) % front.length], c = back[(i + 1) % back.length], d = back[i];
      const nz = (a[2] + b[2]) / 2 - cz, nx = (a[0] + b[0]) / 2;
      if (nz > 2 || nx > 2) p.face([a, b, c, d], nz > Math.abs(nx) * 0.6 ? 0.26 : 0.07, 0);
    }
    // the belt clip on the far side, a lit strip
    p.face([[-6, -TH - 0.6, cz - 5], [-6, -TH - 0.6, cz + S + 0.5], [-2, -TH - 0.6, cz + S + 0.5], [-2, -TH - 0.6, cz - 5]], 0.2, 0);
    // the front face, dense, a cut bevel round it and the bright centre badge
    p.face(front, 0.22, 0);
    const inset = outline(TH + 0.03, 2.2);
    p.line([...inset, inset[0]], SH.edge, 0.7);
    p.dot([0, TH + 0.05, cz], 1.3, 0);
    // the lock button on the top
    p.box(-2.5, -1.5, cz + S - 0.2, 5, 3, 1.6, { top: 0.36, left: 0.2, right: 0.1, edge: 0 });
    // the tape: a bright strip along the floor with tick cuts, then the hook standing up at its end
    const len = 6 + 13 * ease(Math.min(1, h * 1.15)) + h * Math.sin(t * 2.5) * 0.25;
    const x0 = S - 0.5, x1 = x0 + len, w = 2.6;
    p.face([[x0, -w, 0.6], [x1, -w, 0.6], [x1, w, 0.6], [x0, w, 0.6]], 0.36, 0);
    p.face([[x0, w, 0], [x1, w, 0], [x1, w, 0.6], [x0, w, 0.6]], 0.14, 0);
    for (let x = x0 + 2; x < x1 - 0.6; x += 2) {
      const big = Math.round((x - x0) / 2) % 4 === 0;
      p.line([[x, w, 0.62], [x, big ? -0.6 : w - 1.6, 0.62]], SH.edge, big ? 0.75 : 0.6);
    }
    p.box(x1, -w - 0.4, 0, 1.1, w * 2 + 0.8, 3, { top: 0.36, left: 0.26, right: 0.12, edge: 0 });
  },
};
