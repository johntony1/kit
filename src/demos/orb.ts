// "Your energy transforms": a glowing shape that morphs from a sparkle to a circle,
// a turning squircle, a clover and back, with a band of colour (white, blue, black,
// red, orange, yellow) rolling down through it every 3 seconds. Rebuilt frame by
// frame from the reference. 16 second loop.

export const ORB_LOOP = 16;

// time, superellipse n (<1 star, 1 diamond, 2 circle, >2 squircle), turn, clover, wobble
const KEYS: [number, number, number, number, number][] = [
  [0.0, 0.72, 0.0, 0.0, 0.0],
  [1.0, 0.78, 0.0, 0.0, 0.0],
  [1.6, 1.25, 0.0, 0.0, 0.004],
  [2.2, 1.8, 0.0, 0.0, 0.006],
  [2.6, 2.0, 0.0, 0.0, 0.006],
  [3.9, 2.0, 0.0, 0.0, 0.012],
  [4.6, 2.35, 0.25, 0.0, 0.018],
  [5.4, 2.45, 0.55, 0.0, 0.022],
  [6.2, 2.35, 0.8, 0.0, 0.022],
  [6.9, 2.5, 0.4, 0.0, 0.014],
  [7.5, 2.45, 0.3, -0.04, 0.012],
  [8.0, 2.3, 0.15, -0.09, 0.018],
  [8.8, 2.2, 0.0, -0.07, 0.045],
  [9.6, 2.1, 0.0, -0.03, 0.04],
  [10.3, 2.0, 0.0, 0.0, 0.014],
  [12.0, 2.0, 0.0, 0.0, 0.01],
  [12.8, 2.0, 0.0, 0.0, 0.022],
  [16.0, 2.0, 0.0, 0.0, 0.022],
];

const ease = (x: number) => x * x * (3 - 2 * x);
function at(t: number) {
  let i = 0;
  while (i < KEYS.length - 2 && KEYS[i + 1][0] <= t) i++;
  const a = KEYS[i], b = KEYS[i + 1];
  const k = ease(Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0]))));
  return a.map((v, j) => v + (b[j] - v) * k) as typeof a;
}

const FRAG = `precision highp float;
uniform vec2  u_res;
uniform float u_time;     // seconds into the loop
uniform float u_n;
uniform float u_turn;
uniform float u_clover;
uniform float u_wob;
uniform float u_soft;     // 0 crisp .. 1 melted (the end)
uniform float u_bright;   // 1 .. 0 (fade out)
uniform vec2  u_squash;
uniform float u_phase;   // where the colour band is (runs back at the end)

// the colour band, by phase 0..1
vec3 band(float u) {
  u = fract(u);
  vec3 c = vec3(1.0, 0.98, 0.95);
  c = mix(c, vec3(0.84, 0.84, 1.0),  smoothstep(0.00, 0.10, u));
  c = mix(c, vec3(0.27, 0.24, 0.95), smoothstep(0.08, 0.24, u));
  c = mix(c, vec3(0.09, 0.05, 0.33), smoothstep(0.24, 0.38, u));
  c = mix(c, vec3(0.10, 0.0, 0.03),  smoothstep(0.36, 0.47, u));
  c = mix(c, vec3(0.95, 0.12, 0.03), smoothstep(0.46, 0.60, u));
  c = mix(c, vec3(1.0, 0.46, 0.06),  smoothstep(0.58, 0.73, u));
  c = mix(c, vec3(1.0, 0.86, 0.26),  smoothstep(0.71, 0.87, u));
  c = mix(c, vec3(1.0, 0.98, 0.95),  smoothstep(0.85, 1.00, u));
  return c;
}

float superR(float th, float n) {
  return pow(pow(abs(cos(th)), n) + pow(abs(sin(th)), n), -1.0 / n);
}

void main() {
  float m = min(u_res.x, u_res.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / m;
  p.y += 0.03 * u_soft;
  p /= u_squash;
  float R = 0.335;
  float th = atan(p.y, p.x);
  float a = th - u_turn;
  float t = u_time;
  float wob = sin(2.0 * th + 1.3 * t) * 0.5 + sin(3.0 * th - 1.7 * t + 1.0) * 0.35
            + sin(5.0 * th + 2.3 * t + 2.0) * 0.25 + sin(7.0 * th - 2.9 * t) * 0.15;
  float r = R * superR(a, u_n) * (1.0 + u_clover * cos(4.0 * a)) * (1.0 + u_wob * wob);
  float dist = length(p);
  float d = dist - r;
  vec2 nrm = p / max(dist, 1e-4);

  float px = 1.2 / m + u_soft * 0.05;
  float inside = 1.0 - smoothstep(-px, px, d);

  // colour rolls down through the shape: the top is ahead of the bottom
  // the bands bow like they sit on a ball, and lean a little as it turns
  float x = p.x / (2.0 * R);
  float y = p.y / (2.0 * R) - 0.35 * x * x + 0.08 * sin(t * 0.7) * x;
  vec3 fill = band(u_phase + y / 3.0 + 0.667);
  // depth: a ball, lit from the upper left
  float rr = clamp(dist / max(r, 1e-4), 0.0, 1.0);
  float h = sqrt(1.0 - rr * rr);
  fill *= 0.82 + 0.3 * h + 0.12 * dot(nrm, normalize(vec2(-0.5, 0.8))) * rr;
  // light gathers just inside the edge
  float inner = smoothstep(-0.06, 0.0, d) * inside;
  fill = mix(fill, min(fill * 1.25 + vec3(0.32, 0.26, 0.24), vec3(1.0)), inner * 0.75 * (1.0 - u_soft));
  float glint = smoothstep(-0.018, -0.006, d) * (1.0 - smoothstep(-0.004, 0.0, d));
  glint *= pow(max(dot(nrm, normalize(vec2(-0.55, 0.85))), 0.0), 2.0);
  fill = mix(fill, vec3(1.0, 0.97, 0.9), glint * 0.9 * (1.0 - u_soft));

  vec3 col = vec3(0.0);
  float out_ = max(d, 0.0);
  // halo: a violet band a little away from the edge, warmer underneath
  // halo: a wide soft violet bloom a little away from the edge, warmer underneath
  float halo = exp(-pow((out_ - 0.075) / 0.062, 2.0)) * smoothstep(0.0, 0.045, out_);
  halo += exp(-out_ / 0.11) * 0.22 * smoothstep(0.0, 0.05, out_);
  vec3 haloC = mix(vec3(0.43, 0.39, 0.98), vec3(0.8, 0.38, 0.26), smoothstep(0.15, -0.9, nrm.y));
  col += haloC * halo * 0.9 * (1.0 - u_soft * 0.7);
  // when it melts, a warm glow is what is left
  col += fill * exp(-out_ / 0.06) * 0.6 * u_soft;
  col += vec3(1.0, 0.3, 0.35) * exp(-out_ / 0.012) * 0.35 * step(0.0, d);
  col = mix(col, fill, inside);
  // the thin red outline
  float line = exp(-pow(d / (0.0028 + u_soft * 0.02), 2.0)) * (1.0 - u_soft);
  col = mix(col, vec3(1.0, 0.14, 0.07), line * 0.9);
  gl_FragColor = vec4(col * u_bright, 1.0);
}`;

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

export interface Orb {
  canvas: HTMLCanvasElement;
  resize(w: number, h: number): void;
  /** seconds into the loop */
  time(): number;
  destroy(): void;
}

export function createOrb(): Orb {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: true })!;
  const sh = (t: number, src: string) => { const s = gl.createShader(t)!; gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const U = Object.fromEntries(["res", "time", "n", "turn", "clover", "wob", "soft", "bright", "squash", "phase"].map((n) => [n, gl.getUniformLocation(prog, `u_${n}`)]));

  const t0 = performance.now();
  let raf = 0;
  const time = () => ((performance.now() - t0) / 1000) % ORB_LOOP;
  const frame = () => {
    const t = time();
    const [, n, turn, clover, wob] = at(t);
    const soft = Math.min(1, Math.max(0, (t - 12.9) / 0.9));
    const bright = 1 - Math.min(1, Math.max(0, (t - 13.2) / 1.0));
    const egg = Math.min(1, Math.max(0, (t - 12.3) / 0.6));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, t);
    // the band rolls on every 3 s, then runs back (white, yellow, orange, red) as it fades
    gl.uniform1f(U.phase, t < 12.9 ? t / 3 : 12.9 / 3 - (t - 12.9) * 0.3);
    gl.uniform1f(U.n, n);
    gl.uniform1f(U.turn, turn);
    gl.uniform1f(U.clover, clover);
    gl.uniform1f(U.wob, wob);
    gl.uniform1f(U.soft, ease(soft));
    gl.uniform1f(U.bright, bright);
    gl.uniform2f(U.squash, 1 + 0.03 * egg, 1 - 0.035 * egg);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    canvas,
    resize(w, h) { canvas.width = Math.max(1, w); canvas.height = Math.max(1, h); },
    time,
    destroy() { cancelAnimationFrame(raf); gl.deleteProgram(prog); gl.deleteBuffer(buf); },
  };
}
