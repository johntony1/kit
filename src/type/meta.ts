// What the site says about each type effect, and the variants it shows.
import type { TypeOptions } from "./type-core";
import type { TypeEffectKey } from "./effects";

type Variant = Partial<TypeOptions>;
export interface Meta { desc: string; hint: string; small: Variant; wide: Variant; swatches: [string, string][] }

export const TYPE_META: Record<TypeEffectKey, Meta> = {
  bubble: {
    desc: "A glass ring grows out of a point like a drop in water and bends the letters at its rim.",
    hint: "Click anywhere to drop one",
    small: { text: "now", fg: "#ffffff", bg: "#0b0b0b" },
    wide: { text: "They give me structure", weight: "600", fit: 0.82, fg: "#0b0b0b", bg: "#ffffff" },
    swatches: [["#0b0b0b", "#eef0f3"], ["#ffffff", "#0b0b0b"], ["#1a14e0", "#ffffff"], ["#0b0b0b", "#fde1e1"]],
  },
  lens: {
    desc: "A glass blob drifts over the type, magnifies what is under it and splits its colours at the rim.",
    hint: "Move over it to steer the glass",
    small: { text: "STAY\nWILD", uppercase: true, weight: "900", fit: 0.5, params: { stretch: 0.45, size: 0.3 } },
    wide: { text: "See it differently.", weight: "700", fit: 0.7, fg: "#0b0b0b", bg: "#f2f2f2", params: { tint: 0.08, size: 0.26 } },
    swatches: [["#ffffff", "#000000"], ["#0b0b0b", "#f2f2f2"], ["#fde1e1", "#1a0b0b"], ["#c8ff3d", "#0b0b0b"]],
  },
  liquid: {
    desc: "Blobs of liquid glass merge, stretch and wander over the type, with a chrome edge and a highlight.",
    hint: "Move over it to pull the liquid",
    small: { text: "LIQUID\nTYPE", uppercase: true, weight: "800", fit: 0.55, fg: "#ffffff", bg: "#000000" },
    wide: { text: "Melt into it", weight: "700", fit: 0.66, fg: "#0b0b0b", bg: "#e9eef5" },
    swatches: [["#0b0b0b", "#efefef"], ["#ffffff", "#000000"], ["#0b0b0b", "#e9eef5"], ["#1a14e0", "#ffffff"]],
  },
  rings: {
    desc: "Concentric rings turn against each other and cut through the letters, like ripples on water.",
    hint: "Move over it to move the centre",
    small: { text: "WAVE", fg: "#2a7f8f", bg: "#ffffff", fit: 0.66 },
    wide: { text: "RIPPLE EFFECT", fg: "#ffffff", bg: "#2563b8", fit: 0.8, params: { band: 0.04 } },
    swatches: [["#2563b8", "#ffffff"], ["#2a7f8f", "#ffffff"], ["#ffffff", "#2563b8"], ["#0b0b0b", "#f2efe6"]],
  },
  slice: {
    desc: "Horizontal bands slide against each other, so the word ripples sideways in clean cuts.",
    hint: "It moves on its own",
    small: { text: "shift", fg: "#ffffff", bg: "#0b0b0b" },
    wide: { text: "ripple ripple", fg: "#0b0b0b", bg: "#c8ff3d", fit: 0.8, params: { bands: 14 } },
    swatches: [["#111111", "#ffffff"], ["#ffffff", "#0b0b0b"], ["#0b0b0b", "#c8ff3d"], ["#1a14e0", "#ffffff"]],
  },
  smear: {
    desc: "Slices tear sideways, streak, and leave soft ghosts above and below, with a little grain.",
    hint: "It tears every few seconds",
    small: { text: "glitch", fg: "#ffffff", bg: "#0b0b0b" },
    wide: { text: "distortion", fg: "#1a14e0", bg: "#f2f2f2", fit: 0.7 },
    swatches: [["#0a0a0a", "#fde1e1"], ["#ffffff", "#0b0b0b"], ["#1a14e0", "#f2f2f2"], ["#0a0a0a", "#ffffff"]],
  },
  lines: {
    desc: "The letters are drawn by thin vertical lines that bend and wave, like sound on a screen.",
    hint: "It moves on its own",
    small: { text: "HUM", fg: "#ffffff", bg: "#0b0b0b", fit: 0.6 },
    wide: { text: "M.SOUND STUDIO", fg: "#0b0b0b", bg: "#eeeeee", fit: 0.84 },
    swatches: [["#111111", "#eeeeee"], ["#ffffff", "#0b0b0b"], ["#1a14e0", "#ffffff"], ["#0b0b0b", "#fde1e1"]],
  },
  contour: {
    desc: "Outlines pour out of the letters forever, an infinite loop of the word's own shape.",
    hint: "It loops forever",
    small: { text: "HI", fg: "#ff4fa3", bg: "#ffffff", fit: 0.3 },
    wide: { text: "LOVE LOVE", fg: "#ffffff", bg: "#1a14e0", fit: 0.6 },
    swatches: [["#1a14e0", "#ffffff"], ["#ff4fa3", "#ffffff"], ["#ffffff", "#1a14e0"], ["#0b0b0b", "#c8ff3d"]],
  },
};
