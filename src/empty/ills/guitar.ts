// No songs yet: an acoustic guitar leaning on its side. Hover and the strings ring and two notes drift up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const T = 2.3; // half thickness of the body
/** half width of the body at height v: two bouts that meet at a waist */
const half = (v: number) => Math.max(v < 19.2 ? Math.sqrt(Math.max(0, 92.16 - (v - 9.6) * (v - 9.6))) : 0, v > 13.4 ? Math.sqrt(Math.max(0, 51.84 - (v - 20.6) * (v - 20.6))) : 0);
const OUT: [number, number][] = (() => {
  const r: [number, number][] = [], N = 28;
  for (let i = 0; i <= N; i++) { const v = 27.8 * (0.5 - 0.5 * Math.cos((i / N) * Math.PI)); r.push([half(v), v]); }
  for (let i = N - 1; i > 0; i--) { const v = 27.8 * (0.5 - 0.5 * Math.cos((i / N) * Math.PI)); r.push([-half(v), v]); }
  return r;
})();
const area = (p: Pen, q: V3[]) => { const s = q.map((v) => p.pt(v)); let a = 0; for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; } return a; };
function note(p: Pen, at: V3, s: number, a: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.fillStyle = g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 0.7 * s; g.lineCap = "round";
    g.beginPath(); g.ellipse(x, y, 1.5 * s, 1.1 * s, -0.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x + 1.3 * s, y - 0.2 * s); g.lineTo(x + 1.3 * s, y - 5 * s); g.lineTo(x + 3.4 * s, y - 4 * s); g.stroke();
  });
}

export const guitar: Illustration = {
  k: "guitar", name: "Guitar", title: "No songs yet", body: "Write or save a song and it will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 2, -22);
    p.shadow(-5, 0, 27, 12, 0.1);
    p.translate(0, 0, 22);
    p.rotate("z", -0.4);
    p.push();
    p.scale(0.97);
    p.rotate("y", 0.62);
    p.translate(0, 0, -25);
    // the body: the back, the rim that shows, then the top
    const front: V3[] = OUT.map(([u, v]) => [u, T, v]), back: V3[] = OUT.map(([u, v]) => [u, -T, v]);
    const sign = area(p, front);
    p.face(back, 0.065, 0);
    for (let i = 0; i < OUT.length; i++) {
      const j = (i + 1) % OUT.length, q = [front[i], front[j], back[j], back[i]];
      if (area(p, q) * sign >= 0) continue;
      const du = OUT[j][0] - OUT[i][0], dv = OUT[j][1] - OUT[i][1], up = -du / (Math.hypot(du, dv) || 1);
      p.face(q, 0.05 + 0.2 * Math.max(0, up), 0);
    }
    p.face(front, 0.16, SH.edge, 0.65);
    p.line([...front, front[0]], SH.edge, 0.6);
    // the neck and the head, with frets and pegs
    p.box(-2.1, T - 1.6, 26.5, 4.2, 2, 19.5, { top: 0.3, left: 0.3, right: 0.1, edge: 0 });
    for (let i = 0; i < 4; i++) p.line([[-2.1, T + 0.43, 31 + i * 4], [2.1, T + 0.43, 31 + i * 4]], SH.edge, 0.3);
    p.box(-3.2, T - 1.6, 46, 6.4, 2, 6.5, { top: 0.3, left: 0.3, right: 0.1, lw: 0.55 });
    for (const z of [47.6, 50.6]) for (const x of [-4.1, 4.1]) p.dot([x, T, z], 0.8, 0.9);
    // the sound hole and the bridge
    const hole: V3[] = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [Math.cos(a) * 3.2, T + 0.03, 17.6 + Math.sin(a) * 3.2] as V3; });
    p.clear(hole);
    p.line([...hole.map(([x, y, z]) => [x * 1.3, y, 17.6 + (z - 17.6) * 1.3] as V3), [4.16, T + 0.03, 17.6]], SH.edge, 0.4);
    p.box(-4, T, 6.4, 8, 0.7, 1.5, { top: 0.4, left: 0.4, right: 0.2, lw: 0.5 });
    // four strings, shaking while hovered
    for (let s = 0; s < 3; s++) {
      const x = -1.1 + s * 1.1, amp = h * 0.55 * Math.sin(t * 30 + s * 1.7);
      p.line(Array.from({ length: 9 }, (_, i) => [x + amp * Math.sin((i / 8) * Math.PI), T + 0.75, 7.6 + (i / 8) * 38.5] as V3), 0.7, 0.25);
    }
    p.pop();
    // the notes
    for (let i = 0; i < 2; i++) {
      const k = Math.min(1, Math.max(0, (h - 0.25 - i * 0.25) / 0.5));
      if (k <= 0) continue;
      const bob = Math.sin(t * 2.2 + i * 2) * 0.8;
      note(p, [-6 - i * 8 + bob, 4, 12 + i * 3 + 7 * k], 0.9 + 0.3 * k, Math.min(1, k * 2));
    }
  },
};
