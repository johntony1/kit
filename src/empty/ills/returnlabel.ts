// No returns started: a shipping label standing upright, a big return arrow over a barcode, one corner peeling. Hover and the corner peels further back off its backing.
import { easeInOut, SH, type Illustration, type V3 } from "../dots";

const X0 = -10, X1 = 10, Z0 = 1, Z1 = 29; // the label's edges

export const returnlabel: Illustration = {
  k: "returnlabel", name: "Return label", title: "No returns started", body: "Start a return from any order and its label will be ready to print here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 1, 24, 10, 0.12);
    p.rotate("z", -0.55); // turned so the label faces us
    // a little foot it stands in, then the backing sheet, a darker slab
    p.box(-7, -2.5, 0, 14, 5, 2, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.box(X0 - 0.6, -1.2, Z0 - 0.6, X1 - X0 + 1.2, 1.2, Z1 - Z0 + 1.2, { top: 0.2, left: 0.065, right: 0.2, edge: 0 });
    // the label on its front, missing the corner that peels
    const f = 4 + easeInOut(h) * 6 + h * Math.sin(t * 3) * 0.3; // size of the peeled corner
    const y = 0.03, at = (x: number, z: number): V3 => [x, y, z];
    p.face([at(X0, Z0), at(X1, Z0), at(X1, Z1 - f), at(X1 - f, Z1), at(X0, Z1)], 0.22, 0);
    // a bold return arrow: a hook from the right curling back to point left
    const path: [number, number][] = [[-5.5, 21.5], [2.5, 21.5]];
    for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 - (i / 12) * Math.PI; path.push([2.5 + Math.cos(a) * 3.6, 17.9 + Math.sin(a) * 3.6]); }
    path.push([-1, 14.3]);
    p.screen((g) => {
      g.strokeStyle = "#000"; g.lineWidth = 2.3; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); path.forEach(([x, z], i) => { const [sx, sy] = p.pt(at(x, z)); if (i) g.lineTo(sx, sy); else g.moveTo(sx, sy); }); g.stroke();
      const tip = p.pt(at(-8.2, 21.5)), up = p.pt(at(-4.6, 24.6)), dn = p.pt(at(-4.6, 18.4));
      g.fillStyle = "#000"; g.beginPath(); g.moveTo(tip[0], tip[1]); g.lineTo(up[0], up[1]); g.lineTo(dn[0], dn[1]); g.closePath(); g.fill();
    });
    // a rule and the barcode under it
    p.line([at(X0 + 2, 10.8), at(X1 - 2, 10.8)], SH.edge, 0.6);
    const bars = [1, 0.5, 0.5, 1.2, 0.5, 1, 0.5, 0.5, 1.2, 0.5, 1, 0.5];
    let x = -7.2;
    for (const w of bars) { p.face([at(x, 3.5), at(x + w * 0.85, 3.5), at(x + w * 0.85, 8.8), at(x, 8.8)].map(([a, , c]) => [a, y + 0.02, c] as V3), 0.02, 0); x += w * 0.85 + 0.55; }
    // the peeled corner, folded over toward us: its dark underside
    p.face([[X1 - f, y + 0.4, Z1], [X1, y + 0.4, Z1 - f], [X1 - f, y + 0.4, Z1 - f]], 0.065, 0);
    p.line([[X1 - f, y + 0.45, Z1], [X1, y + 0.45, Z1 - f]], SH.edge, 0.6);
  },
};
