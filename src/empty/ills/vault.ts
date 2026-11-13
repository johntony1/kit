// Nothing stored yet: a bank vault, a heavy round door set in a block wall, a spoked wheel on its face. Hover and the wheel spins, then the door swings out on its hinge to show the dark, empty vault.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const W = 15, Y0 = 3, ZB = 0, ZTOP = 29; // wall half width, its front (+y), bottom and top
const CZ = 15, R = 10.5, TH = 3; // door centre height, radius and thickness
/** a circle in the plane y = const */
const circ = (y: number, r: number, n = 40, cx = 0): V3[] =>
  Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return [cx + Math.cos(a) * r, y, CZ + Math.sin(a) * r] as V3; });

/** a bright stroke on screen through 3D points */
function stroke(p: Pen, pts: V3[], w: number, close = false) {
  const q = pts.map((v) => p.pt(v));
  p.screen((g) => {
    g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    if (close) g.closePath();
    g.strokeStyle = "#fff"; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.stroke();
  });
}

export const vault: Illustration = {
  k: "vault", name: "Vault", title: "Nothing stored yet", body: "Keep what matters most locked away here. Anything you store will be listed in the vault.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -15);
    p.shadow(0, 2, 27, 13, 0.12);
    p.rotate("z", -0.42);
    const spin = ease(clamp(h / 0.45)) * Math.PI * 1.5 + h * t * 0.4;
    const open = ease(clamp((h - 0.4) / 0.6));
    // the wall block: a lit top, the dense front the door sits in, a sparse end
    p.box(-W, -4, ZB, W * 2, Y0 + 4, ZTOP, { top: 0.22, left: 0.12, right: 0.065, edge: 0 });
    // the door frame: a lit ring proud of the wall, with bolt heads
    p.face([...circ(Y0 + 0.05, R + 2.4), circ(Y0 + 0.05, R + 2.4)[0], ...circ(Y0 + 0.05, R + 0.3).reverse(), circ(Y0 + 0.05, R + 0.3)[39]], 0.26, 0);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.4; p.dot([Math.cos(a) * (R + 1.35), Y0 + 0.1, CZ + Math.sin(a) * (R + 1.35)], 0.65, 0); }
    // the opening behind the door: dark, with the far wall's lip lit at the bottom
    p.clear(circ(Y0 + 0.1, R + 0.3));
    if (open > 0) p.face(circ(Y0 + 0.1, R + 0.3).slice(25, 36).concat(circ(-3, R + 0.3).slice(25, 36).reverse()), 0.12, 0);
    // the door: hinged on its right edge, swinging out toward us
    p.push();
    p.rotate("z", -1.15 * open, [R + 0.6, Y0, 0]);
    for (let y = Y0; y <= Y0 + TH; y += 0.4) p.face(circ(y, R), 0.08, 0); // the thick rim
    p.face(circ(Y0 + TH, R), 0.26, 0);
    p.face(circ(Y0 + TH + 0.03, R - 2), 0.03, 0); // a sunk panel, dark, so the bright wheel stands out
    p.line([...circ(Y0 + TH + 0.03, R), circ(Y0 + TH + 0.03, R)[0]], SH.edge, 0.7);
    // the wheel: a bright rim, three spokes through a hub, turning
    const yw = Y0 + TH + 0.6, wr = 6.2;
    const spoke = (k: number) => { const a = spin + (k * Math.PI) / 3; return [[Math.cos(a) * wr, yw, CZ + Math.sin(a) * wr], [-Math.cos(a) * wr, yw, CZ - Math.sin(a) * wr]] as V3[]; };
    for (let k = 0; k < 3; k++) stroke(p, spoke(k), 2.2);
    stroke(p, circ(yw, wr, 32), 2.4, true);
    p.ringV("y", [0, yw + 0.1, CZ], 2.2, 1, 0);
    for (let k = 0; k < 6; k++) { const a = spin + (k * Math.PI) / 3; p.dot([Math.cos(a) * wr, yw + 0.2, CZ + Math.sin(a) * wr], 1.5, 1); }
    p.pop();
  },
};
