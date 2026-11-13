// No mains yet: a thick T bone steak, a bright T shaped bone through it and dark grill stripes across the meat. Hover and it sizzles: the steak hops and wisps of steam curl up.
import { SH, type Illustration, type V3 } from "../dots";

type P2 = [number, number];
const seg = (h: number, a: number, b: number) => Math.min(1, Math.max(0, (h - a) / (b - a)));
// the outline: round on the left, flat along the right where the bone's bar runs, the strip side bigger than the fillet side
const shape = (k: number): P2[] => Array.from({ length: 60 }, (_, i) => {
  const a = (i / 60) * Math.PI * 2, s = Math.sin(a);
  return [Math.min(8.6, -1.5 + Math.cos(a) * 14 * k), s * (s > 0 ? 12.5 : 9.5) * k] as P2;
});
const OUT = shape(1), MEAT = shape(0.86).map(([x, y]) => [Math.min(7.6, x), y] as P2), TH = 4.4;
const inside = (pts: P2[], x: number, y: number) => {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

export const steak: Illustration = {
  k: "steak", name: "Steak", title: "No mains yet", body: "Add a main course to the menu and it will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    let hop = 0;
    for (let i = 0; i < 2; i++) hop += Math.sin(Math.PI * seg(h, 0.05 + i * 0.3, 0.3 + i * 0.3)) * (1.8 - i * 0.7);
    p.translate(0, 0, -6);
    p.scale(1.15);
    p.shadow(0, 0, 28, 13, 0.1);
    p.translate(0, 0, hop);
    p.rotate("z", -0.3);
    p.rotate("y", 0.16);
    p.rotate("x", -0.12);
    // the side: dense on the left, sparse on the right
    for (let i = 0; i < OUT.length; i++) {
      const a = OUT[i], b = OUT[(i + 1) % OUT.length], nx = b[1] - a[1], ny = -(b[0] - a[0]);
      if (nx + ny <= 0) continue;
      p.face([[a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], TH], [a[0], a[1], TH]], ny > nx ? 0.12 : 0.065, 0);
    }
    // the top: a band of fat round the meat, cut apart
    const z = TH + 0.03;
    p.face(OUT.map(([x, y]) => [x, y, TH] as V3), 0.3, 0);
    p.face(MEAT.map(([x, y]) => [x, y, z] as V3), 0.075, 0);
    p.line([...MEAT, MEAT[0]].map(([x, y]) => [x, y, z] as V3), SH.edge, 0.6);
    // grill stripes: dark diagonal cuts across the meat
    for (let o = -21; o <= 14; o += 5.6) {
      let run: V3[] = [];
      const flush = () => { if (run.length > 1) p.line(run, SH.edge, 1.4); run = []; };
      for (let s = -16; s <= 16; s += 0.5) {
        const x = o + s * 0.62, y = s * 0.78;
        if (inside(MEAT, x, y) && y > 2.4 && x < 4.4 && x > -11) run.push([x, y, z + 0.02]); else flush();
      }
      flush();
    }
    // the T bone: a bar along the flat side and a stem through the middle, bright, cut round
    const bz = z + 0.05;
    const T: V3[] = [[-12, -3.2, bz], [4.8, -3.2, bz], [4.8, -8.8, bz], [10, -8.8, bz], [10, 11.4, bz], [4.8, 11.4, bz], [4.8, 1, bz], [-12, 1, bz]];
    p.face(T, 0.5, 0);
    p.line([...T, T[0]], SH.edge, 1);
    // steam: short wisps curling up while it sizzles
    const s = seg(h, 0.1, 0.5);
    if (s > 0) {
      const wisps = [3.5, 3.95, 4.4].map((a, i) => { const rx = -1.5 + Math.cos(a) * 13, ry = Math.sin(a) * 9; return Array.from({ length: 8 }, (_, j) => p.pt([rx + Math.sin(j * 0.9 + t * 4 + i * 2) * 0.9, ry - Math.sin(j * 0.9 + t * 4 + i * 2) * 0.9, TH + 1.5 + j * 0.85 * s])); });
      p.screen((c) => {
        c.strokeStyle = "#fff"; c.lineWidth = 1.4; c.lineCap = "round";
        for (const w of wisps) { c.beginPath(); w.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); }
      });
    }
  },
};
