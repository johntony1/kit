// No ideas yet: a light bulb on a little base. Hover and it lights: the glass fills with light, the filament glows and rays shine out.
import { SH, type Illustration, type Pen, type V3 } from "../dots";

const ZG = 22, RG = 9.5; // centre and radius of the glass globe
const ZN = 9.5; // where the glass neck meets the screw base
const S2 = Math.SQRT1_2;
const arc = (r: number, z: number, a0: number, a1: number, n = 24): V3[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [Math.cos(a) * r, Math.sin(a) * r, z]; });
const front = (r: number, z: number) => arc(r, z, -Math.PI / 4, (Math.PI * 3) / 4);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** the glass: a sphere melting into a neck, drawn as quads back to front in the three face tones, brightening with k */
function glass(p: Pen, k: number) {
  // profile: radius at height, from the neck up over the top
  const prof = (v: number): [number, number] => {
    // v in [0,1]: 0 at the neck, 1 at the crown
    const a = -Math.PI / 2 + 0.55 + v * (Math.PI - 0.55);
    const r = Math.cos(a) * RG, z = ZG + Math.sin(a) * RG;
    const n0 = Math.max(0, 1 - v / 0.22); // the neck pulls the bottom in
    return [mix(r, 4.4, n0 * n0), mix(z, ZN + v * 18, n0 * n0)];
  };
  const NU = 30, NV = 18, quads: { d: number; pts: V3[]; f: number }[] = [];
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
    const u0 = (i / NU) * Math.PI * 2, u1 = ((i + 1) / NU) * Math.PI * 2, um = (u0 + u1) / 2;
    const [r0, z0] = prof(j / NV), [r1, z1] = prof((j + 1) / NV), [rm, zm] = prof((j + 0.5) / NV);
    // the normal from the profile's slope
    const dr = r1 - r0, dz = z1 - z0, L = Math.hypot(dr, dz) || 1;
    const nh = dz / L, nz = -dr / L;
    const n: V3 = [Math.cos(um) * nh, Math.sin(um) * nh, nz];
    if (n[0] + n[1] + n[2] < -0.05) continue;
    const m: V3 = [Math.cos(um) * rm, Math.sin(um) * rm, zm];
    const pts = ([[r0, z0, u0], [r0, z0, u1], [r1, z1, u1], [r1, z1, u0]] as const).map(([r, z, u]) => {
      const q: V3 = [Math.cos(u) * r, Math.sin(u) * r, z];
      return q.map((x, c) => m[c] + (x - m[c]) * 1.12) as V3;
    });
    // unlit: three tones, with a bright highlight spot; lit: nearly solid everywhere
    const spot = n[0] * -0.1 + n[1] * 0.45 + n[2] * 0.88 > 0.93;
    const base = spot ? 0.3 : n[2] > 0.55 ? SH.top : n[1] >= n[0] ? SH.left : SH.right;
    quads.push({ d: m[0] + m[1] + m[2], pts, f: mix(base, spot ? 0.4 : 0.3, k) });
  }
  quads.sort((a, b) => a.d - b.d).forEach((q) => p.face(q.pts, q.f, 0));
}

export const bulb: Illustration = {
  k: "bulb", name: "Light bulb", title: "No ideas yet", body: "Jot down your first idea. Every bright one starts somewhere.",
  kind: "hover", cols: 92, rows: 80, zoom: 1.42,
  draw(p, t, h) {
    p.translate(0, 0, -16);
    // the glow builds with a little flicker as it catches
    const flick = h > 0 && h < 1 ? 0.85 + 0.15 * Math.sin(t * 40) : 1;
    const k = Math.min(1, h * 1.15) * flick;
    p.shadow(0, 0, 16, 8, 0.12);
    // a soft halo behind the glass once it is lit
    if (k > 0.05) {
      const [cx, cy] = p.pt([0, 0, ZG]);
      p.screen((c) => {
        const g = c.createRadialGradient(cx, cy, RG * 0.9, cx, cy, RG * 2.1);
        g.addColorStop(0, `rgba(255,255,255,${0.32 * k})`); g.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = g; c.beginPath(); c.arc(cx, cy, RG * 2.1, 0, Math.PI * 2); c.fill();
      });
    }
    // the base: a square plinth, then the screw cap with its threads cut in
    p.box(-6.5, -6.5, 0, 13, 13, 3.2);
    p.line([[-6.5, 6.55, 1.6], [6.5, 6.55, 1.6]], SH.edge, 0.55);
    p.cylinder(0, 0, 3.2, 4.6, 2, { side: SH.left, top: SH.top });
    p.cylinder(0, 0, 5.2, 4.2, ZN - 5.2 + 0.6, { side: 0.17, top: SH.top });
    for (const z of [6.4, 7.8, 9.2]) p.line(front(4.25, z), SH.edge, 0.7);
    // the glass
    glass(p, k);
    // the filament inside: two wires up from the neck to a zigzag, cut out of the glass. Lit: it burns bright in a dark gap
    const wires: V3[][] = [
      [[-1.6 * S2, 1.6 * S2, ZN + 1.5], [-2.4 * S2, 2.4 * S2, ZG - 1]],
      [[1.6 * S2, -1.6 * S2, ZN + 1.5], [2.4 * S2, -2.4 * S2, ZG - 1]],
    ];
    const zig: V3[] = Array.from({ length: 7 }, (_, i) => { const x = -2.4 + (4.8 * i) / 6; return [x * S2, -x * S2, ZG - 1 + (i % 2 ? 2 : 0)] as V3; });
    for (const w of wires) p.line(w, SH.edge, 0.65);
    p.line(zig.slice().reverse(), SH.edge, 0.65);
    if (k > 0.3) {
      // the hot coil: a bright stroke inside the cut, so it reads as a glowing wire
      p.screen((c) => {
        const q = zig.map((v) => p.pt(v));
        c.strokeStyle = `rgba(255,255,255,${Math.min(1, (k - 0.3) * 1.6)})`; c.lineWidth = 0.5; c.lineJoin = "round";
        c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
      });
    }
    // the neck ring where glass meets metal
    p.line(front(4.4, ZN + 0.6), SH.edge, 0.7);
    // rays: short bright dashes all round, pulsing outwards
    if (k > 0.2) {
      const [cx, cy] = p.pt([0, 0, ZG]);
      p.screen((c) => {
        c.lineCap = "round";
        for (let i = 0; i < 9; i++) {
          const a = -Math.PI / 2 + ((i - 4) / 4) * Math.PI * 0.62;
          const pu = (t * 0.9 + i * 0.13) % 1;
          const r0 = RG + 2.6 + pu * 1.4, r1 = r0 + 3.2 * (1 - pu * 0.4);
          const n = Math.round(255 * Math.min(1, (k - 0.2) * 1.5) * (1 - pu * 0.5));
          c.strokeStyle = `rgb(${n},${n},${n})`; c.lineWidth = 1.2;
          c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.stroke();
        }
      });
    }
  },
};
