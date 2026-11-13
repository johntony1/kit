// No products yet: a skincare set, a tall pump bottle with a label band and a squat jar of cream. Hover and the pump dips while the jar's lid lifts and tips back on the cream.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

// the visible half of a cylinder's side between two heights, as one face
function band(p: Pen, cx: number, cy: number, r: number, z0: number, z1: number, fill: number) {
  const N = 40, pts: V3[] = [];
  for (let i = 0; i <= N / 2; i++) { const a = -Math.PI / 4 + (i / N) * Math.PI * 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, z0]); }
  for (let i = N / 2; i >= 0; i--) { const a = -Math.PI / 4 + (i / N) * Math.PI * 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, z1]); }
  p.face(pts, fill, 0);
}

export const skincare: Illustration = {
  k: "skincare", name: "Skincare", title: "No products yet", body: "Add your first product and it will appear here for customers to browse.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 28, 13, 0.12);
    const e = easeInOut(Math.min(1, h * 1.4));
    // the pump bottle, behind and to the left
    const bx = -6, by = 2.5, R = 6.2, H = 21;
    p.cylinder(bx, by, 0, R, H, { side: 0.12, top: 0.2, edge: 0 });
    band(p, bx, by, R + 0.03, 6, 14.5, 0.24); // the label
    p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 40) * Math.PI * 2; return [bx + Math.cos(a) * (R + 0.06), by + Math.sin(a) * (R + 0.06), 10.2] as V3; }), SH.edge, 0.7);
    // shoulder, collar, then the pump stem and head, which dip on hover
    p.cylinder(bx, by, H, 3, 1.8, { side: 0.065, top: 0.2, edge: 0 });
    const dip = e * 2.2 * (1 - 0.25 * Math.max(0, Math.sin(t * 5)) * h);
    p.cylinder(bx, by, H + 1.8, 0.9, 4.4 - dip, { side: 0.2, top: 0.2, edge: 0 });
    const hz = H + 6.2 - dip;
    p.box(bx - 2, by - 2, hz, 4, 4, 2.6, { top: 0.24, left: 0.13, right: 0.065, edge: 0 });
    p.box(bx + 2, by - 0.8, hz + 1, 4.2, 1.6, 1.4, { top: 0.24, left: 0.13, right: 0.065, edge: 0 }); // the nozzle
    // the jar in front, to the right: a wide body and a lid
    const jx = 5.5, jy = -2.5, JR = 7.2, JH = 7;
    p.cylinder(jx, jy, 0, JR, JH, { side: 0.12, top: 0.3, edge: 0 }); // its top is the cream, lit
    p.disc(jx, jy, JH + 0.02, JR - 1, 0.32, 0);
    p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 40) * Math.PI * 2; return [jx + Math.cos(a) * (JR + 0.05), jy + Math.sin(a) * (JR + 0.05), 3] as V3; }), SH.edge, 0.7);
    // the lid lifts and tips back about its far edge
    p.push();
    p.translate(0, 0, e * 5.5 + h * Math.sin(t * 3) * 0.5);
    p.rotate("y", -e * 0.32, [jx, jy, JH + 1.7]);
    p.cylinder(jx, jy, JH, JR + 0.4, 3.4, { side: 0.065, top: 0.22, edge: 0 });
    p.line(Array.from({ length: 21 }, (_, i) => { const a = -Math.PI / 4 + (i / 40) * Math.PI * 2; return [jx + Math.cos(a) * (JR + 0.45), jy + Math.sin(a) * (JR + 0.45), JH + 1.2] as V3; }), SH.edge, 0.6);
    p.pop();
  },
};
