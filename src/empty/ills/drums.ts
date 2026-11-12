// No beats yet: a drum kit playing itself. The kick thumps, a stick taps the snare on the off beat and the cymbals shake.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per loop: four beats
const arcY = (cx: number, y: number, cz: number, r: number, a0: number, a1: number, n = 20): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r] as V3; });
/** a cymbal: a thin tilted plate with a bell, on a pole */
function cymbal(p: Pen, x: number, y: number, z: number, r: number, tx: number, ty: number) {
  p.box(x - 0.35, y - 0.35, 0, 0.7, 0.7, z, { left: 0.3, right: 0.2, edge: 0 });
  p.disc(x, y, 0.02, 2.6, 0.12, 0);
  const ring = (rr: number, dz: number): V3[] => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return [x + Math.cos(a) * rr, y + Math.sin(a) * rr, z + dz + (Math.cos(a) * tx + Math.sin(a) * ty) * rr] as V3; });
  p.face(ring(r, -0.7), 0.07, 0);
  p.face(ring(r, 0), 0.3, SH.edge, 0.55);
  p.line([...ring(r * 0.55, 0.02), ring(r * 0.55, 0.02)[0]], SH.edge, 0.35);
  p.face(ring(1.5, 0.5), 0.5, SH.edge, 0.4);
}
function stick(p: Pen, tip: V3, lift: number) {
  const a = p.pt([tip[0], tip[1], tip[2] + lift]);
  p.screen((g) => {
    g.strokeStyle = "#fff"; g.lineWidth = 0.85; g.lineCap = "round";
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[0] - 8.5, a[1] - 5.5 - lift * 0.35); g.stroke();
  });
}

export const drums: Illustration = {
  k: "drums", name: "Drum kit", title: "No beats yet", body: "Record or program a beat and it will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = (t / P) % 1, b = ph * 4, n = Math.floor(b), f = b - n;
    const hit = Math.exp(-f * 6), kick = n % 2 === 0 ? hit : 0, snare = n % 2 === 1 ? hit : 0;
    p.translate(0, 1, -14);
    p.scale(0.95);
    p.shadow(0, 0, 31, 15, 0.1);
    // the cymbals at the back: a hi hat on the left, a crash on the right
    const shake = Math.exp(-ph * 3.2) * Math.sin(ph * Math.PI * 2 * 6);
    cymbal(p, -17, -8, 20 - 0.5 * hit, 5.6, 0, 0);
    cymbal(p, 14, -11, 29, 7.2, 0.16 * shake, 0.1 + 0.1 * shake);
    // the kick drum, lying on its side with its head toward us
    const R = 9.6, CZ = 9.6, Y0 = -5.5, Y1 = 5.5;
    p.face([...arcY(0, Y1, CZ, R, -Math.PI / 4, Math.PI / 4), ...arcY(0, Y0, CZ, R, -Math.PI / 4, Math.PI / 4).reverse()], 0.065, 0);
    p.face([...arcY(0, Y1, CZ, R, Math.PI / 4, (Math.PI * 3) / 4), ...arcY(0, Y0, CZ, R, Math.PI / 4, (Math.PI * 3) / 4).reverse()], 0.2, 0);
    p.line(arcY(0, Y0, CZ, R, -Math.PI / 4, (Math.PI * 3) / 4), SH.edge, 0.5);
    p.ringV("y", [0, Y1, CZ], R, 0.1, SH.edge, 0.65);
    p.ringV("y", [0, Y1 + 0.03, CZ], R - 1.5, 0.3, SH.edge, 0.5);
    p.ringV("y", [0, Y1 + 0.05, CZ], 2.6 + 2.2 * kick, 0, SH.edge, 0.9);
    // two toms on top of it
    for (const x of [-5.6, 5.6]) p.cylinder(x, 0, 20.5, 4.7, 4.6, { side: 0.11, top: 0.3, lw: 0.55 });
    // the snare on its stand, front left, and the floor tom, front right
    p.box(-17.35, 5.65, 0, 0.7, 0.7, 10, { left: 0.3, right: 0.2, edge: 0 });
    p.disc(-17, 6, 0.02, 3, 0.12, 0);
    p.cylinder(-17, 6, 10 - 0.4 * snare, 5.6, 3.4, { side: 0.11, top: 0.3 + 0.5 * snare, lw: 0.55 });
    for (const [dx, dy] of [[-4, 3.4], [4.4, -2.6], [2.6, 4.6]]) p.box(17 + dx - 0.3, 4 + dy - 0.3, 0, 0.6, 0.6, 6, { left: 0.3, right: 0.2, edge: 0 });
    p.cylinder(17, 4, 4.5, 6, 8.5, { side: 0.11, top: 0.3, lw: 0.55 });
    // the sticks: one on the snare, one keeping time on the hi hat
    stick(p, [-17, 6, 13.4], n % 2 === 1 ? 6 * (1 - hit) : 6);
    const f8 = (b * 2) % 1;
    stick(p, [-15, -6, 20.4], 4 * (1 - Math.exp(-f8 * 5)));
  },
};
