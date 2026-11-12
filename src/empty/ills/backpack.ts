// Nothing packed: a backpack buckled shut. Hover and its flap swings open and a flask and a rolled map rise out of the top.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const X = 9, Y = 6, ZT = 22; // half width, half depth, height

export const backpack: Illustration = {
  k: "backpack", name: "Backpack", title: "Nothing packed", body: "Add what you need for the trip and your packing list will fill up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const a = ease(clamp(h / 0.55)) * 2.05, up = ease(clamp((h - 0.4) / 0.6));
    p.translate(0, 0, -14);
    p.scale(1.12);
    p.shadow(0, 1, 23, 11, 0.12);
    // the flap: a top panel and a lip, hinged along the back edge
    const c = Math.cos(a), s = Math.sin(a);
    const R = (x: number, d: number, e: number): V3 => [x, -Y + d * c + e * s, ZT + d * s - e * c]; // d along the flap, e down its lip
    const flap = () => {
      const open = a > 1.2;
      p.face([R(-X - 0.4, 0, 0), R(X + 0.4, 0, 0), R(X + 0.4, 12.5, 0), R(-X - 0.4, 12.5, 0)], open ? 0.1 : 0.24, SH.edge, 0.6);
      p.face([R(-X - 0.4, 12.5, 0), R(X + 0.4, 12.5, 0), R(X + 0.4, 12.5, 5), R(-X - 0.4, 12.5, 5)], open ? 0.07 : 0.2, SH.edge, 0.6);
      if (!open) {
        p.line([R(-X - 0.4, 12.53, 0), R(X + 0.4, 12.53, 0)], SH.edge, 0.6);
        p.line([R(-X - 0.4, 12.53, 5), R(X + 0.4, 12.53, 5)], SH.edge, 0.6);
      }
    };
    // the carry handle at the back
    p.face([[-3.4, -Y, ZT], [-3.4, -Y, ZT + 3.4], [3.4, -Y, ZT + 3.4], [3.4, -Y, ZT], [2.2, -Y, ZT], [2.2, -Y, ZT + 2.2], [-2.2, -Y, ZT + 2.2], [-2.2, -Y, ZT]], 0.22, SH.edge, 0.5);
    if (a > 1.2) flap();
    // the body, a side pocket, a front pocket with a zip
    p.box(-X, -Y, 0, X * 2, Y * 2, ZT, { top: 0.22, left: 0.2, right: 0.075, lw: 0.6 });
    p.line([[-X, Y + 0.03, ZT], [X, Y + 0.03, ZT], [X + 0.03, -Y, ZT]], SH.edge, 0.6);
    p.box(X, -3.6, 1.5, 2, 7.2, 8, { top: 0.2, left: 0.14, right: 0.09 });
    p.box(-6.6, Y, 1.5, 13.2, 2.4, 10, { top: 0.26, left: 0.2, right: 0.09, lw: 0.6 });
    p.line([[-6.6, Y + 2.43, 11.5], [6.6, Y + 2.43, 11.5], [6.63, Y, 11.5]], SH.edge, 0.6);
    p.line([[-6.6, Y + 2.43, 1.5], [-6.6, Y + 2.43, 11.5]], SH.edge, 0.6);
    p.line([[-4.6, Y + 2.44, 8.8], [4.6, Y + 2.44, 8.8]], SH.edge, 0.9);
    // two straps down the front, each with a buckle
    for (const x of [-4.2, 4.2]) {
      p.line([[x, Y + 0.04, 11.8], [x, Y + 0.04, ZT]], SH.edge, 0.8);
      if (a < 0.3) p.clear([[x - 1, Y + 0.05, ZT - 6.4], [x + 1, Y + 0.05, ZT - 6.4], [x + 1, Y + 0.05, ZT - 4.6], [x - 1, Y + 0.05, ZT - 4.6]]);
    }
    if (a > 0.25) {
      // the mouth, and what comes out of it
      p.clear([[-X + 1.4, -Y + 1.4, ZT + 0.02], [X - 1.4, -Y + 1.4, ZT + 0.02], [X - 1.4, Y - 1.4, ZT + 0.02], [-X + 1.4, Y - 1.4, ZT + 0.02]]);
      if (up > 0.02) {
        p.cylinder(-3.6, -1.2, ZT, 1.5, 11 * up, { side: 0.22, top: 0.26, lw: 0.5 });
        const zf = 7.5 * up;
        p.cylinder(3, 0.8, ZT, 2.6, zf, { side: 0.2, top: 0.22, lw: 0.6 });
        if (up > 0.5) { p.cylinder(3, 0.8, ZT + zf, 1.3, 1.8 * up, { side: 0.1, top: 0.26, lw: 0.5 }); p.line(Array.from({ length: 13 }, (_, i) => { const b = -Math.PI / 4 + (i / 12) * Math.PI; return [3 + Math.cos(b) * 2.62, 0.8 + Math.sin(b) * 2.62, ZT + zf * 0.6] as V3; }), SH.edge, 0.7); }
      }
    }
    if (a <= 1.2) flap();
  },
};
