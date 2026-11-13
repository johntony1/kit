// Nothing to collect: a parcel with a big map pin standing on top of it, the pickup point. Hover and the pin hops, spins round once and lands; a tick badge pops in.
import { type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const B = 8.5, BH = 9; // half size and height of the parcel
const PR = 6.8, PT = 15.5; // pin head radius, height of the head centre above its tip

function tick(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.5, y); g.lineTo(x - r * 0.12, y + r * 0.4); g.lineTo(x + r * 0.52, y - r * 0.38); g.stroke();
  });
}
// the pin's outline in [x, z]: a round head narrowing to a point at z = 0, grown by g for its dark halo
const pin = (g: number): [number, number][] => {
  const out: [number, number][] = Array.from({ length: 36 }, (_, i) => {
    const a = -Math.PI / 2 + 0.66 + (i / 35) * (Math.PI * 2 - 1.32);
    return [Math.cos(a) * (PR + g), PT + Math.sin(a) * (PR + g)];
  });
  out.push([0, -g * 1.4]);
  return out;
};

function hop(k: number) {
  if (k <= 0 || k >= 1) return 0;
  if (k < 0.7) { const v = k / 0.7; return 7 * 4 * v * (1 - v); }
  const v = (k - 0.7) / 0.3; return 1.2 * 4 * v * (1 - v);
}

export const pickup: Illustration = {
  k: "pickup", name: "Store pickup", title: "Nothing to collect", body: "When an order is ready to pick up in store, it will show here with where to collect it.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const k = Math.min(1, h * 1.3);
    p.translate(0, 0, -17);
    p.shadow(0, 0, 25, 12, 0.12);
    // the parcel: lit top, dense front, sparse side, a tape band across the top and down the front
    p.box(-B, -B, 0, B * 2, B * 2, BH, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    p.face([[-B, -1.5, BH + 0.03], [B, -1.5, BH + 0.03], [B, 1.5, BH + 0.03], [-B, 1.5, BH + 0.03]], 0.34, 0);
    p.face([[B + 0.03, -1.5, BH], [B + 0.03, 1.5, BH], [B + 0.03, 1.5, 0], [B + 0.03, -1.5, 0]], 0.2, 0);
    // a dark spot where the pin stands
    p.disc(0, 0, BH + 0.05, 2.2, 0.02, 0);
    // the pin: hops off the parcel and spins round once in the air
    const z = BH + 0.4 + hop(k), spin = ease(Math.min(1, k / 0.7)) * Math.PI * 2;
    p.push();
    p.translate(0, 0, z);
    p.rotate("z", -0.78 + spin);
    const pts = (y: number, g: number) => pin(g).map(([x, zz]) => [x, y, zz] as V3);
    p.face(pts(-1.6, 0), 0.08, 0); // its thickness, behind
    p.face(pts(0.7, 0.9), 0.02, 0); // a dark halo that cuts it off the parcel
    p.face(pts(0.75, 0), 0.3, 0);
    p.ringV("y", [0, 0.8, PT], 2.6, 0.02, 0); // the hole in the head
    p.pop();
    const b = Math.max(0, (h - 0.72) / 0.28);
    if (b > 0) {
      const pop = b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35);
      tick(p, [-5, 7, BH + 17], 4.2 * pop);
    }
  },
};
