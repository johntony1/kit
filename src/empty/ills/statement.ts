// Bank statement: a statement sheet standing up, a small bank at its head and rows of entries below. Hover and the pages behind fan out while the rows light up one by one, down to the balance.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 10.5, H = 28, T = 0.6; // half width, height and thickness of a sheet

const sheet = (p: Pen, face: number) => p.box(-W, -T / 2, 0, W * 2, T, H, { top: 0.22, left: face, right: 0.04, lw: 0.55 });

export const statement: Illustration = {
  k: "statement", name: "Bank statement", title: "No statements yet", body: "Your first statement will be ready here at the end of the month.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const e = ease(clamp(h / 0.6));
    p.translate(-1.5, 0, -14);
    p.shadow(2, 0, 21, 9, 0.11);
    p.rotate("x", 0.2); // leaning back
    // the pages behind: tucked in at rest, fanned out on hover
    for (const i of [2, 1]) {
      p.push();
      p.translate(0, -1.3 * i, 0);
      p.rotate("y", (0.05 + 0.17 * e) * i, [0, 0, 0]);
      sheet(p, i === 2 ? 0.065 : 0.11);
      p.pop();
    }
    sheet(p, 0.2);
    const y = T / 2 + 0.04;
    const L = (a: [number, number], b: [number, number], s = SH.edge, lw = 0.6) => p.line([[a[0], y, a[1]], [b[0], y, b[1]]] as V3[], s, lw);
    // the bank at the head of the page: a roof, three columns and a step
    p.line([[-8.4, y, 22.6], [-3, y, 22.6], [-5.7, y, 25.4], [-8.4, y, 22.6]], SH.edge, 0.9);
    for (const x of [-7.5, -5.7, -3.9]) L([x, 21.6], [x, 19.6], SH.edge, 0.9);
    L([-8.6, 18.4], [-2.8, 18.4], SH.edge, 0.9);
    // the account lines beside it, and a rule under the head
    L([1, 24.2], [8.2, 24.2], SH.edge, 1.2);
    L([3.6, 21.2], [8.2, 21.2], SH.edge, 0.8);
    L([-8.6, 15.4], [8.2, 15.4], SH.edge, 0.6);
    // the entries write themselves in, one row after another
    [12.4, 9.4, 6.4].forEach((z, i) => {
      const k = ease(clamp((h - 0.12 - i * 0.2) / 0.26));
      if (k <= 0) return;
      const len = [7.5, 9.5, 6][i];
      L([-8.6, z], [-8.6 + len * Math.min(1, k * 1.5), z], SH.edge, 0.9);
      if (k > 0.5) L([8.2 - 3.2 * (k - 0.5) * 2, z], [8.2, z], SH.edge, 0.9);
    });
    // the balance, struck under the last row
    const k = ease(clamp((h - 0.74) / 0.24));
    if (k > 0) {
      L([8.2 - 6 * k, 4.2], [8.2, 4.2], SH.edge, 0.6);
      L([8.2 - 6 * k, 2.2], [8.2, 2.2], SH.edge, 1.5);
    }
  },
};
