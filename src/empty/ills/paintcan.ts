// No colours picked: a fat paint tin with a wire handle laid back and a pressed lid. Hover and the lid pops up and off to one side, showing the bright paint inside, and a drip runs down the side.
import { SH, type Illustration, type V3 } from "../dots";

const R = 10.5, HB = 17; // radius, height
const K = 0.70711;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
const ring = (r: number, z: number, n = 48): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r, z]; });
const arc = (r: number, z: number, a0: number, a1: number, n = 20): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z]; });

export const paintcan: Illustration = {
  k: "paintcan", name: "Paint can", title: "No colours picked", body: "Choose your first colour and it will be saved here for later.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 22, 10, 0.12);
    const k = Math.min(1, h * 1.2);
    // the lid: pressed on at rest; on hover it pops up and off to the side, tipped toward us
    const lid = () => {
      const e = back(k), a = 0.42 * ease(k) + h * Math.sin(t * 3) * 0.03;
      p.push();
      p.rotate("z", -Math.PI / 4);
      p.translate(10 * ease(k), -4 * ease(k), 5.5 * e);
      p.rotate("x", -0.6 * a, [0, 0, HB]);
      p.rotate("y", 0.3 * ease(k), [0, 0, HB]);
      p.face(ring(R + 0.3, HB + 0.02), 0.3, 0);
      p.face(ring(R - 0.4, HB + 1.2), 0.2, 0);
      p.line(ring(R - 2.8, HB + 1.25), SH.edge, 0.7);
      p.pop();
    };
    // the handle, laid back behind the tin: a bright wire
    const arch = Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI, u = Math.cos(a) * (R + 0.6); return p.pt([u * K - Math.sin(a) * 8, -u * K - Math.sin(a) * 8, HB - 3 + Math.sin(a) * 4]); });
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.8; g.lineCap = "round"; g.beginPath(); arch.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
    // the wall: lit on the left, shaded on the right, with two rolled bands cut into it
    const wall = (a0: number, a1: number, f: number) => p.face([...arc(R, 0, a0, a1), ...arc(R, HB, a1, a0)], f, 0);
    wall(-Math.PI / 4, Math.PI / 5, 0.07);
    wall(Math.PI / 5, (Math.PI * 3) / 4, 0.2);
    for (const z of [2.2, HB - 2.2]) p.line(arc(R + 0.05, z, -Math.PI / 4, (Math.PI * 3) / 4, 24), SH.edge, 0.8);
    // ears where the handle hooks on
    for (const s of [-1, 1]) p.box(s * (R + 0.2) * K - 1, -s * (R + 0.2) * K - 1, HB - 4.5, 2, 2, 2.6, { top: 0.3, left: 0.24, right: 0.12, edge: 0 });
    // the rim
    p.face(ring(R + 0.5, HB), 0.28, 0);
    if (k > 0.05) {
      // the open tin: a dark lip, then the paint, bright, with a swirl cut in it
      p.face(ring(R - 0.6, HB + 0.02), 0.03, 0);
      p.face(ring(R - 1.6, HB + 0.04).map(([x, y, z]) => [x + 0.5, y + 0.5, z] as V3), 0.34, 0);
      p.line(arc(R - 1.6, HB + 0.05, Math.PI * 0.9, Math.PI * 1.9).map(([x, y, z]) => [x * 0.55 + 0.5, y * 0.55 + 0.5, z] as V3), SH.edge, 0.6);
      // a drip over the front lip, running down
      const d = ease(Math.max(0, (h - 0.35) / 0.65)) * 8, a = Math.PI / 4 + 0.05, w = 0.13;
      if (d > 0.2) {
        const drip: V3[] = [...arc(R + 0.08, HB + 0.4, a - w * 1.4, a + w * 1.4, 6)];
        drip.push([Math.cos(a + w) * (R + 0.08), Math.sin(a + w) * (R + 0.08), HB - d]);
        for (let i = 0; i <= 6; i++) { const b = a + w - (2 * w * i) / 6; drip.push([Math.cos(b) * (R + 0.08), Math.sin(b) * (R + 0.08), HB - d - 1.2 * Math.sin((i / 6) * Math.PI)]); }
        p.face(drip, 0.34, 0);
      }
    }
    lid();
  },
};
