// No exchanges yet: two coins of different currencies circling each other over a round pad, two arrows chasing round beneath them.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const PER = 3.6, OR = 10.5, CR = 7.6; // seconds per loop, orbit radius, coin radius

// a coin facing the viewer. bright: a lit coin with a dark mark; else a dark coin with a bright mark
function coin(p: Pen, at: V3, r: number, bright: boolean, mark: "s" | "e") {
  const [x, y] = p.pt(at);
  p.screen((g) => {
    // its thickness, then its face
    g.beginPath(); g.arc(x + r * 0.16, y + r * 0.1, r, 0, Math.PI * 2); g.fillStyle = "rgb(60,60,60)"; g.fill();
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = bright ? "#fff" : "rgb(26,26,26)"; g.fill();
    g.strokeStyle = bright ? "#000" : "#fff"; g.lineCap = "round"; g.lineJoin = "round";
    if (!bright) { g.lineWidth = 0.6; g.stroke(); }
    g.lineWidth = 0.5; g.beginPath(); g.arc(x, y, r * 0.78, 0, Math.PI * 2); g.stroke();
    g.lineWidth = r * 0.14;
    const s = r * 0.42;
    g.beginPath();
    if (mark === "s") {
      // an S with a bar through it
      g.arc(x, y - s * 0.5, s * 0.5, -0.3, Math.PI * 0.5, true);
      g.arc(x, y + s * 0.5, s * 0.5, -Math.PI * 0.5, Math.PI - 0.3, false);
      g.moveTo(x, y - s * 1.35); g.lineTo(x, y + s * 1.35);
    } else {
      // a C with two bars across it
      g.arc(x + s * 0.15, y, s * 0.9, 0.85, Math.PI * 2 - 0.85, false);
      g.moveTo(x - s * 1.1, y - s * 0.28); g.lineTo(x + s * 0.2, y - s * 0.28);
      g.moveTo(x - s * 1.1, y + s * 0.28); g.lineTo(x + s * 0.2, y + s * 0.28);
    }
    g.stroke();
  });
}

export const exchange: Illustration = {
  k: "exchange", name: "Currency exchange", title: "No exchanges yet", body: "Convert between currencies and each exchange will be listed here.",
  kind: "loop", period: PER, cols: 92, rows: 80, zoom: 1.42,
  draw(p, t) {
    const u = (t / PER) % 1, th = u * Math.PI * 2;
    p.translate(0, 0, -11);
    p.shadow(0, 0, 28, 14, 0.1);
    // the pad
    p.cylinder(0, 0, 0, 16, 1.8, { side: 0.12, top: 0.17 });
    // two arrows on the pad, turning with the coins
    for (const o of [0, Math.PI]) {
      const arc: V3[] = Array.from({ length: 15 }, (_, i) => { const a = th + o + 0.5 + (i / 14) * 2; return [Math.cos(a) * 11.5, Math.sin(a) * 11.5, 1.83] as V3; });
      p.line(arc, SH.edge, 0.8);
      const a = th + o + 2.5, tip: V3 = [Math.cos(a) * 11.5, Math.sin(a) * 11.5, 1.83];
      const back = (r: number): V3 => [Math.cos(a - 0.28) * r, Math.sin(a - 0.28) * r, 1.83];
      p.face([back(9.4), tip, back(13.6)], 1, SH.edge, 0.5);
    }
    // the coins, the far one first
    const coins = [0, 1].map((i) => {
      const a = th + i * Math.PI;
      return { i, x: Math.cos(a) * OR, y: Math.sin(a) * OR, z: 13 + Math.sin(th * 2 + i * Math.PI) * 0.8 };
    }).sort((a, b) => a.x + a.y - (b.x + b.y));
    for (const c of coins) {
      const near = (c.x + c.y) / (OR * Math.SQRT2); // -1 far, 1 near
      p.guide([[c.x, c.y, 1.8], [c.x, c.y, c.z - CR]]);
      coin(p, [c.x, c.y, c.z], CR * (1 + 0.1 * near), c.i === 0, c.i === 0 ? "s" : "e");
    }
  },
};
