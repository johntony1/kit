// No envelopes budgeted: a cash envelope standing up, its flap open behind and three banknotes sticking out of the top, a currency seal on the front note. Hover and the notes rise further and fan apart.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const X = 14, Y = 1.6, H = 18; // half width, half thickness, height of the envelope
const NW = 11, NH = 13; // half width and height of a note

// a banknote standing in the envelope: a lit face with a cut border, the front one with a seal and a dollar mark
function note(p: Pen, x: number, y: number, z: number, a: number, fill: number, front: boolean) {
  p.push();
  p.translate(x, y, z);
  p.rotate("y", a);
  const f: V3[] = [[-NW, 0, 0], [NW, 0, 0], [NW, 0, NH], [-NW, 0, NH]];
  p.face(f, fill, 0);
  p.line([[-NW, 0.02, 0], [-NW, 0.02, NH], [NW, 0.02, NH], [NW, 0.02, 0]], SH.edge, 0.8);
  p.line([[-NW + 1.6, 0.03, 0], [-NW + 1.6, 0.03, NH - 1.6], [NW - 1.6, 0.03, NH - 1.6], [NW - 1.6, 0.03, 0]], SH.edge, 0.5);
  if (front) {
    const zc = NH - 5.2;
    p.ringV("y", [0, 0.05, zc], 3.4, 0.02, 0);
    p.ringV("y", [0, 0.07, zc], 2.6, 0.36, 0);
    const [cx, cy] = p.pt([0, 0.1, zc]);
    p.screen((g) => {
      g.strokeStyle = "#000"; g.lineWidth = 0.75; g.lineCap = "round";
      g.beginPath();
      g.arc(cx, cy - 0.75, 0.85, -0.2, Math.PI * 1.5, true);
      g.arc(cx, cy + 0.75, 0.85, -Math.PI / 2, Math.PI * 0.8);
      g.moveTo(cx, cy - 2.3); g.lineTo(cx, cy + 2.3);
      g.stroke();
    });
  }
  p.pop();
}

export const cashenvelope: Illustration = {
  k: "cashenvelope", name: "Cash envelope", title: "No envelopes budgeted", body: "Split your money into envelopes for rent, food and fun, and each one will show here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const rise = ease(clamp(h / 0.7)), bob = h * Math.sin(t * 2.6) * 0.3;
    p.translate(0, 0, -16);
    p.scale(1.05);
    p.shadow(0, 0, 28, 10, 0.12);
    p.rotate("z", -0.66);
    // the flap, open and leaning back from the top of the back wall
    const fa = 0.5, fl = 10;
    p.face([[-X, -Y, H], [X, -Y, H], [0, -Y - fl * Math.sin(fa), H + fl * Math.cos(fa)]], 0.12, 0);
    p.line([[-X, -Y, H], [0, -Y - fl * Math.sin(fa), H + fl * Math.cos(fa)], [X, -Y, H]], SH.edge, 0.8);
    // the dark mouth of the envelope
    p.face([[-X, -Y, H], [X, -Y, H], [X, Y, H], [-X, Y, H]], 0.03, 0);
    // three notes, fanning out as they rise
    const z0 = H - NH + 8.5 + 3.5 * rise + bob;
    note(p, -2.2 - 2 * rise, -0.6, z0 + 1.4, -0.12 - 0.1 * rise, 0.16, false);
    note(p, 2.4 + 2 * rise, -0.1, z0 + 0.6 + 1.6 * rise, 0.1 + 0.1 * rise, 0.2, false);
    note(p, 0, 0.5, z0 + 1.2 * rise, 0, 0.28, true);
    // the envelope: a lit front with its folds cut in, a sparse end
    p.face([[X, -Y, 0], [X, Y, 0], [X, Y, H], [X, -Y, H]], 0.065, 0);
    p.face([[-X, Y, 0], [X, Y, 0], [X, Y, H], [-X, Y, H]], 0.2, 0);
    const f = Y + 0.03;
    p.line([[-X, f, H], [X, f, H]], SH.edge, 0.9);
    p.line([[-X, f, 0], [0, f, H * 0.5], [X, f, 0]], SH.edge, 0.7);
    p.line([[-X, f, H - 0.2], [-2, f, H * 0.5 + 0.8]], SH.edge, 0.6);
    p.line([[X, f, H - 0.2], [2, f, H * 0.5 + 0.8]], SH.edge, 0.6);
  },
};
