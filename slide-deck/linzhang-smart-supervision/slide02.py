# -*- coding: utf-8 -*-
"""Slide 02: agenda."""
from PIL import Image, ImageDraw
from slide_lib import (
    W, H, WHITE, DEEP, CYAN, DARK, MUTED, BORDER, CARD, OUT_DIR, F,
    make_canvas, title_band, footer, number_badge, text_size,
)


def render():
    img = make_canvas()
    title_band(img, "汇报目录", "Agenda", kicker="01")
    d = ImageDraw.Draw(img)

    sections = [
        ("01", "建设背景", "监管方式转型与执行力挑战"),
        ("02", "总体思路", "一底座 · 一核心 · 一抓手 · 一闭环"),
        ("03", "核心能力", "时空平台 · 套合监管 · 卫星与低空协同"),
        ("04", "应用场景", "耕地 · 违法用地 · 设施农用地 · 批后 · 违建"),
        ("05", "实施路径", "示范先行 · 场景铺开 · 体系化运营"),
    ]

    left_x = 120
    top_y = 270
    row_h = 130
    for i, (no, name, desc) in enumerate(sections):
        y = top_y + i * row_h
        # number badge
        d.ellipse([left_x, y, left_x + 80, y + 80], fill=DEEP)
        nw, nh = text_size(d, no, F(36, bold=True))
        d.text((left_x + 40 - nw / 2, y + 40 - nh / 2 - 4), no,
               font=F(36, bold=True), fill=WHITE)
        # name
        d.text((left_x + 110, y + 8), name, font=F(36, bold=True), fill=DARK)
        # desc
        d.text((left_x + 110, y + 58), desc, font=F(22), fill=MUTED)
        # cyan tick
        d.rectangle([left_x + 110, y + 50, left_x + 170, y + 54], fill=CYAN)

    # Right visual: vertical flow
    rx = 1280
    ry = 270
    d.rounded_rectangle([rx - 30, ry - 30, rx + 540, ry + 700],
                        radius=24, fill=CARD, outline=BORDER, width=2)
    d.text((rx, ry), "汇报主线", font=F(28, bold=True), fill=DEEP)
    d.rectangle([rx, ry + 42, rx + 80, ry + 46], fill=CYAN)

    flow = ["背景 · 痛点", "总体思路", "核心能力", "应用场景", "实施路径"]
    fy = ry + 80
    for i, item in enumerate(flow):
        # connector
        cx = rx + 50
        d.ellipse([cx - 14, fy + 16, cx + 14, fy + 44], fill=DEEP)
        d.text((rx + 90, fy + 12), item, font=F(28, bold=True), fill=DARK)
        if i < len(flow) - 1:
            d.line([(cx, fy + 44), (cx, fy + 120)], fill=DEEP, width=3)
        fy += 120

    footer(img, 2)
    img.save(OUT_DIR / "02-slide-agenda.png")
    return "02"


if __name__ == "__main__":
    render()
