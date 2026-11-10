// Link expired: a desk calendar on its stand. Hover and the top page lifts up over the rings, showing the date underneath crossed out.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 12, Z0 = 4, Z1 = 31, HZ = 25.5, Y = 1.4; // half width, bottom and top of the card, under the header, the page plane

/** the grid of days on a page at plane y: rows of little cells, cut as lines */
function grid(p: Pen, y: number, mark: boolean) {
  for (let r = 0; r <= 4; r++) p.line([[-X + 2, y, 7 + r * 4], [X - 2, y, 7 + r * 4]], SH.edge, 0.55);
  for (let c = 0; c <= 5; c++) { const x = -X + 2 + (c * (2 * X - 4)) / 5; p.line([[x, y, 7], [x, y, 23]], SH.edge, 0.55); }
  if (!mark) return;
  // the cross: two bright bars over the whole month
  const bar = (a: V3, b: V3) => {
    const w = 1.3, dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz), nx = (-dz / L) * w, nz = (dx / L) * w;
    const q: V3[] = [[a[0] + nx, y + 0.05, a[2] + nz], [b[0] + nx, y + 0.05, b[2] + nz], [b[0] - nx, y + 0.05, b[2] - nz], [a[0] - nx, y + 0.05, a[2] - nz]];
    p.face(q, 1, SH.edge, 0.6);
    if (!p.ink) p.line([...q, q[0]], SH.edge, 0.7); // the dot styles show no face outlines
  };
  bar([-6.5, y, 21.5], [6.5, y, 8.5]);
  bar([-6.5, y, 8.5], [6.5, y, 21.5]);
}

export const expired: Illustration = {
  k: "expired", name: "Expired", title: "This link has expired", body: "Links stay open for seven days. Ask for a new one to get back in.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -14);
    // turned toward us, so the page reads nearly square on
    p.rotate("z", -0.45);
    p.shadow(0, 0, 32, 13, 0.12);
    // the stand: a low wedge the card leans in
    p.box(-X - 1.5, -4.5, 0, X * 2 + 3, 7.5, Z0, { top: SH.top, left: SH.left, right: SH.right });
    p.line([[-X - 1.5, 3.05, Z0 - 1.4], [X + 1.5, 3.05, Z0 - 1.4]], SH.edge, 0.55);
    p.push();
    p.rotate("x", -0.12, [0, 0, Z0]);
    // the card: its edge on top, the page facing us, the thin side on the right
    p.box(-X, -0.4, Z0, X * 2, Y + 0.4, Z1 - Z0, { top: SH.top, left: 0.22, right: SH.right });
    // the header band with its two binding rings
    p.face([[-X, Y + 0.02, HZ], [X, Y + 0.02, HZ], [X, Y + 0.02, Z1], [-X, Y + 0.02, Z1]], 0.12, SH.edge, 0.6);
    for (const x of [-X + 5, X - 5]) {
      p.ringV("x", [x, Y - 0.2, Z1], 1.8, 0, SH.edge, 0.9);
      p.dot([x, Y + 0.05, Z1 - 1.8], 0.9, 0.02);
    }
    p.line([[-4, Y + 0.05, HZ + 2.8], [4, Y + 0.05, HZ + 2.8]], SH.edge, 0.9);
    // the page underneath: the month, crossed out
    grid(p, Y + 0.03, true);
    // the top page, hinged under the header, lifting up and over toward us
    const a = h * 2.75;
    if (a > 0.04) p.guide([[-X, Y, Z0], [X, Y, Z0]], true);
    p.push();
    p.rotate("x", a, [0, Y + 0.1, HZ]);
    const back = a > Math.PI / 2;
    p.face([[-X + 0.3, Y + 0.1, Z0 + 0.4], [X - 0.3, Y + 0.1, Z0 + 0.4], [X - 0.3, Y + 0.1, HZ], [-X + 0.3, Y + 0.1, HZ]], back ? 0.12 : 0.22, SH.edge, 0.6);
    if (!back) {
      grid(p, Y + 0.13, false);
      // today, ringed: the day the link ran out
      p.face([[3.6, Y + 0.15, 15.3], [6.8, Y + 0.15, 15.3], [6.8, Y + 0.15, 18.7], [3.6, Y + 0.15, 18.7]], 0.02, SH.edge, 0.55);
    }
    p.pop();
    p.pop();
  },
};
