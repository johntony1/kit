// No scooters nearby: a kick scooter standing side on. Hover and it rolls forward, its wheels turning and speed lines trailing behind.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const R = 4.3; // wheel radius

/** a stroke drawn flat to the screen, so it stays a bright mark in every style */
function stroke(p: Pen, pts: V3[], shade: number, lw: number) {
  const q = pts.map((v) => p.pt(v)), n = Math.round(255 * Math.max(0, Math.min(1, shade)));
  p.screen((c) => {
    c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round";
    c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  });
}

function wheel(p: Pen, x: number, spin: number) {
  p.ringV("y", [x, 0, R], R, 0.9, SH.edge, 0.6);
  p.ringV("y", [x, 0.02, R], R * 0.56, 0.03, 0);
  for (let i = 0; i < 3; i++) {
    const a = spin + (i * Math.PI) / 3;
    p.line([[x - Math.cos(a) * R * 0.55, 0.03, R - Math.sin(a) * R * 0.55], [x + Math.cos(a) * R * 0.55, 0.03, R + Math.sin(a) * R * 0.55]], 0.6, 0.4);
  }
  p.dot([x, 0.04, R], 0.9, 1);
}

export const scooter: Illustration = {
  k: "scooter", name: "Scooter", title: "No scooters nearby", body: "Zoom out or try another street. Scooters you can unlock will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const k = ease(h);
    p.translate(0, 0, -14);
    p.scale(1.1, [0, 0, 12]);
    const dx = -3.5 + 7 * k;
    p.shadow(dx, 0, 24, 8, 0.1);
    p.translate(dx, 0, 0);
    const spin = dx / R + t * 7 * h;
    // speed lines trailing behind
    if (k > 0.05) [[3, 5], [10, 7], [17, 4.5]].forEach(([z, len], i) => {
      const o = ((t * 1.4 + i * 0.37) % 1) * 3;
      stroke(p, [[-20 - o - len, 0, z], [-20 - o, 0, z]], k * 0.9, 0.9);
    });
    // the deck, low between the wheels
    p.box(-8, -1.7, 2.6, 16, 3.4, 1.4, { top: 0.26, left: 0.16, right: 0.07, lw: 0.6 });
    // the neck up from the deck to the steering column
    stroke(p, [[7.6, 0, 3.6], [10.6, 0, 10]], 1, 1.6);
    wheel(p, -12.6, spin);
    // the rear fender
    p.line(Array.from({ length: 9 }, (_, i) => { const a = 0.5 + (i / 8) * 1.9; return [-12.6 + Math.cos(a) * (R + 1.3), 0, R + Math.sin(a) * (R + 1.3)] as V3; }), SH.edge, 0.9);
    wheel(p, 12.6, spin);
    // the column, leaning back, and the handlebar across it
    p.push();
    p.rotate("y", -0.14, [12.6, 0, R]);
    p.box(11.7, -0.9, R, 1.8, 1.8, 23.5, { top: 0.22, left: 0.2, right: 0.09, lw: 0.6 });
    p.box(11.6, -6.4, R + 23.5, 2, 12.8, 1.7, { top: 0.26, left: 0.3, right: 0.1, lw: 0.6 });
    p.box(11.6, 3.4, R + 23.5, 2, 3, 1.7, { top: 0.9, left: 0.9, right: 0.5, lw: 0.6 });
    p.pop();
  },
};
