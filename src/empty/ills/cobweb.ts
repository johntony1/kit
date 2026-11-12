// Nothing here for a while: a cobweb strung in the corner of a post and beam, a spider tucked up under the beam. Hover and the spider drops down on its thread and bobs.
import { type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  if (v <= 0.02) return;
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
const NR = 5; // threads fanning out from the corner

export const cobweb: Illustration = {
  k: "cobweb", name: "Cobweb", title: "Nothing here for a while", body: "It has been quiet. New activity will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(1, -1, -16);
    p.shadow(-3, 3, 22, 10, 0.1);
    p.rotate("z", -0.5);
    // the post and the beam
    p.box(-14, -1.6, 0, 3.4, 3.2, 27);
    p.box(-14, -1.6, 27, 29, 3.2, 3.4);
    // the web, in the corner under the beam
    const Y = 1.6;
    const at = (i: number, r: number): V3 => { const a = ((i / (NR - 1)) * Math.PI) / 2; return [-10.6 + Math.cos(a) * r, Y, 27 - Math.sin(a) * r]; };
    const len = [22, 21, 19.5, 21, 22];
    for (let i = 0; i < NR; i++) glow(p, [at(i, 0), at(i, len[i])], 0.95);
    for (const r of [6, 12, 18]) {
      const pts: V3[] = [];
      for (let i = 0; i < NR - 1; i++) pts.push(at(i, r), at(i + 0.5, r * 0.9));
      pts.push(at(NR - 1, r));
      glow(p, pts, 0.85);
    }
    // the spider: drops past its mark, comes back up a little, then bobs
    const back = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
    const L = 3.2 + 13 * back(h) * h + h * Math.sin(t * 2.2) * 0.7;
    const S: V3 = [9.5, Y, 27 - L];
    glow(p, [[9.5, Y, 27], S], 0.5);
    const [x, y] = p.pt(S), wig = h * Math.sin(t * 5) * 0.12;
    p.screen((g) => {
      g.fillStyle = "#fff"; g.strokeStyle = "#fff"; g.lineWidth = 0.6; g.lineCap = "round"; g.lineJoin = "round";
      for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
        const a = -0.75 + i * 0.5 + wig * (i % 2 ? 1 : -1);
        g.beginPath(); g.moveTo(x, y + 1); g.lineTo(x + s * 3.1 * Math.cos(a), y + 1 + 3.1 * Math.sin(a) - 1); g.lineTo(x + s * 4.4 * Math.cos(a), y + 1.8 + 4.4 * Math.sin(a)); g.stroke();
      }
      g.beginPath(); g.arc(x, y + 2, 2.1, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(x, y - 0.5, 1.2, 0, Math.PI * 2); g.fill();
    });
  },
};
