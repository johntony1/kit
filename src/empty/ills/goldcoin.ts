// No rewards yet: a big thick gold coin standing on its edge, a star struck on each face. It turns half round, rests, turns again, and glints each time its face comes round.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.2; // seconds per loop
const R = 11, TH = 3; // radius and thickness
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// the coin on its edge, its face turned to angle f about the upright axis
function coin(p: Pen, f: number) {
  const n: V3 = [Math.cos(f), Math.sin(f), 0], u: V3 = [-Math.sin(f), Math.cos(f), 0];
  const side = Math.sign(n[0] + n[1]) || 1; // which face looks at us
  const P3 = (a: number, r: number, off: number): V3 => [u[0] * Math.cos(a) * r + n[0] * off, u[1] * Math.cos(a) * r + n[1] * off, R + Math.sin(a) * r];
  const disc = (off: number, r = R) => Array.from({ length: 44 }, (_, i) => P3((i / 44) * Math.PI * 2, r, off));
  // the far face, then the milled rim in slices, then the near face
  for (let k = 0; k <= 6; k++) p.face(disc(-side * TH / 2 + (side * TH * k) / 6), k === 0 ? 0.1 : 0.12, 0);
  const look = Math.abs(n[0] + n[1]) / Math.SQRT2;
  const o = side * (TH / 2);
  p.face(disc(o), look > 0.35 ? 0.2 : 0.14, SH.edge, 0.6);
  if (look < 0.35) return;
  const ring = disc(o + side * 0.05, R - 2);
  p.line([...ring, ring[0]], SH.edge, 0.8);
  // the star: bright, with a cut outline
  const star = Array.from({ length: 10 }, (_, i) => P3(Math.PI / 2 + (i * Math.PI) / 5, i % 2 ? 2.6 : 6, o + side * 0.08));
  p.face(star, 0.4, 0);
  p.line([...star, star[0]], SH.edge, 0.7);
}

export const goldcoin: Illustration = {
  k: "goldcoin", name: "Gold coin", title: "No rewards yet", body: "Complete actions to earn coins and your rewards will collect here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, half = u * 2, i = Math.floor(half), fr = half - i;
    // rest face on, then turn half round
    const f = Math.PI / 4 + Math.PI * (i + (fr < 0.45 ? 0 : ease((fr - 0.45) / 0.55)));
    p.translate(0, 0, -11);
    p.shadow(0, 0, 22, 11, 0.12);
    // a low round stand it sits in
    p.cylinder(0, 0, 0, 7, 1.6, { side: 0.12, top: 0.2 });
    coin(p, f);
    // a glint as the face settles toward us
    const g = fr < 0.45 ? Math.sin((fr / 0.45) * Math.PI) : 0;
    if (g > 0.05) {
      const [gx, gy] = p.pt([-3, 3, R * 2 - 2]);
      p.screen((c) => {
        c.fillStyle = "#fff";
        const s = 1 + 3 * g;
        c.beginPath(); c.moveTo(gx, gy - s); c.lineTo(gx + 0.6, gy - 0.6); c.lineTo(gx + s, gy); c.lineTo(gx + 0.6, gy + 0.6);
        c.lineTo(gx, gy + s); c.lineTo(gx - 0.6, gy + 0.6); c.lineTo(gx - s, gy); c.lineTo(gx - 0.6, gy - 0.6); c.closePath(); c.fill();
      });
    }
  },
};
