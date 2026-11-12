// Ask me anything: a friendly robot head on a neck, two round eyes behind a dark visor. Hover and it perks up, its eyes smile, the antenna lights and a speech bubble pops out.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const HW = 11.5, HD = 7, Z0 = 5, HH = 17; // head: half width, half depth, bottom, height

// a speech bubble with three dots, flat to the screen, growing out of its tail
function bubble(p: Pen, at: V3, k: number) {
  const [x, y] = p.pt(at), w = 13 * k, hg = 8.5 * k, r = 2.6 * k;
  p.screen((g) => {
    const x0 = x, y0 = y - hg;
    g.fillStyle = "#fff"; g.beginPath();
    g.moveTo(x0 + r, y0); g.arcTo(x0 + w, y0, x0 + w, y0 + hg, r); g.arcTo(x0 + w, y0 + hg, x0, y0 + hg, r);
    g.lineTo(x0 + 3.4 * k, y0 + hg); g.lineTo(x0 - 0.6 * k, y0 + hg + 2.8 * k); g.lineTo(x0 + 1 * k, y0 + hg - 1.5 * k); g.arcTo(x0, y0, x0 + w, y0, r); g.closePath(); g.fill();
    g.fillStyle = "#000";
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x0 + w / 2 + (i - 1) * 3.1 * k, y0 + hg / 2, 0.95 * k, 0, Math.PI * 2); g.fill(); }
  });
}

export const chatbot: Illustration = {
  k: "chatbot", name: "Assistant", title: "Ask me anything", body: "Type a question to get started. The assistant can explain, draft and look things up.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(-1, 1, -14);
    p.shadow(0, 0, 25, 12, 0.12);
    p.rotate("z", -0.5);
    // shoulders and neck
    p.box(-8, -5, 0, 16, 10, 2.6);
    p.box(-3.5, -3, 2.6, 7, 6, 2.4, { lw: 0.45 });
    // the head perks up and nods a little
    const k = ease(clamp(h / 0.5));
    p.translate(0, 0, 1.6 * k + h * Math.sin(t * 2.6) * 0.4);
    p.rotate("y", 0.07 * k * Math.sin(t * 1.7), [0, 0, Z0]);
    p.box(-HW - 1.6, -2.2, Z0 + 5.5, 1.6, 4.4, 6, { lw: 0.45 }); // far ear
    p.box(-HW, -HD, Z0, 2 * HW, 2 * HD, HH, { top: 0.22 });
    p.box(HW, -2.2, Z0 + 5.5, 1.6, 4.4, 6, { lw: 0.45 }); // near ear
    // the face: a dark visor, eyes, a mouth
    const f = HD + 0.03, ez = Z0 + 10.6;
    p.clear([[-8.6, f, Z0 + 6.6], [8.6, f, Z0 + 6.6], [8.6, f, Z0 + 14.4], [-8.6, f, Z0 + 14.4]]);
    const eyes = [-4.2, 4.2].map((x) => p.pt([x, f, ez])), m = clamp((h - 0.35) / 0.3);
    p.screen((g) => {
      g.fillStyle = "#fff"; g.strokeStyle = "#fff"; g.lineWidth = 1.3; g.lineCap = "round";
      for (const [x, y] of eyes) {
        if (m < 0.5) { g.beginPath(); g.ellipse(x, y, 1.9, 1.9 * (1 - m * 1.6), 0, 0, Math.PI * 2); g.fill(); }
        else { g.beginPath(); g.arc(x, y + 1.1, 2.1, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); } // smiling
      }
    });
    p.line([[-2.6, f, Z0 + 3.4], [2.6, f, Z0 + 3.4]], SH.edge, 0.8);
    // the antenna: a stalk and a bulb that lights
    const top: V3 = [0, 0, Z0 + HH + 5];
    const [ax, ay] = p.pt([0, 0, Z0 + HH]), [bx, by] = p.pt(top);
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); });
    p.dot(top, 1.5 + 0.5 * k, 0.5 + 0.5 * k);
    if (k > 0.6) p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 0.6; g.beginPath(); g.arc(bx, by, 3.4 + Math.sin(t * 4) * 0.5, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); });
    const q = clamp((h - 0.6) / 0.4);
    if (q > 0) bubble(p, [HW + 1.5, 0, Z0 + HH + 1], q < 0.65 ? ease(q / 0.65) * 1.12 : 1.12 - 0.12 * ease((q - 0.65) / 0.35));
  },
};
