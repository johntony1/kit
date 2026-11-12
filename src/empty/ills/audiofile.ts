// No audio yet: a sound file standing up, a note in its corner and a waveform across it. The bars of the waveform rise and fall in a steady rhythm.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a bright stroke: lines turn dark in the dot styles, so marks on a dark ground are stroked on the screen
function bright(p: Pen, pts: V3[], lw: number) {
  if (p.ink) { p.line(pts, SH.edge, lw); return; }
  const q = pts.map((v) => p.pt(v));
  p.screen((c) => {
    c.strokeStyle = "#fff"; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

const W = 11, H = 27, T = 0.5, F = 5;
const P = 2.4;
const AMP = [2, 4.2, 6, 3.4, 5.6, 3, 1.8];

function sheet(p: Pen, fill: number) {
  p.face([[W, -T, 0], [W, T, 0], [W, T, H - F], [W, -T, H - F]], SH.right, SH.edge, 0.5);
  p.face([[-W, -T, H], [W - F, -T, H], [W - F, T, H], [-W, T, H]], SH.top, SH.edge, 0.5);
  p.face([[-W, T, 0], [W, T, 0], [W, T, H - F], [W - F, T, H], [-W, T, H]], fill, SH.edge, 0.55);
  p.face([[W - F, T + 0.03, H], [W, T + 0.03, H - F], [W - F, T + 0.03, H - F]], 0.36, SH.edge, 0.5);
}

export const audiofile: Illustration = {
  k: "audiofile", name: "Audio file", title: "No audio yet", body: "Record or upload a sound and it will be ready to play from here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -14);
    p.shadow(0, 2, 24, 10, 0.11);
    p.rotate("z", -0.42);
    sheet(p, 0.2);
    const fy = T + 0.03;
    // the note in the top corner
    p.dot([-6.4, fy, 19.6], 1.5, 1);
    p.line([[-5.2, fy, 19.8], [-5.2, fy, 24.4], [-2.6, fy, 23.2]], SH.edge, 0.9);
    // the waveform: bars mirrored about a centre line
    const zc = 9.5;
    p.face([[-8.6, fy, 2.6], [8.6, fy, 2.6], [8.6, fy, 16.4], [-8.6, fy, 16.4]], 0.02, SH.edge, 0.5);
    AMP.forEach((a, i) => {
      const x = -6.6 + i * 2.2;
      const m = 0.5 + 0.5 * Math.sin(Math.PI * 2 * (u - i * 0.13)) * Math.cos(Math.PI * 2 * (u * 2 + i * 0.31));
      const v = Math.max(0.5, a * (0.35 + 0.65 * m));
      bright(p, [[x, fy + 0.03, zc - v], [x, fy + 0.03, zc + v]], 1.3);
    });
  },
};
