// No jewellery yet: a necklace on a jewellery bust, a fine dark chain on the lit front dipping to a cut gem. Hover and the pendant swings and the gem glints.
import { type Illustration, type Pen, type V3 } from "../dots";

const Y0 = -3, Y1 = 3; // the bust's back and front
// the bust's outline in x, z: a chest flaring to shoulders, a neck on top
const BUST: [number, number][] = [
  [-4.5, 9], [4.5, 9], [10.5, 18], [12, 22], [11, 24.5], [4, 26], [3.6, 34], [-3.6, 34], [-4, 26], [-11, 24.5], [-12, 22], [-10.5, 18],
];

/** screen winding, > 0 when the face looks at us */
const facing = (p: Pen, pts: V3[]) => {
  const q = pts.map((v) => p.pt(v));
  let s = 0;
  for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; s += q[i][0] * q[j][1] - q[j][0] * q[i][1]; }
  return s;
};

// a four point glint
function glint(p: Pen, at: V3, r: number) {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.fillStyle = "#000"; g.beginPath();
    g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r);
    g.fill();
  });
}

export const necklace: Illustration = {
  k: "necklace", name: "Necklace", title: "No jewellery yet", body: "Save the pieces you love and they will be kept here for later.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16.5);
    p.shadow(0, 0, 20, 10, 0.12);
    p.rotate("z", -0.62); // turned so the bust's front faces us
    // a round foot and a short stem
    p.cylinder(0, 0, 0, 7.5, 2.6, { side: 0.12, top: 0.2, edge: 0 });
    p.box(-1.6, -1.6, 2.6, 3.2, 3.2, 6.6, { top: 0.2, left: 0.12, right: 0.065, edge: 0 });
    // the bust: its sides first (only the ones we see), then the front
    const n = BUST.length;
    for (let i = 0; i < n; i++) {
      const [ax, az] = BUST[i], [bx, bz] = BUST[(i + 1) % n];
      const q: V3[] = [[ax, Y1, az], [bx, Y1, bz], [bx, Y0, bz], [ax, Y0, az]];
      if (facing(p, q) > 0) p.face(q, bz - az < -0.5 || Math.abs(bz - az) < 2.5 ? 0.2 : 0.065, 0);
    }
    p.face(BUST.map(([x, z]) => [x, Y1, z] as V3), 0.2, 0);
    // the chain: a bright cord round the neck, dipping to the pendant
    const sw = h * (Math.sin(t * 3.4) * 0.22 + 0.12 * Math.sin(h * Math.PI));
    const pz = 18, pend: V3 = [Math.sin(sw) * 2.4, Y1 + 0.1, pz + 2.4 - Math.cos(sw) * 2.4];
    const chain = (side: number): V3[] => Array.from({ length: 13 }, (_, i) => {
      const k = i / 12;
      return [side * 4.2 * (1 - k) + pend[0] * k, Y1 + 0.1, 27.5 - (27.5 - pend[2] - 2.6) * Math.sin((k * Math.PI) / 2)] as V3;
    });
    p.screen((g) => {
      g.strokeStyle = "#000"; g.lineWidth = 1.1; g.lineCap = "round"; g.lineJoin = "round";
      for (const s of [-1, 1]) { g.beginPath(); chain(s).forEach((v, i) => { const [x, y] = p.pt(v); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.stroke(); }
      // the band behind the neck
      const [lx, ly] = p.pt([-4.2, Y1, 27.5]), [rx, ry] = p.pt([4.2, Y1, 27.5]), [mx, my] = p.pt([0, Y1, 29.2]);
      g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo(mx, my, rx, ry); g.stroke();
      // the pendant: a bright cut gem, a drop shape with facet cuts
      const [x, y] = p.pt(pend), r = 4.6;
      g.beginPath(); g.moveTo(x, y - r * 0.2); g.lineTo(x + r * 0.85, y + r * 0.35); g.lineTo(x, y + r * 1.6); g.lineTo(x - r * 0.85, y + r * 0.35); g.closePath();
      g.fillStyle = "#000"; g.fill();
      g.strokeStyle = "#fff"; g.lineWidth = 0.6;
      g.beginPath(); g.moveTo(x - r * 0.85, y + r * 0.35); g.lineTo(x + r * 0.85, y + r * 0.35); g.moveTo(x - r * 0.3, y + r * 0.35); g.lineTo(x, y + r * 1.5); g.lineTo(x + r * 0.3, y + r * 0.35); g.stroke();
    });
    const k = Math.max(0, (h - 0.45) / 0.55);
    if (k > 0) {
      const [gx, , gz] = pend;
      glint(p, [gx + 3.8, Y1 + 0.2, gz - 1.2], 2.6 * k * (0.75 + 0.25 * Math.sin(t * 6)));
      glint(p, [gx - 3.4, Y1 + 0.2, gz - 3.8], 1.7 * k * (0.75 + 0.25 * Math.sin(t * 6 + 2)));
    }
  },
};
