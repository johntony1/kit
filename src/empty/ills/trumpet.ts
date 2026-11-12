// Trumpet: a trumpet side on, mouthpiece on the left, a long tube, three tall valves and a wide flared bell on the right. Hover and the valves press one after another and notes rise over the bell.
import { type Illustration, type Pen, type V3 } from "../dots";

const AX = 15, Y = 1.6, BX = 5, BE = 21; // height of the main tube, half its thickness, where the bell starts and ends
const clamp = (x: number) => Math.max(0, Math.min(1, x));
// the bell's radius along the tube: thin for a long way, then a wide flare
const bell = (x: number) => Y + 11.4 * Math.pow(clamp((x - BX) / (BE - BX)), 2.6);
const ringX = (x: number, r: number): V3[] => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [x, Math.cos(a) * r, AX + Math.sin(a) * r] as V3; });
// the loop of tube under the main one: a racetrack ring
function track(x0: number, x1: number, z0: number, z1: number, inset: number): V3[] {
  const r = (z1 - z0) / 2 - inset, o: V3[] = [];
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * Math.PI; o.push([x1 - (z1 - z0) / 2 + Math.cos(a) * r, Y, (z0 + z1) / 2 + Math.sin(a) * r]); }
  for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + (i / 12) * Math.PI; o.push([x0 + (z1 - z0) / 2 + Math.cos(a) * r, Y, (z0 + z1) / 2 + Math.sin(a) * r]); }
  return o;
}
function note(p: Pen, at: V3, s: number, a: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.fillStyle = g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 0.9 * s; g.lineCap = "round";
    g.beginPath(); g.ellipse(x, y, 1.7 * s, 1.3 * s, -0.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x + 1.5 * s, y - 0.2 * s); g.lineTo(x + 1.5 * s, y - 5.4 * s); g.lineTo(x + 3.8 * s, y - 4.2 * s); g.stroke();
  });
}

export const trumpet: Illustration = {
  k: "trumpet", name: "Trumpet", title: "No announcements yet", body: "When there is news to share, it will be announced here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 0, 26, 9, 0.1);
    p.rotate("z", -0.68); // side on
    p.scale(0.94);
    p.translate(1.5, 0, 0);
    // the loop of tube under the main one, in shade
    const o = track(-14.5, 6.6, AX - 11, AX + Y, 0), i = track(-14.5, 6.6, AX - 11, AX + Y, 3);
    p.face([...o, o[0], i[0], ...i.slice().reverse()], 0.12, 0);
    // the long main tube and the mouthpiece cup
    p.box(-21, -Y, AX - Y, 26, Y * 2, Y * 2, { top: 0.3, left: 0.3, right: 0.05, edge: 0 });
    p.face([[-24.5, Y, AX - 3.6], [-24.5, Y, AX + 3.6], [-20.5, Y, AX + Y], [-20.5, Y, AX - Y]], 0.3, 0);
    // the bell: a solid flare, its profile square to us, a bright rim round a slim dark mouth
    for (let x = BX; x < BE; x += 0.4) p.face(ringX(x, bell(x)), 0.3, 0);
    const up: V3[] = [], dn: V3[] = [];
    for (let x = BX; x <= BE + 0.01; x += 0.5) { up.push([x, 0, AX + bell(x)]); dn.unshift([x, 0, AX - bell(x)]); }
    p.face([...up, ...dn], 0.3, 0);
    p.face(ringX(BE, bell(BE)), 0.3, 0);
    p.clear(ringX(BE + 0.03, bell(BE) - 2.6));
    // three tall valves: a casing through the loop, a stem and a button on each
    for (let n = 0; n < 3; n++) {
      const x = -9.5 + n * 5.6, press = h > 0 ? Math.max(0, Math.sin(t * 5 - n * 1.4)) * 2.4 * h : 0;
      p.clear([[x - 2.8, Y + 0.02, AX - 12.5], [x + 2.8, Y + 0.02, AX - 12.5], [x + 2.8, Y + 0.02, AX + 2.6], [x - 2.8, Y + 0.02, AX + 2.6]]);
      p.box(x - 1.8, -1.8, AX - 12.5, 3.6, 3.6, 14.6, { top: 0.3, left: 0.3, right: 0.07, edge: 0 });
      p.box(x - 0.6, -0.6, AX + 2.1, 1.2, 1.2, 5.4 - press, { top: 0.3, left: 0.3, right: 0.1, edge: 0 });
      p.box(x - 2, -2, AX + 7.5 - press, 4, 4, 1.3, { top: 0.3, left: 0.3, right: 0.1, edge: 0 });
    }
    // notes rise over the bell
    for (let n = 0; n < 2; n++) {
      const k = clamp((h - 0.3 - n * 0.25) / 0.45);
      if (k <= 0) continue;
      note(p, [9 + n * 6, 0, AX + 6 + n * 3.5 + 2 * k + Math.sin(t * 2.2 + n * 2) * 0.6], 1 + 0.2 * k, Math.min(1, k * 2));
    }
  },
};
