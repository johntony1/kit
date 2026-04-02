// QRRipple.tsx
// deps: qrcode.react, framer-motion  (no three / @react-three/fiber)

import { useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useReducedMotion } from "framer-motion";

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 *   mount+400ms  first ripple fires from center (0.5, 0.5)
 *   +1.5–3.5s    subsequent ripples at random UV positions
 *   …            repeats indefinitely
 *
 *   Wave lifecycle:
 *     0ms     radius 0
 *   +180ms    ~0.10 UV — peak distortion + blue glow
 *   +800ms    ~0.44 UV — fading
 *  +2500ms    expired
 * ───────────────────────────────────────────────────────── */

const MAX_RIPPLES = 6;

const SHADER = {
  intensity:  0.015,
  frequency:  22.0,
  speed:      0.55,
  fadeRate:   1.3,
  envelope:   280.0,
  aberrScale: 0.005,
  glowGain:   0.22,
  glowColor:  [0.25, 0.55, 1.0] as [number, number, number],
} as const;

const FIRE = {
  firstDelay: 0.4,
  minGap:     1.5,
  maxGap:     3.5,
} as const;

/* ─── Vertex shader ─────────────────────────────────────── */
/* Full-screen quad: NDC positions passed straight through.
 * No camera math — position.xy of a [2,2] plane ARE NDC corners. */
const VERT = /* glsl */`
  attribute vec2 a_pos;
  attribute vec2 a_uv;
  varying   vec2 vUv;
  void main() {
    vUv         = a_uv;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

/* ─── Fragment shader ───────────────────────────────────── */
const FRAG = /* glsl */`
  precision highp float;

  uniform sampler2D u_texture;
  uniform float     u_time;
  uniform vec2      u_ripplePositions[${MAX_RIPPLES}];
  uniform float     u_rippleStartTimes[${MAX_RIPPLES}];
  uniform int       u_rippleCount;
  uniform float     u_intensity;
  uniform float     u_frequency;
  uniform float     u_speed;
  uniform float     u_fadeRate;
  uniform float     u_envelope;
  uniform float     u_aberrScale;
  uniform float     u_glowGain;
  uniform vec3      u_glowColor;

  varying vec2 vUv;

  void main() {
    vec2  uv        = vUv;
    vec2  totalDisp = vec2(0.0);
    float totalGlow = 0.0;

    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      if (i >= u_rippleCount) break;

      float age = u_time - u_rippleStartTimes[i];
      if (age < 0.0) continue;

      vec2  center = u_ripplePositions[i];
      vec2  diff   = uv - center;
      float dist   = length(diff);
      if (dist < 0.001) continue;

      float waveRadius = age * u_speed;
      float waveDist   = dist - waveRadius;
      float envelope   = exp(-waveDist * waveDist * u_envelope);
      float fade       = exp(-age * u_fadeRate);
      float wave       = sin(waveDist * u_frequency) * envelope * fade;

      totalDisp += normalize(diff) * wave * u_intensity;
      totalGlow += envelope * fade;
    }

    vec2 aberr = length(totalDisp) > 0.0001
      ? normalize(totalDisp) * length(totalDisp) * 0.6 * u_aberrScale
      : vec2(0.0);

    float r = texture2D(u_texture, clamp(uv + totalDisp + aberr, 0.0, 1.0)).r;
    float g = texture2D(u_texture, clamp(uv + totalDisp,         0.0, 1.0)).g;
    float b = texture2D(u_texture, clamp(uv + totalDisp - aberr, 0.0, 1.0)).b;
    float a = texture2D(u_texture, clamp(uv + totalDisp,         0.0, 1.0)).a;

    vec4 color = vec4(r, g, b, a);
    color.rgb += totalGlow * u_glowGain * u_glowColor;
    gl_FragColor = color;
  }
`;

/* ─── WebGL helpers ─────────────────────────────────────── */
function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile error");
  return shader;
}

interface Ripple { x: number; y: number; startTime: number; }

/* ─── Public component ──────────────────────────────────── */
export interface QRRippleProps {
  value: string;
  size: number;
  fgColor?: string;
  bgColor?: string;
  borderRadius?: number;
}

export function QRRipple({
  value,
  size,
  fgColor = "#111111",
  bgColor = "#ffffff",
  borderRadius = 16,
}: QRRippleProps) {
  const shouldReduceMotion = useReducedMotion();
  const wrapRef  = useRef<HTMLDivElement>(null);
  const glRef    = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const wrapper  = wrapRef.current;
    const glCanvas = glRef.current;
    if (!wrapper || !glCanvas) return;

    /* QRCodeCanvas renders a <canvas> as its only DOM output.
     * It's the first element inside the wrapper. */
    const qrCanvas = wrapper.querySelector<HTMLCanvasElement>("canvas:not([data-gl])");
    if (!qrCanvas) return;

    /* ── WebGL init ────────────────────────────────────── */
    const gl = glCanvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) return;

    gl.viewport(0, 0, size, size);

    const vert = compileShader(gl, gl.VERTEX_SHADER,   VERT);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(prog) ?? "link error");
    gl.useProgram(prog);

    /* Full-screen triangle-strip quad
     *   NDC: (-1,-1) → (1,-1) → (-1,1) → (1,1)
     *   UV:  ( 0, 0) → (1, 0) → ( 0, 1) → (1, 1)  */
    const quadVerts = new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
       1,  1,  1, 1,
    ]);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "a_pos");
    const aUv  = gl.getAttribLocation(prog, "a_uv");
    gl.enableVertexAttribArray(aPos);
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(aUv,  2, gl.FLOAT, false, 16, 8);

    /* QR canvas → WebGL texture
     * UNPACK_FLIP_Y_WEBGL corrects canvas Y-axis (0 = top) vs UV (0 = bottom) */
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, qrCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    /* Uniform locations */
    const uTime      = gl.getUniformLocation(prog, "u_time");
    const uPositions = gl.getUniformLocation(prog, "u_ripplePositions");
    const uTimes     = gl.getUniformLocation(prog, "u_rippleStartTimes");
    const uCount     = gl.getUniformLocation(prog, "u_rippleCount");

    /* Static uniforms — set once */
    gl.uniform1f(gl.getUniformLocation(prog, "u_intensity"),  SHADER.intensity);
    gl.uniform1f(gl.getUniformLocation(prog, "u_frequency"),  SHADER.frequency);
    gl.uniform1f(gl.getUniformLocation(prog, "u_speed"),      SHADER.speed);
    gl.uniform1f(gl.getUniformLocation(prog, "u_fadeRate"),   SHADER.fadeRate);
    gl.uniform1f(gl.getUniformLocation(prog, "u_envelope"),   SHADER.envelope);
    gl.uniform1f(gl.getUniformLocation(prog, "u_aberrScale"), SHADER.aberrScale);
    gl.uniform1f(gl.getUniformLocation(prog, "u_glowGain"),   SHADER.glowGain);
    gl.uniform3f(gl.getUniformLocation(prog, "u_glowColor"),  ...SHADER.glowColor);
    gl.uniform1i(gl.getUniformLocation(prog, "u_texture"), 0);

    /* ── Ripple state ──────────────────────────────────── */
    const ripples: Ripple[] = [];
    let startClock: number | null = null;
    let nextFire   = 0;
    let firstFired = false;
    let rafId      = 0;

    const posFlat  = new Float32Array(MAX_RIPPLES * 2).fill(0.5);
    const timFlat  = new Float32Array(MAX_RIPPLES).fill(-999);

    function render(now: number) {
      const t = now / 1000;

      if (startClock === null) {
        startClock = t;
        nextFire   = t + FIRE.firstDelay;
      }

      /* Fire new ripple */
      if (t >= nextFire) {
        const x = firstFired ? 0.15 + Math.random() * 0.70 : 0.5;
        const y = firstFired ? 0.15 + Math.random() * 0.70 : 0.5;
        firstFired = true;
        ripples.push({ x, y, startTime: t });
        if (ripples.length > MAX_RIPPLES) ripples.shift();
        nextFire = t + FIRE.minGap + Math.random() * (FIRE.maxGap - FIRE.minGap);
      }

      /* Expire old ripples */
      while (ripples.length && t - ripples[0].startTime > 2.5) ripples.shift();

      /* Pack into flat arrays for upload */
      for (let i = 0; i < MAX_RIPPLES; i++) {
        if (i < ripples.length) {
          posFlat[i * 2]     = ripples[i].x;
          posFlat[i * 2 + 1] = ripples[i].y;
          timFlat[i]         = ripples[i].startTime;
        } else {
          timFlat[i] = -999;
        }
      }

      gl.uniform1f(uTime, t);
      gl.uniform2fv(uPositions, posFlat);
      gl.uniform1fv(uTimes, timFlat);
      gl.uniform1i(uCount, ripples.length);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      rafId = requestAnimationFrame(render);
    }

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
    };
  }, [value, size, shouldReduceMotion]);

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", width: size, height: size, borderRadius, overflow: "hidden" }}
    >
      {/* Always in DOM: fallback display + CanvasTexture source */}
      <QRCodeCanvas
        value={value}
        size={size}
        level="H"
        fgColor={fgColor}
        bgColor={bgColor}
        style={{
          display: "block",
          visibility: shouldReduceMotion ? "visible" : "hidden",
        }}
      />

      {/* Raw WebGL canvas — exact pixel dimensions prevent any sizing ambiguity */}
      {!shouldReduceMotion && (
        <canvas
          ref={glRef}
          data-gl=""
          width={size}
          height={size}
          style={{ position: "absolute", top: 0, left: 0, width: size, height: size }}
        />
      )}
    </div>
  );
}
