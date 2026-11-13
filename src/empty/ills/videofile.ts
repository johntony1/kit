// No videos yet: a video file standing up, a big play button on its face. Hover and it rises, the play mark pulses and the progress bar runs along its foot.
import { SH, type Illustration } from "../dots";

const W = 12, H = 30, T = 0.6, F = 6; // half width, height, half thickness, folded corner
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

export const videofile: Illustration = {
  k: "videofile", name: "Video file", title: "No videos yet", body: "Upload or record a video and it will be ready to watch here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    const lift = 2.5 * ease(h / 0.5) + h * Math.sin(t * 2.2) * 0.4;
    p.translate(0, 0, -15);
    p.shadow(0, 2, 25 - lift, 10, 0.12);
    p.rotate("z", -0.42);
    p.translate(0, 0, lift);
    // the sheet: its right edge, its top edge, the face, then the folded corner
    p.face([[W, -T, 0], [W, T, 0], [W, T, H - F], [W, -T, H - F]], SH.right, SH.edge, 0.5);
    p.face([[-W, -T, H], [W - F, -T, H], [W - F, T, H], [-W, T, H]], SH.top, SH.edge, 0.5);
    p.face([[-W, T, 0], [W, T, 0], [W, T, H - F], [W - F, T, H], [-W, T, H]], 0.22, SH.edge, 0.55);
    p.face([[W - F, T + 0.03, H], [W, T + 0.03, H - F], [W - F, T + 0.03, H - F]], 0.4, SH.edge, 0.5);
    const y = T + 0.04;
    // the player: a framed picture with a big play mark cut into it
    p.line([[-9, y, 7], [9, y, 7], [9, y, 21], [-9, y, 21], [-9, y, 7]], SH.edge, 1.1);
    const g = ease((h - 0.15) / 0.4), s = 1 + 0.22 * Math.sin(g * Math.PI) * (1 - g) + 0.12 * g, zc = 14;
    p.clear([[-2.6 * s, y + 0.02, zc + 4.2 * s], [4.6 * s, y + 0.02, zc], [-2.6 * s, y + 0.02, zc - 4.2 * s]]);
    // the progress bar: a thin track, the played part a bold bar with a knob, running on hover
    p.line([[-9, y, 3.4], [9, y, 3.4]], SH.edge, 0.6);
    const k = -9 + 18 * Math.max(0.15, ease((h - 0.3) / 0.7));
    p.line([[-9, y + 0.02, 3.4], [k, y + 0.02, 3.4]], SH.edge, 1.6);
    p.dot([k, y + 0.04, 3.4], 1.5, 0);
  },
};
