// No organizations yet: an office block with a lower wing, every window dark. Hover and the windows light up floor by floor and a flag runs up the pole on the roof.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => 1 - Math.pow(1 - x, 3);

/** a window on a wall facing +y (plane "y") or +x (plane "x"), dark or lit */
function win(p: Pen, plane: "x" | "y", at: number, u: number, z: number, w: number, lit: boolean) {
  const pts: V3[] = plane === "y" ? [[u, at, z], [u + w, at, z], [u + w, at, z + 2.6], [u, at, z + 2.6]] : [[at, u, z], [at, u + w, z], [at, u + w, z + 2.6], [at, u, z + 2.6]];
  p.face(pts, 0.03, SH.edge, 0.45);
  if (!lit) return;
  // lit: a bright pane inside the dark frame
  const m = 0.3;
  p.face(plane === "y" ? [[u + m, at + 0.02, z + m], [u + w - m, at + 0.02, z + m], [u + w - m, at + 0.02, z + 2.6 - m], [u + m, at + 0.02, z + 2.6 - m]] : [[at + 0.02, u + m, z + m], [at + 0.02, u + w - m, z + m], [at + 0.02, u + w - m, z + 2.6 - m], [at + 0.02, u + m, z + 2.6 - m]], 0.9, 0);
}

export const org: Illustration = {
  k: "org", name: "Organization", title: "No organizations yet", body: "Create an organization to bring your teams, projects and billing under one roof.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-3.5, 0, -17);
    p.shadow(3, 0, 30, 15, 0.11);
    // how many floors are lit, from the ground up
    const lit = (row: number, n: number) => h > 0.08 + row * 0.11 + n * 0.035;
    // the tower
    p.box(-9, -7, 0, 15, 14, 28, { top: 0.22, left: 0.14, right: 0.075, lw: 0.6 });
    for (let r = 0; r < 5; r++) {
      const z = 7 + r * 4.1;
      [-7.4, -3, 1.4].forEach((x, i) => win(p, "y", 7.04, x, z, 3, lit(r + 1, i)));
      if (r >= 2) [-4.8, 0.6].forEach((y, i) => win(p, "x", 6.04, y, z, 3.2, lit(r + 1, 2 - i)));
    }
    // the door, with a step
    p.clear([[-3.6, 7.04, 0], [0.6, 7.04, 0], [0.6, 7.04, 4.8], [-3.6, 7.04, 4.8]]);
    p.line([[-1.5, 7.06, 0], [-1.5, 7.06, 4.8]], SH.edge, 0.45);
    // a plant room on the roof and the flag pole
    p.box(-6.5, -4.5, 28, 6, 5, 2.2, { top: 0.2, left: 0.12, right: 0.065 });
    const k = ease(Math.max(0, Math.min(1, (h - 0.45) / 0.5)));
    p.box(2.2, 2.2, 28, 0.8, 0.8, 9, { top: 0.3, left: 0.3, right: 0.2, edge: 0 });
    const fz = 30.5 + 4 * k, wave = h * Math.sin(t * 5) * 0.5;
    p.face([[3, 2.6, fz], [3, 2.6, fz + 2.8], [7.6, 2.6, fz + 1.4 + wave]], 0.34, SH.edge, 0.55);
    // the wing
    p.box(6, -4, 0, 10.5, 11, 13, { top: 0.22, left: 0.14, right: 0.075, lw: 0.6 });
    for (let r = 0; r < 2; r++) {
      const z = 3.2 + r * 4.6;
      [7.6, 11.8].forEach((x, i) => win(p, "y", 7.04, x, z, 3, lit(r, i + 1)));
      [-2.4, 2.4].forEach((y, i) => win(p, "x", 16.54, y, z, 3, lit(r, 3 - i)));
    }
  },
};
