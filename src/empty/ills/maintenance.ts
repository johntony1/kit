// Down for maintenance: a monitor on a stand. A little crane lowers a worried screen onto it, then lifts it away; a striped barrier and a cone wait at its foot.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 6; // seconds per loop
type P2 = [number, number];
/** clip a polygon (in x,z) to a rectangle */
const clipRect = (poly: P2[], x0: number, x1: number, z0: number, z1: number): P2[] => {
  const edge = (pts: P2[], inside: (q: P2) => boolean, cut: (a: P2, b: P2) => P2) => {
    const out: P2[] = [];
    pts.forEach((b, i) => {
      const a = pts[(i + pts.length - 1) % pts.length];
      if (inside(b)) { if (!inside(a)) out.push(cut(a, b)); out.push(b); }
      else if (inside(a)) out.push(cut(a, b));
    });
    return out;
  };
  const atX = (x: number) => (a: P2, b: P2): P2 => [x, a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0])];
  const atZ = (z: number) => (a: P2, b: P2): P2 => [a[0] + ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]), z];
  let r = edge(poly, (q) => q[0] >= x0, atX(x0));
  r = edge(r, (q) => q[0] <= x1, atX(x1));
  r = edge(r, (q) => q[1] >= z0, atZ(z0));
  return edge(r, (q) => q[1] <= z1, atZ(z1));
};
/** the visible half of a cone section around the z axis */
const frustum = (p: Pen, cx: number, cy: number, z0: number, r0: number, z1: number, r1: number, fill: number) => {
  const N = 32, pts: V3[] = [];
  for (let i = 0; i <= N / 2; i++) { const a = -Math.PI / 4 + (i / N) * Math.PI * 2; pts.push([cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, z0]); }
  for (let i = N / 2; i >= 0; i--) { const a = -Math.PI / 4 + (i / N) * Math.PI * 2; pts.push([cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, z1]); }
  p.face(pts, fill, SH.edge, 0.5);
};
/** a lattice member: a thin box with zigzag bracing cut into its lit faces */
const lattice = (p: Pen, x: number, y: number, z: number, w: number, d: number, h: number, along: "x" | "z") => {
  p.box(x, y, z, w, d, h, { top: 0.24, left: 0.16, right: 0.08 });
  const n = Math.round((along === "x" ? w : h) / 2.2);
  const pts: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, lo = i % 2 === 0;
    pts.push(along === "x" ? [x + w * u, y + d + 0.03, z + (lo ? 0.35 : h - 0.35)] : [x + (lo ? 0.35 : w - 0.35), y + d + 0.03, z + h * u]);
  }
  p.line(pts, SH.edge, 0.5);
};

const MX = 0, MY = -4, MZ = 4, MW = 9.5, MH = 10.5; // the monitor: centre x, centre y, bottom, half width, height
const FY = MY + 1.6; // its front face

export const maintenance: Illustration = {
  k: "maintenance", name: "Maintenance", title: "Down for maintenance", body: "We're tuning a few things behind the scenes. Please check back soon.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    // the panel: up under the jib, lowered onto the screen, rests, lifted away
    const down = u < 0.12 ? 0 : u < 0.42 ? easeInOut((u - 0.12) / 0.3) : u < 0.8 ? 1 : u < 0.97 ? 1 - easeInOut((u - 0.8) / 0.17) : 0;
    const settle = u > 0.42 && u < 0.55 ? Math.sin(((u - 0.42) / 0.13) * Math.PI * 2) * 0.35 * (1 - (u - 0.42) / 0.13) : 0;
    p.translate(-1, -1, -13);
    p.shadow(0, 2, 30, 14, 0.1);

    // the crane, behind and to the right of the monitor
    const JZ = 27.5, CX = 14;
    p.box(CX - 2.5, MY - 3, 0, 5, 5, 2, { top: 0.22, left: 0.14, right: 0.07 });
    lattice(p, CX - 1, MY - 1.6, 2, 2, 2, JZ - 2, "z");
    lattice(p, -6, MY + 0.4 - 1, JZ, CX + 8, 2, 1.6, "x"); // the jib, over the monitor
    p.box(CX + 2.5, MY - 1, JZ - 2.6, 3.4, 2.4, 2.6, { top: 0.24, left: 0.14, right: 0.07 }); // counterweight
    p.box(CX - 1.4, MY - 1.2, JZ + 1.6, 2.8, 2.4, 2.4, { top: 0.24, left: 0.16, right: 0.08 }); // cab
    // the trolley and the cable
    const PW = 7.3, PH = 7; // the panel's half width and height
    const seat = MZ + 1.75, upZ = JZ - 3.2 - PH; // the panel's bottom when seated, and when up
    const pz = upZ + (seat - upZ) * down + settle;
    p.box(-1.6, FY - 0.6, JZ - 1.2, 3.2, 1.6, 1.2, { top: 0.24, left: 0.16, right: 0.08 });
    const cable = (x: number) => p.face([[x - 0.25, FY + 0.4, JZ - 1.2], [x + 0.25, FY + 0.4, JZ - 1.2], [x + 0.25, FY + 0.4, pz + PH + 1.4], [x - 0.25, FY + 0.4, pz + PH + 1.4]], 0.3, 0);
    cable(0);

    // the monitor on its stand
    p.box(MX - 3.5, MY - 3, 0, 7, 4, 0.8, { top: 0.2, left: 0.13, right: 0.065 });
    p.box(MX - 1.3, MY - 2.2, 1, 2.6, 1.8, MZ - 1, { top: 0.22, left: 0.14, right: 0.07 });
    p.box(MX - MW, MY - 1.6, MZ, MW * 2, 3.2, MH, { top: 0.22, left: 0.065, right: 0.12 });
    // the blank screen inside the bezel
    p.face([[MX - MW + 1.8, FY + 0.02, MZ + 1.8], [MX + MW - 1.8, FY + 0.02, MZ + 1.8], [MX + MW - 1.8, FY + 0.02, MZ + MH - 1.8], [MX - MW + 1.8, FY + 0.02, MZ + MH - 1.8]], 0.02, 0);
    p.dot([MX, FY + 0.05, MZ + 0.9], 0.5, 1); // the power light

    // the panel with its worried face, hanging from a hook
    p.push();
    p.translate(0, 0, pz);
    const y = FY + 0.4;
    p.line([[-1.6, y, PH + 1.4], [0, y, PH], [1.6, y, PH + 1.4]], SH.edge, 0.1); // sling
    p.face([[-1.8, y, PH + 1.6], [0, y, PH - 0.1], [1.8, y, PH + 1.6]], 0, SH.edge, 0.6);
    p.box(-PW, y - 0.5, 0, PW * 2, 0.9, PH, { top: 0.28, left: 0.24, right: 0.1 });
    const fy = y + 0.45, look = Math.sin(t * 1.6) * 0.8 * down;
    // eyes, brows tilted up in the middle, and a wobbly mouth
    for (const s of [-1, 1]) {
      p.line([[s * 2.6 + look, fy, 3.7], [s * 2.6 + look, fy, 4.7]], SH.edge, 1.2);
      p.line([[s * 4.1, fy, 5.6], [s * 1.5, fy, 6.3]], SH.edge, 0.7);
    }
    p.line(Array.from({ length: 9 }, (_, i) => [-3.2 + i * 0.8, fy, 1.7 + (i % 2 ? 0.5 : 0)] as V3), SH.edge, 0.65);
    p.pop();

    // a drop of sweat once it lands
    const sw = u > 0.5 && u < 0.78 ? (u - 0.5) / 0.28 : 0;
    if (sw > 0) p.dot([PW + 0.5, FY + 0.6, seat + PH - 1 - sw * 3], 0.9, Math.sin(sw * Math.PI));

    // a striped barrier at the foot, and a cone
    const bx0 = -17, bx1 = -3, by = 7;
    for (const x of [bx0 + 1.5, bx1 - 1.5]) p.box(x - 0.6, by - 1.4, 0, 1.2, 1.2, 8, { top: 0.25, left: 0.16, right: 0.08 });
    p.box(bx0, by - 0.8, 4, bx1 - bx0, 0.8, 3.8, { top: 0.22, left: 0.06, right: 0.12 });
    const w = 2.4, k = 3;
    for (let s = bx0; s < bx1 + k; s += w * 2) {
      const band = clipRect([[s, 4], [s + w, 4], [s + w - k, 7.8], [s - k, 7.8]], bx0, bx1, 4, 7.8);
      if (band.length > 2) p.face(band.map(([x, z]) => [x, by + 0.02, z] as V3), 0.3, 0);
    }
    const cx = 15, cy = 9;
    p.box(cx - 3.8, cy - 3.8, 0, 7.6, 7.6, 1, { top: 0.2, left: 0.13, right: 0.065 });
    frustum(p, cx, cy, 1, 3.2, 4, 2.6, 0.065);
    frustum(p, cx, cy, 4, 2.6, 6.8, 2, 0.3);
    frustum(p, cx, cy, 6.8, 2, 10, 1.1, 0.065);
    p.disc(cx, cy, 10, 1.1, 0.3, SH.edge);
  },
};
