// No projects: a stack of app panels. Hover and the top panel lifts off the stack, showing the layers below.
import { SH, type Illustration, type Pen } from "../dots";

const W = 11.5, D = 9.5, T = 1.3; // half width (x), half depth (y), panel thickness

// one panel of the stack, with a gap line along its near edges so the layers read apart
function panel(p: Pen, z: number, top: number) {
  p.box(-W, -D, z, W * 2, D * 2, T, { top, left: 0.12, right: 0.065 });
  p.line([[-W, D, z + T], [W, D, z + T], [W, -D, z + T]], SH.edge, 0.5);
}

// a lit panel with its outline cut around it, so it reads in every style
function rect(p: Pen, x0: number, y0: number, x1: number, y1: number, z: number, fill: number) {
  p.face([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], fill, SH.edge, 0.55);
  if (!p.ink) p.line([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [x0, y0, z]], SH.edge, 0.6);
}

export const projects: Illustration = {
  k: "projects", name: "Project stack", title: "No projects yet", body: "Create a project and it will sit on top of this stack.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -12);
    p.shadow(0, 0, 30, 14, 0.12);
    for (let i = 0; i < 4; i++) panel(p, i * (T + 0.5), 0.15);
    const base = 4 * (T + 0.5);
    const lift = h * 8 + h * Math.sin(t * 2.4) * 0.6;
    const z = base + lift;
    // dashed drops from the lifted panel's corners to the stack
    if (lift > 0.4) {
      p.guide([[-W, D, base], [-W, D, z]]);
      p.guide([[W, D, base], [W, D, z]]);
      p.guide([[W, -D, base], [W, -D, z]]);
    }
    panel(p, z, 0.22);
    const Z = z + T + 0.02;
    // the app on the top panel: a window card with a title and lines of text
    rect(p, -8.5, -7, 5.5, 1.5, Z, 0.2);
    p.dot([-6.8, -5.4, Z], 0.9, 0);
    p.line([[-6.8, -2.8, Z], [3, -2.8, Z]], SH.edge, 0.9);
    p.line([[-6.8, -0.6, Z], [0, -0.6, Z]], SH.edge, 0.6);
    // a row of tabs along the front, the last one picked
    for (let i = 0; i < 4; i++) {
      const x = -8.5 + i * 3.2;
      rect(p, x, 3.6, x + 2.2, 5.8, Z, i === 3 ? 0.34 : 0.2);
      if (i === 3 && !p.ink) p.line([[x + 0.7, 4.7, Z], [x + 1.5, 4.7, Z]], SH.edge, 0.8);
    }
    p.line([[5, 6.6, Z], [9.5, 6.6, Z]], SH.edge, 0.55);
  },
};
