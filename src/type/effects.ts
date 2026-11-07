// effects.ts
// Eight type effects for type-core.ts. Each one is a shader that defines
// vec4 effect(vec2 uv), plus its settings and the look it was designed with.
// Free to use in anything.

import type { Effect } from "./type-core";

/** shared: read the ink three times, a little apart, for a colour split */
const SPLIT = `
vec3 inkSplit(vec2 uv, vec2 off, float k) {
  return vec3(ink(uv + off * (1.0 + k)), ink(uv + off), ink(uv + off * (1.0 - k)));
}
vec3 paint(vec3 i) { return vec3(mix(u_bg.r, u_fg.r, i.r), mix(u_bg.g, u_fg.g, i.g), mix(u_bg.b, u_fg.b, i.b)); }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
`;

/* 1. Bubble ring: a glass ring grows out of a point and bends the type at its rim */
export const bubble: Effect = {
  name: "Bubble ring",
  params: {
    strength: { value: 0.11, min: 0, max: 0.25, step: 0.005, label: "Strength" },
    width: { value: 0.07, min: 0.02, max: 0.25, step: 0.005, label: "Rim width" },
    every: { value: 3.2, min: 1.5, max: 8, step: 0.1, label: "Every" },
    split: { value: 0.35, min: 0, max: 1, step: 0.01, label: "Colour split" },
  },
  look: { text: "grow", weight: "500", tracking: -0.05, fit: 0.98, fg: "#0b0b0b", bg: "#eef0f3" },
  glsl: SPLIT + `
vec4 effect(vec2 uv) {
  float A = aspect();
  float start = floor(u_time / u_every) * u_every;
  vec2 c = vec2(0.5);
  if (u_fire.z > start) { start = u_fire.z; c = u_fire.xy; }
  float age = u_time - start;
  vec2 d = (uv - c) * vec2(A, 1.0);
  float dist = length(d);
  vec2 n = d / max(dist, 1e-4);
  float R = 1.25 * (1.0 - exp(-1.15 * age)) * max(A, 1.0);
  float x = (dist - R) / u_width;
  float fade = 1.0 - smoothstep(0.65, 1.0, age / u_every);
  // a thick ring lens: things just inside the rim are pulled out, just outside pushed in
  float bend = -x * exp(-x * x * 1.6) * u_strength * fade;
  vec2 off = n * bend / vec2(A, 1.0);
  vec3 col = paint(inkSplit(uv - off, -off * u_split, 1.0));
  // the film: a faint milky disc, brighter towards its edge, and a fine rim line
  float inside = smoothstep(0.004, -0.004, dist - R);
  float film = inside * (0.05 + 0.22 * smoothstep(R * 0.55, R, dist)) * fade;
  // the film only lightens the paper, never the letters
  col = mix(col, vec3(1.0), film * smoothstep(0.35, 0.8, dot(col, vec3(0.333))));
  float rim = exp(-pow((dist - R) / 0.0035, 2.0)) * fade;
  col = mix(col, vec3(0.55, 0.62, 0.75), rim * 0.5);
  return vec4(col, 1.0);
}`,
};

/* 2. Glass lens: a glass blob drifts over the type, magnifies it, splits its colours */
export const lens: Effect = {
  name: "Glass lens",
  params: {
    size: { value: 0.34, min: 0.15, max: 0.6, step: 0.01, label: "Size" },
    stretch: { value: 0.12, min: 0, max: 0.5, step: 0.01, label: "Capsule" },
    zoom: { value: 0.55, min: 0.2, max: 1.2, step: 0.01, label: "Zoom" },
    split: { value: 0.22, min: 0, max: 0.6, step: 0.01, label: "Colour split" },
    tint: { value: 0.28, min: 0, max: 0.8, step: 0.01, label: "Glass tint" },
  },
  look: { text: "Distort.\nReality.", weight: "800", tracking: -0.06, leading: 0.9, fit: 0.42, fg: "#ffffff", bg: "#000000" },
  glsl: SPLIT + `
vec4 effect(vec2 uv) {
  float A = aspect();
  vec2 p = (uv - 0.5) * vec2(A, 1.0);
  float t = u_time;
  vec2 path = vec2(0.17 * A * sin(t * 0.55), 0.08 * sin(t * 0.9 + 1.2));
  vec2 c = mix(path, (u_mouse - 0.5) * vec2(A, 1.0), u_hover);
  float ang = t * 0.45 + 0.6 * sin(t * 0.3);
  vec2 q = rot(ang) * (p - c);
  float rx = u_size * (1.0 + 0.12 * sin(t * 1.3)), ry = u_size * (0.82 + 0.1 * cos(t * 1.1));
  // capsule: stretch the middle along x
  float k = u_stretch * rx * 2.0;
  vec2 qq = vec2(sign(q.x) * max(abs(q.x) - k, 0.0), q.y) / vec2(rx, ry);
  float r = length(qq);
  vec3 col = paint(vec3(ink(uv)));
  if (r < 1.0) {
    float h = sqrt(1.0 - r * r);
    // magnify, and bend hard near the rim like a thick lens
    vec2 local = (q * u_zoom) - qq * (1.0 - h) * vec2(rx, ry) * 1.6;
    vec2 back = c + rot(-ang) * local;
    vec2 suv = back / vec2(A, 1.0) + 0.5;
    vec2 off = rot(-ang) * qq * (1.0 - h) * 0.06;
    vec3 i3 = inkSplit(suv, off * u_split * 6.0, 0.9);
    vec3 glass = mix(u_bg, vec3(0.5), u_tint);
    col = vec3(mix(glass.r, u_fg.r, i3.r), mix(glass.g, u_fg.g, i3.g), mix(glass.b, u_fg.b, i3.b));
    float fres = pow(1.0 - h, 3.0);
    col += fres * 0.35;
    // a soft highlight on the upper left
    col += 0.25 * smoothstep(0.5, 0.0, length(qq - vec2(-0.35, 0.45))) ;
    col = mix(paint(vec3(ink(uv))), col, smoothstep(1.0, 0.985, r));
  }
  return vec4(col, 1.0);
}`,
};

/* 3. Liquid: blobs of liquid glass merge, stretch and wander over the type */
export const liquid: Effect = {
  name: "Liquid",
  params: {
    amount: { value: 1.0, min: 0.5, max: 1.6, step: 0.05, label: "Amount" },
    strength: { value: 0.1, min: 0, max: 0.3, step: 0.005, label: "Strength" },
    split: { value: 0.55, min: 0, max: 1, step: 0.01, label: "Colour split" },
    speed: { value: 0.45, min: 0.1, max: 1.5, step: 0.05, label: "Speed" },
  },
  look: { text: "SPEELD\nSTUDIO", weight: "600", tracking: -0.02, leading: 0.9, fit: 0.5, fg: "#0b0b0b", bg: "#efefef" },
  glsl: SPLIT + `
float field(vec2 p) {
  float t = u_time * u_speed;
  float f = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 c = vec2(0.36 * sin(t * (0.6 + fi * 0.17) + fi * 2.4), 0.16 * sin(t * (0.9 + fi * 0.13) + fi * 1.7));
    // each blob is stretched along its way, like liquid
    vec2 q = p - c;
    q = rot(t * 0.4 + fi) * q;
    q.x *= 0.7 + 0.25 * sin(t + fi * 1.9);
    float r = (0.085 + 0.025 * sin(fi * 3.7 + t * 0.7)) * u_amount;
    f += r * r / dot(q, q);
  }
  vec2 m = (u_mouse - 0.5) * vec2(aspect(), 1.0);
  f += u_hover * 0.016 * u_amount / dot(p - m, p - m);
  return f;
}
vec4 effect(vec2 uv) {
  float A = aspect();
  vec2 p = (uv - 0.5) * vec2(A, 1.0);
  float f = field(p);
  float body = smoothstep(0.96, 1.04, f);
  vec3 col = paint(vec3(ink(uv)));
  if (body > 0.0) {
    float e = 0.0025;
    vec2 g = vec2(field(p + vec2(e, 0.0)) - field(p - vec2(e, 0.0)), field(p + vec2(0.0, e)) - field(p - vec2(0.0, e))) / (2.0 * e);
    vec2 n = -normalize(g + 1e-5);
    // thick in the middle, thin at the edge: the edge bends the most
    float thick = 1.0 - exp(-(f - 1.0) * 1.6);
    vec2 off = n * u_strength * (1.0 - thick * 0.75) / vec2(A, 1.0);
    vec3 inside = paint(inkSplit(uv + off, off * u_split, 0.85));
    // chrome: a hard dark edge, a white highlight facing the light, a soft shadow on the far side
    float facing = dot(n, normalize(vec2(-0.55, 0.8)));
    inside += pow(max(facing, 0.0), 18.0) * (1.0 - thick) * 0.85;
    inside = mix(inside, inside * 0.55, pow(max(-facing, 0.0), 3.0) * (1.0 - thick) * 0.6);
    col = mix(col, inside, body);
    col = mix(col, u_fg, exp(-pow((f - 1.0) / 0.035, 2.0)) * 0.7);
  }
  return vec4(col, 1.0);
}`,
};

/* 4. Ring cut: concentric rings turn against each other and slice through the letters */
export const rings: Effect = {
  name: "Ring cut",
  params: {
    band: { value: 0.055, min: 0.02, max: 0.15, step: 0.002, label: "Ring size" },
    turn: { value: 0.09, min: 0, max: 0.4, step: 0.005, label: "Turn" },
    gap: { value: 0.12, min: 0, max: 0.4, step: 0.01, label: "Gap" },
    speed: { value: 1.6, min: 0, max: 5, step: 0.1, label: "Speed" },
  },
  look: { text: "RIPPLE\nEFFECT", weight: "900", tracking: -0.02, leading: 0.88, fit: 0.62, uppercase: true, fg: "#2563b8", bg: "#ffffff" },
  glsl: SPLIT + `
vec4 effect(vec2 uv) {
  float A = aspect();
  vec2 c = mix(vec2(0.5), u_mouse, u_hover);
  vec2 d = (uv - c) * vec2(A, 1.0);
  float dist = length(d);
  float k = floor(dist / u_band);
  float a = u_turn * sin(k * 1.35 - u_time * u_speed) * smoothstep(0.0, 2.0, k);
  vec2 s = c + (rot(a) * d) / vec2(A, 1.0);
  float g = fract(dist / u_band);
  float cut = smoothstep(0.0, 0.02, g - u_gap * 0.5) * smoothstep(0.0, 0.02, 1.0 - u_gap * 0.5 - g);
  float i = ink(s) * mix(1.0, cut, step(1.0, k));
  return vec4(mix(u_bg, u_fg, i), 1.0);
}`,
};

/* 5. Slice: horizontal bands slide against each other */
export const slice: Effect = {
  name: "Slice",
  params: {
    bands: { value: 9, min: 3, max: 30, step: 1, label: "Bands" },
    amount: { value: 0.022, min: 0, max: 0.1, step: 0.001, label: "Shift" },
    speed: { value: 1.4, min: 0, max: 5, step: 0.1, label: "Speed" },
  },
  look: { text: "ripple", weight: "800", tracking: -0.055, fit: 0.66, fg: "#111111", bg: "#ffffff" },
  glsl: `
vec4 effect(vec2 uv) {
  float y = (uv.y - 0.5) * u_bands * 2.6;
  float idx = floor(y);
  float wave = sin(idx * 0.85 - u_time * u_speed) * 0.6 + (hash(vec2(idx, 3.0)) - 0.5) * 0.8;
  float pulse = 0.55 + 0.45 * sin(u_time * u_speed * 0.5);
  float i = ink(uv - vec2(wave * u_amount * pulse, 0.0));
  return vec4(mix(u_bg, u_fg, i), 1.0);
}`,
};

/* 6. Smear: slices tear sideways, streak, and leave ghosts above and below */
export const smear: Effect = {
  name: "Smear",
  params: {
    amount: { value: 0.06, min: 0, max: 0.2, step: 0.002, label: "Tear" },
    ghosts: { value: 0.55, min: 0, max: 1, step: 0.01, label: "Ghosts" },
    grain: { value: 0.35, min: 0, max: 1, step: 0.01, label: "Grain" },
    rate: { value: 2.2, min: 0.8, max: 6, step: 0.1, label: "Every" },
  },
  look: { text: "distortion", weight: "800", tracking: -0.055, fit: 0.78, fg: "#0a0a0a", bg: "#fde1e1" },
  glsl: `
float streak(vec2 uv, float len) {
  float s = 0.0;
  for (int k = 0; k < 10; k++) s += ink(uv - vec2(len * float(k) / 9.0, 0.0));
  return s / 10.0;
}
vec4 effect(vec2 uv) {
  float ph = fract(u_time / u_rate);
  float burst = smoothstep(0.0, 0.08, ph) * (1.0 - smoothstep(0.3, 0.6, ph));
  float level = 0.3 + 0.7 * burst;
  float step_ = floor(u_time * 9.0);
  float rows = 22.0 + 10.0 * hash(vec2(step_, 1.0));
  float idx = floor(uv.y * rows);
  float r = hash(vec2(idx, step_));
  float tear = (r > 0.55 ? (r - 0.55) * 2.2 : 0.0) * u_amount * level;
  vec2 suv = uv - vec2(tear, 0.0);
  float base = mix(ink(suv), streak(suv, tear * 1.6), step(0.001, tear));
  // ghosts: soft copies drifting up and down
  float gh = 0.0;
  float gy = 0.07 + 0.04 * burst;
  gh += streak(suv + vec2(0.0, gy), 0.05) * 0.55;
  gh += streak(suv - vec2(0.0, gy), 0.05) * 0.45;
  gh += streak(suv + vec2(0.01, gy * 2.0), 0.08) * 0.2;
  float i = max(base, gh * u_ghosts * level * step(0.4, hash(vec2(floor(uv.y * rows * 0.5), step_ + 7.0))));
  float n = hash(uv * u_res + fract(u_time) * 100.0) - 0.5;
  i = clamp(i + n * u_grain * (1.0 - abs(i * 2.0 - 1.0)), 0.0, 1.0);
  return vec4(mix(u_bg, u_fg, i), 1.0);
}`,
};

/* 7. Line scan: the letters are drawn by thin vertical lines that wave */
export const lines: Effect = {
  name: "Line scan",
  params: {
    pitch: { value: 6, min: 3, max: 14, step: 0.1, label: "Line pitch" },
    wave: { value: 0.02, min: 0, max: 0.08, step: 0.001, label: "Wave" },
    bend: { value: 2.4, min: 0, max: 6, step: 0.05, label: "Bend" },
    speed: { value: 1.2, min: 0, max: 4, step: 0.1, label: "Speed" },
  },
  look: { text: "M.SOUND", weight: "900", tracking: 0.0, fit: 0.62, uppercase: true, fg: "#111111", bg: "#eeeeee" },
  glsl: `
vec4 effect(vec2 uv) {
  float P = max(u_pitch * (u_res.y / 600.0), 3.0);
  // bend the page first, then cut it into lines, so a line never leaves its slot
  float bend = u_bend * P * sin(uv.y * 5.0 + uv.x * 5.0 + u_time * u_speed);
  float xs = uv.x * u_res.x - bend;
  float cell = floor(xs / P);
  float lx = (cell + 0.5) * P;
  float dx = u_wave * sin(uv.y * 7.0 - u_time * u_speed * 1.3 + uv.x * 3.0);
  vec2 s = vec2((lx + bend) / u_res.x + dx, uv.y);
  float cov = (ink(s) * 2.0 + ink(s + vec2(0.0, 0.003)) + ink(s - vec2(0.0, 0.003))) / 4.0;
  float hw = P * 0.4 * cov;
  float a = smoothstep(hw + 0.6, hw - 0.6, abs(xs - lx)) * step(0.03, cov);
  return vec4(mix(u_bg, u_fg, a), 1.0);
}`,
};

/* 8. Contour loop: outlines pour out of the letters forever */
export const contour: Effect = {
  name: "Contour loop",
  sdf: 1.0,
  params: {
    count: { value: 30, min: 6, max: 70, step: 1, label: "Lines" },
    duty: { value: 0.5, min: 0.15, max: 0.85, step: 0.01, label: "Weight" },
    speed: { value: 0.7, min: -3, max: 3, step: 0.05, label: "Speed" },
  },
  look: { text: "LOVE", weight: "700", family: "Fredoka", tracking: 0.02, fit: 0.36, uppercase: true, fg: "#1a14e0", bg: "#ffffff" },
  glsl: `
vec4 effect(vec2 uv) {
  float s = sdf(uv);
  float px = 1.5 / u_res.y;
  // inside the letters: white with a blue outline
  float edge = smoothstep(-0.0075 - px, -0.0075, s);
  float inside = 1.0 - smoothstep(-px, px, s);
  float stripe = fract(s * u_count - u_time * u_speed);
  float aa = 0.06;
  float line = smoothstep(u_duty - aa, u_duty + aa, stripe);
  vec3 col = mix(u_bg, u_fg, line);
  col = mix(col, mix(u_bg, u_fg, edge), inside);
  return vec4(col, 1.0);
}`,
};

export const TYPE_EFFECTS = { bubble, lens, liquid, rings, slice, smear, lines, contour } as const;
export type TypeEffectKey = keyof typeof TYPE_EFFECTS;
