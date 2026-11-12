// No fields yet: a form with two fields, an empty slot and a dim button. Hover and a new field drops into the slot with a bounce, and the button lights up.
import { SH, type Illustration, type Pen } from "../dots";

const X = 13, Y = 17, T = 2.4, Z = T + 0.03;

/** a field printed on the form: a label and a sunken input */
function field(p: Pen, y: number, label: number) {
  p.line([[-9.5, y, Z], [-9.5 + label, y, Z]], SH.edge, 0.9);
  p.face([[-9.5, y + 1.6, Z], [9.5, y + 1.6, Z], [9.5, y + 5.4, Z], [-9.5, y + 5.4, Z]], 0.03, SH.edge, 0.55);
}
// height above the slot: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k < 0.5) return 17 * (1 - Math.pow(k / 0.5, 2));
  if (k < 0.78) { const v = (k - 0.5) / 0.28; return 3 * 4 * v * (1 - v); }
  if (k < 0.92) { const v = (k - 0.78) / 0.14; return 0.9 * 4 * v * (1 - v); }
  return 0;
}

export const form: Illustration = {
  k: "form", name: "Form builder", title: "No fields yet", body: "Drag a field onto the form to start building. You can reorder them at any time.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -4);
    p.shadow(0, 0, 42, 21, 0.11);
    p.box(-X, -Y, 0, X * 2, Y * 2, T, { top: 0.21, left: 0.13, right: 0.065, lw: 0.6 });
    field(p, -13.6, 6);
    field(p, -6.2, 8.5);
    // the empty slot, and the button: dim until the form has its new field
    p.guide([[-9.5, 2.8, Z], [9.5, 2.8, Z], [9.5, 6.6, Z], [-9.5, 6.6, Z], [-9.5, 2.8, Z]], true);
    const done = h > 0.8;
    p.box(-9.5, 10, T, 9, 4, done ? 1.1 : 0.5, { top: done ? 0.34 : 0.045, left: 0.13, right: 0.065 });
    p.line([[-7.4, 12, Z + (done ? 1.1 : 0.5)], [-2.6, 12, Z + (done ? 1.1 : 0.5)]], SH.edge, 0.8);
    // the new field: a raised block with a sunken input and its label, falling into the slot
    const k = Math.min(1, h / 0.82);
    if (k > 0.02) {
      const z = T + drop(k), s = Math.min(1, k * 5);
      if (drop(k) > 0.5) for (const [x, y] of [[-9.5, 6.6], [9.5, 6.6], [9.5, 2.8]]) p.guide([[x, y, z], [x, y, Z]]);
      p.push(); p.scale(s, [0, 4.7, z]);
      p.box(-9.9, 0.4, z, 19.8, 6.6, 1.3, { top: 0.3, left: 0.16, right: 0.09, lw: 0.6 });
      p.line([[-8.6, 1.5, z + 1.33], [-2, 1.5, z + 1.33]], SH.edge, 0.9);
      p.face([[-8.8, 2.9, z + 1.33], [8.8, 2.9, z + 1.33], [8.8, 6.2, z + 1.33], [-8.8, 6.2, z + 1.33]], 0.03, SH.edge, 0.5);
      p.pop();
    }
  },
};
