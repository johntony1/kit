// This is read only: a page with an eye on it and a padlock standing in front. Hover and the eye reads along the lines while the lock shakes its head.
import { SH, type Illustration, type V3 } from "../dots";

const cl = (x: number) => Math.min(1, Math.max(0, x));
const X = 12, Y = 0.7, Z = 31, F = Y + 0.03;

export const readonly: Illustration = {
  k: "readonly", name: "Read only", title: "This is read only", body: "You can view this but not change it. Ask the owner for edit access.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(2, 4, 27, 11, 0.12);
    p.push();
    p.rotate("z", -0.42);
    const at = (x: number, z: number, d = 0): V3 => [x, F + d, z];
    p.translate(-2, -2, 0);
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { top: 0.3, left: 0.2, right: 0.08, lw: 0.8 });
    // three lines of text, cut into the page
    for (let i = 0; i < 3; i++) {
      const z = Z - 4.6 - i * 3.7;
      p.line([at(-X + 3.2, z), at(i === 2 ? 1 : X - 3.2, z)], SH.edge, 1.2);
    }
    // the eye: a dark almond, a bright iris and a pupil. It blinks once, then reads from side to side
    const blink = 1 - Math.sin(cl(h / 0.3) * Math.PI) * 0.92;
    const ez = 10.5, ew = 8.6, eh = 4.9 * blink;
    const lid = (s: number) => Array.from({ length: 17 }, (_, i) => { const u = -1 + i / 8; return at(u * ew, ez + s * eh * (1 - u * u), 0.02); });
    p.clear([...lid(1), ...lid(-1).reverse()]);
    const look = cl((h - 0.3) / 0.3) * Math.sin(t * 2.6) * 3.4;
    if (blink > 0.45) {
      p.ringV("y", at(look, ez, 0.04), 3.3, 0.9, 0);
      p.dot(at(look, ez, 0.06), 1.5, 0);
    }
    p.pop();
    // the padlock in front, shaking no
    const shake = cl((h - 0.4) / 0.4) * Math.sin(t * 11) * 0.9 * (0.5 + 0.5 * Math.sin(t * 2.2));
    p.push();
    p.translate(15.5 + shake, 8 - shake, 0);
    p.rotate("z", -0.42);
    p.scale(1.25);
    const arc = (r: number): V3[] => Array.from({ length: 13 }, (_, i) => { const a = (Math.PI * i) / 12; return [Math.cos(a) * r, 0, 9 + Math.sin(a) * (r + 0.7)] as V3; });
    p.face([[3.9, 0, 6], ...arc(3.9), [-3.9, 0, 6], [-2.2, 0, 6], ...arc(2.2).reverse(), [2.2, 0, 6]], 0.3, SH.edge, 0.6);
    p.box(-5, -2.2, 0, 10, 4.4, 7.4, { top: 0.3, left: 0.2, right: 0.065, lw: 0.8 });
    p.line([[-5, 2.23, 7.4], [5, 2.23, 7.4]], SH.edge, 0.8);
    p.dot([0, 2.25, 4.4], 1.3, 0);
    p.line([[0, 2.25, 4.4], [0, 2.25, 2.1]], SH.edge, 1);
    p.pop();
  },
};
