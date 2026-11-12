// Lanyard pass: an event pass on a looped neck strap, a star on its face. Hover and it swings on the strap; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 8.5, H = 21, T = 0.7; // the card: half width, height, half thickness
const ZC = H + 2.6, LH = 20, LW = 12; // the clip's top, the loop's height and width

// a teardrop: pointed at the clip, round at the top
const drop = (w: number, z0: number, hgt: number, y: number): V3[] =>
  Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [w * Math.sin(a) * Math.sin(a / 2), y, z0 + (hgt * (1 - Math.cos(a))) / 2] as V3; });
const star = (cx: number, cz: number, y: number, R: number, r: number): V3[] =>
  Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r : R; return [cx + Math.cos(a) * q, y, cz + Math.sin(a) * q] as V3; });

function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

export const lanyard: Illustration = {
  k: "lanyard", name: "Lanyard pass", title: "No passes issued", body: "Issue a pass and it will be listed here, ready to print or share.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -23);
    p.shadow(0, 0, 18, 7, 0.1);
    p.rotate("z", -0.5);
    const top = ZC + LH;
    p.rotate("y", h * 0.2 * Math.sin(t * 2.6), [0, 0, top]);
    // the strap: one flat loop, wide enough to read as a band
    const o = drop(LW, ZC - 0.6, LH + 0.6, 0), i = drop(LW - 3.4, ZC + 3.2, LH - 5.6, 0);
    p.face([...o, ...i.slice().reverse()], 0.3, 0);
    p.line(o, SH.edge, 0.5);
    p.line(i, SH.edge, 0.5);
    // the clip
    p.box(-2.4, -0.9, ZC - 2.4, 4.8, 1.8, 2.6, { top: 0.3, left: 0.34 });
    p.line([[0, 0.93, ZC - 2.4], [0, 0.93, H - 1.8]], SH.edge, 0.9);
    // the card
    p.box(-W, -T, 0, W * 2, T * 2, H, { top: 0.3, left: 0.2 });
    const y = T + 0.03;
    p.line([[-2.4, y, H - 2], [2.4, y, H - 2]], SH.edge, 1.1); // the slot
    // a header rule, a star cut out of the face, and a barcode
    p.line([[-W, y, H - 4.6], [W, y, H - 4.6]], SH.edge, 0.7);
    p.clear(star(0, 10.4, y, 4.4, 1.9));
    for (let n = 0; n < 9; n++) {
      if (n % 4 === 2) continue;
      const x = -W + 2.6 + n * 1.5;
      p.line([[x, y, 1.6], [x, y, 3.8]], SH.edge, 0.6);
    }
    const b = clamp((h - 0.45) / 0.55);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [W + 1.5, 0, H + 0.5], 4.6 * pop);
    }
  },
};
