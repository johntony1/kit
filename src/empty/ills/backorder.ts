// Nothing on backorder: a taped parcel with a big clock face on its side. The minute hand sweeps round once a loop while the hour hand waits.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const W = 10.5, D = 9, H = 19; // half width, half depth, height

export const backorder: Illustration = {
  k: "backorder", name: "Backorder", title: "Nothing on backorder", body: "Items you order before they are back in stock will wait here until they ship.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    p.translate(0, 0, -13.5);
    p.shadow(0, 0, 28, 13, 0.12);
    p.rotate("z", -0.4); // turned so the clock faces us
    // the parcel, tape across its lid and down the right side
    p.box(-W, -D, 0, W * 2, D * 2, H, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.face([[-W, -1.6, H + 0.03], [W, -1.6, H + 0.03], [W, 1.6, H + 0.03], [-W, 1.6, H + 0.03]], 0.05, 0);
    p.face([[W + 0.03, -1.6, H - 5], [W + 0.03, 1.6, H - 5], [W + 0.03, 1.6, H], [W + 0.03, -1.6, H]], 0.2, 0);
    p.line([[-W, D + 0.03, H], [W, D + 0.03, H], [W + 0.03, -D, H]], SH.edge, 0.6);
    // the clock on the near side: a bright face, a cut ring, twelve ticks
    const y = D + 0.04, cx = 0, cz = H / 2, R = 7.4;
    const ring = (r: number, yy = y): V3[] => Array.from({ length: 44 }, (_, i) => { const a = (i / 44) * Math.PI * 2; return [cx + Math.cos(a) * r, yy, cz + Math.sin(a) * r] as V3; });
    p.face(ring(R + 1.5), 0.02, 0);
    p.face(ring(R, y + 0.02), 0.3, 0);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, r0 = i % 3 ? R - 1.3 : R - 2.1;
      p.line([[cx + Math.cos(a) * r0, y + 0.05, cz + Math.sin(a) * r0], [cx + Math.cos(a) * (R - 0.5), y + 0.05, cz + Math.sin(a) * (R - 0.5)]], SH.edge, i % 3 ? 0.5 : 0.8);
    }
    // the hands: the hour hand still, the minute hand sweeping
    const m = Math.PI / 2 - u * Math.PI * 2, hr = Math.PI / 2 - (2 / 12) * Math.PI * 2;
    p.screen((g) => {
      g.strokeStyle = "#000"; g.lineCap = "round";
      const c = p.pt([cx, y + 0.06, cz]);
      const tip = (a: number, r: number) => p.pt([cx + Math.cos(a) * r, y + 0.06, cz + Math.sin(a) * r]);
      const hh = tip(hr, R * 0.48), mm = tip(m, R * 0.78);
      g.lineWidth = 2.2; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(hh[0], hh[1]); g.stroke();
      g.lineWidth = 1.5; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(mm[0], mm[1]); g.stroke();
      g.fillStyle = "#000"; g.beginPath(); g.arc(c[0], c[1], 1.1, 0, Math.PI * 2); g.fill();
    });
  },
};
