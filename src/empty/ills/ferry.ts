// No sailings: a ferry riding the swell. It bobs and rocks, wave crests slide along its hull and smoke puffs from the funnel.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

// a luminous stroke: bright on bare ground in the dot styles, accent in line art
const glow = (p: Pen, pts: V3[], lw = 0.8, v = 1) => {
  const q = pts.map((a) => p.pt(a)), n = Math.round(255 * v);
  p.screen((g) => { g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
};
// a thin solid part (a rail, a pole): bright in the dot styles, a plain stroke in line art
const rod = (p: Pen, pts: V3[], lw = 0.8) => { if (p.ink) p.line(pts, SH.edge, lw); else glow(p, pts, lw); };
const P = 3.2; // seconds per loop
const Y = 6; // half the beam

// a row of wave crests along x at depth y, drifting with the phase
function waves(p: Pen, y: number, drift: number) {
  for (let i = -4; i <= 4; i++) {
    const x = i * 7 + drift * 7, f = Math.max(0, 1 - Math.pow(Math.abs(x) / 24, 3));
    if (f > 0.05) glow(p, [[x - 2.2, y, 0], [x - 1, y, 0.9], [x + 1, y, 0.9], [x + 2.2, y, 0]], 1, f * 0.95);
  }
}

export const ferry: Illustration = {
  k: "ferry", name: "Ferry", title: "No sailings", body: "Book a crossing and your sailing times will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2;
    p.translate(0, 0, -11);
    p.scale(1.2);
    p.shadow(0, 0, 31, 12, 0.1);
    waves(p, -9.5, u);
    const bob = 0.8 * Math.sin(w);
    p.push();
    p.translate(0, 0, bob);
    p.rotate("y", 0.03 * Math.sin(w + 1.2), [0, 0, 3]);
    // the hull: a raked bow, a bright deck, portholes along the side
    const ZD = 6.5;
    p.face([[-15, Y, 0], [11, Y, 0], [18, Y, ZD], [-17, Y, ZD]], 0.2, SH.edge, 0.6);
    p.face([[11, -Y, 0], [11, Y, 0], [18, Y, ZD], [18, -Y, ZD]], 0.07, SH.edge, 0.6);
    p.face([[-17, -Y, ZD], [18, -Y, ZD], [18, Y, ZD], [-17, Y, ZD]], 0.22, SH.edge, 0.6);
    p.line([[-17, Y + 0.03, ZD], [18, Y + 0.03, ZD], [18.03, -Y, ZD]], SH.edge, 0.6);
    p.line([[-16.4, Y + 0.03, 4.4], [15.6, Y + 0.03, 4.4]], SH.edge, 0.7);
        // the passenger deck and its windows
    p.box(-13.5, -4.5, ZD, 22, 9, 5, { top: 0.22, left: 0.2, right: 0.075, lw: 0.6 });
    p.line([[-13.5, 4.53, ZD + 5], [8.5, 4.53, ZD + 5], [8.53, -4.5, ZD + 5]], SH.edge, 0.6);
    for (let i = 0; i < 5; i++) { const x = -12 + i * 4.1; p.clear([[x, 4.53, ZD + 1.5], [x + 2.9, 4.53, ZD + 1.5], [x + 2.9, 4.53, ZD + 3.8], [x, 4.53, ZD + 3.8]]); }
    for (const y of [-2.2, 1.2]) p.clear([[8.53, y - 1, ZD + 1.6], [8.53, y + 1.2, ZD + 1.6], [8.53, y + 1.2, ZD + 3.8], [8.53, y - 1, ZD + 3.8]]);
    // the funnel, then the bridge in front of it
    const ZC = ZD + 5;
    p.cylinder(-9, 0, ZC, 2.2, 6.2, { side: 0.2, top: 0.03, lw: 0.6 });
    p.line(Array.from({ length: 13 }, (_, i) => { const a = -Math.PI / 4 + (i / 12) * Math.PI; return [-9 + Math.cos(a) * 2.22, Math.sin(a) * 2.22, ZC + 4.4] as V3; }), SH.edge, 0.9);
    p.box(-4, -3.6, ZC, 10.5, 7.2, 4.2, { top: 0.22, left: 0.2, right: 0.075, lw: 0.6 });
    p.line([[-4, 3.63, ZC + 4.2], [6.5, 3.63, ZC + 4.2], [6.53, -3.6, ZC + 4.2]], SH.edge, 0.6);
    p.clear([[-3, 3.63, ZC + 1.5], [5.5, 3.63, ZC + 1.5], [5.5, 3.63, ZC + 3.2], [-3, 3.63, ZC + 3.2]]);
    p.clear([[6.53, -2.8, ZC + 1.5], [6.53, 2.8, ZC + 1.5], [6.53, 2.8, ZC + 3.2], [6.53, -2.8, ZC + 3.2]]);
    // a mast with a pennant
    rod(p, [[2, 0, ZC + 4.2], [2, 0, ZC + 9.6]], 0.7);
    p.face([[2, 0, ZC + 9.6], [-1.6 , 0, ZC + 8.7 + 0.3 * Math.sin(w * 2)], [2, 0, ZC + 7.6]], 0.3, SH.edge, 0.4);
    p.pop();
    // smoke drifting back from the funnel
    for (let i = 0; i < 3; i++) {
      const k = (u + i / 3) % 1;
      p.dot([-9 - k * 8, 0, 18.5 + bob + k * 8], 0.8 + k * 1.7, Math.sin(k * Math.PI) * 0.85);
    }
    // the swell in front of the hull
    waves(p, Y + 2.2, -u + 0.5);
    waves(p, Y + 6.5, -u);
  },
};
