// No lessons yet: a small keyboard. A short tune plays on its own: keys press in turn and notes float up.
import { type Illustration, type V3 } from "../dots";

const P = 3.6; // seconds per loop
const KW = 3.1, NK = 8; // white key width, white keys
const X0 = -(KW * NK) / 2; // the first key's left edge
const YK = -1.5, KL = 9.5; // keys start at the back panel and run forward
const ZK = 3; // top of the keybed
// the tune: [white key or black key after it (+0.5), start (0..1 of the loop)]
const TUNE: [number, number][] = [[0, 0], [2, 0.14], [4, 0.28], [3.5, 0.42], [4, 0.56], [2, 0.7]];
const BLACK = [0, 1, 3, 4, 5]; // black keys sit after these white keys

export const piano: Illustration = {
  k: "piano", name: "Keyboard", title: "No lessons yet", body: "Start your first lesson and your practice will be saved here.",
  kind: "loop", period: P, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % P) / P;
    // how far each key is down: a quick press and a slower release
    const down = (key: number) => {
      let d = 0;
      for (const [k, s] of TUNE) {
        if (k !== key) continue;
        const v = (u - s + 1) % 1;
        if (v < 0.04) d = Math.max(d, v / 0.04); else if (v < 0.14) d = Math.max(d, 1 - (v - 0.04) / 0.1);
      }
      return d;
    };
    p.translate(-1, 0, -6);
    p.scale(1.08, [0, 0, 0]);
    p.shadow(0, 0, 34, 17, 0.12);
    const X1 = -X0;
    // the case: a base, a back panel with a little screen
    p.box(X0 - 2, -7, 0, X1 - X0 + 4, 17.5, ZK, { top: 0.13, left: 0.12, right: 0.065 });
    p.box(X0 - 2, -7, ZK, X1 - X0 + 4, 5.5, 3.2, { top: 0.14, left: 0.12, right: 0.065 });
    const zb = ZK + 3.22;
    p.face([[-4, -5.6, zb], [4, -5.6, zb], [4, -3.2, zb], [-4, -3.2, zb]], 0.04, 1);
    for (let i = 0; i < 5; i++) {
      const lvl = 0.3 + 0.7 * Math.abs(Math.sin(u * Math.PI * 6 + i)), x = -3.4 + i * 1.5;
      p.face([[x, -3.6, zb + 0.01], [x + 0.9, -3.6, zb + 0.01], [x + 0.9, -3.6 - lvl * 1.7, zb + 0.01], [x, -3.6 - lvl * 1.7, zb + 0.01]], 0.24, 0);
    }
    p.disc(X0 + 1.4, -4.4, zb, 1.2, 0.24, 1);
    p.disc(X0 + 4.4, -4.4, zb, 1.2, 0.24, 1);
    p.line([[X1 - 6, -5, zb], [X1 - 1, -5, zb]], 1, 0.6);
    p.line([[X1 - 6, -3.8, zb], [X1 - 3, -3.8, zb]], 1, 0.6);
    // the side cheeks round the keys
    p.box(X0 - 2, YK, ZK, 1.7, KL, 1.6, { top: 0.22, left: 0.13, right: 0.065 });

    // white keys, left to right
    for (let i = 0; i < NK; i++) {
      const d = down(i), x = X0 + i * KW;
      p.push(); p.rotate("x", -d * 0.07, [0, YK, ZK]);
      p.box(x + 0.18, YK, ZK, KW - 0.36, KL, 1.4, { top: d > 0.4 ? 0.34 : 0.24, left: d > 0.4 ? 0.3 : 0.2, right: 0.065 });
      p.pop();
    }
    // black keys, shorter and raised, on top
    for (const b of BLACK) {
      const d = down(b + 0.5), x = X0 + (b + 1) * KW;
      p.push(); p.rotate("x", -d * 0.07, [0, YK, ZK]);
      p.box(x - 0.8, YK, ZK + 1.4, 1.6, KL * 0.55, 1.1, { top: d > 0.4 ? 0.34 : 0.04, left: d > 0.4 ? 0.3 : 0.12, right: 0.04 });
      p.pop();
    }
    p.box(X1 + 0.3, YK, ZK, 1.7, KL, 1.6, { top: 0.22, left: 0.13, right: 0.065 });

    // notes rise from each key after it is struck
    for (const [k, s] of TUNE) {
      const v = (u - s + 1) % 1;
      if (v > 0.5) continue;
      const x = k % 1 ? X0 + (Math.floor(k) + 1) * KW : X0 + k * KW + KW / 2;
      const at: V3 = [x, YK + 2, ZK + 4 + v * 26];
      p.guide([[x, YK + 2, ZK + 2.6], at]);
      const [sx, sy] = p.pt(at), a = Math.sin(v * 2 * Math.PI) > -0.1 ? 1 : 0.6;
      p.screen((g) => {
        const n = Math.round(255 * a);
        g.fillStyle = g.strokeStyle = `rgb(${n},${n},${n})`; g.lineWidth = 0.8; g.lineCap = "round";
        g.beginPath(); g.ellipse(sx, sy, 1.3, 1, -0.4, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.moveTo(sx + 1.1, sy); g.lineTo(sx + 1.1, sy - 5); g.quadraticCurveTo(sx + 3.4, sy - 4, sx + 2.8, sy - 2.4); g.stroke();
      });
    }
  },
};
