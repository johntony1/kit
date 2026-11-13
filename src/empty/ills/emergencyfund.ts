// Nothing set aside: a wall mounted break glass box with a big coin behind the glass and a small hammer hanging beside it. Hover and the hammer swings in, the glass cracks and the coin glints.
import { SH, type Illustration, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const X = 11, Y = 3, H = 28; // half width, half depth, height of the box
const IX = 7.6, IZ0 = 3.6, IZ1 = 24.4; // the glass opening
const CZ = 14, CR = 6.4; // the coin behind the glass

export const emergencyfund: Illustration = {
  k: "emergencyfund", name: "Emergency fund", title: "Nothing set aside", body: "Start a safety net for surprise costs. Every amount you put by will be kept here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const swing = -Math.sin(clamp(h / 0.45) * Math.PI) * 0.7, crack = clamp((h - 0.25) / 0.25), glint = clamp((h - 0.5) / 0.3);
    p.translate(0, 0, -14);
    p.shadow(0, 0, 22, 10, 0.1);
    p.rotate("z", -0.6); // turned so the glass faces us
    // the box: lit top, lit frame, sparse side
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.22, left: 0.2, right: 0.065, edge: 0 });
    const f = Y + 0.03, at = (x: number, z: number, o = 0): V3 => [x, f + o, z];
    // the dark inside behind the glass
    p.face([at(-IX, IZ0), at(IX, IZ0), at(IX, IZ1), at(-IX, IZ1)], 0.03, 0);
    p.line([at(-IX - 0.6, IZ0 - 0.6), at(IX + 0.6, IZ0 - 0.6), at(IX + 0.6, IZ1 + 0.6), at(-IX - 0.6, IZ1 + 0.6), at(-IX - 0.6, IZ0 - 0.6)], SH.edge, 0.6);
    // the coin: bright, a ring and a bar cut into it
    const ring = (r: number, o: number) => Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return at((Math.cos(a) * r) / 1.18, CZ + Math.sin(a) * r, o); });
    p.face(ring(CR, 0.02), 0.4 + 0.2 * glint, 0);
    const inner = ring(CR * 0.66, 0.04);
    p.line([...inner, inner[0]], SH.edge, 0.7);
    p.line([at(0, CZ - 2.4, 0.05), at(0, CZ + 2.4, 0.05)], SH.edge, 0.8);
    // the glass: two bright diagonal glare streaks, and cracks from the hit
    const q = (x: number, z: number) => p.pt(at(x, z, 0.1));
    const hit = q(-4.2, 19.6);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineCap = "round";
      g.globalAlpha = 0.85; g.lineWidth = 1.8;
      for (const [x0, z0, x1, z1] of [[2.4, 23.4, 6.8, 18.6], [4.6, 23.4, 6.8, 21]]) {
        const [a, b] = [q(x0, z0), q(x1, z1)];
        g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
      }
      if (crack > 0) {
        g.globalAlpha = 1; g.lineWidth = 1.2;
        for (let i = 0; i < 5; i++) {
          const ang = i * 1.26 + 0.4, len = (5 + (i % 2) * 2.5) * crack * 1.42;
          const mid = [hit[0] + Math.cos(ang) * len * 0.5 + Math.sin(ang) * 1.2, hit[1] + Math.sin(ang) * len * 0.5 - Math.cos(ang) * 1.2];
          g.beginPath(); g.moveTo(hit[0], hit[1]); g.lineTo(mid[0], mid[1]); g.lineTo(hit[0] + Math.cos(ang) * len, hit[1] + Math.sin(ang) * len); g.stroke();
        }
      }
    });
    // the hammer, hanging by a cord off the top left corner, head down; it swings in on hover
    const hook: V3 = [-X + 1.4, f, H - 1.5], hx = -X - 4.2;
    p.push();
    p.rotate("y", swing, hook);
    const [c0, c1] = [p.pt(hook), p.pt([hx, f, H - 5])];
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.4; g.lineCap = "round"; g.beginPath(); g.moveTo(c0[0], c0[1]); g.lineTo(c1[0], c1[1]); g.stroke(); });
    p.box(hx - 0.8, f - 0.8, H - 15, 1.6, 1.6, 10, { top: 0.3, left: 0.26, right: 0.1, edge: 0 }); // the handle
    p.box(hx - 4, f - 1.6, H - 19, 8, 3.2, 4, { top: 0.3, left: 0.24, right: 0.08, edge: 0 }); // the head
    p.line([[hx - 4, f + 1.63, H - 17], [hx + 4, f + 1.63, H - 17]], SH.edge, 0.6);
    p.pop();
  },
};
