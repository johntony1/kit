// Nothing in your wardrobe: a bare clothes rail with one hanger left crooked on it. Hover and the hanger swings, settles level, and a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// a round bright badge with a dark plus, drawn flat to the screen so it stays crisp
function badge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
  });
}

const ZR = 31; // height of the rail

export const hanger: Illustration = {
  k: "hanger", name: "Clothes hanger", title: "Nothing in your wardrobe", body: "Save pieces you own or love and they will hang here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 28, 12, 0.1);
    p.rotate("z", -0.55); // turned so the rail faces us
    // the rail: two feet, two uprights and the bar across the top
    for (const x of [-16.5, 15]) {
      p.box(x - 0.6, -6.5, 0, 3.2, 13, 1.4, { edge: 0 });
      p.box(x, -1, 1.3, 2, 2, ZR - 1.3, { top: 0.2, left: 0.22, right: 0.08, edge: 0 });
    }
    p.box(-16.5, -1, ZR, 33.5, 2, 2, { top: 0.32, left: 0.24, right: 0.08, edge: 0 });
    // the swing: it rests crooked, swings as the pointer arrives and settles level
    const ang = -0.3 * (1 - h) + 0.55 * Math.sin(h * Math.PI * 3) * (1 - h) + 0.05 * h * Math.sin(t * 2.6);
    p.push();
    p.rotate("y", ang, [0, 0, ZR + 2]);
    const Y = 1.4, top = ZR - 5.5, low = ZR - 15.5, W = 13.5;
    // the shoulders and the bottom bar: thick lit bands with a darker back edge
    const band = (a: [number, number], b: [number, number], w: number, y: number, fill: number, edge: number) =>
      p.face([[a[0], y, a[1]], [b[0], y, b[1]], [b[0], y, b[1] - w], [a[0], y, a[1] - w]], fill, edge, 0.55);
    for (const y of [Y - 1.1, Y]) {
      const f = y === Y ? 0.32 : 0.1, e = y === Y ? SH.edge : 0;
      band([-W, low + 2], [W, low + 2], 2, y, f, e);
      band([0, top], [-W, low + 2.2], 2.6, y, f, e);
      band([0, top], [W, low + 2.2], 2.6, y, f, e);
    }
    // the hook: a neck, then round and over the bar
    const hook: V3[] = [[0, Y, top - 0.4], [0, Y, ZR - 2.6]];
    for (let i = 0; i <= 14; i++) { const a = -Math.PI / 2 + (i / 14) * Math.PI * 1.45; hook.push([Math.cos(a) * 2.9, Y, ZR + 0.8 + Math.sin(a) * 2.9]); }
    p.line(hook, SH.edge, 1);
    p.pop();
    // the plus badge pops in once it hangs level
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      badge(p, [8, 2, 9], 4.6 * pop);
    }
  },
};
