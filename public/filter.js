// Warhol's photo-silkscreen process as code (see RESEARCH.md for sources).
//  1. Flat color first: one ground color + one subject color, loosely traced, not following tones.
//  2. Black photo screen last: solid in shadows, coarse halftone dots in midtones, nothing in highlights.
//  3. The same screen reused per repeat, so it lands off-register (offset + slight rotation).
//  4. Uneven ink: heavy pulls fill the dots in, thin pulls leave a ghost, and the squeegee leaves streaks.
// Pure functions (no DOM) so test/filter.test.js can run them in Node.
// shortcut: tone thresholds, dot pitch and offset ranges are design choices; no source gives measured values.

export const INK = '#161616';
// [ground, subject] per tile. Grounds from the Marilyns / Shot Marilyns (turquoise, orange, lemon, light blue).
export const PALETTES = [
  ['#2bb3b1', '#f4a6b8'],
  ['#f07a2a', '#f7c6d0'],
  ['#f2df3a', '#ef8fb0'],
  ['#86c3e6', '#f9b48f'],
];
const DOT_PITCH = 5; // px per halftone cell at a 300px tile; large enough to read as dots on a phone

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Separable box blur of a Float32Array plane.
export function blur(src, w, h, r) {
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, n = 0;
    for (let i = -r; i <= r; i++) { const xx = x + i; if (xx >= 0 && xx < w) { s += src[y * w + xx]; n++; } }
    tmp[y * w + x] = s / n;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, n = 0;
    for (let j = -r; j <= r; j++) { const yy = y + j; if (yy >= 0 && yy < h) { s += tmp[yy * w + x]; n++; } }
    out[y * w + x] = s / n;
  }
  return out;
}

export function luminance(rgba, w, h) {
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) lum[i] = 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];
  return blur(lum, w, h, 1); // light smoothing so the threshold doesn't speckle
}

// Subject region as 0/1. Under 5% person (a hand, a cup) → the whole frame is the subject.
// Blur + low threshold = a loose, slightly spilling outline, like tracing by hand.
export function subjectMask(mask, w, h) {
  const n = w * h, out = new Uint8Array(n);
  let count = 0;
  if (mask) for (let i = 0; i < n; i++) if (mask[i] > 0.5) count++;
  if (!mask || count < n * 0.05) return out.fill(1);
  const soft = blur(mask, w, h, Math.max(2, Math.round(w / 75)));
  for (let i = 0; i < n; i++) out[i] = soft[i] > 0.3 ? 1 : 0;
  return out;
}

// Ink coverage 0..1 from the photo: 1 in shadows, 0 in highlights, a ramp in between (midtones → dots).
// Thresholds are the subject's own percentiles so dark and bright photos both print.
export function coverage(lum, subj, n) {
  const hist = new Uint32Array(256);
  let total = 0;
  for (let i = 0; i < n; i++) if (subj[i]) { hist[Math.min(255, lum[i] | 0)]++; total++; }
  const pct = (p) => { let acc = 0; for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * p) return v; } return 255; };
  const dark = pct(0.3), light = Math.max(dark + 1, pct(0.6));
  const cov = new Float32Array(n);
  for (let i = 0; i < n; i++) cov[i] = !subj[i] ? 0 : Math.min(1, Math.max(0, (light - lum[i]) / (light - dark)));
  return cov;
}

// Halftone threshold map: a round-dot screen at 45°. Ink where coverage > threshold.
export function dotScreen(w, h, pitch = DOT_PITCH) {
  const t = new Float32Array(w * h), k = (2 * Math.PI) / pitch / Math.SQRT2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++)
    t[y * w + x] = 0.5 - 0.25 * (Math.cos((x + y) * k) + Math.cos((x - y) * k));
  return t;
}

// Random print conditions for one repeat.
export function pull(rnd, S) {
  const r = (a, b) => a + (b - a) * rnd();
  const ang = r(0, 2 * Math.PI), dist = r(0.01, 0.04) * S;
  const knots = Array.from({ length: 7 }, () => r(-1, 1)); // squeegee streaks across the width
  return {
    ink: [Math.round(Math.cos(ang) * dist), Math.round(Math.sin(ang) * dist)],
    rot: r(-1, 1) * (Math.PI / 180),
    color: [Math.round(r(-0.015, 0.015) * S), Math.round(r(-0.015, 0.015) * S)],
    load: r(0.7, 1.35), // <1 thin, ghosty; >1 heavy, dots fill in
    streak: (x) => { const p = (x / S) * 6, i = Math.min(5, p | 0), f = p - i; return knots[i] * (1 - f) + knots[i + 1] * f; },
  };
}

const hex = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));

// One repeat: color layer, then the black screen on top.
export function renderTile(subj, cov, screen, S, palette, p) {
  const [ground, skin] = palette.map(hex), ink = hex(INK);
  const out = new Uint8ClampedArray(S * S * 4);
  const c = S / 2, cos = Math.cos(p.rot), sin = Math.sin(p.rot);
  for (let y = 0; y < S; y++) {
    const band = y > (S * 2) / 3 ? 1 : 0.35; // streaks strongest in the lower third
    for (let x = 0; x < S; x++) {
      const i = y * S + x;
      // Color layer, with its own small offset.
      const cx = x - p.color[0], cy = y - p.color[1];
      const inSubj = cx >= 0 && cy >= 0 && cx < S && cy < S && subj[cy * S + cx];
      let col = inSubj ? skin : ground;
      // Black screen: rotate about the center, then offset.
      const sx = Math.round(cos * (x - c) + sin * (y - c) + c - p.ink[0]);
      const sy = Math.round(-sin * (x - c) + cos * (y - c) + c - p.ink[1]);
      if (sx >= 0 && sy >= 0 && sx < S && sy < S) {
        const j = sy * S + sx;
        const load = p.load * (1 + 0.3 * band * p.streak(x));
        if (Math.min(1, cov[j] * load) > screen[j]) col = ink;
      }
      out.set(col, i * 4); out[i * 4 + 3] = 255;
    }
  }
  return out;
}

// Whole pipeline for one S×S photo → four RGBA tiles (top-left, top-right, bottom-left, bottom-right).
export function warholize(rgba, mask, S, seed = 1) {
  const subj = subjectMask(mask, S, S);
  const cov = coverage(luminance(rgba, S, S), subj, S * S);
  const screen = dotScreen(S, S);
  const rnd = mulberry32(seed);
  return PALETTES.map((pal) => renderTile(subj, cov, screen, S, pal, pull(rnd, S)));
}
