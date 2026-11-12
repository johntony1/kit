// No packages published: three taped parcels in a stack. Hover and the top one lifts off, ready to ship; an up arrow pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

// a parcel: a box with tape over the top and down the front, and a label on its side
function parcel(p: Pen, x: number, y: number, z: number, w: number, d: number, hg: number, lit = 0) {
  p.box(x, y, z, w, d, hg, { top: 0.2 + lit, left: 0.12, right: 0.065 });
  const cx = x + w / 2, Z = z + hg, f = 0.03;
  p.face([[cx - 1.3, y, Z + f], [cx + 1.3, y, Z + f], [cx + 1.3, y + d, Z + f], [cx - 1.3, y + d, Z + f]], 0.36, 0);
  p.face([[cx - 1.3, y + d + f, Z], [cx + 1.3, y + d + f, Z], [cx + 1.3, y + d + f, Z - 3], [cx - 1.3, y + d + f, Z - 3]], 0.34, 0);
  p.line([[x, y + d + f, Z], [x + w, y + d + f, Z]], SH.edge, 0.5);
  // the label on the right wall
  const X = x + w + f, y0 = y + d * 0.2, y1 = y + d * 0.62;
  p.face([[X, y0, z + 1.6], [X, y1, z + 1.6], [X, y1, z + 4.6], [X, y0, z + 4.6]], 0.26, SH.edge, 0.4);
}

function arrow(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x, y + r * 0.5); g.lineTo(x, y - r * 0.5); g.moveTo(x - r * 0.4, y - r * 0.1); g.lineTo(x, y - r * 0.52); g.lineTo(x + r * 0.4, y - r * 0.1); g.stroke();
  });
}

export const packages: Illustration = {
  k: "packages", name: "Package", title: "No packages published", body: "Publish your first package and its versions will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -11);
    p.shadow(0, 0, 30, 14, 0.12);
    parcel(p, -13, -6, 0, 12, 12, 9);
    parcel(p, 0.5, -5.5, 0, 12.5, 11, 10);
    // the top parcel: sits across the two, lifts and floats on hover
    const k = ease(clamp(h / 0.7)), lift = 6.5 * k + h * Math.sin(t * 2.4) * 0.6;
    if (k > 0.05) {
      p.guide([[-6.5, 5, 9.5], [-6.5, 5, 9.5 + lift]], true);
      p.guide([[5, 5, 9.5], [5, 5, 9.5 + lift]], true);
    }
    parcel(p, -6.5, -5, 9.5 + lift, 11.5, 10, 8.5, 0.06 * k);
    const q = clamp((h - 0.68) / 0.32);
    if (q > 0) arrow(p, [9, -6, 26 + lift * 0.4], 4.6 * (q < 0.65 ? ease(q / 0.65) * 1.18 : 1.18 - 0.18 * ease((q - 0.65) / 0.35)));
  },
};
