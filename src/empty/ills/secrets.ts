// No secrets stored: a masked entry field with a small open padlock sitting on top. Hover and five masked dots type in, then the padlock snaps shut.
import { SH, type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const pop = (b: number) => (b <= 0 ? 0 : b < 0.65 ? ease(b / 0.65) * 1.25 : 1.25 - 0.25 * ease((b - 0.65) / 0.35));

export const secrets: Illustration = {
  k: "secrets", name: "Secrets vault", title: "No secrets stored", body: "Store a key or a password here. It stays masked and only your services can read it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -11);
    p.scale(1.05);
    p.shadow(0, 0, 27, 13, 0.12);
    p.rotate("z", -0.45);
    p.box(-16, -3.5, 0, 32, 7, 14, { top: 0.2, left: 0.13, right: 0.065, lw: 0.6 });
    const fy = 3.53;
    const win: V3[] = [[-13.4, fy, 3], [13.4, fy, 3], [13.4, fy, 11], [-13.4, fy, 11]];
    p.clear(win);
    p.line([...win, win[0]], SH.edge, 0.5);
    // the masked characters: faint places at rest, bright dots as they are typed
    let typed = 0;
    for (let i = 0; i < 5; i++) {
      const x = -9.6 + i * 4.8, k = cl((h * 1.2 - i * 0.13) / 0.16);
      if (k > 0) { p.dot([x, fy + 0.03, 7], 1.45 * pop(k), 1); typed = i + 1; }
      else p.dot([x, fy + 0.03, 7], 0.5, 0.35);
    }
    if (typed < 5 && (h > 0.02 || Math.sin(t * 5) > 0)) { const x = -12 + typed * 4.8; p.line([[x, fy + 0.03, 5], [x, fy + 0.03, 9]], SH.edge, 0.7); }
    // the padlock on top: its shackle stands open until the secret is in
    const shut = ease(cl((h - 0.72) / 0.2)), lift = 2.6 * (1 - shut);
    const cx = 9, zb = 14, bh = 6.4, r = 2.6;
    const arc: V3[] = [[cx - r, 0, zb + bh - 0.5], [cx - r, 0, zb + bh + 1.4 + lift]];
    for (let i = 1; i < 10; i++) { const a = Math.PI - (Math.PI * i) / 10; arc.push([cx + Math.cos(a) * r, 0, zb + bh + 1.4 + lift + Math.sin(a) * r]); }
    arc.push([cx + r, 0, zb + bh + 1.4 + lift], [cx + r, 0, zb + bh - 0.5 + lift]);
    p.line(arc, SH.edge, 1.5);
    p.box(cx - 4.3, -2.6, zb, 8.6, 5.2, bh, { top: 0.24, left: 0.32, right: 0.12, lw: 0.6 });
    p.dot([cx, 2.65, zb + bh / 2], 0.9, 0);
  },
};
