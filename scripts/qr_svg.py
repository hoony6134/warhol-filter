"""Plain QR PNG (from qr.swift: 1-module margin, 40px/module) → pop-art SVG for the admin page.

Every module stays dark ink so phones can scan it; pink and cyan copies are offset behind,
like the filter's misregistered colour layer.
usage: python3 -I scripts/qr_svg.py qr-raw.png public/qr.svg
"""
import sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
img = Image.open(src).convert('L')
MOD = 40
n = img.width // MOD - 2  # strip the 1-module margin CoreImage adds
grid = [[img.getpixel((int((x + 1.5) * MOD), int((y + 1.5) * MOD))) < 128 for x in range(n)] for y in range(n)]
assert n in range(21, 178, 4), f'unexpected QR size {n}'
assert all(grid[y][x] for y, x in [(0, 0), (0, 6), (6, 0), (6, 6)]), 'finder pattern not found'

Q = 4  # quiet zone in modules
size = n + 2 * Q
cells = ''.join(f'<rect x="{x + Q}" y="{y + Q}" width="1" height="1"/>' for y in range(n) for x in range(n) if grid[y][x])
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" shape-rendering="crispEdges">
<rect width="{size}" height="{size}" fill="#fffaf0"/>
<defs><g id="m">{cells}</g></defs>
<use href="#m" fill="#18c3d6" transform="translate(-0.22 0.18)"/>
<use href="#m" fill="#ff4fa0" transform="translate(0.24 -0.16)"/>
<use href="#m" fill="#1b1b1b"/>
</svg>'''
open(out, 'w').write(svg)
print(f'{n}×{n} modules → {out}')
