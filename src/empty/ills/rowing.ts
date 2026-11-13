// No workouts yet: a rowing machine seen side on, a big flywheel housing at the front, a long rail and a sliding seat. The seat slides back on the drive, the handle is pulled with it on its cord and the flywheel spins, over and over.
import { type Illustration, type V3 } from "../dots";

const P = 3; // seconds per loop
const FX = -14, FR = 11, FZ = 12.5; // flywheel centre along x, its radius and height
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

export const rowing: Illustration = {
  k: "rowing", name: "Rowing machine", title: "No workouts yet", body: "Log a session on the rower and your distance and splits will show up here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    // the drive is quick, the recovery slow
    const k = u < 0.38 ? ease(u / 0.38) : 1 - ease((u - 0.38) / 0.62);
    const seat = 2 + 6 * k, handle = -2 + 7 * Math.min(1, k * 1.1);
    p.translate(2, 0, -11);
    p.shadow(0, 0, 32, 13, 0.12);
    p.rotate("z", -0.36); // side on: the machine runs across the frame
    // the feet: a wide bar under the flywheel and one at the far end of the rail
    p.box(FX - 4, -7, 0, 8, 14, 2.4, { top: 0.2, left: 0.065, right: 0.05, edge: 0 });
    p.box(15, -5.5, 0, 3.4, 11, 2.4, { top: 0.2, left: 0.065, right: 0.05, edge: 0 });
    // the rail: one long thick beam, lit on top, rising slightly to the flywheel
    p.box(FX + 5, -3, 4.6, 26, 6, 2.4, { top: 0.34, left: 0.065, right: 0.05, edge: 0 });
    p.box(15.6, -1.5, 2.4, 2.2, 3, 2.2, { top: 0.2, left: 0.065, right: 0.05, edge: 0 });
    // the flywheel housing: a deep drum standing upright, its round face toward us
    const ring = (y: number, r: number, n = 44): V3[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [FX + Math.cos(a) * r, y, FZ + Math.sin(a) * r] as V3; });
    for (let y = -0.5; y < 3.5; y += 0.5) p.face(ring(y, FR), 0.065, 0);
    p.face(ring(3.5, FR), 0.26, 0);
    // a dark rim cut and the fan behind its grille: dark spokes turning on the lit face
    p.line([...ring(3.55, FR - 2), ring(3.55, FR - 2)[0]], 1, 1);
    const spin = u * Math.PI * 2 + k * 1.4;
    for (let i = 0; i < 6; i++) {
      const a = spin + (i * Math.PI) / 3;
      p.line([[FX + Math.cos(a) * 2.2, 3.6, FZ + Math.sin(a) * 2.2], [FX + Math.cos(a + 0.3) * (FR - 3.2), 3.6, FZ + Math.sin(a + 0.3) * (FR - 3.2)]], 1, 1);
    }
    p.face(ring(3.6, 1.6, 16), 0.02, 0);
    // the cord from the flywheel to the handle, a bright strand
    const [ax, ay] = p.pt([FX + 1.5, 0, FZ]), [bx, by] = p.pt([handle, 0, FZ + 0.6]);
    p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.lineCap = "round"; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); });
    // the seat, riding on the rail
    p.box(seat, -4, 7, 7.5, 8, 2.6, { top: 0.32, left: 0.12, right: 0.065, edge: 0 });
    // the handle: a bar across, bright
    p.box(handle - 1, -3.5, FZ - 0.4, 2, 7, 2, { top: 0.32, left: 0.22, right: 0.1, edge: 0 });
  },
};
