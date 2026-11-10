// No branches yet: a board with a main line of commits. A branch forks off, grows a commit at a time and merges back.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const PERIOD = 4.8;
const BX = 17, BY = 11.5, BZ = 2.5; // the board: half width, half depth, thickness
const MY = 5; // the main line's y
const FY = -4.5; // the branch's y
const MAIN = [-12, -6, 6.5, 12]; // main commits (x)
// the branch path: up from main, across, back down into main
const PATH: [number, number][] = [[-6, MY], [-3, FY], [0.5, FY], [3.5, FY], [6.5, MY]];
const NODES = [1, 2, 3]; // branch commits sit on these path points

/** a commit: a short round post with a lit top */
function commit(p: Pen, x: number, y: number, k: number, top: number) {
  if (k <= 0.02) return;
  const r = 2.3 * Math.min(1, 0.4 + k * 0.6);
  p.cylinder(x, y, BZ, r, 1.5 + 3.5 * k, { top, side: SH.left });
}

/** the point a distance s along the branch path, plus the path up to it */
function along(s: number) {
  const seg: number[] = [];
  let total = 0;
  for (let i = 0; i < PATH.length - 1; i++) { const d = Math.hypot(PATH[i + 1][0] - PATH[i][0], PATH[i + 1][1] - PATH[i][1]); seg.push(d); total += d; }
  let left = s * total;
  const pts: [number, number][] = [PATH[0]];
  for (let i = 0; i < seg.length; i++) {
    if (left >= seg[i]) { pts.push(PATH[i + 1]); left -= seg[i]; continue; }
    const f = left / seg[i];
    pts.push([PATH[i][0] + (PATH[i + 1][0] - PATH[i][0]) * f, PATH[i][1] + (PATH[i + 1][1] - PATH[i][1]) * f]);
    break;
  }
  return pts;
}

export const branch: Illustration = {
  k: "branch", name: "Git branch", title: "No branches yet", body: "Create a branch to work on a change without touching the main line.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    const grow = easeInOut(Math.min(1, u / 0.62)); // how much of the branch is drawn
    const out = u > 0.86 ? easeInOut((u - 0.86) / 0.14) : 0; // the branch fades out to start again
    p.translate(0, 0, -5);
    p.shadow(-BX + BY, 0, BY * 2, BY, 0.12);
    p.shadow(BX - BY, 0, BY * 2, BY, 0.12);
    // the board: a lit slab
    p.box(-BX, -BY, 0, BX * 2, BY * 2, BZ, { top: SH.right, left: SH.left, right: SH.right });
    const z = BZ + 0.02;
    const at = (q: [number, number]): V3 => [q[0], q[1], z];
    // the lines are lit strips laid on the board
    const strip = (pts: [number, number][]) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], n = Math.hypot(x1 - x0, y1 - y0) || 1;
        const ox = (-(y1 - y0) / n) * 0.8, oy = ((x1 - x0) / n) * 0.8;
        p.face([[x0 + ox, y0 + oy, z], [x1 + ox, y1 + oy, z], [x1 - ox, y1 - oy, z], [x0 - ox, y0 - oy, z]], SH.top, 0);
      }
    };
    strip([[-BX + 2, MY], [BX - 2, MY]]);
    // the branch, laid as far as it has grown, its unbuilt rest as a dashed guide
    const pts = along(grow * (1 - out));
    if (pts.length > 1 && grow * (1 - out) > 0.01) strip(pts);
    p.guide(PATH.map(at));
    // a label tab at the board's front edge
    p.face([[-BX + 2, BY + 0.03, 0.6], [-BX + 8, BY + 0.03, 0.6], [-BX + 8, BY + 0.03, BZ - 0.6], [-BX + 2, BY + 0.03, BZ - 0.6]], SH.top, 0);
    // commits back to front: branch ones first (they sit further back), then main
    const n = NODES.length;
    NODES.forEach((pi, i) => {
      const at0 = (i + 1) / (n + 1) * 0.92; // when the head reaches it
      const k = Math.max(0, Math.min(1, (grow - at0) / 0.1)) * (1 - out);
      commit(p, PATH[pi][0], PATH[pi][1], k, 0.24);
    });
    // the moving head of the branch: a bright dot
    const head = pts[pts.length - 1];
    if (grow < 1 && grow > 0.02) p.dot([head[0], head[1], z + 0.6], 1.3, 1);
    for (const x of MAIN) commit(p, x, MY, 1, 0.24);
    // the merge commit swells as the branch lands
    const m = Math.max(0, Math.min(1, (grow - 0.95) / 0.05)) * (1 - out);
    if (m > 0) p.cylinder(6.5, MY, BZ + 5, 2.3 * m, 1.4 * m, { top: 0.32, side: SH.left });
    if (m > 0) p.guide([[6.5, MY, BZ + 6.4], [6.5, MY, BZ + 11]], true);
  },
};
