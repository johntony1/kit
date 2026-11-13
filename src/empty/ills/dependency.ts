// No dependencies: a package tree, one box up top linked down to two boxes below by bold bright links. Hover and light runs down the links into both boxes, over and over.
import { SH, type Illustration, type Pen } from "../dots";

const S = 6.5, BH = 11.5; // half size and height of a package
const C = 11.5, ZP = 26; // children offset, the parent's floor height

/** a closed package with a tape line over its top and down its front */
function pkg(p: Pen, cx: number, cy: number, z: number) {
  p.box(cx - S, cy - S, z, 2 * S, 2 * S, BH, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
  const Z = z + BH + 0.03;
  p.line([[cx - S + 0.4, cy, Z], [cx + S - 0.4, cy, Z]], SH.edge, 1);
  p.line([[cx + S + 0.03, cy, Z], [cx + S + 0.03, cy, Z - 4]], SH.edge, 1);
  p.line([[cx + S + 0.03, cy + S + 0.03, z], [cx + S + 0.03, cy + S + 0.03, z + BH]], SH.edge, 0.55);
}

export const dependency: Illustration = {
  k: "dependency", name: "Dependencies", title: "No dependencies", body: "Add a package to your project and the ones it relies on will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 0, 36, 13, 0.11);
    // the two children on the floor, left and right, then the parent above them
    pkg(p, -C, C, 0);
    pkg(p, C, -C, 0);
    pkg(p, 0, 0, ZP);
    // the links: down from the parent, split, down onto each child's top
    const top = p.pt([S, S, ZP]), ends = [p.pt([-C, C, BH]), p.pt([C, -C, BH])];
    const ym = (top[1] + ends[0][1]) / 2;
    const legs = ends.map((e) => [top, [top[0], ym], [e[0], ym], e] as [number, number][]);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 2.2; g.lineCap = "round"; g.lineJoin = "round";
      for (const l of legs) { g.beginPath(); l.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke(); }
      g.fillStyle = "#fff";
      for (const e of ends) { g.beginPath(); g.arc(e[0], e[1], 2, 0, Math.PI * 2); g.fill(); }
      g.beginPath(); g.arc(top[0], top[1], 1.5, 0, Math.PI * 2); g.fill();
    });
    // hovered: pulses of light run down both links
    if (h > 0.02) {
      const at = (l: [number, number][], f: number) => {
        const seg = l.slice(1).map((q, i) => Math.hypot(q[0] - l[i][0], q[1] - l[i][1]));
        let d = f * seg.reduce((a, b) => a + b, 0);
        for (let i = 0; i < seg.length; i++) { if (d <= seg[i]) { const k = d / seg[i]; return [l[i][0] + (l[i + 1][0] - l[i][0]) * k, l[i][1] + (l[i + 1][1] - l[i][1]) * k]; } d -= seg[i]; }
        return l[l.length - 1];
      };
      const f = (t * 0.7) % 1;
      p.screen((g) => {
        for (const l of legs) {
          const [x, y] = at(l, f);
          g.beginPath(); g.arc(x, y, 3 * h, 0, Math.PI * 2); g.fillStyle = "#000"; g.fill();
          g.beginPath(); g.arc(x, y, 2.2 * h, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
        }
      });
    }
  },
};
