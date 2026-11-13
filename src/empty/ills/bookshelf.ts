// Your shelf is empty: a short two shelf bookcase, a few fat books standing on the bottom shelf with one leaning, the top shelf bare. Hover and a new book slides onto the top shelf; a plus badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// a book standing on a shelf: a lit top, a bright spine facing us with one band cut across it, a sparse side
function book(p: Pen, x: number, z: number, w: number, hgt: number, spine: number) {
  p.box(x, -2, z, w, 6.5, hgt, { top: 0.12, left: spine, right: 0.04, edge: 0 });
  p.line([[x + 0.3, 4.55, z + hgt * 0.78], [x + w - 0.3, 4.55, z + hgt * 0.78]], 1, 0.7);
}

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const bookshelf: Illustration = {
  k: "bookshelf", name: "Bookshelf", title: "Your shelf is empty", body: "Save books and articles and they will line up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 1, 30, 13, 0.12);
    p.rotate("z", -0.68);
    const W = 14, Z = 28; // half width, height
    // the back of the case: black, so the shelves read as open
    p.clear([[-W, -5, 0], [W, -5, 0], [W, -5, Z], [-W, -5, Z]]);
    p.box(-W, -5, 0, 2, 10, Z, { top: 0.24, left: 0.2, right: 0.03, edge: 0 }); // left side
    p.box(-W + 2, -5, 0, W * 2 - 4, 10, 2.2, { top: 0.03, left: 0.24, right: 0.065, edge: 0 }); // the plinth
    // the bottom shelf's books: three fat ones upright, one leaning on them, a gap
    book(p, -11.4, 2.2, 3.6, 10.6, 0.3);
    book(p, -7, 2.2, 4.2, 9.2, 0.22);
    book(p, -2.2, 2.2, 3.2, 11, 0.3);
    p.push();
    p.rotate("y", 0.45, [1.6, 0, 2.2]);
    book(p, 1.6, 2.2, 3.2, 10.4, 0.22);
    p.pop();
    // the middle shelf
    p.box(-W + 2, -5, 14, W * 2 - 4, 10, 2, { top: 0.03, left: 0.26, right: 0.065, edge: 0 });
    // the new book slides in from the right onto the bare top shelf
    if (h > 0.01) {
      const k = ease(Math.min(1, h * 1.4));
      p.push();
      p.translate((1 - k) * 9, 0, 0);
      book(p, -3, 16, 4, 10, 0.26);
      p.pop();
    }
    // the top and the right side
    p.box(-W, -5, Z - 2, W * 2, 10, 2, { top: 0.24, left: 0.26, right: 0.065, edge: 0 });
    p.box(W - 2, -5, 0, 2, 10, Z - 2, { top: 0.24, left: 0.2, right: 0.065, edge: 0 });
    const b = Math.max(0, (h - 0.68) / 0.32);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [W - 2, 5, Z + 1], 4.4 * pop);
    }
  },
};
