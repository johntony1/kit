// No variables set: a panel of three rows, each a name, an equals sign and an empty slot. Hover and the slots fill with values one after another.
import { SH, type Illustration } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.max(0, Math.min(1, x));
// each row: height on the panel, width of the name tab, how much of the slot its value fills
const ROWS: [number, number, number][] = [[20.2, 6.4, 0.9], [13.6, 4.6, 0.55], [7, 7.4, 0.75]];

export const envvars: Illustration = {
  k: "envvars", name: "Environment variables", title: "No variables set", body: "Add a variable and it will be available to your builds and running services.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -13);
    p.shadow(0, 1, 27, 13, 0.12);
    p.rotate("z", -0.45);
    p.box(-16, -4.5, 0, 32, 9, 2, { lw: 0.6 });
    p.box(-15, -1.6, 2, 30, 3.2, 23.5, { top: 0.22, left: 0.09, right: 0.05, lw: 0.6 });
    const fy = 1.63, X0 = -12.6, S0 = 0.6, S1 = 12.6; // the slot runs from S0 to S1
    ROWS.forEach(([z, w, fill], i) => {
      // the name: a lit tab
      p.face([[X0, fy, z - 1.7], [X0 + w, fy, z - 1.7], [X0 + w, fy, z + 1.7], [X0, fy, z + 1.7]], 0.55, 0);
      // equals
      for (const dz of [-0.75, 0.75]) p.line([[-3.6, fy, z + dz], [-1.4, fy, z + dz]], SH.edge, 0.95);
      // the slot, and the value typing into it
      p.clear([[S0, fy, z - 2], [S1, fy, z - 2], [S1, fy, z + 2], [S0, fy, z + 2]]);
      const k = ease(cl((h - i * 0.2) / 0.5));
      const x1 = S0 + 1 + (S1 - S0 - 2) * fill * k;
      if (k > 0.02) p.face([[S0 + 1, fy + 0.03, z - 1], [x1, fy + 0.03, z - 1], [x1, fy + 0.03, z + 1], [S0 + 1, fy + 0.03, z + 1]], 0.85, 0);
      // a cursor in the row being typed, blinking in the first row at rest
      const typing = k > 0 && k < 1, idle = i === 0 && h < 0.02;
      if ((typing || idle) && (idle || Math.sin(t * 9) > -0.4)) p.line([[x1 + 0.9, fy + 0.03, z - 1.1], [x1 + 0.9, fy + 0.03, z + 1.1]], SH.edge, 0.7);
    });
  },
};
