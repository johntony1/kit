declare module "gifenc" {
  export function GIFEncoder(): { writeFrame(index: Uint8Array, w: number, h: number, o?: { palette?: number[][]; delay?: number; repeat?: number }): void; finish(): void; bytes(): Uint8Array };
  export function quantize(rgba: Uint8ClampedArray | Uint8Array, max: number, o?: object): number[][];
  export function applyPalette(rgba: Uint8ClampedArray | Uint8Array, palette: number[][], format?: string): Uint8Array;
}
