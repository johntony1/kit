// Nothing framed yet: a big bevelled picture frame hanging crooked from a nail by its wire, its window empty. Hover and it swings level and settles, and a picture of a hill under the sun appears in it.
import { SH, type Illustration, type V3 } from "../dots";

const W = 13, ZB = 0, ZT = 24, B = 4; // half width, bottom, top, border
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const Y = 1.6; // the front of the frame

export const pictureframe: Illustration = {
  k: "pictureframe", name: "Picture frame", title: "Nothing framed yet", body: "Pick a favourite image and it will hang here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    p.shadow(0, 2, 26, 9, 0.09);
    p.rotate("z", -0.58);
    const NZ = ZT + 6; // the nail
    // crooked at rest; on hover it swings level with a damped wobble
    const ang = 0.16 * Math.cos(h * Math.PI * 2.5) * Math.pow(1 - h, 1.4) + h * Math.sin(t * 2) * 0.008;
    p.rotate("y", ang, [0, 0, NZ]);
    // the wire, two bright strokes up to the nail, and the nail head
    const [nx, ny] = p.pt([0, Y - 0.6, NZ]), [ax, ay] = p.pt([-W + 5, Y - 0.6, ZT - 1]), [bx, by] = p.pt([W - 5, Y - 0.6, ZT - 1]);
    p.screen((g) => {
      g.strokeStyle = "#fff"; g.lineWidth = 1.3; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(ax, ay); g.lineTo(nx, ny); g.lineTo(bx, by); g.stroke();
      g.fillStyle = "#fff"; g.beginPath(); g.arc(nx, ny, 1.5, 0, Math.PI * 2); g.fill();
    });
    // the frame's body: a lit top edge and a sparse end behind the front
    p.box(-W, -0.6, ZB, W * 2, Y + 0.6, ZT - ZB, { top: 0.26, left: 0.12, right: 0.065, edge: 0 });
    // the bevelled front: top lit, left mid, bottom dense, right sparse, mitred at the corners
    const o = (x: number, z: number): V3 => [x, Y + 0.03, z];
    const iL = -W + B, iR = W - B, iB = ZB + B, iT = ZT - B;
    p.face([o(-W, ZT), o(W, ZT), o(iR, iT), o(iL, iT)], 0.3, 0);
    p.face([o(-W, ZB), o(-W, ZT), o(iL, iT), o(iL, iB)], 0.22, 0);
    p.face([o(-W, ZB), o(iL, iB), o(iR, iB), o(W, ZB)], 0.12, 0);
    p.face([o(W, ZB), o(W, ZT), o(iR, iT), o(iR, iB)], 0.08, 0);
    p.line([o(-W, ZT), o(iL, iT)], SH.edge, 0.55); p.line([o(W, ZB), o(iR, iB)], SH.edge, 0.55);
    // the window: dark and empty, then the picture fades in
    const win: V3[] = [o(iL, iB), o(iR, iB), o(iR, iT), o(iL, iT)];
    p.face(win, 0.03, 0);
    p.line([...win, win[0]], SH.edge, 0.7);
    const k = ease(Math.max(0, (h - 0.35) / 0.65));
    if (k > 0.02) {
      const w = (x: number, z: number): V3 => [x, Y + 0.06, z];
      // the sun, then a hill across the bottom
      p.ringV("y", [3.4, Y + 0.05, iT - 4.2], 2.6 * k, 0.32, 0);
      const hill: V3[] = [w(iL, iB)];
      for (let i = 0; i <= 12; i++) { const x = iL + ((iR - iL) * i) / 12; hill.push(w(x, iB + 0.3 + 6.5 * k * Math.exp(-Math.pow((x + 2.5) / 5.5, 2)))); }
      hill.push(w(iR, iB));
      p.face(hill, 0.24, 0);
    }
  },
};
