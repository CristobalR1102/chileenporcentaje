"""Render the app icons from data/comunas.json: continental Chile on the app's brown background.

Usage: python tools/make_icons.py . 0 -37.5   (repo_dir, angle_degrees, split_lat)
No dependencies: scanline polygon fill with 4x supersampling, PNG written with zlib.
"""
import json
import math
import os
import struct
import sys
import zlib

repo = sys.argv[1]
ANGLE = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
SPLIT_LAT = float(sys.argv[3]) if len(sys.argv) > 3 else -33.0  # comunas north of this are "visited"

BG = (0x26, 0x1F, 0x15)        # --card (dark theme)
VISITED = (0x6F, 0xA3, 0x77)   # --green (dark theme)
UNVISITED = (0xD9, 0xCC, 0xA8) # --unvisited-fill (light theme), reads well on brown
SS = 4

with open(os.path.join(repo, "data", "comunas.json"), encoding="utf-8") as fh:
    data = json.load(fh)


def merc(lng, lat):
    return lng, -math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))


features = []  # (color, [rings in projected coords])
for f in data["features"]:
    g = f["geometry"]
    polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
    rings = []
    lat_sum = n = 0
    for p in polys:
        if min(c[0] for c in p[0]) < -76.5:  # skip Rapa Nui / Juan Fernández / Desventuradas
            continue
        for ring in p:
            rings.append([merc(x, y) for x, y in ring])
        for x, y in p[0]:
            lat_sum += y
            n += 1
    if rings:
        features.append((VISITED if lat_sum / n > SPLIT_LAT else UNVISITED, rings))

# Rotate around the shape's center.
pts = [pt for _, rings in features for r in rings for pt in r]
cx = (min(p[0] for p in pts) + max(p[0] for p in pts)) / 2
cy = (min(p[1] for p in pts) + max(p[1] for p in pts)) / 2
a = math.radians(ANGLE)
ca, sa = math.cos(a), math.sin(a)


def rot(p):
    x, y = p[0] - cx, p[1] - cy
    return x * ca - y * sa, x * sa + y * ca


features = [(col, [[rot(p) for p in r] for r in rings]) for col, rings in features]
pts = [pt for _, rings in features for r in rings for pt in r]
minx, maxx = min(p[0] for p in pts), max(p[0] for p in pts)
miny, maxy = min(p[1] for p in pts), max(p[1] for p in pts)


def render(size, content):
    """content: fraction of the icon side the shape's bounding box may occupy."""
    W = size * SS
    scale = content * W / max(maxx - minx, maxy - miny)
    ox = W / 2 - (minx + maxx) / 2 * scale
    oy = W / 2 - (miny + maxy) / 2 * scale
    canvas = [bytearray(bytes(BG) * W) for _ in range(W)]
    for col, rings in features:
        edges = []
        for r in rings:
            sp = [(x * scale + ox, y * scale + oy) for x, y in r]
            for i in range(len(sp) - 1):
                (x0, y0), (x1, y1) = sp[i], sp[i + 1]
                if y0 != y1:
                    edges.append((x0, y0, x1, y1))
        if not edges:
            continue
        ylo = max(0, int(min(min(e[1], e[3]) for e in edges)))
        yhi = min(W - 1, int(max(max(e[1], e[3]) for e in edges)) + 1)
        px = bytes(col)
        for row in range(ylo, yhi + 1):
            yc = row + 0.5
            xs = []
            for x0, y0, x1, y1 in edges:
                if (y0 <= yc < y1) or (y1 <= yc < y0):
                    xs.append(x0 + (yc - y0) * (x1 - x0) / (y1 - y0))
            xs.sort()
            line = canvas[row]
            for i in range(0, len(xs) - 1, 2):  # even-odd: handles holes
                s = max(0, math.ceil(xs[i] - 0.5))
                e = min(W - 1, math.ceil(xs[i + 1] - 0.5) - 1)
                if e >= s:
                    line[s * 3:(e + 1) * 3] = px * (e - s + 1)
    # Downsample (box filter) to the final size.
    out = []
    n = SS * SS
    for oy_ in range(size):
        rows = canvas[oy_ * SS:(oy_ + 1) * SS]
        line = bytearray(size * 3)
        for ox_ in range(size):
            base = ox_ * SS * 3
            for ch in range(3):
                t = 0
                for r in rows:
                    t += sum(r[base + ch:base + SS * 3:3])
                line[ox_ * 3 + ch] = t // n
        out.append(bytes(line))
    return out


def write_png(path, rows):
    h, w = len(rows), len(rows[0]) // 3
    raw = b"".join(b"\x00" + r for r in rows)

    def chunk(tag, body):
        return struct.pack(">I", len(body)) + tag + body + struct.pack(">I", zlib.crc32(tag + body) & 0xFFFFFFFF)

    with open(path, "wb") as fh:
        fh.write(b"\x89PNG\r\n\x1a\n")
        fh.write(chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)))
        fh.write(chunk(b"IDAT", zlib.compress(raw, 9)))
        fh.write(chunk(b"IEND", b""))


out_dir = os.path.join(repo, "icons")
os.makedirs(out_dir, exist_ok=True)
for name, size, content in [
    ("icon-512.png", 512, 0.86),
    ("icon-192.png", 192, 0.86),
    ("icon-maskable-512.png", 512, 0.72),  # stays inside the 80% safe-zone circle
    ("apple-touch-icon.png", 180, 0.80),
]:
    write_png(os.path.join(out_dir, name), render(size, content))
    print("wrote", name)
