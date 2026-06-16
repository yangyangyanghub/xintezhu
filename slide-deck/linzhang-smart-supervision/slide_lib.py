# -*- coding: utf-8 -*-
"""Common drawing helpers for the linzhang smart supervision deck."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W, H = 1920, 1080

WHITE = (255, 255, 255)
BG = (247, 251, 255)
DEEP = (11, 92, 173)
CYAN = (0, 166, 214)
DARK = (31, 41, 55)
MUTED = (100, 116, 139)
BORDER = (216, 230, 243)
CARD = (238, 246, 255)
GRID = (220, 232, 246)
ACCENT_LIGHT = (200, 225, 245)

OUT_DIR = Path(__file__).parent
FONT_DIR = "C:/Windows/Fonts"


def F(size, bold=False):
    name = "msyhbd.ttc" if bold else "msyh.ttc"
    return ImageFont.truetype(f"{FONT_DIR}/{name}", size)


def text_size(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def wrap_lines(draw, text, font, max_w):
    lines = []
    cur = ""
    for ch in text:
        if ch == "\n":
            lines.append(cur)
            cur = ""
            continue
        test = cur + ch
        w, _ = text_size(draw, test, font)
        if w > max_w and cur:
            lines.append(cur)
            cur = ch
        else:
            cur = test
    if cur:
        lines.append(cur)
    return lines


def draw_wrapped(d, xy, text, font, fill, max_w, line_height=None):
    lines = wrap_lines(d, text, font, max_w)
    if line_height is None:
        _, h = text_size(d, "M", font)
        line_height = int(h * 1.6)
    x, y = xy
    for ln in lines:
        d.text((x, y), ln, font=font, fill=fill)
        y += line_height
    return y


def make_canvas():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill=BG)
    for x in range(0, W, 80):
        d.line([(x, 0), (x, H)], fill=GRID, width=1)
    for y in range(0, H, 80):
        d.line([(0, y), (W, y)], fill=GRID, width=1)
    overlay = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([-400, -600, 1200, 400], outline=(11, 92, 173, 30), width=4)
    od.ellipse([1300, 700, 2400, 1500], outline=(0, 166, 214, 35), width=3)
    img.paste(overlay, (0, 0), overlay)
    return img


def title_band(img, title, subtitle=None, kicker=None):
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 12], fill=DEEP)
    if kicker:
        d.text((80, 40), kicker, font=F(20), fill=CYAN)
        d.text((80, 75), title, font=F(46, bold=True), fill=DEEP)
        d.rectangle([80, 140, 200, 146], fill=CYAN)
        if subtitle:
            d.text((80, 160), subtitle, font=F(22), fill=MUTED)
    else:
        d.text((80, 60), title, font=F(46, bold=True), fill=DEEP)
        d.rectangle([80, 130, 200, 136], fill=CYAN)
        if subtitle:
            d.text((80, 150), subtitle, font=F(22), fill=MUTED)


def footer(img, page_num):
    d = ImageDraw.Draw(img)
    d.line([(80, H - 60), (W - 80, H - 60)], fill=BORDER, width=2)
    d.text((80, H - 45), "临漳县自然资源空天地一体化智能监管体系", font=F(18), fill=MUTED)
    d.text((W - 220, H - 45), f"-  {page_num:02d}  /  14  -", font=F(18), fill=MUTED)


def rounded_card(d, xy, fill=WHITE, outline=BORDER, radius=18, width=2):
    d.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def number_badge(d, cx, cy, num, radius=34, color=DEEP):
    d.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)
    f = F(28, bold=True)
    s = str(num)
    w, h = text_size(d, s, f)
    d.text((cx - w / 2, cy - h / 2 - 4), s, font=f, fill=WHITE)


def chip(d, xy, text, fill=CARD, outline=DEEP, text_color=DEEP, padding=(18, 10), font=None):
    if font is None:
        font = F(20, bold=True)
    tw, th = text_size(d, text, font)
    x0, y0 = xy
    x1 = x0 + tw + padding[0] * 2
    y1 = y0 + th + padding[1] * 2 + 4
    d.rounded_rectangle([x0, y0, x1, y1], radius=10, fill=fill, outline=outline, width=2)
    d.text((x0 + padding[0], y0 + padding[1]), text, font=font, fill=text_color)
    return x1, y1
