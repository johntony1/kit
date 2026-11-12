// Identity check: an ID card standing in a holder, a portrait in its photo window and details beside it. A scan band passes over the face inside its corner marks, then a tick confirms it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 3.4; // seconds per loop
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 14.5, H = 20, T = 0.7; // the card: half width, height, half thickness

// a round bright badge with a dark tick, flat to the screen
function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r + 1, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.5, y - r * 0.36); g.stroke();
  });
}

export const kyc: Illustration = {
  k: "kyc", name: "Identity check", title: "Verify your identity", body: "Add a photo of your ID and a quick selfie. It takes about two minutes.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    p.translate(0, 0, -12);
    p.shadow(0, 0, 24, 10, 0.12);
    // the holder
    p.box(-10, -4.5, 0, 20, 9, 2, { top: 0.2, left: 0.12, right: 0.065 });
    p.push();
    p.rotate("x", 0.18, [0, 0, 2]);
    // the card
    const z0 = 1.6, y = T + 0.04;
    p.box(-W, -T, z0, W * 2, T * 2, H, { top: 0.24, left: 0.2, right: 0.065, lw: 0.6 });
    // the photo window: dark, with a lit head and shoulders in it
    const fx = -6.6, fz = z0 + 10, x0 = fx - 5.4, x1 = fx + 5.4, a0 = fz - 7, a1 = fz + 7;
    p.face([[x0, y, a0], [x1, y, a0], [x1, y, a1], [x0, y, a1]], 0.03, SH.edge, 0.6);
    p.ringV("y", [fx, y + 0.02, fz + 2.6], 2.6, 0.3, 0);
    p.face(Array.from({ length: 15 }, (_, i) => { const a = (i / 14) * Math.PI; return [fx + Math.cos(a) * 4.4, y + 0.02, a0 + 0.9 + Math.sin(a) * 4.6] as V3; }), 0.3, 0);
    // the details: a name, two lines and a number
    p.line([[2, y, z0 + 16], [11.5, y, z0 + 16]], SH.edge, 1.4);
    p.line([[2, y, z0 + 12.6], [9, y, z0 + 12.6]], SH.edge, 0.8);
    p.line([[2, y, z0 + 9.8], [10.8, y, z0 + 9.8]], SH.edge, 0.8);
    for (let i = 0; i < 3; i++) p.line([[2 + i * 3.4, y, z0 + 5], [4.4 + i * 3.4, y, z0 + 5]], SH.edge, 1.1);
    // the scan: a bright band down the face and back
    if (u < 0.56) {
      const s = 0.5 - 0.5 * Math.cos((u / 0.56) * Math.PI * 2), z = a1 - 1.2 - s * (a1 - a0 - 2.4);
      p.face([[x0, y + 0.04, z - 0.7], [x1, y + 0.04, z - 0.7], [x1, y + 0.04, z + 0.7], [x0, y + 0.04, z + 0.7]], 0.34, 0);
    }
    // the corner marks around the window
    const c = 2.4, m = 0.9;
    for (const [cx, cz, sx, sz] of [[x0 + m, a0 + m, 1, 1], [x1 - m, a0 + m, -1, 1], [x1 - m, a1 - m, -1, -1], [x0 + m, a1 - m, 1, -1]]) {
      p.guide([[cx + sx * c, y + 0.05, cz], [cx, y + 0.05, cz], [cx, y + 0.05, cz + sz * c]], true);
    }
    p.pop();
    // the tick: pops in once the scan is done, then goes
    const b = u < 0.6 ? 0 : u < 0.92 ? clamp((u - 0.6) / 0.16) : 1 - clamp((u - 0.92) / 0.07);
    if (b > 0) {
      const pop = u < 0.92 ? (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)) : b;
      tick(p, [W - 1, T - 3, z0 + H - 0.5], 5 * pop);
    }
  },
};
