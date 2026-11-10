// No workspace yet: a desk with a monitor, a keyboard and a lamp. Lines type out on the screen and the cursor blinks.
import { SH, type Illustration } from "../dots";

const P = 4.8;

export const workspace: Illustration = {
  k: "workspace", name: "Desk", title: "Set up your workspace", body: "Create a workspace to bring your team, your files and your tools together.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, -15);
    p.shadow(0, 0, 32, 15, 0.12);
    // legs, then the drawer unit, then the top
    const DZ = 11, DT = 1.6;
    p.box(-14, -7, 0, 1.6, 1.6, DZ, { top: 0.2 });
    p.box(-14, 5.4, 0, 1.6, 1.6, DZ, { top: 0.2 });
    p.box(6.5, -7, 3, 7.5, 14, DZ - 3, { top: 0.2, left: 0.12, right: 0.065 });
    p.line([[7.5, 7, 7], [13, 7, 7]], SH.edge, 0.55);
    p.line([[9, 7.02, 9.2], [11.5, 7.02, 9.2]], SH.edge, 0.9);
    p.line([[9, 7.02, 5.2], [11.5, 7.02, 5.2]], SH.edge, 0.9);
    p.box(12.4, 5.4, 0, 1.6, 1.6, 3, { top: 0.2 });
    // the desk top: lit in line art, dense in dots so what stands on it reads
    p.box(-14, -7, DZ, 28, 14, DT, { top: p.ink ? 0.2 : 0.12, left: 0.12, right: 0.065 });
    const Z = DZ + DT;
    if (!p.ink) p.line([[-14, 7, Z], [14, 7, Z], [14, -7, Z]], SH.edge, 0.6);
    // the monitor: a base, a neck, then the screen in its bezel
    p.box(-6.5, -5, Z, 6, 4, 0.6, { top: 0.22, left: 0.065, right: 0.065 });
    p.box(-4.2, -4.4, Z + 0.6, 1.4, 1, 3, { top: 0.2, left: 0.12, right: 0.065 });
    const SY = -3.4, z0 = Z + 3.2, z1 = Z + 13.2, x0 = -11, x1 = 4;
    p.box(x0, SY - 1.2, z0, x1 - x0, 1.2, z1 - z0, { top: 0.2, left: 0.12, right: 0.065 });
    if (!p.ink) p.line([[x0, SY, z0], [x1, SY, z0], [x1, SY - 1.2, z0]], SH.edge, 0.6);
    const y = SY + 0.02;
    p.face([[x0 + 0.9, y, z0 + 0.9], [x1 - 0.9, y, z0 + 0.9], [x1 - 0.9, y, z1 - 0.9], [x0 + 0.9, y, z1 - 0.9]], 0.22, SH.edge, 0.55);
    // the window on the screen: a title bar, typed lines, a blinking cursor, a button
    const yy = y + 0.02;
    p.line([[x0 + 0.9, yy, z1 - 2.6], [x1 - 0.9, yy, z1 - 2.6]], SH.edge, 0.6);
    p.line([[x0 + 2, yy, z1 - 1.75], [x0 + 2, yy, z1 - 1.75]], SH.edge, 1);
    p.line([[x0 + 3.3, yy, z1 - 1.75], [x0 + 3.3, yy, z1 - 1.75]], SH.edge, 1);
    const rows = [9, 6, 10, 4];
    const typed = Math.min(1, u / 0.75) * rows.reduce((a, b) => a + b, 0);
    let left = typed, cz = z1 - 4.2, cx = x0 + 2.2;
    for (let i = 0; i < rows.length; i++) {
      const z = z1 - 4.2 - i * 1.7, n = Math.max(0, Math.min(rows[i], left));
      if (n > 0.2) p.line([[x0 + 2.2, yy, z], [x0 + 2.2 + n, yy, z]], SH.edge, 0.75);
      if (left > 0) { cz = z; cx = x0 + 2.2 + n + 0.6; }
      left -= rows[i];
    }
    if (Math.floor(t * 2.5) % 2 === 0 || u < 0.75) p.line([[cx, yy, cz - 0.5], [cx, yy, cz + 0.5]], SH.edge, 0.9);
    if (u > 0.78) p.face([[x1 - 5, yy, z0 + 1.6], [x1 - 2, yy, z0 + 1.6], [x1 - 2, yy, z0 + 2.8], [x1 - 5, yy, z0 + 2.8]], 0.34, SH.edge, 0.5);
    // the keyboard in front, keys cut into a lit top
    p.box(-9, 0.8, Z, 10, 3.6, 0.7, { top: 0.22, left: 0.065, right: 0.065 });
    for (let i = 0; i < 3; i++) p.line([[-8.2, 1.7 + i * 0.9, Z + 0.72], [0.2, 1.7 + i * 0.9, Z + 0.72]], SH.edge, 0.4);
    // the lamp at the back corner: a base, a post, an arm reaching forward, a shade over a pool of light
    const LX = 11, LY = -4.6, LH = 10, HY = 0.4;
    const g = 0.5 + 0.5 * Math.sin((t / P) * Math.PI * 4);
    p.disc(LX, HY, Z + 0.02, 2.3 + g * 0.5, p.ink ? 0.3 : 0.24, 0);
    p.cylinder(LX, LY, Z, 1.8, 0.8, { side: 0.065, top: 0.22 });
    p.box(LX - 0.45, LY - 0.45, Z + 0.8, 0.9, 0.9, LH, { top: 0.2, left: 0.12, right: 0.065 });
    p.box(LX - 0.45, LY - 0.45, Z + 0.8 + LH, 0.9, HY - LY + 0.45, 0.9, { top: 0.2, left: 0.12, right: 0.065 });
    p.cylinder(LX, HY, Z + LH - 1.6, 1.9, 2.4, { side: p.ink ? 0.12 : 0.065, top: 0.22 });
    for (let i = 0; i < 3; i++) p.dot([LX + (i - 1) * 1.1, HY + (i - 1) * 0.3, Z + LH - 4.2 - g * 1.2 - (i % 2) * 1.2], 0.6, 1);
  },
};
