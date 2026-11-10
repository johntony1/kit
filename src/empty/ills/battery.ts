// Nothing charging: a battery lying on its side, plugged in. Pulses run up the cable and the cells fill in turn, blink full, then empty.
import { SH, type Illustration, type V3 } from "../dots";

const X0 = -15, X1 = 11, Y = 6, H = 9; // body from X0 to X1, half depth, height
const CELLS = 4;

export const battery: Illustration = {
  k: "battery", name: "Battery", title: "Nothing charging", body: "Plug in a device and its charge will show up here.",
  kind: "loop", period: 4.4, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % 4.4) / 4.4;
    p.translate(-3.6, 2.2, -4);
    p.scale(1.12, [0, 0, 4]);
    p.shadow(0, 0, 27, 12, 0.12);

    // the cable: from the terminal, along the floor and round to a plug, behind the body's far side
    const cable: V3[] = [];
    for (let i = 0; i <= 24; i++) {
      const v = i / 24;
      // out of the terminal, down to the floor, then curling round toward the back
      const x = X1 + 2.6 + Math.sin(v * Math.PI * 0.85) * 5;
      const y = -v * 10 + Math.sin(v * Math.PI) * 1.5;
      const z = Math.max(0.5, 4.5 - v * 16);
      cable.push([x, y, z]);
    }
    // drawn on screen: a lit cord with a dark edge, so it reads on the floor and over the body alike
    p.screen((c) => {
      const q = cable.map((v) => p.pt(v));
      c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.strokeStyle = "#000"; c.lineWidth = 2.6; c.stroke(); c.strokeStyle = "#cfcfcf"; c.lineWidth = 1.4; c.stroke();
    });
    // the plug at the far end, lying on the floor
    const e = cable[cable.length - 1];
    p.box(e[0] - 1.8, e[1] - 4.2, 0, 3.6, 4.2, 2.8, { top: 0.24, left: 0.14, right: 0.07 });
    p.box(e[0] - 1.1, e[1] - 6, 0.7, 0.6, 1.8, 0.6, { top: 0.3, left: 0.2, right: 0.1 });
    p.box(e[0] + 0.5, e[1] - 6, 0.7, 0.6, 1.8, 0.6, { top: 0.3, left: 0.2, right: 0.1 });

    // charge pulses running along the cable toward the battery
    const charging = u < 0.62;
    if (charging) for (let i = 0; i < 3; i++) {
      const v = 1 - ((u * 6 + i / 3) % 1);
      const q = cable[Math.round(v * (cable.length - 1))];
      p.dot([q[0], q[1], q[2] + 0.6], 0.95, 1);
    }

    // the body: a lit top, a dense front and a sparse end
    p.box(X0, -Y, 0, X1 - X0, Y * 2, H, { top: 0.22, left: 0.13, right: 0.07 });
    // the terminal on the end
    p.box(X1, -2.6, 2.4, 2.6, 5.2, 4.2, { top: 0.24, left: 0.14, right: 0.08 });
    // a band near the negative end
    p.line([[X0 + 3, Y + 0.03, 0.2], [X0 + 3, Y + 0.03, H - 0.2], [X0 + 3, -Y + 0.2, H + 0.03]], SH.edge, 0.7);

    // the window on the top: one cell per quarter, filling in turn
    const fill = u < 0.62 ? u / 0.62 : 1;
    const blink = u > 0.66 && u < 0.86 ? (Math.sin(((u - 0.66) / 0.2) * Math.PI * 4) > 0 ? 1 : 0.45) : 1;
    const gone = u > 0.9; // the cells empty at the end of the loop, so it starts again clean
    const z = H + 0.03, wx0 = X0 + 4.6, wx1 = X1 - 1.6, wy = Y - 1.6, gap = 1;
    const cw = (wx1 - wx0 - gap * (CELLS - 1)) / CELLS;
    // the dark recess the cells sit in
    p.face([[wx0 - 0.8, -wy - 0.8, z], [wx1 + 0.8, -wy - 0.8, z], [wx1 + 0.8, wy + 0.8, z], [wx0 - 0.8, wy + 0.8, z]], 0.03, SH.edge, 0.6);
    for (let i = 0; i < CELLS; i++) {
      const a = wx0 + i * (cw + gap), b = a + cw;
      const k = gone ? 0 : Math.min(1, Math.max(0, fill * CELLS - i));
      // an empty cell stays a faint outline; a filling one grows from its back edge
      p.face([[a, -wy, z + 0.01], [b, -wy, z + 0.01], [b, wy, z + 0.01], [a, wy, z + 0.01]], 0.06, 0, 0.5);
      if (k > 0) {
        const lit = k >= 1 ? blink : 1;
        p.face([[a, -wy, z + 0.02], [a + cw * k, -wy, z + 0.02], [a + cw * k, wy, z + 0.02], [a, wy, z + 0.02]], 0.3 * lit, 0, 0.5);
      }
    }

    // a lightning bolt on the front, lit while charging
    const by = Y + 0.04, bx = -2, bz = 1.1;
    const bolt: V3[] = [[bx + 1.6, by, bz + 7], [bx - 3, by, bz + 3], [bx - 0.1, by, bz + 3], [bx - 1.6, by, bz], [bx + 3, by, bz + 4.2], [bx + 0.1, by, bz + 4.2]];
    // a dark plate round the bolt, so the bolt reads lit against it
    p.face([[bx - 4.6, by - 0.01, 0.6], [bx + 4.6, by - 0.01, 0.6], [bx + 4.6, by - 0.01, H - 0.6], [bx - 4.6, by - 0.01, H - 0.6]], 0.03, SH.edge, 0.6);
    p.face(bolt, charging ? 0.4 : 0.14, 0, 0.6);
    // a plus and a minus stamped on the front
    p.line([[X1 - 3.4, by + 0.02, 4.5], [X1 - 1.4, by + 0.02, 4.5]], SH.edge, 0.7);
    p.line([[X1 - 2.4, by + 0.02, 3.5], [X1 - 2.4, by + 0.02, 5.5]], SH.edge, 0.7);
    p.line([[X0 + 4.8, by + 0.02, 4.5], [X0 + 6.8, by + 0.02, 4.5]], SH.edge, 0.7);
  },
};
