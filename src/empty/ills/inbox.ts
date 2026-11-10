// Inbox zero: an empty letter tray. Hover and a sheet of paper glides down into it and settles with a little bounce.
import { SH, type Illustration, type V3 } from "../dots";

const X = 12, Y = 9, H = 5.5, T = 1.5; // half length, half depth, wall height, wall thickness

export const inbox: Illustration = {
  k: "inbox", name: "Inbox tray", title: "Inbox zero", body: "You have read everything. New messages will land here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -9);
    p.scale(1.12, [0, 0, 3]);
    p.shadow(0, 0, 27, 13, 0.12);
    const x0 = -X + T, x1 = X - T, y0 = -Y + T, y1 = Y - T;
    // the inside: the floor and the two far walls, seen over the near walls
    p.face([[x0, y0, 0.8], [x1, y0, 0.8], [x1, y1, 0.8], [x0, y1, 0.8]], 0.04, 0);
    p.face([[x0, y0, 0.8], [x1, y0, 0.8], [x1, y0, H], [x0, y0, H]], 0.12, 0); // far wall facing +y
    p.face([[x0, y0, 0.8], [x0, y1, 0.8], [x0, y1, H], [x0, y0, H]], 0.065, 0); // far wall facing +x
    p.line([[x0, y1, 0.8], [x0, y0, 0.8], [x1, y0, 0.8]], SH.edge, 0.6);

    // the sheet: comes down from above and behind, tilted, then lands flat on the floor.
    // while it is still above the rim it is drawn last, in front of everything; once low, inside the tray
    const e = Math.min(1, h * 1.12), fall = 1 - e;
    const sheet = () => {
      // a small bounce as it lands
      const bounce = e > 0.85 ? Math.sin(((e - 0.85) / 0.15) * Math.PI) * 0.9 : 0;
      p.push();
      p.translate(-fall * 1.5, -fall * 7, 0.85 + fall * 8.5 + bounce);
      p.rotate("x", fall * 0.45, [0, 0, 0]);
      p.rotate("z", fall * 0.35, [0, 0, 0]);
      p.scale(0.45 + 0.55 * e); // it grows as it comes in, so it never leaves the frame
      const sx = 7.6, sy = 5.6;
      p.face([[-sx, -sy, 0], [sx, -sy, 0], [sx, sy, 0], [-sx, sy, 0]], 0.3, SH.edge, 0.55);
      // a folded corner and lines of text, cut out of the lit page
      p.line([[sx - 2.6, -sy, 0.02], [sx - 2.6, -sy + 2.6, 0.02], [sx, -sy + 2.6, 0.02]], SH.edge, 0.55);
      for (let i = 0; i < 4; i++) {
        const y = -sy + 1.8 + i * 2.4;
        p.line([[-sx + 1.6, y, 0.03], [sx - (i === 0 ? 4 : 1.6 + (i % 2) * 3.2), y, 0.03]], SH.edge, 0.6);
      }
      p.pop();
    };
    const high = fall * 8.5 > H - 1;
    if (h > 0.01 && !high) sheet();

    // the rim on top of the walls: lit strips all round
    const z = H;
    p.face([[-X, -Y, z], [X, -Y, z], [X, y0, z], [-X, y0, z]], 0.24, 0);
    p.face([[-X, -Y, z], [x0, -Y, z], [x0, Y, z], [-X, Y, z]], 0.24, 0);
    p.face([[x1, -Y, z], [X, -Y, z], [X, Y, z], [x1, Y, z]], 0.24, 0);
    p.face([[-X, y1, z], [-3.6, y1, z], [-3.6, Y, z], [-X, Y, z]], 0.24, 0);
    p.face([[3.6, y1, z], [X, y1, z], [X, Y, z], [3.6, Y, z]], 0.24, 0);
    p.line([[-3.6, y1, z + 0.02], [x0, y1, z + 0.02], [x0, y0, z + 0.02], [x1, y0, z + 0.02], [x1, y1, z + 0.02], [3.6, y1, z + 0.02]], SH.edge, 0.55);
    // the near walls, with a scoop cut in the front so a hand can reach in
    const sc: V3[] = Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * Math.PI; return [Math.cos(a) * 3.6, Y, H - Math.sin(a) * 2.6] as V3; });
    p.face([[-X, Y, 0], [X, Y, 0], [X, Y, H], ...sc, [-X, Y, H]], 0.13, 0);
    p.face([[X, -Y, 0], [X, Y, 0], [X, Y, H], [X, -Y, H]], 0.065, 0);
    // the cut edge of the scoop: the wall's thickness, lit, curving down
    const sc2 = sc.map(([x, , zz]) => [x, y1, zz] as V3);
    p.face([...sc, ...sc2.reverse()], 0.24, 0);
    p.line(sc, SH.edge, 0.6);
    // a label holder on the front, a lit card with a line of text
    p.face([[-X + 2, Y + 0.03, 1.2], [-X + 7.6, Y + 0.03, 1.2], [-X + 7.6, Y + 0.03, 3.6], [-X + 2, Y + 0.03, 3.6]], 0.32, SH.edge, 0.85);
    p.line([[-X + 3.2, Y + 0.06, 2.4], [-X + 6.4, Y + 0.06, 2.4]], SH.edge, 0.6);
    // the foot strip
    p.line([[-X, Y + 0.03, 0.9], [X, Y + 0.03, 0.9], [X + 0.03, -Y, 0.9]], SH.edge, 0.55);

    if (h > 0.01 && high) sheet();

    // a couple of specks of air pushed out as the sheet lands
    const k = Math.max(0, (h - 0.82) / 0.18);
    if (k > 0 && k < 1) for (let i = 0; i < 4; i++) {
      const a = i * 1.7 + 0.4;
      p.dot([Math.cos(a) * (9 + k * 4), Math.sin(a) * (7 + k * 3), H + 1 + k * 2], 0.8 * Math.sin(k * Math.PI), 1);
    }
  },
};
