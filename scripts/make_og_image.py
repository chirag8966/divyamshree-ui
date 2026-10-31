#!/usr/bin/env python3
"""
Build the social share card (public/images/og-cover.jpg) from the hero's first
video frame, so link previews on WhatsApp / Facebook / LinkedIn / X / Slack show
the actual first page of the website.

Pipeline (no third-party deps — PIL is not available on this machine):
  1. Decode public/frames/frame_001.jpg with macOS `sips` -> raw RGB.
  2. Cover-crop to 1200x630 (the 1.91:1 Open Graph ratio).
  3. Composite a bottom scrim + the "Divyam Shree" wordmark and tagline,
     drawn with a hand-rolled 5x7 bitmap font (scaled 4x, nearest neighbour).
  4. Encode a baseline JPEG with `sips`.

Run:  python3 scripts/make_og_image.py
"""

import os
import struct
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "frames", "frame_001.jpg")
OUT = os.path.join(ROOT, "public", "images", "og-cover.jpg")

W, H = 1200, 630

# ---------------------------------------------------------------- bitmap font
# 5x7 glyphs, one string per row, '#' = ink.
FONT = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    "J": ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
    "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
    "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
    ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
    ",": ["00000", "00000", "00000", "00000", "01100", "01100", "01000"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
    "'": ["00100", "00100", "00000", "00000", "00000", "00000", "00000"],
    "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
    ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
    "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
    "·": ["00000", "00000", "00000", "01100", "01100", "00000", "00000"],
}

GLYPH_W, GLYPH_H = 5, 7


def text_width(text, scale, tracking):
    if not text:
        return 0
    return len(text) * (GLYPH_W * scale + tracking) - tracking


def draw_text(buf, text, x, y, scale, color, tracking=None):
    """Blend `text` into the RGB bytearray `buf` at (x, y)."""
    if tracking is None:
        tracking = scale
    r, g, b = color
    cursor = x
    for ch in text.upper():
        glyph = FONT.get(ch, FONT[" "])
        for row in range(GLYPH_H):
            line = glyph[row]
            for col in range(GLYPH_W):
                if line[col] != "#":
                    continue
                px0 = cursor + col * scale
                py0 = y + row * scale
                for dy in range(scale):
                    py = py0 + dy
                    if py < 0 or py >= H:
                        continue
                    base = (py * W) * 3
                    for dx in range(scale):
                        px = px0 + dx
                        if px < 0 or px >= W:
                            continue
                        i = base + px * 3
                        buf[i] = r
                        buf[i + 1] = g
                        buf[i + 2] = b
        cursor += GLYPH_W * scale + tracking
    return cursor


# ------------------------------------------------------------- image helpers
def sips_convert(src, dst, fmt, extra=()):
    cmd = ["sips", "-s", "format", fmt, *extra, src, "--out", dst]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def load_rgb(path):
    """Decode any sips-readable image to a raw RGB bytearray at W x H (cover crop)."""
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, "raw")
        # Resample so the *shorter* side matches, then crop the overflow.
        sips_convert(path, raw, "tiff", ("-Z", str(max(W, H))))
        png = os.path.join(tmp, "full.png")
        sips_convert(raw, png, "png")
        with open(png, "rb") as fh:
            data = fh.read()

    width, height, pixels = decode_png(data)
    return cover_crop(pixels, width, height)


def decode_png(data):
    """Minimal PNG decoder: 8-bit RGB / RGBA, no interlace."""
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "not a PNG"
    pos = 8
    idat = bytearray()
    width = height = depth = color_type = None
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos:pos + 4])
        ctype = data[pos + 4:pos + 8]
        chunk = data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if ctype == b"IHDR":
            width, height, depth, color_type, _, _, interlace = struct.unpack(">IIBBBBB", chunk)
            assert depth == 8 and interlace == 0, "unsupported PNG"
        elif ctype == b"IDAT":
            idat += chunk
        elif ctype == b"IEND":
            break

    channels = {0: 1, 2: 3, 4: 2, 6: 4}[color_type]
    raw = zlib_decompress(bytes(idat))
    stride = width * channels
    out = bytearray(width * height * 3)
    prev = bytearray(stride)
    p = 0
    for y in range(height):
        ftype = raw[p]
        p += 1
        line = bytearray(raw[p:p + stride])
        p += stride
        if ftype == 1:
            for i in range(channels, stride):
                line[i] = (line[i] + line[i - channels]) & 0xFF
        elif ftype == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif ftype == 3:
            for i in range(stride):
                left = line[i - channels] if i >= channels else 0
                line[i] = (line[i] + ((left + prev[i]) >> 1)) & 0xFF
        elif ftype == 4:
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                b = prev[i]
                c = prev[i - channels] if i >= channels else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pred) & 0xFF
        prev = line
        row = y * width * 3
        if channels == 3:
            out[row:row + stride] = line
        elif channels == 4:
            for x in range(width):
                out[row + x * 3:row + x * 3 + 3] = line[x * 4:x * 4 + 3]
        elif channels == 2:
            for x in range(width):
                v = line[x * 2]
                out[row + x * 3:row + x * 3 + 3] = bytes((v, v, v))
        else:
            for x in range(width):
                v = line[x]
                out[row + x * 3:row + x * 3 + 3] = bytes((v, v, v))
    return width, height, out


def zlib_decompress(data):
    import zlib
    return zlib.decompress(data)


def cover_crop(pixels, sw, sh):
    """Scale-to-cover crop of a source buffer into exactly W x H."""
    scale = max(W / sw, H / sh)
    cw, ch = int(round(sw * scale)), int(round(sh * scale))
    off_x, off_y = (cw - W) // 2, (ch - H) // 2
    out = bytearray(W * H * 3)
    for y in range(H):
        sy = min(sh - 1, int((y + off_y) / scale))
        srow = sy * sw * 3
        drow = y * W * 3
        for x in range(W):
            sx = min(sw - 1, int((x + off_x) / scale))
            si = srow + sx * 3
            di = drow + x * 3
            out[di:di + 3] = pixels[si:si + 3]
    return out


def write_png(path, pixels):
    import zlib
    raw = bytearray()
    for y in range(H):
        raw.append(0)
        raw += pixels[y * W * 3:(y + 1) * W * 3]

    def chunk(tag, payload):
        return (struct.pack(">I", len(payload)) + tag + payload
                + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF))

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as fh:
        fh.write(png)


# ------------------------------------------------------------------- compose
def main():
    if not os.path.exists(SRC):
        sys.exit(f"missing source frame: {SRC}")

    buf = load_rgb(SRC)

    # Bottom scrim so the wordmark stays legible over any frame content.
    for y in range(H):
        t = max(0.0, (y - H * 0.42) / (H * 0.58))
        alpha = (t ** 1.35) * 0.86
        if alpha <= 0:
            continue
        row = y * W * 3
        for x in range(W):
            i = row + x * 3
            buf[i] = int(buf[i] * (1 - alpha) + 12 * alpha)
            buf[i + 1] = int(buf[i + 1] * (1 - alpha) + 8 * alpha)
            buf[i + 2] = int(buf[i + 2] * (1 - alpha) + 5 * alpha)

    # Gold hairline above the wordmark block.
    hair_y = 402
    for y in range(hair_y, hair_y + 3):
        row = y * W * 3
        for x in range(96, 96 + 132):
            i = row + x * 3
            buf[i], buf[i + 1], buf[i + 2] = 197, 138, 43

    # Wordmark: "DIVYAM SHREE" — 5x7 glyphs at 9x = 45px cap height.
    draw_text(buf, "DIVYAM SHREE", 96, 432, 9, (255, 252, 246), tracking=18)

    # Tagline: "TEA · COFFEE · MASALA" at 3x = 21px.
    draw_text(buf, "TEA · COFFEE · MASALA", 98, 528, 3, (226, 178, 92), tracking=6)

    # Sub-tagline at 2x = 14px.
    draw_text(buf, "AN INDIAN HOUSE OF TASTE - SINCE 1980", 98, 566, 2,
              (214, 198, 180), tracking=4)

    with tempfile.TemporaryDirectory() as tmp:
        png = os.path.join(tmp, "og.png")
        write_png(png, buf)
        sips_convert(png, OUT, "jpeg", ("-s", "formatOptions", "82"))

    size = os.path.getsize(OUT)
    print(f"wrote {OUT} ({W}x{H}, {size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
