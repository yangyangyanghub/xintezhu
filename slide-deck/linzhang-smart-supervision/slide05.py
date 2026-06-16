# -*- coding: utf-8 -*-
"""Slide 05: spatiotemporal platform."""
from PIL import ImageDraw
from slide_lib import (
    W, H, WHITE, DEEP, CYAN, DARK, MUTED, BORDER, CARD, OUT_DIR, F,
    make_canvas, title_band, footer, draw_wrapped, text_size,
)


def render():
    img = make_canvas()
    title_band(img, "核心能力一：时空数据智能开放平台",
               "统一监管所需的「底账 · 底图 · 底线 · 底数」", kicker="04")
    d = ImageDraw.Draw(img)

    # Left: platform visual stack
    lx, ly = 100, 260
    lw, lh = 720, 660
    d.rounded_rectangle([lx, ly, lx + lw, ly + lh], radius=20,
                        fill=CARD, outline=BORDER, width=2)
    d.text((lx + 30, ly + 28), "平台分层架构", font=F(28, bold=True), fill=DEEP)
    d.rectangle([lx + 30, ly + 68, lx + 130, ly + 72], fill=CYAN)

    layers = [
        ("应用层", "耕地保护 · 违法用地 · 设施农用地 · 批后监管 · 违建监管"),
        ("能力层", "套合监管 · 智能识别 · 变化检测 · 三维取证"),
        ("数据层", "卫星影像 · 低空影像 · 矢量图层 · 业务台账"),
        ("基础设施", "时空数据库 · 服务发布 · 安全权限"),
    ]
    colors = [DEEP, (40, 120, 195), (80, 150, 210), (130, 180, 220)]
    ly_start = ly + 110
    for i, (name, body) in enumerate(layers):
        y = ly_start + i * 130
        d.rounded_rectangle([lx + 30, y, lx + lw - 30, y + 110],
                            radius=14, fill=colors[i], outline=colors[i], width=2)
        d.text((lx + 60, y + 18), name, font=F(28, bold=True), fill=WHITE)
        d.rectangle([lx + 60, y + 62, lx + 160, y + 66], fill=CYAN)
        d.text((lx + 200, y + 22), body, font=F(20), fill=WHITE)
        # description on second line if wraps
        # Already short enough

    # Right: capability cards (3) + data examples
    rx = lx + lw + 40
    rw = W - rx - 80
    cards = [
        ("底账统一", "ACCOUNT", "汇聚审批、执法、调查、规划等业务台账，形成单一数据底账。"),
        ("底图统一", "MAP", "卫星影像、低空影像、地形地貌、专题图层叠加为统一空间底图。"),
        ("底线统一", "RED LINE", "永久基本农田、生态保护红线、城镇开发边界形成监管底线。"),
    ]
    cy = 260
    for kicker, en, body in cards:
        d.rounded_rectangle([rx, cy, rx + rw, cy + 130], radius=18,
                            fill=WHITE, outline=BORDER, width=2)
        d.rounded_rectangle([rx, cy, rx + 12, cy + 130], radius=10, fill=DEEP)
        d.rectangle([rx, cy, rx + 12, cy + 124], fill=DEEP)
        d.text((rx + 40, cy + 18), kicker, font=F(28, bold=True), fill=DEEP)
        d.text((rx + 200, cy + 26), en, font=F(20), fill=CYAN)
        draw_wrapped(d, (rx + 40, cy + 65), body, F(20), DARK,
                     rw - 80, line_height=32)
        cy += 150

    # Data examples panel
    dy = cy + 10
    dh = ly + lh - dy
    d.rounded_rectangle([rx, dy, rx + rw, dy + dh], radius=18,
                        fill=DEEP, outline=DEEP, width=2)
    d.text((rx + 30, dy + 20), "典型数据汇聚", font=F(26, bold=True), fill=WHITE)
    d.rectangle([rx + 30, dy + 60, rx + 130, dy + 64], fill=CYAN)
    items = [
        "国土变更调查", "三调成果", "永久基本农田",
        "国土空间规划", "审批红线", "执法图斑",
        "卫星影像", "无人机影像", "宗地权属",
    ]
    cols = 3
    iw = (rw - 80) / cols
    ih = 70
    sx = rx + 30
    sy = dy + 90
    for idx, name in enumerate(items):
        r = idx // cols
        c = idx % cols
        x0 = sx + c * iw
        y0 = sy + r * (ih + 10)
        d.rounded_rectangle([x0, y0, x0 + iw - 20, y0 + ih],
                            radius=10, fill=WHITE, outline=CYAN, width=2)
        tw, th = text_size(d, name, F(22, bold=True))
        d.text((x0 + (iw - 20) / 2 - tw / 2, y0 + ih / 2 - th / 2 - 4),
               name, font=F(22, bold=True), fill=DEEP)

    footer(img, 5)
    img.save(OUT_DIR / "05-slide-spatiotemporal-platform.png")
    return "05"


if __name__ == "__main__":
    render()
