// Nothing sparked yet: a matchbox seen from the front, its tray slid half out to the left, three matches lying in it with fat heads, a dark striker strip along the sleeve. Hover and the middle match tips up out of the tray and lights.
import { easeInOut, type Illustration, type Pen, type V3 } from "../dots";

const S0 = -1, S1 = 15, Y = 9.5, Z = 7; // the sleeve: left end, right end, half depth, height
const T0 = -14; // the tray's left end, slid out of the sleeve
const ROWS = [-5.4, 0, 5.4];

// a fat match head: a bright bulb facing us, ringed in black so it reads on any tone
function head(p: Pen, c: V3) {
  const ring = (rx: number, rz: number): V3[] => Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [c[0] + Math.cos(a) * rx, c[1], c[2] + Math.sin(a) * rz]; });
  p.face(ring(3, 2.3), 0.03, 0);
  p.face(ring(2.2, 1.6), 0.45, 0);
}
// a match stick: a bright stroke on screen, so it shows on the dark inside of the tray
function stick(p: Pen, a: V3, b: V3) {
  const [ax, ay] = p.pt(a), [bx, by] = p.pt(b);
  p.screen((g) => { g.strokeStyle = "#fff"; g.lineWidth = 1.8; g.lineCap = "round"; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke(); });
}
function match(p: Pen, y: number) {
  stick(p, [T0 + 4, y, 3.4], [S0 + 1, y, 3.4]);
  head(p, [T0 + 3, y + 0.5, 3.6]);
}

export const matches: Illustration = {
  k: "matches", name: "Matchbox", title: "Nothing sparked yet", body: "Start your first idea and it will light up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const e = easeInOut(Math.min(1, h * 1.4)), fl = Math.max(0, (h - 0.5) / 0.5);
    p.translate(0, 0, -8);
    p.shadow(0, 0, 30, 11, 0.12);
    p.rotate("z", -0.72);
    
    // the tray, slid out to the left: low lit walls round a dark inside
    p.box(T0, -Y + 0.7, 0.3, S0 - T0 + 1, 2 * Y - 1.4, 3.2, { open: true, left: 0.26, right: 0.12, edge: 0 });
    // the matches lying in it, back row first, heads at the left end
    for (const y of ROWS) if (!(y === 0 && e > 0.01)) match(p, y);
    // the sleeve: a lit top, a front with a dark striker strip
    p.box(S0, -Y, 0, S1 - S0, 2 * Y, Z, { top: 0.24, left: 0.2, right: 0.065, edge: 0 });
    p.face([[S0 + 1.2, Y + 0.03, 1.5], [S1 - 1.2, Y + 0.03, 1.5], [S1 - 1.2, Y + 0.03, Z - 1.5], [S0 + 1.2, Y + 0.03, Z - 1.5]], 0.03, 0);
    // the middle match tips up out of the tray and lights
    if (e > 0.01) {
      p.push();
      p.translate(0, 0, 2.5 * e);
      p.rotate("y", 0.45 * e, [S0 + 1, 0, 3.4]);
      match(p, 0);
      const tip = p.pt([T0 + 2.6, 0.5, 5.4]);
      p.pop();
      if (fl > 0) flame(p, tip, fl, t, h);
    }
  },
};

// the flame on screen, leaning off the head: a black rim, a bright tongue, a dark core
function flame(p: Pen, [x, y]: [number, number], k: number, t: number, h: number) {
  const sw = Math.sin(t * 9) * 0.8 * h;
  p.screen((g) => {
    const tongue = (w: number, H: number, col: string) => {
      g.beginPath();
      g.moveTo(x - w * 0.9, y + w * 0.4);
      g.bezierCurveTo(x - w * 1.3, y - H * 0.3, x - w * 0.4 + sw, y - H * 0.7, x + sw, y - H);
      g.bezierCurveTo(x + w * 0.4 + sw, y - H * 0.7, x + w * 1.3, y - H * 0.3, x + w * 0.9, y + w * 0.4);
      g.closePath(); g.fillStyle = col; g.fill();
    };
    tongue(4.6 * k, 12 * k, "#000");
    tongue(3.4 * k, 10 * k, "rgb(115,115,115)");
    tongue(1.3 * k, 4.4 * k, "#000");
  });
}
