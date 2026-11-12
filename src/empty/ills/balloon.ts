// Nothing to celebrate yet: one big balloon on a string. Hover and it lifts and sways, its string ripples and sparkles pop around it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const RX = 13.2, RY = 15.2; // the balloon's half width and half height
// the balloon's outline: an oval drawn in a little toward the knot
const skin = (a: number, k = 1): P2 => { const s = Math.sin(a), c = Math.cos(a); return [c * RX * k * (s < 0 ? 1 - 0.2 * s * s : 1), s * RY * k]; };
// a four point sparkle, flat to the screen
const spark = (p: Pen, at: P2, r: number) => {
  if (r <= 0.05) return;
  const [x, y] = p.pt(B(at));
  p.screen((g) => { g.fillStyle = "#fff"; g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, q = i % 2 ? r * 0.3 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); });
};

export const balloon: Illustration = {
  k: "balloon", name: "Balloon", title: "Nothing to celebrate yet", body: "Reach your first milestone and it will be marked here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = ease(h);
    p.push(); p.translate(0, 0, -25); p.shadow(0, 0, 18, 8, 0.1); p.pop();
    const cx = h * Math.sin(t * 1.7) * 1.6, cy = 7 + 2.6 * e + h * Math.sin(t * 2.3) * 0.7;
    const at = ([u, v]: P2): P2 => [cx + u, cy + v];
    // the string: one clear line hanging from the knot, rippling while hovered
    const str = Array.from({ length: 23 }, (_, i) => { const s = i / 22; return p.pt(B([cx * (1 - s) + Math.sin(s * 5.4 + t * 2.4 * (h > 0 ? 1 : 0)) * 1.9 * s * (0.55 + 0.45 * h), cy - RY - 2.6 - s * (15 + 2.6 * e)])); });
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); str.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); });
    // the knot, then the skin: lit, with a shaded side and a cut for the shine
    p.face([at([0, -RY + 0.6]), at([-2.5, -RY - 3]), at([2.5, -RY - 3])].map(B), 0.24, 0);
    const out = Array.from({ length: 48 }, (_, i) => at(skin((i / 48) * Math.PI * 2)));
    p.face(out.map(B), 0.24, 0);
    const shade: P2[] = [];
    for (let i = 0; i <= 20; i++) shade.push(at(skin(-1.75 + (i / 20) * 2.5)));
    for (let i = 20; i >= 0; i--) { const [u, v] = skin(-1.75 + (i / 20) * 2.5, 0.985); const f = Math.sin((i / 20) * Math.PI); shade.push(at([u - 5.2 * f, v + 3.4 * f])); }
    p.face(shade.map(B), 0.09, 0);
    p.line([...out, out[0]].map(B), SH.edge, 0.6);
    p.line(Array.from({ length: 9 }, (_, i) => at(skin(2.05 + (i / 8) * 0.75, 0.68))).map(B), SH.edge, 1.3);
    // sparkles pop in around it
    const k = Math.max(0, (h - 0.45) / 0.55);
    ([[-20, 17], [19, 21], [21, -3]] as P2[]).forEach((q, i) => spark(p, q, k * (2.6 + 0.9 * Math.sin(t * 3.4 + i * 2.1))));
  },
};
