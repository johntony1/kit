// Nothing labelled yet: a block sitting inside loose corner brackets. Hover and the brackets snap tight round it and a label tag pops onto the top corner.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const S = 8; // half size of the block

export const labelling: Illustration = {
  k: "labelling", name: "Labelling", title: "Nothing labelled yet", body: "Upload some data and tag what is in it to start building your training set.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 24, 12, 0.12);
    // the block, a little turned, with one face cut in two
    p.push();
    p.rotate("z", -0.18);
    p.box(-S, -S, 0, S * 2, S * 2, S * 2, { top: 0.24, left: 0.12, right: 0.065, edge: 0 });
    p.line([[-S, S + 0.03, 0.2], [-S, S + 0.03, S * 2], [S, S + 0.03, S * 2], [S + 0.03, S, 0.2]], 1, 0.5);
    p.pop();
    // brackets in the screen's plane round the block: loose and dim at rest, tight and bright on hover
    const k = ease(Math.min(1, h / 0.5));
    const at = (u: number, v: number): [number, number] => p.pt([u * 0.577, -u * 0.577, S + v]);
    const W = 14.6 + 4 * (1 - k), H = 17 + 4 * (1 - k), L = 5.5;
    p.screen((c) => {
      c.strokeStyle = `rgba(255,255,255,${0.55 + 0.45 * k})`; c.lineWidth = 1.6; c.lineCap = "round"; c.lineJoin = "round";
      for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const a = at(su * W, sv * H - sv * L), b = at(su * W, sv * H), d = at(su * W - su * L, sv * H);
        c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.stroke();
      }
    });
    // the label tag pops onto the top left corner
    const b = Math.max(0, (h - 0.5) / 0.5);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.15 : 1.15 - 0.15 * ease((b - 0.65) / 0.35);
      const u0 = -W, v0 = H + 1.4, w = 15 * pop, t = 6 * pop;
      const tag = (g: number): V3[] => {
        const pts: [number, number][] = [[u0 - g, v0 - g], [u0 + w + g, v0 - g], [u0 + w + g, v0 + t + g], [u0 - g, v0 + t + g]];
        return pts.map(([u, v]) => [u * 0.577, -u * 0.577, S + v] as V3);
      };
      p.face(tag(0.7), 0.03, 0);
      p.face(tag(0), 0.45, 0);
      p.dot([(u0 + 2.6 * pop) * 0.577, -(u0 + 2.6 * pop) * 0.577, S + v0 + t / 2], 1.1 * pop, 0);
      p.line([[(u0 + 5.4 * pop) * 0.577, -(u0 + 5.4 * pop) * 0.577, S + v0 + t / 2], [(u0 + w - 2.4 * pop) * 0.577, -(u0 + w - 2.4 * pop) * 0.577, S + v0 + t / 2]], 0, 1.1 * pop);
    }
  },
};
