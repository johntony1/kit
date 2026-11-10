// No camera access: a camera. Hover and the lens extends, then the shutter blinks and the flash fires.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const X = 14, Y = 6, Z0 = 3, Z1 = 21; // half width, half depth, bottom, top of the body
const LX = -1, LZ = 12; // the lens centre on the front (+y) face

/** a barrel along +y from y0 to y1: strips round its visible side, lit on top, darker to the right */
function barrel(p: Pen, y0: number, y1: number, r: number, lit = 0.24) {
  const N = 24;
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2, m = (a0 + a1) / 2;
    if (Math.cos(m) + Math.sin(m) < -0.1) continue;
    const at = (a: number, y: number): V3 => [LX + Math.cos(a) * r, y, LZ + Math.sin(a) * r];
    const f = Math.sin(m) > 0.35 ? lit : Math.sin(m) > -0.35 ? 0.12 : 0.065;
    p.face([at(a0, y0), at(a1, y0), at(a1, y1), at(a0, y1)], f, 0);
  }
}

export const camera: Illustration = {
  k: "camera", name: "Camera", title: "No camera access", body: "Allow camera access in your browser settings to take a photo.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, -3, -10);
    p.shadow(0, 2, 26, 12, 0.12);
    // body: front faces +y; a silver strip top and bottom, dark leather between
    p.box(-X, -Y, Z0, X * 2, Y * 2, Z1 - Z0, { top: 0.22, left: 0.13, right: 0.065 });
    const b0 = Z0 + 3, b1 = Z1 - 3.6;
    // a grip seam round the body, and a strap lug on the side
    p.line([[-X, Y + 0.03, b1], [X, Y + 0.03, b1], [X + 0.03, -Y, b1]], SH.edge, 0.6);
    p.line([[-X, Y + 0.03, b0], [X, Y + 0.03, b0], [X + 0.03, -Y, b0]], SH.edge, 0.6);
    p.ringV("x", [X + 0.05, 0, b1 - 2.4], 1.1, 0.3, SH.edge, 0.4);
    // top: the viewfinder hump, the shutter button and a dial
    p.box(-6, -4.5, Z1, 9, 9, 3.4, { top: 0.24, left: 0.13, right: 0.07 });
    p.box(-5, -3, Z1 + 3.4, 7, 6, 1.4, { top: 0.22, left: 0.12, right: 0.07 });
    p.cylinder(9.5, -3, Z1, 2.2, 1.2, { top: 0.24, side: 0.12 });
    const press = Math.max(0, Math.min(1, (h - 0.6) / 0.25));
    p.cylinder(9.5, -3, Z1 + 1.2, 1.2, 1.2 - press * 0.7, { top: 0.32, side: 0.16 });
    p.cylinder(-10.5, -1.5, Z1, 1.8, 1.4, { top: 0.22, side: 0.12 });

    // the shutter: one blink every 1.5 s once the lens is out
    const ready = Math.max(0, (h - 0.75) / 0.25);
    const u = (t % 1.5) / 1.5;
    const blink = ready >= 1 && u > 0.15 && u < 0.35 ? Math.sin(((u - 0.15) / 0.2) * Math.PI) : 0;

    // the flash: its own short pulse just after the shutter closes
    const fu = (u - 0.22) / 0.3;
    const flash = ready >= 1 && fu > 0 && fu < 1 ? Math.pow(Math.sin(fu * Math.PI), 0.6) : 0;
    // the flash head sits on top, its window flush with the front and dark until it fires
    p.box(4.5, 1.6, Z1, 7.5, Y - 1.6, 3.4, { top: 0.24, left: 0.13, right: 0.07 });
    p.face([[5.1, Y + 0.03, Z1 + 0.6], [11.4, Y + 0.03, Z1 + 0.6], [11.4, Y + 0.03, Z1 + 2.8], [5.1, Y + 0.03, Z1 + 2.8]], 0.02 + flash * 0.98, SH.edge, 0.45);
    // the lens: a mount, then a barrel that extends on hover, then a focus ring and the glass
    const L = 2 + 7 * Math.min(1, h / 0.75);
    p.ringV("y", [LX, Y + 0.03, LZ], 8.2, 0.24, SH.edge, 0.55);
    barrel(p, Y, Y + 1.4, 7.2, 0.2);
    p.ringV("y", [LX, Y + 1.4, LZ], 7.2, 0.22, SH.edge, 0.5);
    barrel(p, Y + 1.4, Y + L, 6.2, 0.26);
    // grip ridges round the focus ring
    for (let i = 0; i < 3; i++) {
      const y = Y + L - 1 - i * 1.3;
      if (y < Y + 1.8) break;
      p.line(Array.from({ length: 13 }, (_, j) => { const a = -Math.PI * 0.05 + (Math.PI * 0.85 * j) / 12; return [LX + Math.cos(a) * 6.2, y, LZ + Math.sin(a) * 6.2] as V3; }), SH.edge, 0.5);
    }
    p.ringV("y", [LX, Y + L, LZ], 6.2, 0.3, SH.edge, 0.55);
    p.ringV("y", [LX, Y + L + 0.02, LZ], 4.6, 0.02, SH.edge, 0.5);
    // the blades close across the glass and open again
    if (blink > 0) {
      // the iris: a ring of blades closing in, their seams cut as lines
      const rr = 4.6 * (1 - blink);
      p.ringV("y", [LX, Y + L + 0.04, LZ], 4.6, 0.14, 0);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + blink;
        p.line([[LX + Math.cos(a) * rr, Y + L + 0.06, LZ + Math.sin(a) * rr], [LX + Math.cos(a + 1.2) * 4.6, Y + L + 0.06, LZ + Math.sin(a + 1.2) * 4.6]], SH.edge, 0.45);
      }
      if (rr > 0.3) p.ringV("y", [LX, Y + L + 0.08, LZ], rr, 0.02, 0);
    }
    // a glint on the glass
    const g: V3 = [LX - 1.6, Y + L + 0.08, LZ + 1.6];
    p.dot(g, 0.9, 1);
    p.dot([LX - 0.4, Y + L + 0.08, LZ + 2.4], 0.45, 0.9);
    // the burst: a white star blooms out of the flash window, ringed by a dark halo so it reads
    // against the lit body, then fades
    if (flash > 0.05) {
      const cx = 8.2, cz = Z1 + 1.7, y = Y + 0.4;
      const star = (R: number, r0: number): V3[] => Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? r0 : i % 4 ? R * 0.62 : R;
        return [cx + Math.cos(a) * rr, y, cz + Math.sin(a) * rr] as V3;
      });
      const R = 3 + 6 * flash;
      p.clear(star(R + 1.3, 1.6 + 1.6 * flash + 1));
      p.face(star(R, 1.2 + 1.6 * flash), 1, 0);
    }
  },
};
