// Nothing scanned yet: a flatbed scanner with its lid up. The light bar sweeps under the glass and the lamp blinks.
import { easeInOut, SH, type Illustration } from "../dots";

const PERIOD = 3.2;
const X = 14, Y = 10, H = 6; // half width, half depth, body height

export const scanner: Illustration = {
  k: "scanner", name: "Scanner", title: "Nothing scanned yet", body: "Scan a document or a receipt and it will appear here, ready to use.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    // the bar: a slow pass forward, a quick return, a pause
    const pass = u < 0.62 ? easeInOut(u / 0.62) : u < 0.86 ? 1 - easeInOut((u - 0.62) / 0.24) : 0;
    const scanning = u < 0.62;
    p.translate(0, 3, -6);
    p.shadow(0, -1, 32, 15, 0.12);

    // the lid, hinged on the back edge and standing open: we see its padded underside
    p.push(); p.rotate("x", 1.72, [0, -Y, H]);
    const L = H - 1.4; // the lid's outer face, under its pad when closed
    p.face([[X, -Y, L], [X, Y, L], [X, Y, H], [X, -Y, H]], SH.right, SH.edge, 0.55);
    p.face([[-X, Y, L], [X, Y, L], [X, Y, H], [-X, Y, H]], 0.2, SH.edge, 0.55);
    p.face([[-X, -Y, H], [X, -Y, H], [X, Y, H], [-X, Y, H]], p.ink ? 0.13 : 0.065, SH.edge, 0.55);
    p.face([[-X + 1.6, -Y + 1.6, H + 0.03], [X - 1.6, -Y + 1.6, H + 0.03], [X - 1.6, Y - 1.6, H + 0.03], [-X + 1.6, Y - 1.6, H + 0.03]], 0.2, SH.edge, 0.5);
    p.pop();
    // hinges
    p.box(-10, -Y - 1.2, H - 1, 3.5, 1.4, 2.4, { top: 0.2 });
    p.box(6.5, -Y - 1.2, H - 1, 3.5, 1.4, 2.4, { top: 0.2 });

    // the body: a lit frame round the glass
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.22, left: 0.13, right: 0.065 });
    const Z = H + 0.03, gx0 = -X + 2, gx1 = X - 2, gy0 = -Y + 2, gy1 = Y - 3;
    p.face([[gx0, gy0, Z], [gx1, gy0, Z], [gx1, gy1, Z], [gx0, gy1, Z]], p.ink ? 0.12 : 0.03, SH.edge, 0.55);
    // a sheet on the glass, face down, its lines showing through
    p.face([[gx0 + 1.2, gy0 + 1.2, Z + 0.03], [-1, gy0 + 1.2, Z + 0.03], [-1, gy1 - 3, Z + 0.03], [gx0 + 1.2, gy1 - 3, Z + 0.03]], 0.22, SH.edge, 0.5);
    for (let i = 0; i < 3; i++) p.line([[gx0 + 3, gy0 + 3.6 + i * 2.6, Z + 0.06], [i === 2 ? -6 : -3, gy0 + 3.6 + i * 2.6, Z + 0.06]], SH.edge, 0.6);
    // the light bar, sweeping front to back across the glass, with a soft wash behind it
    const by = gy0 + 0.4 + (gy1 - gy0 - 3.4) * pass;
    if (scanning && pass > 0.02 && p.ink) {
      const w0 = Math.max(gy0 + 0.2, by - 4);
      p.face([[gx0 + 0.2, w0, Z + 0.08], [gx1 - 0.2, w0, Z + 0.08], [gx1 - 0.2, by, Z + 0.08], [gx0 + 0.2, by, Z + 0.08]], p.ink ? 0.16 : 0.1, 0);
    }
    p.face([[gx0 + 0.2, by, Z + 0.1], [gx1 - 0.2, by, Z + 0.1], [gx1 - 0.2, by + 3, Z + 0.1], [gx0 + 0.2, by + 3, Z + 0.1]], scanning ? 0.4 : 0.3, SH.edge, 0.55);
    if (scanning) p.guide([[gx0, by + 1, Z + 0.12], [gx0, by + 1, Z + 9], [gx1, by + 1, Z + 9], [gx1, by + 1, Z + 0.12]], true);

    // the front: a slot, a start button and a lamp that blinks while it scans
    p.face([[-11, Y + 0.03, 2], [-3, Y + 0.03, 2], [-3, Y + 0.03, 3.2], [-11, Y + 0.03, 3.2]], 0.02, SH.edge, 0.5);
    p.box(6, Y, 1.6, 3.2, 0.9, 2.4, { top: 0.3, left: 0.2, right: 0.1 });
    const blink = scanning && Math.sin(t * 12) > 0;
    p.dot([11.4, Y + 0.2, 2.8], 0.85, blink ? 1 : 0.3);
  },
};
