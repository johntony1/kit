// No results: a magnifier glides over a small stack of papers in a figure eight, sparks scattering as it searches.
import { SH, type Illustration, type V3 } from "../dots";

const PERIOD = 3.4, R = 6.2, LZ = 9; // lens radius, lens height above the floor
const ring = (cx: number, cy: number, z: number, r: number, n = 40): V3[] =>
  Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]; });

export const search: Illustration = {
  k: "search", name: "Search", title: "No results found", body: "Try a different word or check the spelling, then search again.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD, A = u * Math.PI * 2;
    p.translate(0, 0, -6);
    p.shadow(0, 0, 30, 14, 0.1);
    // three sheets, a little askew
    const sheets: [number, number][] = [[-0.22, 0], [0.12, 1], [0, 2]];
    for (const [rot, i] of sheets) {
      p.push(); p.rotate("z", rot, [0, 0, 0]);
      p.box(-11, -14, i * 1.1, 22, 28, 1, { top: i === 2 ? 0.2 : 0.14, edge: i === 2 ? SH.edge : SH.soft, lw: i === 2 ? 0.55 : 0.45 });
      p.pop();
    }
    const TZ = 3.3;
    const rows = [-9, -5, -1, 3, 7];
    const lens: V3 = [Math.sin(A) * 6.5, Math.sin(A * 2) * 5, LZ];
    // text lines on the top sheet
    rows.forEach((y, i) => p.line([[-7, y, TZ], [i === 4 ? 1 : 7 - (i % 2) * 3, y, TZ]], 0.55, 0.9));
    // the lens's shadow on the paper
    p.face(ring(lens[0] + 2, lens[1] + 2, TZ, R * 0.8), 0.05, 0);
    // the lens faces us: a circle on screen, a lighter glass that magnifies the lines under it
    const [sx, sy] = p.pt(lens);
    const SR = R; // radius on screen
    p.screen((c) => {
      c.beginPath(); c.arc(sx, sy, SR, 0, Math.PI * 2); c.fillStyle = "rgb(64,64,64)"; c.fill(); c.clip();
      p.push(); p.translate(0, 0, LZ - TZ); p.scale(1.45, [lens[0], lens[1], TZ]);
      rows.forEach((y, i) => p.line([[-7, y, TZ], [i === 4 ? 1 : 7 - (i % 2) * 3, y, TZ]], 0.9, 0.8));
      p.pop();
    });
    // the rim and the handle, pointing down and right
    p.screen((c) => {
      const hx = sx + SR * 0.72, hy = sy + SR * 0.72, ex = hx + 8, ey = hy + 8;
      c.lineCap = "round";
      c.strokeStyle = "#fff"; c.lineWidth = 3.6; c.beginPath(); c.moveTo(hx, hy); c.lineTo(ex, ey); c.stroke();
      c.strokeStyle = "rgb(40,40,40)"; c.lineWidth = 2.1; c.beginPath(); c.moveTo(hx + 0.8, hy + 0.8); c.lineTo(ex, ey); c.stroke();
      c.strokeStyle = "#fff"; c.lineWidth = 1.4; c.beginPath(); c.arc(sx, sy, SR, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = "rgb(150,150,150)"; c.lineWidth = 0.7; c.beginPath(); c.arc(sx, sy, SR - 2, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
    });
    // sparks scattering from the lens as it searches
    for (let i = 0; i < 3; i++) {
      const v = (u * 2 + i / 3) % 1;
      const ang = i * 2.1 + Math.floor(u * 2 + i / 3) * 1.3;
      const d = R * 0.9 + v * 5;
      p.dot([lens[0] + Math.cos(ang) * d * 1.3, lens[1] + Math.sin(ang) * d * 1.3, LZ + 2 + v * 6], 0.75, Math.sin(v * Math.PI));
    }
  },
};
