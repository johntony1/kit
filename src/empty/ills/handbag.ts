// No purchases yet: a handbag with a top handle and a pointed flap held by a clasp. Hover and the flap swings up to show the empty inside, and a few sparkles rise.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const B = 11.5, W = 8.8, D = 4.6, H = 14.5, F = D + 0.03; // half width at the base and at the top, half depth, height

export const handbag: Illustration = {
  k: "handbag", name: "Handbag", title: "No purchases yet", body: "Things you buy will be listed here once your first order is placed.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(clamp(h / 0.65));
    p.translate(0, 0, -11.5);
    p.shadow(0, 0, 26, 13, 0.12);
    // the body: wider at the base, the top going dark as the flap opens
    p.face([[-W, -D, H], [W, -D, H], [W, D, H], [-W, D, H]], 0.2 - 0.17 * k, SH.edge, 0.6);
    p.face([[-B, D, 0], [B, D, 0], [W, D, H], [-W, D, H]], 0.1, SH.edge, 0.6);
    p.face([[B, -D, 0], [B, D, 0], [W, D, H], [W, -D, H]], 0.05, SH.edge, 0.6);
    p.line([[-B + 1, F, 1.6], [B - 1, F, 1.6]], 0.5, 0.45); // a seam along the base
    p.line([[B - 0.4, 0, 1], [W + 0.03, 0, H - 1]], 0.4, 0.4); // the side gusset
    // the handle: one arch over the top
    const N = 20, hz = H - 0.4, out: V3[] = [], inn: V3[] = [];
    for (let i = 0; i <= N; i++) {
      const a = (Math.PI * i) / N;
      out.push([Math.cos(a) * 6.2, 0, hz + Math.sin(a) * 8.6]);
      inn.push([Math.cos(a) * 4.7, 0, hz + Math.sin(a) * 6.9]);
    }
    p.face([...out, ...inn.reverse()], 0.3, SH.edge, 0.5);
    // the flap, hinged along the top of the front, with its clasp
    p.push();
    p.rotate("x", 1.25 * k, [0, D, H]);
    p.face([[-W, F, H], [W, F, H], [W + 0.5, F, H - 4.6], [0, F, H - 8.2], [-W - 0.5, F, H - 4.6]], 0.26, SH.edge, 0.7);
    p.face([[-1.3, F + 0.03, H - 8.8], [1.3, F + 0.03, H - 8.8], [1.3, F + 0.03, H - 6.4], [-1.3, F + 0.03, H - 6.4]], 0.5, SH.edge, 0.5);
    p.pop();
    // sparkles rising out of the open bag
    const s = clamp((h - 0.6) / 0.4);
    if (s > 0) ([[-5, 0, H + 5], [4, -2, H + 9], [9, 1, H + 4]] as V3[]).forEach((q, i) => p.dot([q[0], q[1], q[2] + Math.sin(t * 2.6 + i * 2) * 0.8], 0.8 + 0.35 * Math.sin(t * 3.2 + i * 2.1), s));
  },
};
