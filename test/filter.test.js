import assert from 'node:assert/strict';
import { subjectMask, coverage, dotScreen, renderTile, warholize, mulberry32, PALETTES, INK } from '../public/filter.js';

const S = 40, n = S * S;
const hex = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
const px = (t, x, y) => [...t.slice((y * S + x) * 4, (y * S + x) * 4 + 3)];
const still = { ink: [0, 0], rot: 0, color: [0, 0], load: 1, streak: () => 0 }; // perfect registration

// Subject = left half. Tiny mask (a hand, a cup) → whole frame is subject.
const mask = new Float32Array(n).map((_, i) => (i % S < S / 2 ? 1 : 0));
const subj = subjectMask(mask, S, S);
assert.equal(subj[S * 20 + 2], 1);
assert.equal(subj[S * 20 + S - 2], 0);
const tiny = new Float32Array(n); tiny[0] = 1;
assert.ok(subjectMask(tiny, S, S).every((v) => v === 1), 'tiny mask ignored');
assert.ok(subjectMask(null, S, S).every((v) => v === 1), 'no mask → all subject');

// Luminance ramps top (dark) → bottom (bright): shadows get full coverage, highlights none, outside subject none.
const lum = new Float32Array(n).map((_, i) => ((i / S) | 0) * (255 / S));
const cov = coverage(lum, subj, n);
assert.equal(cov[S * 1 + 2], 1, 'shadow fully inked');
assert.equal(cov[S * (S - 1) + 2], 0, 'highlight not inked');
assert.equal(cov[S * 1 + S - 2], 0, 'no ink outside subject');

// Layer order: black on top of color; flat ground outside; flat subject color where no ink.
const tile = renderTile(subj, cov, dotScreen(S, S), S, PALETTES[0], still);
assert.deepEqual(px(tile, 2, 1), hex(INK), 'shadow prints black over the subject color');
assert.deepEqual(px(tile, 2, S - 1), hex(PALETTES[0][1]), 'highlight shows flat subject color');
assert.deepEqual(px(tile, S - 2, 20), hex(PALETTES[0][0]), 'outside subject shows flat ground');

// Ink load: heavy pull covers more than a thin one.
const inked = (t) => { let c = 0; for (let i = 0; i < n; i++) if (t[i * 4] === hex(INK)[0] && t[i * 4 + 1] === hex(INK)[1]) c++; return c; };
const screen = dotScreen(S, S);
assert.ok(inked(renderTile(subj, cov, screen, S, PALETTES[0], { ...still, load: 1.35 })) >
          inked(renderTile(subj, cov, screen, S, PALETTES[0], { ...still, load: 0.7 })), 'heavy ink > thin ink');

// Misregistration: shifting the screen moves the black layer.
const shifted = renderTile(subj, cov, screen, S, PALETTES[0], { ...still, ink: [5, 0] });
assert.notDeepEqual(px(shifted, 2, 1), px(tile, 2, 1), 'offset moves the black');

// Pipeline: four tiles, deterministic per seed, different per seed.
const rgba = new Uint8ClampedArray(n * 4).map((_, i) => (i % 4 === 3 ? 255 : lum[(i / 4) | 0]));
const a = warholize(rgba, mask, S, 7), b = warholize(rgba, mask, S, 7), c = warholize(rgba, mask, S, 8);
assert.equal(a.length, 4);
assert.deepEqual(a[0], b[0], 'same seed → same result');
assert.notDeepEqual(a[0], c[0], 'different seed → different pull');
assert.ok(mulberry32(1)() !== mulberry32(2)());

// Color pairs: each photo gets 4 different pairs from PALETTES (right edge is outside the subject → ground).
const grounds = PALETTES.map(([g]) => hex(g).join());
for (let seed = 1; seed <= 50; seed++) {
  const seen = warholize(rgba, mask, S, seed).map((t) => px(t, S - 1, 20).join());
  assert.ok(seen.every((g) => grounds.includes(g)), 'ground comes from PALETTES');
  assert.equal(new Set(seen).size, 4, 'four different pairs');
}

console.log('filter ok');
