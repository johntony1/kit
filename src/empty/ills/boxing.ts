// No rounds yet: a boxing glove seen side on, fist to the left, thumb curled across its front, a bright cuff to the lower right. Hover and it throws a quick jab and snaps back, impact marks flashing at its knuckles.
import { type Illustration, type V3 } from "../dots";

const cl = (x: number) => Math.max(0, Math.min(1, x));

export const boxing: Illustration = {
  k: "boxing", name: "Boxing glove", title: "No rounds yet", body: "Log your first session and your rounds and training time will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    // a jab: out fast, then a slower return
    const k = cl(h / 0.5), j = k < 0.4 ? Math.sin((k / 0.4) * Math.PI * 0.5) : 1 - 0.8 * ((k - 0.4) / 0.6);
    const dx = -5 * j, tilt = -0.38 + 0.12 * j;
    p.translate(0, 0, -15);
    p.shadow(1, 1, 30, 10, 0.12);
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    // the glove lives in the plane that faces us: u across, v up, d toward us; it tips about its middle
    const G = (u: number, v: number, d = 0): V3 => {
      const x = u * ct - (v - 15) * st + dx, z = u * st + (v - 15) * ct + 15;
      return [x * 0.577 + d, -x * 0.577 + d, z];
    };
    const ell = (cu: number, cv: number, ru: number, rv: number, rot: number, d = 0, a0 = 0, a1 = Math.PI * 2, n = 40): V3[] =>
      Array.from({ length: n }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n, eu = Math.cos(a) * ru, ev = Math.sin(a) * rv; return G(cu + eu * Math.cos(rot) - ev * Math.sin(rot), cv + eu * Math.sin(rot) + ev * Math.cos(rot), d); });
    const cuff = (d: number): V3[] => [G(5, 8, d), G(17, 8.5, d), G(17, 23, d), G(5, 23.5, d)];
    // depth first: every part stepped back, so the top rims show lit
    for (let d = -3.5; d < 0; d += 0.5) {
      p.face(cuff(d), 0.2, 0);
      p.face(ell(-3, 17, 13, 10.5, 0.08, d), 0.2, 0);
    }
    // the cuff: bright, a dark band round it, its open end a dark mouth
    p.face(cuff(0), 0.28, 0);
    p.face([G(11, 8.4, 0.1), G(13, 8.4, 0.1), G(13, 23.2, 0.1), G(11, 23.3, 0.1)], 0.05, 0);
    p.face(ell(17, 15.7, 2, 7.3, 0, -1.5), 0.02, 0);
    // the fist: dense below, lit across its top
    p.face(ell(-3, 17, 13, 10.5, 0.08), 0.12, 0);
    p.face(ell(-4, 20.5, 10.5, 6.5, 0.1, 0.1), 0.22, 0);
    // the thumb curled across the front, cut free by its outline
    const th = ell(-6, 12.5, 7.5, 3.6, 0.38, 0.3);
    p.face(th, 0.28, 0);
    p.line([...th, th[0]], 1, 1.2);
    // the fold where the fingers curl over
    p.line([G(-12, 21, 0.3), G(-11.5, 18, 0.3), G(-12.2, 15.5, 0.3)], 1, 1);
    p.line([G(4.8, 8.5, 0.3), G(5.4, 16, 0.3), G(4.8, 23, 0.3)], 1, 1.1);
    // impact marks off the knuckles at full stretch
    if (j > 0.55) {
      const a = (j - 0.55) / 0.45;
      p.screen((g) => {
        g.strokeStyle = "#fff"; g.lineWidth = 1.6; g.lineCap = "round";
        ([[-17.5, 24, -20.5, 27.5], [-18.5, 17, -22.5, 17], [-17.5, 10, -20.5, 7]] as const).forEach(([u0, v0, u1, v1]) => {
          const [x0, y0] = p.pt(G(u0, v0, 0.3)), [x1, y1] = p.pt(G(u0 + (u1 - u0) * a, v0 + (v1 - v0) * a, 0.3));
          g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        });
      });
    }
  },
};
