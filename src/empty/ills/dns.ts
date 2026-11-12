// No records yet: a tray of record cards with index tabs. Hover and the front card rises out of the tray, an at sign and two lines on it.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const cl = (x: number) => Math.max(0, Math.min(1, x));
const backOut = (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
const X = 12.5, Y = 7.5, H = 7.5; // the tray: half width, half depth, height
const CT = 14.5; // the top of a card at rest

/** a card standing across the tray, with an index tab on its top edge */
function card(p: Pen, y: number, tab: number, lift: number, fill: number) {
  const z0 = 1.2 + lift, z1 = CT + lift;
  p.face([[-X + 1.6, y, z0], [X - 1.6, y, z0], [X - 1.6, y, z1], [tab + 5, y, z1], [tab + 5, y, z1 + 2], [tab, y, z1 + 2], [tab, y, z1], [-X + 1.6, y, z1]], fill, SH.edge, 0.55);
}

export const dns: Illustration = {
  k: "dns", name: "DNS records", title: "No records yet", body: "Add a record to point your domain at a server, a mailbox or another service.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, _t, h) {
    const lift = 10.5 * backOut(cl(h * 1.25)) * (h > 0 ? 1 : 0);
    p.translate(0, 0, -11);
    p.scale(1.1, [0, 0, 8]);
    p.shadow(0, 0, 26, 13, 0.12);
    p.rotate("z", -0.42);
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { open: true, lw: 0.6 });
    card(p, -4.6, -9.5, 0, 0.1);
    card(p, -1.5, -3.5, 0, 0.14);
    card(p, 1.6, 2.5, 0, 0.18);
    // the front card, with its record on it
    const y = 4.7;
    card(p, y, -9.5, lift, 0.3);
    const cx = -4.4, cz = 6.4 + lift, R = 3.3, pt = (a: number, b: number): V3 => [cx + a, y + 0.03, cz + b];
    const at: V3[] = [pt(1.5, 1.4), pt(1.5, -1.1), pt(2.2, -1.6), pt(R * 0.96, -0.9), pt(R, 0)];
    for (let i = 1; i <= 22; i++) { const a = (i / 22) * (Math.PI * 2 - 0.95); at.push(pt(Math.cos(a) * R, Math.sin(a) * R)); }
    p.line(at, SH.edge, 0.75);
    p.line(Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return pt(Math.cos(a) * 1.35, Math.sin(a) * 1.35); }), SH.edge, 0.75);
    p.line([pt(5.6, 1.4), pt(13.4, 1.4)], SH.edge, 0.8);
    p.line([pt(5.6, -1.4), pt(10.6, -1.4)], SH.edge, 0.8);
    p.line([[-X + 3.2, y + 0.03, CT + lift - 2], [X - 3.2, y + 0.03, CT + lift - 2]], SH.edge, 0.6);
    // the tray's front and right walls, over the cards
    p.face([[-X, Y, 0], [X, Y, 0], [X, Y, H], [-X, Y, H]], SH.left, SH.edge, 0.6);
    p.face([[X, -Y, 0], [X, Y, 0], [X, Y, H], [X, -Y, H]], SH.right, SH.edge, 0.6);
    p.face([[-3.2, Y + 0.03, 2.4], [3.2, Y + 0.03, 2.4], [3.2, Y + 0.03, 5.2], [-3.2, Y + 0.03, 5.2]], 0.3, SH.edge, 0.5);
  },
};
