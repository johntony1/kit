// No money yet: a wallet. Hover and the flap lifts on an empty wallet; a moth flutters out.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 14, Y = 2.6, Z = 11; // half width, half depth, height

// a moth flat to the screen: two pairs of wings and a body, wings beating with f (-1..1)
function moth(p: Pen, at: V3, f: number, k: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.fillStyle = `rgba(255,255,255,${0.9 * k})`;
    const sy = 0.3 + 0.7 * Math.abs(f); // wings fold toward the body as they beat
    for (const d of [-1, 1]) {
      g.beginPath(); g.ellipse(x + d * 2.3, y - 1 * sy, 2.2, 1.5 * sy, d * 0.45, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(x + d * 1.6, y + 1.1 * sy, 1.3, 1.1 * sy, -d * 0.5, 0, Math.PI * 2); g.fill();
    }
    // a dark gap down the middle so the two wings read apart, then the body
    g.fillStyle = "#000"; g.fillRect(x - 0.55, y - 3, 1.1, 6);
    g.fillStyle = `rgba(255,255,255,${0.7 * k})`;
    g.beginPath(); g.ellipse(x, y + 0.2, 0.35, 1.6, 0, 0, Math.PI * 2); g.fill();
  });
}

export const wallet: Illustration = {
  k: "wallet", name: "Empty wallet", title: "Your wallet is empty", body: "Add funds to get started. Your balance and payments will show up here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.shadow(0, 0, 28, 13, 0.12);
    // body, open at the top (the flap covers it at rest)
    p.box(-X, -Y, 0, X * 2, Y * 2, Z, { open: true, left: 0.12, right: 0.07 });
    // stitching along the front
    p.line([[-X + 1.6, Y + 0.03, Z - 1.6], [-X + 1.6, Y + 0.03, 1.6], [X - 1.6, Y + 0.03, 1.6], [X - 1.6, Y + 0.03, Z - 1.6]], 0.4, 0.4);
    // the flap, hinged on the top back edge, swinging up and back
    p.push();
    p.rotate("x", h * 2.2, [0, -Y, Z]);
    p.face([[-X, -Y, Z], [X, -Y, Z], [X, Y, Z], [-X, Y, Z]], 0.24, SH.edge, 0.6);
    const fy = Y + 0.05;
    const front: V3[] = [[-X, fy, Z], [X, fy, Z], [X, fy, Z - 3.5], ...Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI; return [Math.cos(a) * 6, fy, Z - 4 - Math.sin(a) * 3.6] as V3; }), [-X, fy, Z - 3.5]];
    p.face(front, 0.3, SH.edge, 0.7);
    p.dot([0, fy + 0.05, Z - 6.2], 1.3, 1); // the snap
    p.pop();
    // the stud the snap closes on
    if (h > 0.15) p.dot([0, Y + 0.05, Z - 6.2], 0.9, Math.min(1, (h - 0.15) * 4) * 0.8);
    // the moth rises out once the flap is up, with a little dust
    const k = Math.max(0, (h - 0.45) / 0.55);
    if (k > 0) {
      for (let i = 0; i < 4; i++) {
        const u = (t * 0.5 + i / 4) % 1;
        p.dot([-6 + i * 3.3, 1.5, Z + 1 + u * 8], 0.7, k * Math.sin(u * Math.PI) * 0.8);
      }
      const m: V3 = [-4 - k * 10 + Math.sin(k * 4 + t * 1.2) * 1.5, 2 + k * 8, Z + 2 + k * 9 + Math.sin(t * 2.3) * 0.8];
      moth(p, m, Math.sin(t * 18), Math.min(1, k * 1.6));
    }
  },
};
