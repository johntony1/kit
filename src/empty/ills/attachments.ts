// No attachments: a page and a paperclip. Hover and the clip drops out of the air and slides onto the page's edge.
import { easeInOut, SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 11, Y = 13, T = 0.7; // page half width, half depth, thickness

/** the clip's wire, as a centre line in its own plane: u along the clip, v across */
function wire(): [number, number][] {
  const out: [number, number][] = [];
  const line = (u0: number, v0: number, u1: number, v1: number) => { for (let i = 0; i <= 6; i++) out.push([u0 + ((u1 - u0) * i) / 6, v0 + ((v1 - v0) * i) / 6]); };
  const arc = (cu: number, cv: number, r: number, a0: number, a1: number) => { for (let i = 1; i <= 12; i++) { const a = a0 + ((a1 - a0) * i) / 12; out.push([cu + Math.cos(a) * r, cv + Math.sin(a) * r]); } };
  line(13, -1.1, 3, -1.1);
  arc(3, 0.65, 1.75, -Math.PI / 2, -Math.PI * 1.5);
  line(3, 2.4, 16, 2.4);
  arc(16, 0, 2.4, Math.PI / 2, -Math.PI / 2);
  line(16, -2.4, 5.5, -2.4);
  return out;
}
const WIRE = wire();

/** the wire as one ribbon polygon of width w, mapped into 3D by `at` */
function ribbon(p: Pen, at: (u: number, v: number) => V3, w: number, fill: number, edge: number) {
  const L: V3[] = [], R: V3[] = [];
  WIRE.forEach(([u, v], i) => {
    const a = WIRE[Math.max(0, i - 1)], b = WIRE[Math.min(WIRE.length - 1, i + 1)];
    let du = b[0] - a[0], dv = b[1] - a[1];
    const l = Math.hypot(du, dv) || 1; du /= l; dv /= l;
    L.push(at(u - dv * w * 0.5, v + du * w * 0.5)); R.push(at(u + dv * w * 0.5, v - du * w * 0.5));
  });
  p.face([...L, ...R.reverse()], fill, edge, 0.4);
}

export const attachments: Illustration = {
  k: "attachments", name: "Paperclip", title: "No attachments", body: "Files you attach to this item will be clipped together here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 2, -9);
    p.shadow(0, 0, 28, 14, 0.12);
    // a second sheet under the page, a little turned
    p.push(); p.rotate("z", 0.12);
    p.box(-X, -Y, 0, X * 2, Y * 2, T, { top: 0.13, left: 0.12, right: 0.065 });
    p.pop();
    p.box(-X, -Y, T, X * 2, Y * 2, T, { top: 0.22 });
    const Z = T * 2 + 0.04;
    // a picture and some lines on the page
    p.face([[-8.5, -4, Z], [3, -4, Z], [3, 4, Z], [-8.5, 4, Z]], p.ink ? 0.13 : 0, SH.edge, 0.6);
    p.line([[-6.5, 2.2, Z + 0.02], [-3.6, -0.6, Z + 0.02], [-1.6, 1.2, Z + 0.02], [0, 0, Z + 0.02], [1.6, 2.2, Z + 0.02]], SH.edge, 0.6);
    p.dot([-0.2, -2, Z + 0.03], 0.9, 0.02);
    for (let i = 0; i < 3; i++) p.line([[-8.5, 6.6 + i * 2.2, Z], [i === 2 ? -1 : 7.5, 6.6 + i * 2.2, Z]], SH.edge, 0.65);

    // the clip: up in the air and back at rest; on hover it drops, then slides onto the edge
    const drop = easeInOut(Math.min(1, h / 0.55)), slide = easeInOut(Math.max(0, Math.min(1, (h - 0.5) / 0.5)));
    const cz = Z + 0.15 + (1 - drop) * 12, shift = (1 - slide) * 7, cx = 4.5;
    // u runs along -y, from on the page out past its back edge
    const at = (u: number, v: number): V3 => [cx + v, -Y + 9 - u - shift, cz];
    // the landing spot and the drops to it
    if (slide < 0.98) {
      const land = (u: number, v: number): V3 => [cx + v, -Y + 9 - u, Z + 0.1];
      p.guide([land(1, -3.4), land(18.4, -3.4), land(18.4, 3.4), land(1, 3.4), land(1, -3.4)], true);
      if (drop < 0.98) for (const [u, v] of [[1, 3.4], [1, -3.4], [18.4, 3.4]]) p.guide([at(u, v), [cx + v, -Y + 9 - u - shift, Z + 0.1]]);
    }
    if (!p.ink) ribbon(p, at, 2.6, 0.02, 0); // a dark halo so the wire reads on the lit page
    ribbon(p, at, 1.2, 0.34, SH.edge);
    // a glint on the bend
    p.dot(at(17.6, 1.2), 0.6, 1);
  },
};
