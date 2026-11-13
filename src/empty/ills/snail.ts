// Taking its time: a snail with a big spiral shell and two eye stalks. It inches along in place: the body stretches forward, the shell follows, the stalks bob.
import { SH, type Illustration, type V3 } from "../dots";

const P = 3; // seconds per loop
type P2 = [number, number];
const K = 0.57735;
/** the plane that faces us: u to the right, v up, in dots */
const B = ([u, v]: P2): V3 => [u * K, -u * K, v];

export const snail: Illustration = {
  k: "snail", name: "Snail", title: "Taking its time", body: "This can take a little while. We will show it here as soon as it is ready.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1, w = u * Math.PI * 2;
    const reach = 0.5 - 0.5 * Math.cos(w); // 0 tucked, 1 stretched
    const lag = 0.5 - 0.5 * Math.cos(w - 0.9);
    p.translate(0, 0, -16);
    p.shadow(0, 0, 26, 10, 0.12);
    // the body: a long foot, the head raised at the front (left), stretching forward
    const hx = -2.6 * reach;
    const body: P2[] = [[17, 0], [-15 + hx, 0], [-18.5 + hx, 2], [-19.5 + hx, 5.5], [-18.5 + hx, 9], [-15.5 + hx, 11], [-12.5 + hx, 10.5], [-10.5 + hx * 0.7, 7], [-6, 5.6], [8, 5.2], [13, 3.4], [17.5, 1.2]];
    // the eye stalks: bright strokes with round tips, bobbing
    const st = (bx: number, tx: number, tv: number, ph: number): [P2, P2] => [[bx + hx, 10.2], [tx + hx + 0.8 * Math.sin(w + ph), tv + 0.8 * Math.sin(w * 2 + ph)]];
    const stalks = [st(-13.4, -12.6, 19.5, 0.6), st(-15.8, -19.2, 18.5, 0)];
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.fillStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round";
      for (const [a, b] of stalks) {
        const [x0, y0] = p.pt(B(a)), [x1, y1] = p.pt(B(b));
        g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        g.beginPath(); g.arc(x1, y1, 1.9, 0, Math.PI * 2); g.fill();
      }
    });
    p.face(body.map(B), 0.2, 0);
    p.face(([[17, 0], [-15 + hx, 0], [-17 + hx, 1.6], [16, 1.6]] as P2[]).map(B), 0.08, 0);
    p.line([...body, body[0]].map(B), SH.edge, 0.6);
    p.dot(B([-17 + hx, 6.8]), 0.8, 0);
    // the shell: a big round, lit, with a shaded crescent and a spiral cut, rocking as it is pulled along
    const cu = 3 - 1.6 * lag, cv = 16.5 + 0.5 * Math.sin(w * 2), R = 12.5;
    const out = Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return [cu + Math.cos(a) * R, cv + Math.sin(a) * R] as P2; });
    p.face(out.map(B), 0.24, 0);
    const sh: P2[] = [];
    for (let i = 0; i <= 20; i++) { const a = -1.9 + (i / 20) * 2.4; sh.push([cu + Math.cos(a) * R, cv + Math.sin(a) * R]); }
    for (let i = 20; i >= 0; i--) { const a = -1.9 + (i / 20) * 2.4, f = Math.sin((i / 20) * Math.PI); sh.push([cu + Math.cos(a) * R * 0.98 - 3.4 * f, cv + Math.sin(a) * R * 0.98 + 2.4 * f]); }
    p.face(sh.map(B), 0.08, 0);
    p.line([...out, out[0]].map(B), SH.edge, 0.65);
    // the spiral, wound in from the rim
    const sp: P2[] = [];
    for (let i = 0; i <= 70; i++) { const s = i / 70, a = -0.6 + s * Math.PI * 4.2, r = R * (0.9 - 0.8 * s); sp.push([cu + 0.6 * s + Math.cos(a) * r, cv + 0.6 * s + Math.sin(a) * r]); }
    p.line(sp.map(B), SH.edge, 1.1);
  },
};
