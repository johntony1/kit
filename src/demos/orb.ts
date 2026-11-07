// The glowing orb used in the Ripple previews: a shape that morphs between a sparkle,
// a circle, a squircle and a clover, lit like heat, with a red rim and a blue halo.
// It draws into its own canvas, which the ripple then reads as a live source.

const FRAG = `precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform float u_a;      // shape it is leaving
uniform float u_b;      // shape it is going to
uniform float u_mix;    // 0..1 (springs past 1 a little)
uniform float u_pa;     // palette leaving
uniform float u_pb;     // palette going to
uniform float u_pmix;
uniform float u_size;
uniform vec3  u_bg;

float superR(float th, float n) {
  return pow(pow(abs(cos(th)), n) + pow(abs(sin(th)), n), -1.0 / n);
}
float shapeR(float k, float th) {
  if (k < 0.5) return superR(th, 0.62) * 1.25;               // sparkle
  if (k < 1.5) return 1.0;                                   // circle
  if (k < 2.5) return superR(th + 0.785, 4.0) * 0.93;        // squircle, turned
  return 0.92 - 0.11 * cos(4.0 * th);                        // clover
}
vec3 ramp(float k, float y) {
  // y: 0 at the bottom, 1 at the top
  if (k < 0.5) {        // fire: white, yellow, orange, red
    vec3 c = mix(vec3(0.85, 0.07, 0.02), vec3(1.0, 0.42, 0.04), smoothstep(0.05, 0.4, y));
    c = mix(c, vec3(1.0, 0.86, 0.22), smoothstep(0.38, 0.62, y));
    return mix(c, vec3(1.0, 0.99, 0.94), smoothstep(0.6, 0.9, y));
  }
  if (k < 1.5) {        // ice: blue on top, white below
    vec3 c = mix(vec3(1.0), vec3(0.78, 0.78, 1.0), smoothstep(0.35, 0.6, y));
    return mix(c, vec3(0.22, 0.2, 0.98), smoothstep(0.62, 0.95, y));
  }
  // dusk: red on top, black middle, blue below
  vec3 c = mix(vec3(0.2, 0.14, 0.92), vec3(0.04, 0.01, 0.05), smoothstep(0.12, 0.48, y));
  return mix(c, vec3(1.0, 0.22, 0.08), smoothstep(0.5, 0.88, y));
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  float th = atan(p.y, p.x);
  float wob = 0.022 * sin(3.0 * th + u_time * 1.3) + 0.016 * sin(5.0 * th - u_time * 1.9);
  float r = u_size * (mix(shapeR(u_a, th), shapeR(u_b, th), u_mix) + wob);
  float d = length(p) - r;

  float y = clamp(p.y / (u_size * 2.0) + 0.5 + 0.06 * sin(u_time * 0.8 + p.x * 4.0), 0.0, 1.0);
  vec3 fill = mix(ramp(u_pa, y), ramp(u_pb, y), u_pmix);
  // light gathers at the edge, inside
  fill += vec3(1.0, 0.55, 0.5) * exp(d * 60.0) * 0.35;

  float inside = smoothstep(0.003, -0.003, d);
  // the halo follows a rounder version of the shape, so a sparkle's points do not streak
  float out_ = max(max(d, (length(p) - u_size * 0.95) * 0.8), 0.0);
  float rim = exp(-abs(d) * 160.0);
  vec3 halo = mix(vec3(0.33, 0.3, 1.0), vec3(1.0, 0.25, 0.2), exp(-out_ * 38.0));
  halo = mix(halo, vec3(1.0, 0.85, 0.9), exp(-out_ * 110.0) * 0.6);

  vec3 col = u_bg;
  col = mix(col, col + halo * 1.1, exp(-out_ * 10.0) * (1.0 - inside));
  col = mix(col, fill, inside);
  col += vec3(1.0, 0.3, 0.25) * rim * 0.9;
  gl_FragColor = vec4(min(col, vec3(1.0)), 1.0);
}`;

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

export interface Orb {
  canvas: HTMLCanvasElement;
  resize(w: number, h: number): void;
  destroy(): void;
}

/** shapes cycle every `every` seconds; onMorph fires as each new shape starts */
export function createOrb({ size = 0.3, every = 1.9, bg = [0.102, 0.102, 0.102] as [number, number, number], onMorph = () => {} } = {}): Orb {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: true })!;
  const sh = (t: number, src: string) => { const s = gl.createShader(t)!; gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const U = { res: u("u_res"), time: u("u_time"), a: u("u_a"), b: u("u_b"), mix: u("u_mix"), pa: u("u_pa"), pb: u("u_pb"), pmix: u("u_pmix"), size: u("u_size"), bg: u("u_bg") };

  // sparkle → circle → squircle → clover → circle → sparkle ...
  const SHAPES = [0, 1, 2, 3, 1];
  const t0 = performance.now();
  let step = -1;
  let raf = 0;

  // a spring that overshoots a little: the shape lands, then settles
  const spring = (x: number) => (x >= 1 ? 1 : 1 - Math.exp(-7 * x) * Math.cos(9 * x));

  const frame = () => {
    const t = (performance.now() - t0) / 1000;
    const s = Math.floor(t / every);
    if (s !== step) { step = s; onMorph(); }
    const k = (t - s * every) / 0.75;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, t);
    gl.uniform1f(U.a, SHAPES[(s + SHAPES.length - 1) % SHAPES.length]);
    gl.uniform1f(U.b, SHAPES[s % SHAPES.length]);
    gl.uniform1f(U.mix, spring(k));
    gl.uniform1f(U.pa, (s + 2) % 3);
    gl.uniform1f(U.pb, s % 3);
    gl.uniform1f(U.pmix, Math.min(1, k * 1.2));
    gl.uniform1f(U.size, size);
    gl.uniform3f(U.bg, ...bg);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  return {
    canvas,
    resize(w, h) { canvas.width = w; canvas.height = h; },
    destroy() { cancelAnimationFrame(raf); gl.getExtension("WEBGL_lose_context")?.loseContext(); },
  };
}
