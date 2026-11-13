// No earrings yet: a pair of drop earrings, each a stud and a big cut teardrop gem. They swing gently out of step and the gems glint.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const L = 22, R = 7.4; // gem length, half width

// the teardrop outline in [x, z], its point at the top (z = 0)
const DROP: [number, number][] = Array.from({ length: 40 }, (_, i) => {
  const a = (i / 40) * Math.PI * 2;
  return [Math.sin(a) * Math.pow(Math.sin(a / 2), 1.3) * R, -(1 - Math.cos(a)) / 2 * L];
});

function earring(p: Pen, cx: number, ztop: number, ang: number, glint: number) {
  p.push();
  p.rotate("y", ang, [cx, 0, ztop]);
  // the stud and the little link
  p.ringV("y", [cx, 0.4, ztop], 2, 0.45, 0);
  p.dot([cx, 0.6, ztop], 0.7, 0);
  p.face([[cx - 0.5, 0.2, ztop - 1.8], [cx + 0.5, 0.2, ztop - 1.8], [cx + 0.5, 0.2, ztop - 4.2], [cx - 0.5, 0.2, ztop - 4.2]], 0.4, 0);
  const z0 = ztop - 3.6;
  const at = (y: number, s = 1): V3[] => DROP.map(([x, z]) => [cx + x * s, y, z0 + z * s + (1 - s) * -L * 0.55] as V3);
  // thickness: the gem again a step back and darker, then the bright front
  p.face(at(-1.8), 0.06, 0);
  p.face(at(0), 0.3, 0);
  // the facets: a darker right half, a bright table inset, cuts from the table out
  const right = DROP.slice(0, 21).map(([x, z]) => [cx + x, 0.03, z0 + z] as V3);
  p.face(right, 0.12, 0);
  const table = at(0.06, 0.46);
  p.face(table, 0.45, 0);
  p.line([...table, table[0]], 1, 0.8);
  // a glint high on the gem
  if (glint > 0.02) {
    const [x, y] = p.pt([cx - R * 0.5, 0.2, z0 - L * 0.45]), r = 3.4 * glint;
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.3; g.lineCap = "round";
      g.beginPath(); g.moveTo(x - r, y); g.lineTo(x + r, y); g.moveTo(x, y - r); g.lineTo(x, y + r); g.stroke();
    });
  }
  p.pop();
}

export const earrings: Illustration = {
  k: "earrings", name: "Earrings", title: "No earrings yet", body: "Earrings you save or buy will hang here, ready to wear.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = ((t / P) % 1) * Math.PI * 2;
    p.translate(0, 0, -2);
    p.shadow(0, 0, 24, 9, 0.08);
    p.translate(0, 0, 12);
    p.rotate("z", -0.62); // turned so their faces look at us
    earring(p, -8.4, 12, 0.16 * Math.sin(u), Math.max(0, Math.sin(u + 0.6)));
    earring(p, 8.4, 12, 0.16 * Math.sin(u + 2.2), Math.max(0, Math.sin(u + 2.8)));
  },
};
