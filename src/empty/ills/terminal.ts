// No logs yet: a terminal window standing on its edge, a prompt and a cursor block blinking, waiting for output.
import { SH, type Illustration, type V3 } from "../dots";

const PERIOD = 2.4;
const X0 = -15, X1 = 15, Z0 = 0, Z1 = 25, DY = 2.4; // the window, its front facing +y

export const terminal: Illustration = {
  k: "terminal", name: "Terminal", title: "No logs yet", body: "Logs will stream in here as soon as your app starts running.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t % PERIOD) / PERIOD;
    p.translate(0, 0, -13);
    p.shadow(0, 0, 25, 11, 0.12);
    p.rotate("z", -0.5);
    // the window: a thick panel, with feet so it stands
    p.box(-11, -3.5, 0, 4, 7, 1.4, { top: 0.2 }); p.box(7, -3.5, 0, 4, 7, 1.4, { top: 0.2 });
    p.translate(0, 0, 1.4);
    p.box(X0, -DY, Z0, X1 - X0, DY, Z1 - Z0, { top: 0.22, left: 0.12, right: 0.065 });
    const f = 0.03;
    const q = (x0: number, z0: number, x1: number, z1: number, fill: number) => {
      const pts: V3[] = [[x0, f, z0], [x1, f, z0], [x1, f, z1], [x0, f, z1]];
      if (fill > 0) p.face(pts, fill, 0); else p.clear(pts);
    };
    // the title bar: lit, with three buttons and a title cut out of it
    q(X0 + 1, Z1 - 4.6, X1 - 1, Z1 - 1, 0.3);
    for (let i = 0; i < 3; i++) p.dot([X0 + 3 + i * 2.6, f + 0.02, Z1 - 2.8], 0.85, 0);
    p.line([[-3.5, f + 0.02, Z1 - 2.8], [3.5, f + 0.02, Z1 - 2.8]], SH.edge, 0.7);
    // the console: dark glass
    q(X0 + 1, Z0 + 1, X1 - 1, Z1 - 5.6, 0);
    // the prompt: a lit chevron, then the cursor block blinking after it
    const zc = Z1 - 9.2;
    const a = p.pt([X0 + 3, f + 0.02, zc + 1.4]), b = p.pt([X0 + 4.8, f + 0.02, zc]), c = p.pt([X0 + 3, f + 0.02, zc - 1.4]);
    p.screen((cx) => {
      cx.strokeStyle = "rgb(255,255,255)"; cx.lineWidth = 1; cx.lineCap = "round"; cx.lineJoin = "round";
      cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.lineTo(c[0], c[1]); cx.stroke();
    });
    // a short lit path, as if the shell named the folder it is in
    q(X0 + 6.2, zc - 0.6, X0 + 11, zc + 0.6, 0.3);
    const on = u < 0.5;
    if (on) q(X0 + 12.4, zc - 1.6, X0 + 14.4, zc + 1.6, 0.4);
  },
};
