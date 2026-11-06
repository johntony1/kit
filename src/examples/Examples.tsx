import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Ripple, type RippleHandle } from "../ripple/RippleCanvas";
import { RIPPLE_DEFAULTS, type RippleOptions } from "../ripple/ripple";
import { drawAlbum, drawAvatar, drawCard, drawDusk, drawTicket, paper } from "./art";

type Draw = (c: CanvasRenderingContext2D, w: number, h: number) => void;

/** a drawn canvas that redraws when deps change or the fonts arrive, and tells the ripple */
function useArt(w: number, h: number, draw: Draw, deps: unknown[]) {
  const ref = useRef<RippleHandle>(null);
  const [cv] = useState(() => paper(w, h, draw));
  const redraw = () => {
    const c = cv.getContext("2d")!;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, cv.width, cv.height);
    c.scale(cv.width / w, cv.height / h);
    draw(c, w, h);
    ref.current?.refresh();
  };
  useEffect(redraw, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { document.fonts?.ready.then(redraw); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return { cv, ref };
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ── A payment that went through ───────────────────────── */
export function PayDemo() {
  const [state, setState] = useState<"idle" | "paying" | "paid">("idle");
  const { cv, ref } = useArt(340, 214, (c, w, h) => drawCard(c, w, h, state === "paid"), [state]);
  const pay = async () => {
    if (state === "paying") return;
    if (state === "paid") { setState("idle"); return; }
    setState("paying");
    await wait(900);
    setState("paid");
    requestAnimationFrame(() => ref.current?.fire(0.12, 0.47));
  };
  return (
    <div className="stage">
      <div className="pay">
        <Ripple ref={ref} source={cv} width={340} height={214} radius={16} glowColor="#2ee59d" label="A payment card" className="lift" />
        <button type="button" className="btn wide" onClick={pay} data-busy={state === "paying" || undefined}>
          {state === "idle" && "Pay $48.00"}
          {state === "paying" && <><span className="spin" aria-hidden="true" /> Paying</>}
          {state === "paid" && "Paid · Pay again"}
        </button>
      </div>
    </div>
  );
}

/* ── A song that starts ────────────────────────────────── */
const HUES = [18, 210, 280, 150];
export function PlayerDemo() {
  const [track, setTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const hue = HUES[track % HUES.length];
  const { cv, ref } = useArt(220, 220, (c, w, h) => drawAlbum(c, w, h, hue), [hue]);
  const glow = `hsl(${hue + 20} 100% 60%)`;
  const toggle = () => {
    setPlaying((p) => !p);
    if (!playing) ref.current?.fire();
  };
  const next = () => {
    setTrack((t) => t + 1);
    setPlaying(true);
    requestAnimationFrame(() => ref.current?.fire());
  };
  return (
    <div className="stage">
      <div className="player">
        <Ripple ref={ref} source={cv} width={220} height={220} radius={14} glowColor={hslHex(hue + 20)} label="Album art" className="lift" />
        <div className="playerRow">
          <div>
            <div className="playerTitle">Slow Light</div>
            <div className="playerSub">Harbour · track {track % HUES.length + 1} of {HUES.length}</div>
          </div>
          <div className="playerBtns">
            <button type="button" className="round main" onClick={toggle} aria-label={playing ? "Pause" : "Play"} style={{ ["--g" as string]: glow }}>
              {playing ? (
                <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="4" y="3" width="3" height="10" rx="1" /><rect x="9" y="3" width="3" height="10" rx="1" /></svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5 3.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L5.9 2.7a.6.6 0 0 0-.9.5Z" /></svg>
              )}
            </button>
            <button type="button" className="round" onClick={next} aria-label="Next track">
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3 3.6v8.8a.5.5 0 0 0 .8.4l6-4.4a.5.5 0 0 0 0-.8l-6-4.4a.5.5 0 0 0-.8.4Z" /><rect x="11" y="3" width="2" height="10" rx="1" /></svg>
            </button>
          </div>
        </div>
        <div className="bar"><div className="barFill" data-on={playing || undefined} /></div>
      </div>
    </div>
  );
}

function hslHex(h: number) {
  const c = document.createElement("canvas").getContext("2d")!;
  c.fillStyle = `hsl(${h} 100% 60%)`;
  return c.fillStyle as string;
}

/* ── A photo you just changed ──────────────────────────── */
const FACE = [200, 330, 30, 120];
export function AvatarDemo() {
  const [i, setI] = useState(0);
  const hue = FACE[i % FACE.length];
  const { cv, ref } = useArt(88, 88, (c, w, h) => drawAvatar(c, w, h, hue), [hue]);
  const [saved, setSaved] = useState(false);
  const change = () => {
    setI((n) => n + 1);
    setSaved(true);
    requestAnimationFrame(() => ref.current?.fire());
    setTimeout(() => setSaved(false), 1600);
  };
  return (
    <div className="stage">
      <div className="profile">
        <Ripple ref={ref} source={cv} width={88} height={88} radius={44} glowColor="#a78bfa" reach={0.9} intensity={0.06} label="Profile photo" />
        <div className="profileText">
          <div className="playerTitle">Ada Okafor</div>
          <div className="playerSub">{saved ? "Photo updated" : "Designer, Lagos"}</div>
        </div>
        <button type="button" className="btn" onClick={change}>Change photo</button>
      </div>
    </div>
  );
}

/* ── A ticket that scans ───────────────────────────────── */
export function TicketDemo() {
  const [state, setState] = useState<"idle" | "scanning" | "scanned">("idle");
  const { cv, ref } = useArt(300, 250, (c, w, h) => drawTicket(c, w, h, state === "scanned"), [state]);
  const scan = async () => {
    if (state === "scanning") return;
    if (state === "scanned") { setState("idle"); return; }
    setState("scanning");
    await wait(800);
    setState("scanned");
    requestAnimationFrame(() => ref.current?.fire(0.5, 0.8));
  };
  return (
    <div className="stage">
      <div className="pay">
        <div className="ticketWrap" data-scan={state === "scanning" || undefined}>
          <Ripple ref={ref} source={cv} width={300} height={250} radius={14} glowColor="#22c55e" label="A boarding pass" className="lift" />
        </div>
        <button type="button" className="btn wide" onClick={scan}>
          {state === "idle" && "Scan at the gate"}
          {state === "scanning" && "Scanning"}
          {state === "scanned" && "Boarding · Reset"}
        </button>
      </div>
    </div>
  );
}

/* ── Wherever you touch ────────────────────────────────── */
export function TouchDemo() {
  const { cv } = useArt(600, 320, drawDusk, []);
  return (
    <div className="stage flush">
      <Ripple source={cv} width="100%" height={320} radius={0} fireOn="click" glowColor="#ffb36b" label="A landscape at dusk. Click anywhere to send a ripple from there." />
      <span className="hint">Click anywhere</span>
    </div>
  );
}

/* ── Tune it ───────────────────────────────────────────── */
const SLIDERS: { key: keyof RippleOptions; label: string; min: number; max: number; step: number }[] = [
  { key: "intensity", label: "Intensity", min: 0, max: 0.15, step: 0.005 },
  { key: "frequency", label: "Frequency", min: 4, max: 60, step: 1 },
  { key: "reach", label: "Reach", min: 0.2, max: 1.5, step: 0.05 },
  { key: "burst", label: "Burst", min: 0.5, max: 8, step: 0.1 },
  { key: "fade", label: "Fade", min: 0.2, max: 3, step: 0.05 },
  { key: "aberration", label: "Colour split", min: 0, max: 0.05, step: 0.001 },
  { key: "glow", label: "Glow", min: 0, max: 6, step: 0.1 },
];
const SWATCHES = ["#1d9fff", "#7c3aed", "#be185d", "#ff5f1f", "#22c55e", "#ffffff"];
const SOURCES = ["QR code", "Card", "Photo"] as const;

export function Playground({ onCode }: { onCode?: (s: string) => void }) {
  const [o, setO] = useState<Required<Pick<RippleOptions, "intensity" | "frequency" | "reach" | "burst" | "fade" | "aberration" | "glow" | "glowColor">>>({
    intensity: RIPPLE_DEFAULTS.intensity, frequency: RIPPLE_DEFAULTS.frequency, reach: RIPPLE_DEFAULTS.reach,
    burst: RIPPLE_DEFAULTS.burst, fade: RIPPLE_DEFAULTS.fade, aberration: RIPPLE_DEFAULTS.aberration,
    glow: RIPPLE_DEFAULTS.glow, glowColor: RIPPLE_DEFAULTS.glowColor,
  });
  const [src, setSrc] = useState<(typeof SOURCES)[number]>("QR code");
  const qr = useRef<HTMLCanvasElement>(null);
  const [qrCv, setQrCv] = useState<HTMLCanvasElement | null>(null);
  const card = useArt(300, 190, (c, w, h) => drawCard(c, w, h, false), []);
  const dusk = useArt(300, 300, drawDusk, []);
  const ref = useRef<RippleHandle>(null);
  useEffect(() => { setQrCv(qr.current); }, []);

  const changed = Object.entries(o).filter(([k, v]) => RIPPLE_DEFAULTS[k as keyof RippleOptions] !== v);
  const code = changed.length
    ? `<Ripple src="/your-image.png" width={300} height={300} fireOn="click"\n${changed.map(([k, v]) => `  ${k}=${typeof v === "string" ? `"${v}"` : `{${v}}`}`).join("\n")}\n/>`
    : `<Ripple src="/your-image.png" width={300} height={300} fireOn="click" />`;
  useEffect(() => { onCode?.(code); }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  const size = src === "Card" ? { w: 300, h: 190 } : { w: 300, h: 300 };
  const source = src === "QR code" ? qrCv : src === "Card" ? card.cv : dusk.cv;

  return (
    <div className="play">
      <QRCodeCanvas ref={qr} value="https://qr-code-animatio.vercel.app" size={600} level="H" marginSize={2} fgColor="#111111" bgColor="#ffffff" style={{ display: "none" }} />
      <div className="playStage">
        <div className="seg" role="tablist" aria-label="What to ripple">
          {SOURCES.map((s) => (
            <button key={s} type="button" role="tab" aria-selected={s === src} className={`segBtn ${s === src ? "on" : ""}`} onClick={() => setSrc(s)}>{s}</button>
          ))}
        </div>
        <div className="playPreview">
          {source && (
            <Ripple key={src} ref={ref} source={source} width={size.w} height={size.h} radius={src === "Photo" ? 150 : 16} fireOn="click" {...o} label={`${src}. Click to fire a ripple from that point.`} className="lift" />
          )}
        </div>
        <button type="button" className="btn" onClick={() => ref.current?.fire()}>Fire from the centre</button>
      </div>
      <div className="controls">
        {SLIDERS.map((s) => (
          <label key={s.key} className="slider">
            <span className="sliderTop"><span>{s.label}</span><span className="num">{Number(o[s.key as keyof typeof o]).toFixed(s.step < 0.01 ? 3 : s.step < 1 ? 2 : 0)}</span></span>
            <input type="range" min={s.min} max={s.max} step={s.step} value={o[s.key as keyof typeof o] as number}
              onChange={(e) => setO({ ...o, [s.key]: Number(e.target.value) })}
              onPointerUp={() => ref.current?.fire()} />
          </label>
        ))}
        <div className="swatches" role="radiogroup" aria-label="Glow colour">
          {SWATCHES.map((c) => (
            <button key={c} type="button" role="radio" aria-checked={o.glowColor === c} aria-label={c} className="swatch" style={{ background: c }}
              onClick={() => { setO({ ...o, glowColor: c }); requestAnimationFrame(() => ref.current?.fire()); }} />
          ))}
        </div>
        <button type="button" className="reset" onClick={() => setO({ ...o, ...Object.fromEntries(SLIDERS.map((s) => [s.key, RIPPLE_DEFAULTS[s.key]])), glowColor: RIPPLE_DEFAULTS.glowColor })}>Reset</button>
      </div>
    </div>
  );
}
