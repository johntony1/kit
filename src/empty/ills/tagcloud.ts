// No tags yet: one big label tag standing up, its point to the left with a hole and a looped string, a bold hash mark cut into its face. Hover and a second tag fans out from behind it and the front tag sways.
import { easeInOut, type Illustration, type Pen, type V3 } from "../dots";

type P2 = [number, number];
const area = (p: Pen, q: V3[]) => { const s = q.map((v) => p.pt(v)); let a = 0; for (let i = 0; i < s.length; i++) { const j = (i + 1) % s.length; a += s[i][0] * s[j][1] - s[j][0] * s[i][1]; } return a; };
const at = (o: P2[], y: number): V3[] => o.map(([x, z]) => [x, y, z]);
// a slab standing up and facing us: the outline (x, z) at depth y, pushed back by T; the rim that shows, then the front
function slab(p: Pen, o: P2[], y: number, T: number, front: number) {
  const F = at(o, y), B = at(o, y - T), s = area(p, F);
  for (let i = 0; i < o.length; i++) {
    const j = (i + 1) % o.length, q = [F[i], F[j], B[j], B[i]];
    if (area(p, q) * s < 0) p.face(q, Math.abs(o[j][0] - o[i][0]) > Math.abs(o[j][1] - o[i][1]) ? 0.12 : 0.05, 0);
  }
  p.face(F, front, 0);
}

// the tag's outline: a body with rounded right corners and a blunt point on the left; g grows it
function outline(g = 0): P2[] {
  const o: P2[] = [[-7 - g * 0.4, -10 - g], [13, -10 - g]];
  const r = 3 + g;
  for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + (i / 5) * Math.PI / 2; o.push([13 + Math.cos(a) * r, -7 + Math.sin(a) * r]); }
  for (let i = 0; i <= 5; i++) { const a = (i / 5) * Math.PI / 2; o.push([13 + Math.cos(a) * r, 7 + Math.sin(a) * r]); }
  o.push([-7 - g * 0.4, 10 + g], [-17 - g, 2.2], [-17 - g, -2.2]);
  return o;
}
const ring = (cx: number, cz: number, r: number, y: number): V3[] => Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]; });

function tag(p: Pen, y: number, tone: number, hash: boolean) {
  p.clear(at(outline(1.1), y));
  slab(p, outline(), y, 1.8, tone);
  p.clear(ring(-12.5, 0, 2.2, y + 0.04)); // the hole
  if (!hash) return;
  // the hash: two slanted uprights and two bars, cut in bold
  const f = y + 0.05, w = 0.95;
  for (const x of [-0.5, 5.5]) p.clear([[x - w - 1.4, f, -6.5], [x + w - 1.4, f, -6.5], [x + w + 1.4, f, 6.5], [x - w + 1.4, f, 6.5]]);
  for (const z of [-2.6, 2.6]) p.clear([[-5.5, f, z - w], [11, f, z - w], [11, f, z + w], [-5.5, f, z + w]]);
}

export const tagcloud: Illustration = {
  k: "tagcloud", name: "Tags", title: "No tags yet", body: "Add tags to sort things out, and they will gather here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = easeInOut(Math.min(1, h * 1.3));
    p.translate(0, 0, 1);
    p.push(); p.translate(0, 0, -18); p.shadow(0, 1, 24, 9, 0.1); p.pop();
    p.rotate("z", -0.6);
    // the second tag, tucked behind; it fans out up and to the right
    p.push();
    p.translate(1 + 2 * k, 0, 2 + 4 * k);
    p.rotate("y", -0.42 - 0.12 * k, [-12.5, 0, 0]);
    tag(p, -3, 0.12, false);
    p.pop();
    // the front tag, tipped down at its point, swaying a little while hovered
    p.push();
    p.rotate("y", 0.32 + h * Math.sin(t * 2.4) * 0.05, [-12.5, 0, 0]);
    tag(p, 0, 0.42, true);
    // the string: through the hole and looping off to the left
    const pts = ([[-12.5, 0.2, 2.2], [-15, 0.2, 7], [-21, 0.2, 9], [-24, 0.2, 5], [-21.5, 0.2, 1.5], [-17.5, 0.2, 3]] as V3[]).map((v) => p.pt(v));
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length - 1; i++) g.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
      g.stroke();
    });
    p.pop();
  },
};
