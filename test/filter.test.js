import assert from 'node:assert/strict';
import { luminance, levels, renderTile, PALETTES } from '../public/filter.js';

// 4×1 image: black, dark gray, light gray, white.
const w = 4, h = 1;
const rgba = new Uint8ClampedArray([0, 0, 0, 255, 80, 80, 80, 255, 170, 170, 170, 255, 255, 255, 255, 255]);
const raw = new Float32Array([0, 80, 170, 255]); // skip blur for exact checks

// No mask: everything is subject, darkest → ink, brightest → highlight.
const lv = levels(raw, null, w, h);
assert.ok(lv[0] <= lv[1] && lv[1] <= lv[2] && lv[2] <= lv[3], 'tones are monotonic');
assert.equal(lv[0], 1, 'darkest is ink');
assert.equal(lv[3], 3, 'brightest is highlight');

// Mask covering half: masked-out pixels become background (0).
const lvMask = levels(raw, new Float32Array([0, 0, 1, 1]), w, h);
assert.deepEqual([...lvMask.slice(0, 2)], [0, 0]);

// Tiny mask (a hand / object): under 5% subject → mask ignored, nothing is background.
const big = 100, bigLum = new Float32Array(big).map((_, i) => i * 2.5), tiny = new Float32Array(big);
tiny[0] = 1;
assert.ok(!levels(bigLum, tiny, big, 1).includes(0), 'tiny mask ignored');

// renderTile: no offset → ink pixel gets ink color; background gets bg color.
const tile = renderTile(new Uint8Array([0, 1, 2, 3]), w, h, PALETTES[0], [0, 0]);
assert.deepEqual([...tile.slice(0, 3)], [0xf7, 0xd2, 0x3e]);
assert.deepEqual([...tile.slice(4, 7)], [0x1b, 0x1b, 0x1b]);
// Offset by 1px: ink shifts right onto pixel 2.
const shifted = renderTile(new Uint8Array([0, 1, 2, 3]), w, h, PALETTES[0], [1, 0]);
assert.deepEqual([...shifted.slice(8, 11)], [0x1b, 0x1b, 0x1b]);

assert.equal(luminance(rgba, w, h).length, 4);
console.log('filter ok');
