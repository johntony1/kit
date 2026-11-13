// No rooms booked: a round meeting table with four chairs tucked in around it. Hover and the chairs slide out one by one; a plus badge pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const TR = 14, TZ = 11; // table radius and top height

/** a chair at distance d along (ox, oy), its back on the outer side */
function chair(p: Pen, ox: number, oy: number, d: number) {
  const cx = ox * d, cy = oy * d, s = 4, sz = 7;
  const st = { top: 0.22, left: 0.12, right: 0.065, edge: 0 };
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) p.box(cx + a * (s - 0.8) - 0.5, cy + b * (s - 0.8) - 0.5, 0, 1, 1, sz, st);
  const back = () => ox ? p.box(cx + ox * s - (ox > 0 ? 1.6 : 0), cy - s, sz, 1.6, 2 * s, 7.5, st) : p.box(cx - s, cy + oy * s - (oy > 0 ? 1.6 : 0), sz, 2 * s, 1.6, 7.5, st);
  const behind = ox < 0 || oy < 0;
  if (behind) back();
  p.box(cx - s, cy - s, sz, 2 * s, 2 * s, 1.6, st);
  p.line([[cx + s + 0.03, cy + s + 0.03, sz], [cx + s + 0.03, cy + s + 0.03, sz + 1.6]], SH.edge, 0.5);
  if (!behind) back();
}

export const meetingroom: Illustration = {
  k: "meetingroom", name: "Meeting room", title: "No rooms booked", body: "Book a room for your next meeting and it will be held here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -11);
    p.shadow(0, 0, 36, 18, 0.12);
    p.rotate("z", -0.42);
    const d = (i: number) => 19.5 + 2.5 * ease((h - i * 0.15) / 0.55);
    // the two chairs behind the table
    chair(p, -1, 0, d(0));
    chair(p, 0, -1, d(1));
    // the table: a foot, a column and a thick round top
    p.cylinder(0, 0, 0, 5, 1, { side: 0.12, top: 0.2, edge: 0 });
    p.cylinder(0, 0, 1, 1.8, TZ - 3, { side: 0.12, edge: 0 });
    p.cylinder(0, 0, TZ - 2, TR, 2, { side: 0.04, top: 0.3, edge: 0 });
    // a cut round the top, so it stands clear of the chairs
    p.line(Array.from({ length: 41 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [Math.cos(a) * TR, Math.sin(a) * TR, TZ] as V3; }), SH.edge, 0.9);
    // the two chairs in front
    chair(p, 0, 1, d(2));
    chair(p, 1, 0, d(3));
    // a plus badge pops in once the chairs are out
    const b = Math.max(0, (h - 0.7) / 0.3);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35), r = 4.4 * pop;
      const [x, y] = p.pt([-8, -8, TZ + 8]);
      p.screen((g) => {
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round";
        g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x + r * 0.5, y); g.moveTo(x, y - r * 0.5); g.lineTo(x, y + r * 0.5); g.stroke();
      });
    }
  },
};
