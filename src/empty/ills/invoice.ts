// No invoices: a small stack of invoices under a rubber stamp. Hover and the stamp comes down, again and again, marking the top one paid.
import { SH, type Illustration, type Pen } from "../dots";

const SW = 9, SD = 6.6, ST = 1.1; // a sheet: half width, half depth, thickness
const A = -0.32; // the stamp's turn on the page

// one sheet lying at height z, turned by r around its middle
function sheet(p: Pen, z: number, r: number, dx: number, dy: number, top: number) {
  p.push();
  p.translate(dx, dy, 0);
  p.rotate("z", r);
  p.box(-SW, -SD, z, SW * 2, SD * 2, ST, { top, left: 0.12, right: 0.065 });
  // a gap along its near edges so each sheet reads apart from the next
  p.line([[-SW, SD, z + ST], [SW, SD, z + ST], [SW, -SD, z + ST]], SH.edge, 0.5);
  p.pop();
}
// lift for the stamp over one stroke: down and pressed, up and held, then down again
function stroke(t: number) {
  const u = (t % 1.7) / 1.7;
  const ease = (x: number) => x * x * (3 - 2 * x);
  if (u < 0.22) return 0;
  if (u < 0.45) return ease((u - 0.22) / 0.23);
  if (u < 0.8) return 1;
  const k = (u - 0.8) / 0.2;
  return 1 - k * k; // falls, quickening, onto the page
}

export const invoice: Illustration = {
  k: "invoice", name: "Invoices", title: "No invoices", body: "Invoices you send or receive will be kept here, ready when you need them.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(1, 1, -11);
    p.shadow(0, 0, 24, 12, 0.12);
    // the stack
    sheet(p, 0, 0.16, -0.6, 0.8, 0.17);
    sheet(p, ST, -0.1, 0.8, -0.4, 0.17);
    sheet(p, ST * 2, 0.06, 0, 0.4, 0.17);
    const zt = ST * 3;
    p.box(-SW, -SD, zt, SW * 2, SD * 2, ST, { top: 0.23, left: 0.12, right: 0.065 });
    const z = zt + ST + 0.02;
    // the top invoice: a heading, a block of line items, a rule and the total
    p.line([[-7, -4.8, z], [-3, -4.8, z]], SH.edge, 1);
    p.line([[4, -4.8, z], [7, -4.8, z]], SH.edge, 0.55);
    for (let i = 0; i < 3; i++) p.line([[-7, -2 + i * 2, z], [-4 + (i % 2) * 0.8, -2 + i * 2, z]], SH.edge, 0.55);
    p.line([[-7, 3.4, z], [-3.6, 3.4, z]], SH.edge, 0.45);
    p.line([[-7, 5.1, z], [-4.4, 5.1, z]], SH.edge, 0.7);
    p.line([[4.2, 5.1, z], [7, 5.1, z]], SH.edge, 0.9);
    // the stamp's mark, once it has come down
    const cx = 2.4, cy = 0.6, c = Math.cos(A), s = Math.sin(A);
    const R = (x: number, y: number): [number, number, number] => [cx + x * c - y * s, cy + x * s + y * c, z + 0.02];
    if (h > 0.55) {
      p.line([R(-4.2, -2.3), R(4.2, -2.3), R(4.2, 2.3), R(-4.2, 2.3), R(-4.2, -2.3)], SH.edge, 0.6);
      p.line([R(-2.6, 0), R(2.6, 0)], SH.edge, 1);
    }
    // the stamp: high at rest; hovered, it drops onto the page and keeps stamping
    const lift = 1 - h + h * stroke(t);
    const zs = z + 0.1 + lift * 9.5;
    p.push();
    p.translate(cx, cy, 0);
    p.rotate("z", A);
    p.box(-4.6, -2.6, zs, 9.2, 5.2, 1.3, { top: 0.12, left: SH.right, right: SH.right }); // the rubber
    p.box(-4.2, -2.3, zs + 1.3, 8.4, 4.6, 2.4, { top: 0.24, left: 0.13, right: SH.right }); // the mount
    p.line([[-4.2, 2.3, zs + 2.6], [4.2, 2.3, zs + 2.6]], SH.edge, 0.55);
    p.cylinder(0, 0, zs + 3.7, 1, 4.4, { side: SH.right, top: 0.2 }); // the neck
    p.cylinder(0, 0, zs + 7.8, 2.8, 1.4, { side: 0.13, top: 0.13 }); // the knob, a rounded cap
    p.cylinder(0, 0, zs + 9.2, 2.2, 0.8, { side: 0.16, top: 0.27 });
    p.pop();
    // a puff of ink specks where it hits
    const u = (t % 1.7) / 1.7;
    if (h > 0.9 && u < 0.18) {
      const k = u / 0.18;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.4;
        p.dot([cx + Math.cos(a) * (6 + k * 3.5), cy + Math.sin(a) * (4.2 + k * 2.5), z + 0.6 + k * 1.4], 0.6, 1 - k);
      }
    }
  },
};
