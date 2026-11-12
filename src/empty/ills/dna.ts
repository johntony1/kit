// DNA strand: a double helix standing at a slight lean, turning slowly on its axis so the two strands cross over and the rungs swing round.
import { type Illustration } from "../dots";

const P = 3.2; // seconds per loop: half a turn, which brings the two strands back onto each other
const LEN = 46, AMP = 9.5, TURNS = 1.6, LEAN = 0.3;
const RUNGS = 11;

export const dna: Illustration = {
  k: "dna", name: "DNA strand", title: "No genetic results yet", body: "Your results will appear here as soon as the lab has processed your sample.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const ph = ((t / P) % 1) * Math.PI;
    p.shadow(0, 0, 20, 9, 0.1);
    const [ox, oy] = p.pt([0, 0, 0]);
    const co = Math.cos(LEAN), si = Math.sin(LEAN);
    // a point s along the axis (0 to 1) and u across it, on screen
    const at = (s: number, u: number): [number, number] => { const l = (s - 0.5) * LEN; return [ox + l * si + u * co, oy - l * co + u * si]; };
    const ang = (s: number) => s * TURNS * Math.PI * 2 + ph;
    const N = 96;
    p.screen((g) => {
      g.lineCap = "round"; g.lineJoin = "round";
      // one strand over a stretch where it is at the back, or at the front
      const strand = (k: number, front: boolean) => {
        g.strokeStyle = front ? "#fff" : "rgb(120,120,120)"; g.lineWidth = front ? 2.6 : 1.7;
        let open = false;
        g.beginPath();
        for (let i = 0; i <= N; i++) {
          const s = i / N, a = ang(s) + k * Math.PI;
          if ((Math.sin(a) >= 0) !== front) { open = false; continue; }
          const [x, y] = at(s, Math.cos(a) * AMP);
          if (open) g.lineTo(x, y); else { g.moveTo(x, y); open = true; }
        }
        g.stroke();
      };
      strand(0, false); strand(1, false);
      // the rungs between the strands, each in two halves
      for (let i = 0; i < RUNGS; i++) {
        const s = (i + 0.5) / RUNGS, u = Math.cos(ang(s)) * (AMP - 1.2);
        if (Math.abs(u) < 1.6) continue;
        const [x0, y0] = at(s, -u), [x1, y1] = at(s, u), [xm, ym] = at(s, 0);
        g.lineWidth = 1.5;
        g.strokeStyle = "#fff"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(xm, ym); g.stroke();
        g.strokeStyle = "rgb(140,140,140)"; g.beginPath(); g.moveTo(xm, ym); g.lineTo(x1, y1); g.stroke();
      }
      strand(0, true); strand(1, true);
    });
  },
};
