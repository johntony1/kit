// Nothing to carry: a wheelbarrow, a deep tray on one front wheel with two long handles and legs. Hover and a crate drops into the tray and bounces.
import { SH, type Illustration, type V3 } from "../dots";

// height of the crate's bottom above the tray floor: a drop, a bounce, a smaller bounce, rest
function drop(k: number) {
  if (k <= 0) return 16;
  if (k < 0.45) return 16 * (1 - Math.pow(k / 0.45, 2));
  if (k < 0.7) { const v = (k - 0.45) / 0.25; return 3.5 * 4 * v * (1 - v); }
  if (k < 0.85) { const v = (k - 0.7) / 0.15; return 1 * 4 * v * (1 - v); }
  return 0;
}
export const wheelbarrow: Illustration = {
  k: "wheelbarrow", name: "Wheelbarrow", title: "Nothing to carry", body: "Add your first item and it will be loaded in here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -10);
    p.shadow(0, 0, 30, 13, 0.12);
    p.rotate("z", -0.62);
    const bar = (y: number) => {
      p.box(-22, y - 0.8, 10.6, 14, 1.6, 1.6, { top: 0.26, left: 0.2, right: 0.12, edge: 0 }); // handle
      p.box(-24.5, y - 1.1, 10.3, 4, 2.2, 2.2, { top: 0.3, left: 0.24, right: 0.14, edge: 0 }); // grip
      p.box(-9.5, y - 0.8, 0, 1.6, 1.6, 11, { top: 0.2, left: 0.2, right: 0.1, edge: 0 }); // leg
    };
    bar(-5.5);
    // the tray: flared walls, open on top
    const T = 21, Z0 = 7;
    const top: V3[] = [[-12, -8, T], [12, -8, T], [12, 8, T], [-12, 8, T]];
    const bot: V3[] = [[-7, -6.5, Z0], [7, -6.5, Z0], [7, 6.5, Z0], [-7, 6.5, Z0]];
    p.face(top, 0.03, 0);
    p.face([top[0], top[1], bot[1], bot[0]], 0.12, 0); // inside, far wall
    p.face([top[0], top[3], bot[3], bot[0]], 0.03, 0); // inside, left wall
    p.face(bot, 0.03, 0);
    // the crate drops in
    const k = Math.min(1, h * 1.3);
    if (k > 0.01) {
      p.push();
      p.translate(0, 0, Z0 + drop(k));
      p.rotate("z", 0.15 * (1 - k));
      p.box(-5, -4, 0, 10, 8, 12, { top: 0.3, left: 0.2, right: 0.1, edge: 0 });
      p.line([[-5, 4.03, 10.5], [5, 4.03, 10.5]], SH.edge, 0.6);
      p.line([[0, -4, 12.03], [0, 4, 12.03]], SH.edge, 0.6);
      p.pop();
    }
    // the outside walls: front lit, end in shade, a bright rim
    p.face([top[3], top[2], bot[2], bot[3]], 0.2, 0);
    p.line([[-9.6, 7.35, 14.5], [9.8, 7.35, 14.5]], SH.edge, 0.6);
    p.face([top[1], top[2], bot[2], bot[1]], 0.065, 0);
    p.line([top[3], top[2], top[1]].map(([x, y, z]) => [x, y + 0.03, z] as V3), SH.edge, 0.6);
    p.face([[-12, 8.03, T], [12, 8.03, T], [12, 8.03, T - 1.6], [-12, 8.03, T - 1.6]], 0.3, 0);
    p.face([[12.03, -8, T], [12.03, 8, T], [12.03, 8, T - 1.6], [12.03, -8, T - 1.6]], 0.16, 0);
    // the wheel at the front, its fork, then the near handle
    p.box(7, -0.8, 6, 7, 1.6, 1.6, { top: 0.2, left: 0.16, right: 0.1, edge: 0 });
    p.ringV("y", [14, 1.6, 6], 6, 0.24, 0);
    p.ringV("y", [14, 1.65, 6], 3.4, 0.08, 0);
    p.ringV("y", [14, 1.7, 6], 1.2, 0.3, 0);
    p.line(Array.from({ length: 37 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return [14 + Math.cos(a) * 6, 1.62, 6 + Math.sin(a) * 6] as V3; }), SH.edge, 0.6);
    bar(5.5);
  },
};
