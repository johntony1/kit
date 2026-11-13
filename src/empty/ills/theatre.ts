// No shows yet: a little theatre, a stage in a dark frame, its curtains drawn shut. Hover and the curtains are drawn back and tied to either side and a spotlight falls on the empty stage.
import { type Illustration, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const W = 17, OW = 12.5, ZS = 4, ZO = 25, ZT = 31; // half width of the frame and the opening, stage height, opening top, frame top
const FY = 3; // where the frame stands (its face is at y = FY)

export const theatre: Illustration = {
  k: "theatre", name: "Theatre", title: "No shows yet", body: "Add your first show and its dates will be listed here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = ease(Math.min(1, h * 1.3)), light = Math.max(0, Math.min(1, (h - 0.5) / 0.5));
    p.translate(0, 0, -16);
    p.shadow(0, 0, 30, 12, 0.12);
    p.rotate("z", -0.62);
    // the stage: a deep dark box behind the opening, its floor lit only by the spotlight
    p.face([[-OW, FY, ZS], [OW, FY, ZS], [OW, FY, ZO], [-OW, FY, ZO]], 0.02, 0);
    if (light > 0) {
      const r = 6 * light;
      p.face(Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return [Math.cos(a) * r, FY - 4 + Math.sin(a) * r * 0.55, ZS + 0.05] as V3; }), 0.32, 0);
      const [x0, y0] = p.pt([-1.5, FY - 6, ZO]), [x1, y1] = p.pt([1.5, FY - 6, ZO]), [a0, b0] = p.pt([-r, FY - 4, ZS]), [a1, b1] = p.pt([r, FY - 4, ZS]);
      p.screen((c) => { const v = Math.round(110 * light); c.fillStyle = `rgb(${v},${v},${v})`; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineTo(a1, b1); c.lineTo(a0, b0); c.closePath(); c.fill(); });
    }
    // the stage floor's front edge, lit, standing out past the frame
    p.box(-W, FY, 0, W * 2, 4, ZS, { top: 0.24, left: 0.12, right: 0.065, edge: 0 });
    // the curtains: two lit drapes with deep folds, gathered toward the sides as they open
    const curtain = (s: number) => {
      // the inner edge runs from the top down to a tie point, then straight to the floor; opening pulls both outward
      const top = s * (0.3 + 5.2 * k), tie = s * (0.3 + (OW - 3.4) * k), zt = ZS + 9, y = FY + 0.6, out = s * OW;
      p.face([[out, y, ZO], [top, y, ZO], [tie, y, zt], [tie, y, ZS], [out, y, ZS]], 0.26, 0);
      // the folds as dark cuts, fanning from the top to the tie
      for (const u of k > 0.4 ? [0.5] : [0.25, 0.5, 0.75]) {
        const xt = out + (top - out) * u, xb = out + (tie - out) * u;
        p.line([[xt, y + 0.05, ZO - 0.6], [xb, y + 0.05, zt], [xb, y + 0.05, ZS + 0.8]], 0, 0.8);
      }
      // the tie: a bright band across the gathered curtain
      if (k > 0.05) p.line([[out, y + 0.08, zt], [tie, y + 0.08, zt]], 0, 1.4);
    };
    curtain(-1);
    curtain(1);
    // the frame: a lit arch round the opening with a scalloped valance hanging under its top
    const fy = FY + 1.2;
    const frame = (y: number, f: number) => {
      p.face([[-W, y, ZS], [-OW, y, ZS], [-OW, y, ZO], [OW, y, ZO], [OW, y, ZS], [W, y, ZS], [W, y, ZT], [-W, y, ZT]], f, 0);
    };
    for (let y = fy - 1.6; y < fy; y += 0.4) frame(y, 0.05);
    frame(fy, 0.12);
    p.line([[-OW, fy + 0.03, ZS], [-OW, fy + 0.03, ZO], [OW, fy + 0.03, ZO], [OW, fy + 0.03, ZS]], 0, 0.8);
    const val: V3[] = [[-OW, fy + 0.04, ZO]];
    for (let i = 0; i <= 30; i++) { const x = -OW + (2 * OW * i) / 30; val.push([x, fy + 0.04, ZO - 2.4 + 1.2 * Math.abs(Math.sin((i / 30) * Math.PI * 5))]); }
    val.push([OW, fy + 0.04, ZO]);
    p.face(val, 0.22, 0);
    // a pediment on top: a shallow lit triangle with a bright star
    p.face([[-W + 2, fy, ZT], [W - 2, fy, ZT], [0, fy, ZT + 4.5]], 0.24, 0);
    p.line([[-W + 2, fy + 0.03, ZT], [W - 2, fy + 0.03, ZT]], 0, 0.7);
  },
};
