// No one on the channel: a walkie talkie with a stubby antenna, a small screen and a speaker grille. Hover and the antenna extends, the screen lights and signal arcs pulse from its tip.
import { SH, type Illustration } from "../dots";

const X = 6.8, Y = 3.6, H = 22; // half width, half depth, height of the body
const seg = (h: number, a: number, b: number) => Math.max(0, Math.min(1, (h - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

export const walkie: Illustration = {
  k: "walkie", name: "Walkie talkie", title: "No one on the channel", body: "This channel is quiet. Invite someone to join and their voice will come through here.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -19);
    p.scale(1.12);
    p.shadow(0, 0, 20, 10, 0.12);
    p.rotate("z", -0.5);
    const k = ease(seg(h, 0, 0.55));
    // the push to talk button on the far side, then the body
    p.box(X, -1.8, 10.5, 1, 3.6, 6.5, { top: 0.26, left: 0.16, right: 0.1 });
    p.box(-X, -Y, 0, X * 2, Y * 2, H, { top: 0.26, left: 0.2, right: 0.065 });
    const y = Y + 0.03;
    // the screen: dark at rest, lit on hover with a level bar cut in it
    const scr: [number, number, number][] = [[-4.6, y, 14], [4.6, y, 14], [4.6, y, 19.2], [-4.6, y, 19.2]];
    if (k < 0.5) { p.clear(scr); p.line([...scr, scr[0]], SH.edge, 0.5); }
    else {
      p.face(scr, 0.4, SH.edge, 0.55);
      for (let i = 0; i < 4; i++) p.line([[-3 + i * 1.9, y + 0.03, 15.4], [-3 + i * 1.9, y + 0.03, 16.2 + i * 0.6]], SH.edge, 0.7);
    }
    // the speaker grille: four slots
    for (let i = 0; i < 4; i++) p.line([[-4.2, y, 3.2 + i * 2.5], [4.2, y, 3.2 + i * 2.5]], SH.edge, 0.85);
    // on top: the channel knob and the antenna, which pulls out
    p.cylinder(3.5, 0, H, 1.9, 2.6, { side: 0.14, top: 0.3 });
    const ext = 7 * k, AZ = H + 9;
    if (ext > 0.2) p.cylinder(-3.4, 0, AZ, 0.95, ext, { side: 0.3, top: 0.3 });
    p.cylinder(-3.4, 0, H, 1.7, 9, { side: 0.16, top: 0.26 });
    const tip = p.pt([-3.4, 0, AZ + ext + 1.2]);
    p.dot([-3.4, 0, AZ + ext + 0.9], 1.5, h > 0.3 ? 1 : 0.5);
    // signal arcs either side of the tip, pulsing outward
    const a = seg(h, 0.45, 1);
    if (a > 0) p.screen((g) => {
      g.lineWidth = 1.1; g.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        const v = Math.round(255 * a * (0.55 + 0.45 * Math.sin(t * 5 - i * 1.3)));
        g.strokeStyle = `rgb(${v},${v},${v})`;
        const r = 4.2 + i * 3.4;
        g.beginPath(); g.arc(tip[0], tip[1], r, -0.75, 0.75); g.stroke();
        g.beginPath(); g.arc(tip[0], tip[1], r, Math.PI - 0.75, Math.PI + 0.75); g.stroke();
      }
    });
  },
};
