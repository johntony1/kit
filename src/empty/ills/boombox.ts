// Boombox: a wide boombox with two big speakers, a tape deck between them and a carry handle. It thumps on the beat, the speaker cones pump and notes drift up.
import { type Illustration, type Pen, type V3 } from "../dots";

const P = 2.4; // seconds per loop, four beats
const X = 16, Y0 = -4.5, Y1 = 4.5, Z0 = 1, Z1 = 16;

const ring = (x: number, y: number, z: number, r: number): V3[] => Array.from({ length: 28 }, (_, i) => [x + Math.cos((i / 28) * Math.PI * 2) * r, y, z + Math.sin((i / 28) * Math.PI * 2) * r] as V3);

function note(p: Pen, at: V3, s: number, a: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.fillStyle = g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 0.8 * s; g.lineCap = "round";
    g.beginPath(); g.ellipse(x, y, 1.6 * s, 1.2 * s, -0.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(x + 1.4 * s, y - 0.2 * s); g.lineTo(x + 1.4 * s, y - 5.2 * s); g.lineTo(x + 3.6 * s, y - 4.1 * s); g.stroke();
  });
}

export const boombox: Illustration = {
  k: "boombox", name: "Boombox", title: "Nothing on the speakers", body: "Pick something to play and it will come through here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / P) % 1;
    const beat = Math.exp(-((u * 4) % 1) * 5); // a thump that dies away, four to the loop
    p.translate(0, 0, -12);
    p.shadow(0, 0, 36, 17, 0.12);
    p.box(-X + 2, Y0 + 1, 0, 4, Y1 - Y0 - 2, Z0, { top: 0.2, left: 0.14, right: 0.08 });
    p.box(X - 6, Y0 + 1, 0, 4, Y1 - Y0 - 2, Z0, { top: 0.2, left: 0.14, right: 0.08 });
    p.push();
    p.translate(0, 0, beat * 0.7);
    // the handle: two posts and a long grip
    p.box(-12, Y0 + 0.6, Z1, 2.2, 2.2, 6, { top: 0.26, left: 0.26, right: 0.1 });
    p.box(9.8, Y0 + 0.6, Z1, 2.2, 2.2, 6, { top: 0.26, left: 0.26, right: 0.1 });
    p.box(-12, Y0 + 0.6, Z1 + 6, 24, 2.2, 2.2, { top: 0.3, left: 0.26, right: 0.1 });
    // the body
    p.box(-X, Y0, Z0, X * 2, Y1 - Y0, Z1 - Z0, { top: 0.2, left: 0.1, right: 0.05 });
    const fy = Y1 + 0.02;
    // two speakers: a lit ring, a dark cone that pumps, a bright cap
    for (const cx of [-9.6, 9.6]) {
      p.ringV("y", [cx, fy, 8.4], 5.6, 0.34, 1, 0.6);
      p.clear(ring(cx, fy + 0.02, 8.4, 4.2 + beat * 0.7));
      p.ringV("y", [cx, fy + 0.04, 8.4], 1.5 + beat * 0.5, 0.34, 0);
    }
    // the tape deck: a lit window with two reels, and a row of keys under it
    p.face([[-3.2, fy, 8.6], [3.2, fy, 8.6], [3.2, fy, 13.4], [-3.2, fy, 13.4]], 0.34, 1, 0.5);
    p.dot([-1.5, fy + 0.03, 11], 0.85, 0); p.dot([1.5, fy + 0.03, 11], 0.85, 0);
    for (let i = 0; i < 3; i++) p.face([[-3.2 + i * 2.3, fy, 3.4], [-1.4 + i * 2.3, fy, 3.4], [-1.4 + i * 2.3, fy, 5.6], [-3.2 + i * 2.3, fy, 5.6]], 0.3, 0);
    p.pop();
    // two notes rising in turn
    for (let i = 0; i < 2; i++) {
      const k = (u + i * 0.5) % 1;
      note(p, [i ? 12 : -9, -2, Z1 + 7 + k * 9], 1 + 0.2 * k, Math.sin(Math.PI * k));
    }
  },
};
