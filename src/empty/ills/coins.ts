// No transactions: a short stack of coins, and one more coin spinning on its edge beside it, catching the light.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const CR = 6.4, CH = 1.7; // stacked coin radius and thickness
const SR = 7.2, ST = 1.5; // the spinning coin's radius and thickness

// the front half of a horizontal ring, the half facing us
const front = (cx: number, cy: number, r: number, z: number): V3[] =>
  Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (Math.PI * i) / 20; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z] as V3; });

// a coin standing on its edge at (cx, cy), its face turned to angle f around the vertical
function spinner(p: Pen, cx: number, cy: number, f: number) {
  const n: V3 = [Math.cos(f), Math.sin(f), 0], u: V3 = [-Math.sin(f), Math.cos(f), 0];
  const P = (a: number, r: number, off: number): V3 => [cx + u[0] * Math.cos(a) * r + n[0] * off, cy + u[1] * Math.cos(a) * r + n[1] * off, SR + Math.sin(a) * r];
  const disc = (off: number, r = SR) => Array.from({ length: 36 }, (_, i) => P((i / 36) * Math.PI * 2, r, off));
  const side = Math.sign(n[0] + n[1]) || 1; // which face looks at us
  // the far face, then the milled rim in slices, then the near face
  for (let k = 0; k <= 4; k++) p.face(disc(-side * ST / 2 + (side * ST * k) / 4), k === 0 ? 0.12 : SH.right, 0);
  const look = Math.abs(n[0] + n[1]) / Math.SQRT2; // 1 when the face looks straight at us
  p.face(disc(side * ST / 2), look > 0.3 ? 0.23 : 0.13, 0);
  if (look > 0.3) {
    const ring = disc(side * (ST / 2 + 0.05), SR - 1.5);
    p.line([...ring, ring[0]], SH.edge, 0.6);
    // a star struck in the middle
    const star = Array.from({ length: 11 }, (_, i) => P(Math.PI / 2 + (i * Math.PI * 2) / 10, i % 2 ? 1.3 : 3, side * (ST / 2 + 0.05)));
    p.line(star, SH.edge, 0.6);
  }
}

export const coins: Illustration = {
  k: "coins", name: "Coins", title: "No transactions", body: "Payments in and out will be listed here once money starts moving.",
  kind: "loop", period: 3, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = t / 3;
    p.translate(0, 0, -9);
    p.shadow(0, 0, 24, 11, 0.12);
    // the stack, at the back left, each coin a little off true
    const off = [[0, 0], [0.5, -0.3], [-0.3, 0.4], [0.4, 0.3], [-0.2, -0.2], [0.3, 0.1], [-0.3, 0.2]];
    const sx = -6, sy = -7;
    off.forEach(([ox, oy], i) => {
      p.cylinder(sx + ox, sy + oy, i * CH, CR, CH, { side: SH.left, top: 0.22 });
      p.line(front(sx + ox, sy + oy, CR, i * CH), SH.edge, 0.55);
    });
    const [tx, ty] = off[off.length - 1], zt = off.length * CH + 0.02;
    p.line([...Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [sx + tx + Math.cos(a) * (CR - 1.4), sy + ty + Math.sin(a) * (CR - 1.4), zt] as V3; })], SH.edge, 0.6);
    // one coin lying flat in front of the stack
    p.cylinder(-9, 4, 0, CR, CH, { side: SH.left, top: 0.22 });
    p.line([...Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [-9 + Math.cos(a) * (CR - 1.4), 4 + Math.sin(a) * (CR - 1.4), CH + 0.02] as V3; })], SH.edge, 0.6);
    // the spinner: two turns a loop, swaying a touch on its point of contact
    const f = Math.PI * 2 * 2 * u + Math.PI / 4;
    p.push();
    p.rotate("x", 0.06 * Math.sin(Math.PI * 2 * 2 * u), [7, 4, 0]);
    spinner(p, 7, 4, f);
    p.pop();
    // a glint each time its face swings round to us
    const look = Math.abs(Math.cos(f - Math.PI / 4));
    if (look > 0.9) {
      const k = (look - 0.9) / 0.1, [gx, gy] = p.pt([7, 4, SR * 2 + 2.5]);
      p.screen((c) => {
        c.fillStyle = `rgba(255,255,255,${k})`;
        const s = 1 + 2.4 * k;
        c.beginPath(); c.moveTo(gx, gy - s); c.lineTo(gx + 0.5, gy - 0.5); c.lineTo(gx + s, gy); c.lineTo(gx + 0.5, gy + 0.5);
        c.lineTo(gx, gy + s); c.lineTo(gx - 0.5, gy + 0.5); c.lineTo(gx - s, gy); c.lineTo(gx - 0.5, gy - 0.5); c.closePath(); c.fill();
      });
    }
  },
};
