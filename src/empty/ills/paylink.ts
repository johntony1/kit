// No payment links yet: two chain links lying apart. Hover and they slide together and lock, and a coin pops up over the join.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const L = 4.6, RO = 6, RI = 2.5, TH = 1.7; // half length of the straight run, outer and inner radius, thickness

// a stadium outline at height z, centred on the origin, long along x
const loop = (r: number, z: number): V3[] => {
  const pts: V3[] = [];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; pts.push([L + Math.cos(a) * r, Math.sin(a) * r, z]); }
  for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (i / 12) * Math.PI; pts.push([-L + Math.cos(a) * r, Math.sin(a) * r, z]); }
  return pts;
};
function link(p: Pen, top: number) {
  for (const [z, fill] of [[0, 0.1], [TH, top]] as [number, number][]) {
    const o = loop(RO, z), i = loop(RI, z);
    p.face([...o, o[0], i[0], ...i.slice().reverse()], fill, 0);
    p.line([...o, o[0]], SH.edge, 0.4);
    p.line([...i, i[0]], SH.edge, 0.4);
  }
}
// the near quarter of a link's right end, drawn again so it passes over the other link
function nearEnd(p: Pen, top: number) {
  const arc = (r: number, z: number): V3[] => Array.from({ length: 9 }, (_, i) => { const a = 0.08 + (i / 8) * 1.62; return [L + Math.cos(a) * r, Math.sin(a) * r, z] as V3; });
  for (const [z, fill] of [[0, 0.1], [TH, top]] as [number, number][]) {
    const o = arc(RO, z), i = arc(RI, z);
    p.face([...o, ...i.slice().reverse()], fill, 0);
    p.line(o, SH.edge, 0.4); p.line(i, SH.edge, 0.4);
  }
}
function coin(p: Pen, at: V3, r: number) {
  if (r < 0.3) return;
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineCap = "round"; g.lineWidth = 0.5;
    g.beginPath(); g.arc(x, y, r * 0.78, 0, Math.PI * 2); g.stroke();
    const s = r * 0.4;
    g.lineWidth = r * 0.15; g.beginPath();
    g.arc(x, y - s * 0.5, s * 0.5, -0.3, Math.PI * 0.5, true);
    g.arc(x, y + s * 0.5, s * 0.5, -Math.PI * 0.5, Math.PI - 0.3, false);
    g.moveTo(x, y - s * 1.35); g.lineTo(x, y + s * 1.35); g.stroke();
  });
}

export const paylink: Illustration = {
  k: "paylink", name: "Payment link", title: "No payment links yet", body: "Create a link and share it to get paid without sending an invoice.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -3);
    p.rotate("z", -0.25);
    p.shadow(0, 0, 30, 14, 0.1);
    const k = ease(clamp(h / 0.6)), gap = 6.2 * (1 - k);
    const C = L + 1.1; // each link's centre when locked
    // the far link, then the near one across it
    p.push(); p.translate(-C - gap, 0, 0); link(p, 0.3); p.pop();
    p.push(); p.translate(C + gap, 0, 0.9 * k); p.rotate("z", 0.32 * (1 - k)); link(p, 0.3); p.pop();
    if (gap < 1.6) { p.push(); p.translate(-C - gap, 0, 0); nearEnd(p, 0.3); p.pop(); }
    // a flash as they lock
    const f = clamp((h - 0.55) / 0.2);
    if (f > 0 && f < 1) for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.4, r = 7 + 5 * f; p.dot([Math.cos(a) * r, Math.sin(a) * r * 0.9, 2], 0.75 * (1 - f) + 0.2, 1); }
    // the coin over the join
    const b = clamp((h - 0.66) / 0.34), pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
    if (b > 0) { p.guide([[0, 0, TH], [0, 0, 8]], true); coin(p, [0, 0, 13.5 + Math.sin(t * 2.4) * 0.6 * b], 5.6 * pop); }
  },
};
