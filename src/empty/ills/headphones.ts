// No podcasts: headphones resting on a stand. They bob to a beat, the cups bounce and little notes float up.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 1.6; // seconds per loop: two beats
const RB = 11, TH = 2.2, BW = 2.1; // band radius (centre line), thickness, half width
const ZC = 15.6; // the band's centre height

/** a cup on the band's end: a short barrel along y, lit on top */
function cup(p: Pen, cz: number, y0: number, y1: number, r: number) {
  const N = 24;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, m = (a0 + a1) / 2;
    if (1.366 * Math.cos(m) + Math.sin(m) < -0.1) continue;
    const at = (a: number, y: number): V3 => [Math.cos(a) * r, y, cz + Math.sin(a) * r];
    const f = Math.sin(m) > 0.35 ? 0.24 : Math.sin(m) > -0.35 ? 0.13 : 0.065;
    p.face([at(a0, y0), at(a1, y0), at(a1, y1), at(a0, y1)], f, 0);
  }
}

/** a music note flat to the screen */
function note(p: Pen, at: V3, k: number, two: boolean) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    const n = Math.round(255 * Math.min(1, k));
    g.fillStyle = g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = 0.8; g.lineCap = "round";
    const heads = two ? [[0, 0], [3.4, -1]] : [[0, 0]];
    for (const [dx, dy] of heads) {
      g.beginPath(); g.ellipse(x + dx, y + dy, 1.3, 1, -0.4, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(x + dx + 1.1, y + dy); g.lineTo(x + dx + 1.1, y + dy - 5); g.stroke();
    }
    g.beginPath();
    if (two) { g.moveTo(x + 1.1, y - 5); g.lineTo(x + 4.5, y - 6); }
    else { g.moveTo(x + 1.1, y - 5); g.quadraticCurveTo(x + 3.4, y - 4, x + 2.8, y - 2.4); }
    g.stroke();
  });
}

export const headphones: Illustration = {
  k: "headphones", name: "Headphones", title: "No podcasts", body: "Follow a show and new episodes will be waiting for you here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    p.translate(0, 0, -15);
    p.rotate("z", (30 * Math.PI) / 180);
    // a beat every half loop: a quick hop, then a soft landing
    const u = (t % (P / 2)) / (P / 2);
    const hop = Math.sin(u * Math.PI) ** 2;
    const lag = Math.sin(Math.max(0, u - 0.12) / 0.88 * Math.PI) ** 2;
    p.shadow(0, 0, 21, 10, 0.12);
    // the stand: a foot, a pole and a bar the band rests on
    p.cylinder(0, 0, 0, 6, 1.6, { top: 0.22, side: 0.12 });
    p.cylinder(0, 0, 1.6, 1, ZC + RB - TH / 2 - 2.6, { top: 0.2, side: 0.2 });

    const lift = hop * 1.3; // the headphones hop off the bar a touch
    const cz = ZC - 3.6 - lag * 1.2 + lift * 0.4; // cups sit low on the band's ends, and lag behind
    const spread = 0.5 * lag;
    // the back cup: its cushion faces us
    p.push(); p.translate(0, 0, lift);
    cup(p, cz - lift, -RB - 3.4 - spread, -RB + 0.4 - spread, 5.8);
    p.ringV("y", [0, -RB + 0.4 - spread, cz - lift], 5.8, 0.13, SH.edge, 0.55);
    p.ringV("y", [0, -RB + 0.45 - spread, cz - lift], 3.3, 0.03, SH.edge, 0.5);
    p.pop();
    // the bar on the pole
    p.box(-1.3, -6, ZC + RB - TH / 2 - 1.8, 2.6, 12, 1.8, { top: 0.24, left: 0.13, right: 0.07 });

    // the band: an arch over the bar, from one cup to the other
    p.push(); p.translate(0, 0, lift);
    const N = 28, a0 = -0.32, a1 = Math.PI + 0.32;
    const arc = (a: number, r: number, x: number): V3 => [x, Math.cos(a) * r, ZC + Math.sin(a) * r];
    for (let i = N - 1; i >= 0; i--) {
      const b0 = a0 + ((a1 - a0) * i) / N, b1 = a0 + ((a1 - a0) * (i + 1)) / N, m = (b0 + b1) / 2;
      const out = 0.366 * Math.cos(m) + Math.sin(m) > 0;
      const r = out ? RB + TH / 2 : RB - TH / 2;
      const f = out ? 0.1 + 0.16 * Math.max(0, Math.sin(m)) : 0.07;
      p.face([arc(b0, r, -BW), arc(b0, r, BW), arc(b1, r, BW), arc(b1, r, -BW)], f, 0);
    }
    // the near side of the band, with a seam along it
    const side: V3[] = [];
    for (let i = 0; i <= N; i++) side.push(arc(a0 + ((a1 - a0) * i) / N, RB + TH / 2, BW));
    for (let i = N; i >= 0; i--) side.push(arc(a0 + ((a1 - a0) * i) / N, RB - TH / 2, BW));
    p.face(side, 0.065, SH.edge, 0.5);
    p.line(Array.from({ length: 21 }, (_, i) => arc(0.15 + ((Math.PI - 0.3) * i) / 20, RB + TH / 2 + 0.02, 0)), SH.edge, 0.55);
    p.pop();

    // the front cup: its outer shell faces us, with a ring and a badge
    p.push(); p.translate(0, 0, lift);
    const y0 = RB - 0.4 + spread, y1 = RB + 3.4 + spread, z = cz - lift;
    cup(p, z, y0, y1, 5.8);
    p.ringV("y", [0, y1, z], 5.8, 0.24, SH.edge, 0.55);
    p.ringV("y", [0, y1 + 0.03, z], 3.8, 0, SH.edge, 0.7);
    p.dot([0, y1 + 0.05, z], 1, 1);
    p.pop();

    // notes drift up on each beat
    for (let i = 0; i < 2; i++) {
      const v = ((t / P) + i * 0.5) % 1;
      const k = Math.sin(v * Math.PI);
      note(p, [-2 + i * 2, (i ? -1 : 1) * (8 + v * 4), ZC + RB - 2 + v * 6], k, i === 1);
    }
  },
};
