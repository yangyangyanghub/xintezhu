# -*- coding: utf-8 -*-
"""Render slide 01: cover."""
from PIL import Image, ImageDraw
from slide_lib import (
    W, H, WHITE, BG, DEEP, CYAN, DARK, MUTED, BORDER, CARD, ACCENT_LIGHT,
    OUT_DIR, F, text_size,
)


def render():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 1080, H], fill=DEEP)
    for x in range(0, 1080, 60):
        d.line([(x, 0), (x, H)], fill=(30, 110, 190), width=1)
    for y in range(0, H, 60):
        d.line([(0, y), (1080, y)], fill=(30, 110, 190), width=1)
    overlay = Image.new("RGBA", (W, H), (255, 255, 255, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([-400, -300, 800, 900], outline=(0, 166, 214, 70), width=5)
    od.ellipse([-200, -100, 600, 700], outline=(255, 255, 255, 50), width=3)
    od.ellipse([1100, 200, 1900, 1000], outline=(11, 92, 173, 80), width=4)
    od.ellipse([1250, 350, 1750, 850], outline=(0, 166, 214, 100), width=3)
    img.paste(overlay, (0, 0), overlay)

    d.text((90, 200), "智能监管", font=F(28), fill=(150, 210, 245))
    d.text((90, 250), "SMART  SUPERVISION", font=F(20), fill=(120, 190, 230))
    d.rectangle([90, 320, 200, 326], fill=CYAN)

    title_lines = ["临漳县自然资源空天地一体化", "智能监管体系建设思路"]
    y = 360
    for line in title_lines:
        d.text((90, y), line, font=F(54, bold=True), fill=WHITE)
        y += 80

    d.text((90, 580), "以「时空数据智能开放平台 + 套合监管系统 + 卫星遥感 + 低空巡查」",
           font=F(22), fill=ACCENT_LIGHT)
    d.text((90, 615), "支撑县域自然资源精细化监管",
           font=F(22), fill=ACCENT_LIGHT)

    d.text((90, 980), "汇报单位：临漳县自然资源局", font=F(22, bold=True), fill=ACCENT_LIGHT)
    d.text((90, 1015), "汇报版本：图像式汇报版", font=F(20), fill=(160, 200, 230))

    d.text((1180, 200), "Spatiotemporal  ·  Satellite  ·  UAV",
           font=F(22), fill=DEEP)
    d.text((1180, 240), "空  天  地  ·  一  体  化", font=F(40, bold=True), fill=DEEP)

    chips = [("时空底座", DEEP), ("套合监管", DEEP), ("卫星遥感", DEEP), ("低空巡查", DEEP)]
    cy = 360
    for label, color in chips:
        d.rounded_rectangle([1180, cy, 1500, cy + 80], radius=14,
                            fill=WHITE, outline=color, width=3)
        d.text((1210, cy + 22), label, font=F(32, bold=True), fill=color)
        cy += 110

    d.rectangle([1080, H - 60, W, H], fill=DEEP)
    d.text((1180, H - 45),
           "Linzhang  ·  Natural  Resources  ·  Integrated  Supervision",
           font=F(18), fill=ACCENT_LIGHT)

    img.save(OUT_DIR / "01-slide-cover.png")
    return "01"


if __name__ == "__main__":
    render()
