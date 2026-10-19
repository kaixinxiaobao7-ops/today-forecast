#!/usr/bin/env python3
"""Generate static brand images (icons + Open Graph card) for 星签."""
from __future__ import annotations

import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

SONGTI = "/System/Library/Fonts/Supplemental/Songti.ttc"
PINGFANG = "/System/Library/Fonts/PingFang.ttc"
SYMBOLS = "/System/Library/Fonts/Apple Symbols.ttf"

GOLD = (230, 199, 141)
GOLD_BRIGHT = (247, 232, 198)
GOLD_DEEP = (185, 139, 74)
TEXT = (243, 238, 228)
MUTED = (163, 169, 187)

GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"]


def font(path: str, size: int, index: int = 0) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size, index=index)


def gradient_base(w: int, h: int) -> Image.Image:
    """Deep navy vertical gradient with soft blue/purple/gold radial glows."""
    yy, xx = np.mgrid[0:h, 0:w]
    y = yy / max(h - 1, 1)
    x = xx / max(w - 1, 1)
    t = np.clip(x * 0.18 + y * 0.82, 0, 1)
    top = np.array([12, 17, 36], dtype=np.float32)
    bottom = np.array([6, 8, 15], dtype=np.float32)
    arr = top + (bottom - top) * t[..., None]

    glows = [
        (w * 0.76, h * -0.05, w * 0.62, np.array([48, 66, 128]), 0.42),
        (w * 0.08, h * 0.55, w * 0.50, np.array([72, 44, 100]), 0.26),
        (w * 0.50, h * 0.46, w * 0.55, np.array([90, 70, 38]), 0.10),
    ]
    for cx, cy, radius, color, strength in glows:
        dist = np.sqrt(((xx - cx) / radius) ** 2 + ((yy - cy) / radius) ** 2)
        alpha = np.clip(1 - dist, 0, 1) ** 2 * strength
        arr = arr * (1 - alpha[..., None]) + color * alpha[..., None]

    # subtle vignette
    vignette = np.clip(1 - (((xx - w / 2) / (w * 0.78)) ** 2 + ((yy - h / 2) / (h * 0.78)) ** 2), 0, 1)
    arr *= (0.82 + 0.18 * vignette)[..., None]
    return Image.fromarray(np.uint8(np.clip(arr, 0, 255)), "RGB")


def add_stars(img: Image.Image, count: int, seed: int = 7) -> None:
    w, h = img.size
    rng = random.Random(seed)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _ in range(count):
        x, y = rng.random() * w, rng.random() * h
        r = rng.uniform(0.4, 1.7) * (w / 1200)
        a = int(rng.uniform(25, 165))
        warm = rng.random() > 0.84
        color = (230, 199, 141, a) if warm else (221, 228, 246, a)
        d.ellipse((x - r, y - r, x + r, y + r), fill=color)
        if r > 1.35:
            d.ellipse((x - r * 3, y - r * 3, x + r * 3, y + r * 3), fill=(230, 199, 141, int(a * 0.12)))
    img.alpha_composite(layer) if img.mode == "RGBA" else img.paste(layer, (0, 0), layer)


def sparkle_points(cx: float, cy: float, radius: float) -> list[tuple[float, float]]:
    k = radius * 0.17
    return [
        (cx, cy - radius),
        (cx + k, cy - k),
        (cx + radius, cy),
        (cx + k, cy + k),
        (cx, cy + radius),
        (cx - k, cy + k),
        (cx - radius, cy),
        (cx - k, cy - k),
    ]


def paste_gradient_polygon(img: Image.Image, points, top_color, bottom_color, bbox) -> None:
    x0, y0, x1, y1 = bbox
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    grad = Image.new("RGB", (1, max(y1 - y0, 1)))
    gd = ImageDraw.Draw(grad)
    for i in range(grad.height):
        t = i / max(grad.height - 1, 1)
        color = tuple(int(top_color[j] + (bottom_color[j] - top_color[j]) * t) for j in range(3))
        gd.line((0, i, 1, i), fill=color)
    grad = grad.resize(img.size)
    img.paste(grad, (0, 0), mask)


def draw_tracked(draw: ImageDraw.ImageDraw, xy, text, fnt, fill, spacing=0, anchor="left"):
    x, y = xy
    widths = [draw.textlength(ch, font=fnt) for ch in text]
    total = sum(widths) + spacing * (len(text) - 1)
    if anchor == "center":
        x -= total / 2
    elif anchor == "right":
        x -= total
    for ch, width in zip(text, widths):
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += width + spacing


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def make_icon(size: int = 512, maskable: bool = False) -> Image.Image:
    s = 1024
    img = gradient_base(s, s).convert("RGBA")
    add_stars(img, 70, seed=11 if maskable else 5)

    overlay = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    cx = cy = s / 2
    if maskable:
        outer, dashed, star_r = 500, 415, 290
    else:
        outer, dashed, star_r = 600, 510, 320

    # glow
    glow = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((cx - 420, cy - 420, cx + 420, cy + 420), fill=(230, 199, 141, 40))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    img.alpha_composite(glow)

    d.ellipse((cx - outer, cy - outer, cx + outer, cy + outer), outline=(230, 199, 141, 66), width=3)
    d.ellipse((cx - dashed, cy - dashed, cx + dashed, cy + dashed), outline=(230, 199, 141, 54), width=2)
    # dashed ring
    for i in range(36):
        import math

        a0 = math.radians(i * 10)
        a1 = math.radians(i * 10 + 5)
        r = dashed
        d.arc((cx - r, cy - r, cx + r, cy + r), i * 10, i * 10 + 4, fill=(230, 199, 141, 96), width=3)
    img.alpha_composite(overlay)

    # star
    star = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    sm = Image.new("L", (s, s), 0)
    ImageDraw.Draw(sm).polygon(sparkle_points(cx, cy, star_r), fill=255)
    grad = Image.new("RGB", (s, s))
    gd = ImageDraw.Draw(grad)
    for i in range(s):
        t = i / (s - 1)
        color = tuple(int(GOLD_BRIGHT[j] + (GOLD_DEEP[j] - GOLD_BRIGHT[j]) * t) for j in range(3))
        gd.line((0, i, s, i), fill=color)
    star.paste(grad, (0, 0), sm)
    img.alpha_composite(star)

    d = ImageDraw.Draw(img)
    core = 58 if maskable else 66
    d.ellipse((cx - core, cy - core, cx + core, cy + core), fill=(9, 12, 22, 255))
    d.ellipse((cx - core * 0.42, cy - core * 0.42, cx + core * 0.42, cy + core * 0.42), fill=(*GOLD_BRIGHT, 255))

    if not maskable:
        img.putalpha(rounded_mask(s, 220))
    return img.resize((size, size), Image.LANCZOS)


def make_og() -> Image.Image:
    w, h = 1200, 630
    img = gradient_base(w, h).convert("RGBA")
    add_stars(img, 150, seed=23)

    d = ImageDraw.Draw(img)
    # border
    d.rectangle((30, 30, w - 31, h - 31), outline=(230, 199, 141, 70), width=2)
    d.rectangle((40, 40, w - 41, h - 41), outline=(230, 199, 141, 28), width=1)

    # brand
    d.polygon(sparkle_points(104, 100, 13), fill=(*GOLD, 255))
    draw_tracked(d, (128, 82), "星签", font(SONGTI, 30, 1), (*TEXT, 255), 4)
    draw_tracked(d, (210, 92), "STARSIGN", font(PINGFANG, 12, 3), (*MUTED, 220), 3)

    # date
    import datetime

    now = datetime.date.today()
    draw_tracked(d, (96, 156), f"{now.year}.{now.month:02d}.{now.day:02d}  ·  每日星象", font(PINGFANG, 16, 2), (*MUTED, 235), 1)

    # headline
    d.text((92, 202), "今日星座运势", font=font(SONGTI, 82, 1), fill=(*TEXT, 255))
    d.text((96, 318), "抬头看星，也看看自己", font=font(SONGTI, 34, 3), fill=(*GOLD_BRIGHT, 245))

    # divider + tags
    d.line((96, 402, 590, 402), fill=(*GOLD, 120), width=1)
    draw_tracked(d, (96, 432), "十二星座  ·  四维解读  ·  今日运势签", font(PINGFANG, 18, 2), (*MUTED, 240), 1)

    # wheel
    cx, cy, r = 900, 318, 190
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(230, 199, 141, 74), width=2)
    d.ellipse((cx - r + 18, cy - r + 18, cx + r - 18, cy + r - 18), outline=(230, 199, 141, 40), width=1)
    inner = 118
    d.ellipse((cx - inner, cy - inner, cx + inner, cy + inner), fill=(11, 15, 28, 230), outline=(230, 199, 141, 70), width=1)
    d.ellipse((cx - inner + 16, cy - inner + 16, cx + inner - 16, cy + inner - 16), outline=(230, 199, 141, 38), width=1)

    import math

    glyph_font = font(SYMBOLS, 30)
    for i, glyph in enumerate(GLYPHS):
        angle = math.radians(-90 + i * 30)
        gx = cx + (r - 36) * math.cos(angle)
        gy = cy + (r - 36) * math.sin(angle)
        d.text((gx, gy), glyph, font=glyph_font, fill=(*GOLD, 245), anchor="mm")
        # ticks
        a = math.radians(i * 30)
        d.line(
            (
                cx + (r + 8) * math.cos(a),
                cy + (r + 8) * math.sin(a),
                cx + (r + 16) * math.cos(a),
                cy + (r + 16) * math.sin(a),
            ),
            fill=(230, 199, 141, 90),
            width=1,
        )

    d.text((cx, cy - 18), "签", font=font(SONGTI, 76, 1), fill=(*GOLD_BRIGHT, 255), anchor="mm")
    draw_tracked(d, (cx, cy + 54), "今日一签", font(PINGFANG, 13, 3), (*MUTED, 235), 3, anchor="center")

    # footer
    draw_tracked(d, (96, 560), "STARSIGN.DAILY  ·  抬头看星，也看看自己", font(PINGFANG, 12, 2), (*MUTED, 180), 2)
    draw_tracked(d, (w - 96, 560), "仅供娱乐参考", font(PINGFANG, 12, 2), (*MUTED, 180), 2, anchor="right")
    return img.convert("RGB")


def main() -> None:
    icon = make_icon(1024, maskable=False)
    icon.resize((512, 512), Image.LANCZOS).save(OUT / "icon-512.png", optimize=True)
    icon.resize((192, 192), Image.LANCZOS).save(OUT / "icon-192.png", optimize=True)
    icon.resize((180, 180), Image.LANCZOS).save(OUT / "apple-touch-icon.png", optimize=True)
    maskable = make_icon(1024, maskable=True)
    maskable.resize((512, 512), Image.LANCZOS).save(OUT / "icon-maskable-512.png", optimize=True)
    make_og().save(OUT / "og.png", optimize=True, quality=92)
    print("generated:", ", ".join(sorted(p.name for p in OUT.glob("*.png"))))


if __name__ == "__main__":
    main()
