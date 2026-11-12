// No devices signed in: an open laptop and a phone, both screens dark. Hover and the laptop wakes, then the phone, each showing a tick.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const cl = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** a screen on a face that looks toward +y: dark when off, bright with a cut tick when on */
function display(p: Pen, x0: number, z0: number, x1: number, z1: number, y: number, on: number, s: number) {
  const r = (g: number, d: number): V3[] => [[x0 + g, y + d, z0 + g], [x1 - g, y + d, z0 + g], [x1 - g, y + d, z1 - g], [x0 + g, y + d, z1 - g]];
  p.clear(r(0, 0));
  if (on <= 0.02) return;
  // the light spreads out from the middle
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hx = ((x1 - x0) / 2 - 0.5) * on, hz = ((z1 - z0) / 2 - 0.5) * Math.min(1, on * 1.6);
  p.face([[cx - hx, y + 0.01, cz - hz], [cx + hx, y + 0.01, cz - hz], [cx + hx, y + 0.01, cz + hz], [cx - hx, y + 0.01, cz + hz]], 0.9, 0);
  if (on > 0.8) p.line([[cx - 2.3 * s, y + 0.03, cz + 0.1 * s], [cx - 0.6 * s, y + 0.03, cz - 1.7 * s], [cx + 2.5 * s, y + 0.03, cz + 1.7 * s]], SH.edge, 1.3);
}

export const devices: Illustration = {
  k: "devices", name: "Devices", title: "No devices signed in", body: "Phones and computers you sign in on will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -10);
    p.shadow(-1, 2, 31, 15, 0.12);
    p.rotate("z", -0.36);
    p.translate(-4, -3, 0);
    // the laptop's lid, leaning back a touch, then its base with keys cut in
    p.push();
    p.rotate("x", 0.16, [0, -6.6, 1.4]);
    p.box(-15, -7.8, 1.4, 30, 1.2, 20, { top: 0.3, left: 0.2, right: 0.065, lw: 0.7 });
    display(p, -13.6, 2.9, 13.6, 20, -6.57, ease(cl(h / 0.45)), 1.5);
    p.pop();
    p.box(-15, -6.6, 0, 30, 17, 1.4, { top: 0.2, left: 0.12, right: 0.065, lw: 0.7 });
    for (let i = 0; i < 3; i++) p.line([[-12, -3.6 + i * 2.5, 1.43], [12, -3.6 + i * 2.5, 1.43]], SH.edge, 1.2);
    p.line([[-4, 5, 1.43], [4, 5, 1.43], [4, 8.6, 1.43], [-4, 8.6, 1.43], [-4, 5, 1.43]], SH.edge, 0.7);
    // the phone standing in front
    p.push();
    p.translate(19, 10.5, 0);
    p.rotate("z", 0.16);
    p.box(-4.8, -0.9, 0, 9.6, 1.8, 18.5, { top: 0.3, left: 0.2, right: 0.065, lw: 0.7 });
    display(p, -3.8, 1.3, 3.8, 17.2, 0.93, ease(cl((h - 0.4) / 0.45)), 1);
    p.pop();
  },
};
