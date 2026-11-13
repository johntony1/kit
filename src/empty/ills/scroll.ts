// Nothing written yet: an open scroll standing between its two rollers, blank. Hover and lines of writing run across it one after another.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const W = 11, Z0 = 4, Z1 = 29; // half width of the sheet, bottom and top roller heights
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

/** a roller: a round bar drawn as a tube (dark rim, body, shine) with a knob at each end */
function roller(p: Pen, z: number) {
  const q = ([[-W - 2.2, 0, z], [W + 2.2, 0, z]] as V3[]).map((v) => p.pt(v));
  if (p.ink) { p.face([[-W - 2.2, 0.2, z - 1.6], [W + 2.2, 0.2, z - 1.6], [W + 2.2, 0.2, z + 1.6], [-W - 2.2, 0.2, z + 1.6]], 0.24); return; }
  p.screen((c) => {
    c.lineCap = "round";
    const stroke = (w: number, v: number, dy = 0) => {
      const n = Math.round(v * 255);
      c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = w;
      c.beginPath(); c.moveTo(q[0][0], q[0][1] + dy); c.lineTo(q[1][0], q[1][1] + dy); c.stroke();
    };
    stroke(5.4, 0); stroke(4, 0.7); stroke(1.3, 1, -0.9);
  });
  for (const x of [-W - 3.4, W + 3.4]) p.dot([x, 0, z], 2.3, 1);
}

export const scroll: Illustration = {
  k: "scroll", name: "Scroll", title: "Nothing written yet", body: "Start writing and your words will fill this page.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -17);
    p.shadow(0, 0, 28, 10, 0.12);
    p.rotate("z", -0.42);
    p.rotate("y", h * Math.sin(t * 1.8) * 0.02, [0, 0, 0]);
    // the sheet: bowed slightly back between the rollers
    const N = 10, edge: V3[] = [];
    for (let i = 0; i <= N; i++) { const z = Z0 + ((Z1 - Z0) * i) / N; edge.push([W, -Math.sin((i / N) * Math.PI) * 1.2, z]); }
    p.face([...edge.map(([x, y, z]) => [-x, y, z] as V3), ...edge.slice().reverse()], 0.24, 0);
    p.line([[W + 0.03, 0, Z0], ...edge.map(([x, y, z]) => [x + 0.03, y, z] as V3)], SH.edge, 0.6);
    roller(p, Z0);
    roller(p, Z1);
    // the writing: each line runs across in turn as the pointer rests
    const y = 0.1;
    for (let i = 0; i < 5; i++) {
      const k = ease(h * 5.5 - i * 0.9), z = Z1 - 5 - i * 3.8, x1 = i === 4 ? 1 : 7.5;
      if (k <= 0.02) continue;
      p.line([[-7.5, y, z], [-7.5 + (x1 + 7.5) * k, y, z]], SH.edge, 0.9);
    }
  },
};
