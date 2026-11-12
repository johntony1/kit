// No pull requests: the pull request mark standing on a slab, a branch on the right with its arrow aimed at the main line. Hover and the arrow reaches across, the node lights and a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.max(0, Math.min(1, x));
const T = 0.9; // half thickness of the mark
const RN = 3.7; // node radius

function badge(p: Pen, at: V3, r: number) {
  if (r <= 0.05) return;
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.36); g.lineTo(x + r * 0.48, y - r * 0.34); g.stroke();
  });
}

/** a node: a thick ring standing in the mark's plane */
function node(p: Pen, x: number, z: number, lit: number) {
  p.ringV("y", [x, -T, z], RN, SH.right, 0);
  p.ringV("y", [x, T, z], RN, 0.3, SH.edge, 0.6);
  const hole: V3[] = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [x + Math.cos(a) * 1.8, T + 0.03, z + Math.sin(a) * 1.8] as V3; });
  if (lit > 0.02) p.face(hole, 0.3 + 0.7 * lit, SH.edge, 0.5);
  else p.clear(hole);
}

export const pullrequest: Illustration = {
  k: "pullrequest", name: "Pull request", title: "No pull requests", body: "Open a pull request to propose a change and ask for a review.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 25, 12, 0.12);
    p.rotate("z", -0.42);
    p.box(-14, -5, 0, 28, 10, 2, { lw: 0.6 });
    const LXc = -7.5, RXc = 7.5, Z0 = 8, Z1 = 26;
    const bar = { top: 0.3, left: 0.26, right: 0.1, edge: 0 };
    // stubs down to the slab, then the two stems
    p.box(LXc - T, -T, 2, T * 2, T * 2, 3, bar);
    p.box(RXc - T, -T, 2, T * 2, T * 2, 3, bar);
    p.box(LXc - T, -T, Z0 + RN - 0.4, T * 2, T * 2, Z1 - Z0 - RN * 2 + 0.8, bar);
    p.box(RXc - T, -T, Z0 + RN - 0.4, T * 2, T * 2, Z1 - Z0 - RN + 1.3, bar);
    // the arrow: a bar from the top of the right stem, reaching left on hover
    const reach = ease(cl(h / 0.5));
    const tip = 2.6 - 3.6 * reach; // where the head starts
    p.box(tip, -T, Z1 - 0.9, RXc + T - tip, T * 2, 1.8, bar);
    const head = (y: number): V3[] => [[tip + 0.4, y, Z1 + 2.9], [tip + 0.4, y, Z1 - 2.9], [tip - 3.2, y, Z1]];
    p.face(head(-T), SH.right, 0);
    p.face(head(T), 0.3, SH.edge, 0.6);
    // nodes: the one the arrow points at lights up when it arrives
    node(p, LXc, Z0, 0);
    node(p, RXc, Z0, 0);
    node(p, LXc, Z1, ease(cl((h - 0.42) / 0.25)));
    const b = cl((h - 0.66) / 0.34);
    if (b > 0) badge(p, [LXc - 3.5, 0, Z1 + 7], 4.2 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
