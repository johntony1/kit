// No figures yet: a calculator lying on the desk. Keys press one by one, the digits appear, then equals lights.
import { SH, type Illustration, type Pen } from "../dots";

const SEG: Record<string, string> = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg" };

/** a seven segment digit on the screen (lying flat): x across, y down the calculator */
function digit(p: Pen, ch: string, x: number, y: number, z: number) {
  const w = 1.6, l = 1.5, th = 0.42;
  const seg: Record<string, [number, number, number, number]> = {
    a: [x, y, x + w, y + th], g: [x, y + l, x + w, y + l + th], d: [x, y + 2 * l, x + w, y + 2 * l + th],
    f: [x, y, x + th, y + l + th], b: [x + w - th, y, x + w, y + l + th], e: [x, y + l, x + th, y + 2 * l + th], c: [x + w - th, y + l, x + w, y + 2 * l + th],
  };
  for (const s of SEG[ch] ?? "") {
    const [x0, y0, x1, y1] = seg[s];
    p.face([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], 0.34, 0);
  }
}

const COLS = 4, ROWS = 4, KX = -8.6, KY = -3.2, SX = 4.6, SY = 4.4, KW = 3.7, KD = 3.4;
// the keys pressed each loop: three digits, then equals (bottom right)
const SEQ = [[0, 1], [1, 1], [2, 0], [3, 3]];
const STEP = 0.75, PERIOD = SEQ.length * STEP + 1.6;

export const calculator: Illustration = {
  k: "calculator", name: "Calculator", title: "Nothing to calculate yet", body: "Add your income and expenses and the totals will be worked out here.",
  kind: "loop", period: PERIOD, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const tt = t % PERIOD;
    p.translate(1, 0, -6);
    p.shadow(0, 1, 34, 15, 0.12);
    // tilted toward us: the back end sits on a little foot
    p.box(-8, -14, 0, 16, 2, 2.6, { top: 0.2 });
    p.push(); p.rotate("x", -0.13, [0, 15, 0]);
    p.box(-10.5, -14.5, 0, 21, 30, 3.4, { top: 0.2, left: 0.13, right: 0.065 });
    const Z = 3.4;
    // the screen, set into the top
    p.face([[-8.6, -12.6, Z + 0.02], [8.6, -12.6, Z + 0.02], [8.6, -6.6, Z + 0.02], [-8.6, -6.6, Z + 0.02]], 0.03, SH.edge, 0.6);
    // which key is down right now, and how many have been pressed
    const n = Math.min(SEQ.length, Math.floor(tt / STEP + 0.6));
    const cur = Math.floor(tt / STEP), ph = (tt % STEP) / STEP;
    const down = cur < SEQ.length && ph > 0.25 && ph < 0.75 ? cur : -1;
    // the digits typed so far, right aligned, then the answer
    const typed = ["4", "2", "8"].slice(0, Math.min(3, n));
    const shown = n >= 4 ? ["5", "3", "6"] : typed.length ? typed : ["0"];
    shown.forEach((ch, i) => digit(p, ch, 6.2 - (shown.length - 1 - i) * 2.6, -11.6, Z + 0.05));
    // a solar strip beside the screen
    p.face([[-8.6, -14, Z + 0.02], [-2, -14, Z + 0.02], [-2, -13.1, Z + 0.02], [-8.6, -13.1, Z + 0.02]], 0.03, SH.edge, 0.45);
    // the keys, back rows first
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const i = SEQ.findIndex(([cc, rr]) => cc === c && rr === r);
      const isDown = i >= 0 && i === down;
      const x = KX + c * SX, y = KY + r * SY;
      const kh = isDown ? 0.35 : 1.3;
      const eq = c === 3 && r === 3;
      p.box(x, y, Z, KW, KD, kh, { top: isDown || (eq && n >= 4) ? 0.34 : c === 3 ? 0.13 : 0.26, left: 0.14, right: 0.07 });
      // operator marks on the right column
      const zt = Z + kh + 0.03, mx = x + KW / 2, my = y + KD / 2;
      if (c === 3) {
        if (r === 0) p.line([[mx - 0.9, my, zt], [mx + 0.9, my, zt]], SH.edge, 0.6);
        if (r === 1) { p.line([[mx - 0.9, my, zt], [mx + 0.9, my, zt]], SH.edge, 0.6); p.line([[mx, my - 0.9, zt], [mx, my + 0.9, zt]], SH.edge, 0.6); }
        if (r === 2) { p.line([[mx - 0.7, my - 0.7, zt], [mx + 0.7, my + 0.7, zt]], SH.edge, 0.6); p.line([[mx + 0.7, my - 0.7, zt], [mx - 0.7, my + 0.7, zt]], SH.edge, 0.6); }
        if (r === 3) { p.line([[mx - 0.9, my - 0.45, zt], [mx + 0.9, my - 0.45, zt]], SH.edge, 0.6); p.line([[mx - 0.9, my + 0.45, zt], [mx + 0.9, my + 0.45, zt]], SH.edge, 0.6); }
      }
    }
    p.pop();
    // a glint off the screen when the answer appears
    if (n >= 4) {
      const k = Math.min(1, (tt - SEQ.length * STEP + 0.45) / 0.3);
      const [gx, gy] = p.pt([9.5, -12, 9]);
      p.screen((c) => {
        c.fillStyle = `rgba(255,255,255,${Math.max(0, k) * (1 - Math.max(0, (tt - SEQ.length * STEP - 0.5) / 1.1))})`;
        const s = 2.6;
        c.beginPath(); c.moveTo(gx, gy - s); c.lineTo(gx + 0.5, gy - 0.5); c.lineTo(gx + s, gy); c.lineTo(gx + 0.5, gy + 0.5);
        c.lineTo(gx, gy + s); c.lineTo(gx - 0.5, gy + 0.5); c.lineTo(gx - s, gy); c.lineTo(gx - 0.5, gy - 0.5); c.closePath(); c.fill();
      });
    }
  },
};
