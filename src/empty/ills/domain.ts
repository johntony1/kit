// No domains connected: an address bar with a globe at its left and a faint placeholder. Hover and a name types in, then a dot and its ending, and a tick pops in.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (x: number) => Math.max(0, Math.min(1, x));

function badge(p: Pen, at: V3, r: number) {
  if (r <= 0.05) return;
  const [x, y] = p.pt(at);
  p.screen((g) => {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = "#fff"; g.fill();
    g.strokeStyle = "#000"; g.lineWidth = r * 0.3; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(x - r * 0.45, y + r * 0.02); g.lineTo(x - r * 0.12, y + r * 0.36); g.lineTo(x + r * 0.48, y - r * 0.34); g.stroke();
  });
}

export const domain: Illustration = {
  k: "domain", name: "Domain", title: "No domains connected", body: "Connect a domain you own and your site will be served from that address.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.scale(1.04);
    p.shadow(0, 0, 29, 14, 0.12);
    p.rotate("z", -0.45);
    p.box(-18, -3.5, 0, 36, 7, 14, { top: 0.2, left: 0.12, right: 0.065, lw: 0.6 });
    const fy = 3.53, zc = 7;
    const win: V3[] = [[-15.6, fy, 2.6], [15.6, fy, 2.6], [15.6, fy, 11.4], [-15.6, fy, 11.4]];
    p.clear(win);
    p.line([...win, win[0]], SH.edge, 0.5);
    // the globe: a ring, one meridian and the equator
    const gx = -11.4, gr = 3.1;
    p.ringV("y", [gx, fy + 0.02, zc], gr, 0.4, SH.edge, 0.7);
    p.line(Array.from({ length: 25 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [gx + Math.cos(a) * gr * 0.42, fy + 0.03, zc + Math.sin(a) * gr] as V3; }), SH.edge, 0.5);
    p.line([[gx - gr, fy + 0.03, zc], [gx + gr, fy + 0.03, zc]], SH.edge, 0.5);
    // the address: a faint placeholder at rest, then typed bright as a name, a dot and an ending
    const X0 = -6.2, bar = (x0: number, x1: number, v: number) => p.face([[x0, fy + 0.03, zc - 1], [x1, fy + 0.03, zc - 1], [x1, fy + 0.03, zc + 1], [x0, fy + 0.03, zc + 1]], v, 0);
    const k = cl(h / 0.62), name = 10.2 * ease(cl(k / 0.6)), tld = 5.4 * ease(cl((k - 0.72) / 0.28));
    let end = X0;
    if (k <= 0) bar(X0 + 1.4, 12.6, 0.07);
    if (name > 0.1) { bar(X0, X0 + name, 0.85); end = X0 + name; }
    if (k > 0.62) { p.dot([X0 + 11.5, fy + 0.03, zc - 0.6], 0.75, 1); end = X0 + 12.2; }
    if (tld > 0.1) { bar(X0 + 12.8, X0 + 12.8 + tld, 0.85); end = X0 + 12.8 + tld; }
    if (k < 1 && (h > 0.02 || Math.sin(t * 5) > 0)) p.line([[end + 0.8, fy + 0.03, zc - 2.2], [end + 0.8, fy + 0.03, zc + 2.2]], SH.edge, 0.7);
    const b = cl((h - 0.66) / 0.34);
    if (b > 0) badge(p, [17, -3.5, 19.5], 4.4 * (b < 0.65 ? ease(b / 0.65) * 1.18 : 1.18 - 0.18 * ease((b - 0.65) / 0.35)));
  },
};
