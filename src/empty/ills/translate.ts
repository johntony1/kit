// Nothing to translate: a thick speech bubble standing up with a letter A on it. Hover and it flips over like a card to show a second script on its back.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const T = 1.8; // half thickness
const F0 = -Math.PI / 4; // the turn at which the front looks straight at us

/** the bubble outline in its own plane (u right, v up): a rounded box with a tail at the bottom left */
const OUT: [number, number][] = (() => {
  const W = 13, B = -7, Tp = 12, r = 4.5, o: [number, number][] = [];
  const arc = (cx: number, cy: number, a0: number) => { for (let i = 0; i <= 6; i++) { const a = a0 + (i / 6) * (Math.PI / 2); o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(W - r, B + r, -Math.PI / 2); // bottom right
  arc(W - r, Tp - r, 0); // top right
  arc(-W + r, Tp - r, Math.PI / 2); // top left
  arc(-W + r, B + r, Math.PI); // bottom left
  o.push([-W + r, B], [-8.5, -13.5], [-3, B]); // the tail
  return o;
})();
const A: [number, number][][] = [[[-5, -3.5], [0, 8], [5, -3.5]], [[-2.8, 1.2], [2.8, 1.2]]];
// a second script: a dot, a bar, two crossing strokes (read from the back, so u is mirrored when drawn)
const WEN: [number, number][][] = [[[0, 8.5], [0, 7]], [[-6, 5.6], [6, 5.6]], [[-3.6, 5.6], [-1.5, 1], [2, -2.6], [6, -4.4]], [[3.6, 5.6], [1.5, 1], [-2, -2.6], [-6, -4.4]]];

export const translate: Illustration = {
  k: "translate", name: "Translate", title: "Nothing to translate", body: "Paste some text or upload a file and pick a language to translate it into.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 22, 10, 0.12);
    const e = ease(Math.min(1, h * 1.2));
    const th = F0 + Math.PI * e;
    p.translate(0, 0, 18 + 3 * Math.sin(Math.PI * e) + h * Math.sin(t * 2.4) * 0.5);
    p.rotate("z", th);
    // which way the bubble faces: the +y side looks at us when cos - sin > 0
    const front = Math.cos(th) - Math.sin(th) > 0;
    const at = (y: number) => OUT.map(([u, v]) => [u, y, v] as V3);
    // its thickness: the same outline stacked from the far side to the near one
    const s = front ? 1 : -1;
    for (let y = -T; y <= T; y += 0.35) p.face(at(-s * y), SH.right, 0);
    const y = s * T;
    p.face(at(y), 0.26, SH.edge, 0.6);
    const glyph = front ? A : WEN;
    for (const st of glyph) p.line(st.map(([u, v]) => [front ? u : -u, y + s * 0.05, v] as V3), SH.edge, 1.3);
    drawRim(p, y);
  },
};

// the outline of the near face again, a crisp cut around it
function drawRim(p: Pen, y: number) {
  p.line([...OUT, OUT[0]].map(([u, v]) => [u, y, v] as V3), SH.edge, 0.6);
}
