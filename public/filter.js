// Warhol process as code: ① isolate subject ② reduce tones ③ flat colors ④ repeat 2×2, off-register.
// Pure functions (no DOM) so test/filter.test.js can run them in Node.

// [background, ink (black screen layer), mid tone, highlight] — Marilyn-ish sets, one per tile.
export const PALETTES = [
  ['#f7d23e', '#1b1b1b', '#e8508c', '#f9c6a0'],
  ['#3ec6c9', '#1b1b1b', '#f28c28', '#fde74c'],
  ['#e8508c', '#26265c', '#8fd14f', '#fff2a8'],
  ['#f28c28', '#1b1b1b', '#5a8de0', '#f7b8d2'],
];
// Each tile's ink layer is printed a few px off, like a misaligned screen.
export const OFFSETS = [[3, 2], [-2, 3], [2, -3], [-3, -2]];

const BG = 0, INK = 1, MID = 2, LIGHT = 3;

// rgba → luminance, with a 3×3 box blur so posterizing doesn't speckle.
export function luminance(rgba, w, h) {
  const raw = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) raw[i] = 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, n = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const xx = x + i, yy = y + j;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h) { s += raw[yy * w + xx]; n++; }
    }
    out[y * w + x] = s / n;
  }
  return out;
}

// Tone levels per pixel. Thresholds are the subject's own 35th/75th luminance percentiles,
// so dark and bright photos both split into balanced ink / mid / highlight areas.
// mask: per-pixel person confidence (0..1) or null. Under 5% person (a hand, a cup) → ignore the mask.
export function levels(lum, mask, w, h) {
  const n = w * h;
  let fg = new Uint8Array(n).fill(1);
  if (mask) {
    let count = 0;
    const m = new Uint8Array(n);
    for (let i = 0; i < n; i++) if (mask[i] > 0.5) { m[i] = 1; count++; }
    if (count > n * 0.05) fg = m;
  }
  const hist = new Uint32Array(256);
  let total = 0;
  for (let i = 0; i < n; i++) if (fg[i]) { hist[Math.min(255, lum[i] | 0)]++; total++; }
  const pct = (p) => { let acc = 0; for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * p) return v; } return 255; };
  const t1 = pct(0.35), t2 = pct(0.75);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = !fg[i] ? BG : lum[i] <= t1 ? INK : lum[i] <= t2 ? MID : LIGHT;
  return out;
}

const hex = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));

// One tile: flat color layer, then the ink layer stamped at (dx, dy).
export function renderTile(lv, w, h, palette, [dx, dy]) {
  const [bg, ink, mid, light] = palette.map(hex);
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    const sx = x - dx, sy = y - dy;
    const inked = sx >= 0 && sy >= 0 && sx < w && sy < h && lv[sy * w + sx] === INK;
    const c = inked ? ink : lv[i] === BG ? bg : lv[i] === LIGHT ? light : mid;
    out.set(c, i * 4); out[i * 4 + 3] = 255;
  }
  return out;
}
