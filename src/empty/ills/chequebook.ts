// No cheques written: one big cheque standing upright on a thin pad of more cheques, a stub torn line at its left, an amount box and a signature line, a pen leaning on it. Hover and the pen signs the line with a quick squiggle, then a tick badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const W = 22, H0 = 4, H1 = 26, F = 0.03; // half width, bottom and top of the cheque, its front plane

// the signature: a looping squiggle along the line, in [x, z]
const SIG: [number, number][] = Array.from({ length: 41 }, (_, i) => {
  const s = i / 40;
  return [3 + s * 14, 9.4 + Math.sin(s * Math.PI * 5) * 1.8 * (1 - s * 0.4) + s * 0.8];
});

function tickBadge(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.48, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.38); g.lineTo(x + r * 0.5, y - r * 0.32); g.stroke();
  });
}

export const chequebook: Illustration = {
  k: "chequebook", name: "Chequebook", title: "No cheques written", body: "Write or deposit a cheque and it will be listed here with its amount and date.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 26, 9, 0.11);
    p.rotate("z", -0.62); // turned to face us
    // the pad behind: the cheques under the top one, seen as a dark cover with a lit top edge
    p.box(-W, -3, 0, W * 2, 3, H1, { top: 0.2, left: 0.065, right: 0.065, edge: 0 });
    // the cheque: a lit face, the stub cut off by a torn line of dots
    const sheet: V3[] = [[-W, F, H0], [W, F, H0], [W, F, H1], [-W, F, H1]];
    p.face(sheet, 0.2, 0);
    for (let z = H0 + 1; z < H1; z += 2.2) p.dot([-12.5, F + 0.02, z], 0.55, 0);
    // on the stub: two short lines; on the cheque: the payee line, the amount box, the signature line
    p.line([[-19.5, F + 0.02, 19], [-15, F + 0.02, 19]], SH.edge, 0.8);
    p.line([[-19.5, F + 0.02, 14], [-15, F + 0.02, 14]], SH.edge, 0.8);
    p.line([[-9.5, F + 0.02, 19], [8, F + 0.02, 19]], SH.edge, 0.8);
    p.clear([[11, F + 0.02, 16.6], [19.5, F + 0.02, 16.6], [19.5, F + 0.02, 22.4], [11, F + 0.02, 22.4]]);
    p.line([[-9.5, F + 0.02, 14], [6, F + 0.02, 14]], SH.edge, 0.8);
    p.line([[2, F + 0.02, 7.6], [19.5, F + 0.02, 7.6]], SH.edge, 0.8);
    // a currency mark in the amount box, bright
    const [mx, my] = p.pt([15.25, F + 0.04, 19.5]);
    p.screen((g) => { g.fillStyle = "#fff"; g.fillRect(mx - 0.7, my - 2, 1.4, 4); g.fillRect(mx - 1.8, my - 0.6, 3.6, 1.2); });
    // the signature, written as the pen moves along the line
    const k = ease(clamp(h / 0.6));
    const n = Math.round(k * (SIG.length - 1));
    if (n > 0) p.line(SIG.slice(0, n + 1).map(([x, z]) => [x, F + 0.03, z] as V3), SH.edge, 1);
    // the pen: a thick bright body leaning on the cheque, its nib at the end of the signature
    const [nx, nz] = n > 0 ? SIG[n] : [3, 12];
    const lift = clamp((h - 0.6) / 0.2) * 2.5;
    const tip: V3 = [nx, F + 0.5, nz + lift], dir: [number, number] = [0.42, 0.91];
    const L = 24, R = 2;
    const o = (s: number, w: number): V3 => [tip[0] + dir[0] * s - dir[1] * w, tip[1], tip[2] + dir[1] * s + dir[0] * w];
    p.face([o(-0.8, 0), o(3.2, R + 0.8), o(L + 0.8, R + 0.8), o(L + 0.8, -R - 0.8), o(3.2, -R - 0.8)], 0.03, 0);
    p.face([o(0, 0), o(3.4, R), o(L, R), o(L, -R), o(3.4, -R)], 0.45, 0);
    p.face([o(L - 6, R), o(L, R), o(L, -R), o(L - 6, -R)], 0.12, 0);
    p.line([o(3.4, R), o(3.4, -R)], SH.edge, 0.7);
    const b = clamp((h - 0.72) / 0.28);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      tickBadge(p, [-W + 3, F, H1 + 1], 4.6 * pop);
    }
  },
};
