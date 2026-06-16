# -*- coding: utf-8 -*-
"""Slide 06: overlay supervision system."""
from PIL import ImageDraw
from slide_lib import (
    W, H, WHITE, DEEP, CYAN, DARK, MUTED, BORDER, CARD, OUT_DIR, F,
    make_canvas, title_band, footer, draw_wrapped, text_size,
)


def render():
    img = make_canvas()
    title_band(img, "核心能力二：套合监管系统",
               "低空影像发现「现象」，套合系统判断「问题属性」", kicker="05")
    d = ImageDraw.Draw(img)

    # Three-panel top: Input -> Overlay -> Output
    panel_y = 260
    panel_h = 280
    panel_w = 540
    gap = 50
    total = panel_w * 3 + gap * 2
    start_x = (W - total) // 2

    panels = [
        ("输 入", "INPUT", [
            "疑似图斑",
            "低空高分辨率影像",
            "卫星变化检测结果",
        ]),
        ("套 合", "OVERLAY", [
            "地类图层 · 规划图层",
            "审批红线 · 权属图层",
            "执法历史 · 业务台账",
        ]),
        ("输 出", "OUTPUT", [
            "核查清单",
            "责任主体识别",
            "问题属性研判",
        ]),
    ]
    for i, (kicker, en, items) in enumerate(panels):
        x = start_x + i * (panel_w + gap)
        d.rounded_rectangle([x, panel_y, x + panel_w, panel_y + panel_h],
                            radius=20, fill=WHITE, outline=BORDER, width=2)
        d.rounded_rectangle([x, panel_y, x + panel_w, panel_y + 60],
                            radius=20, fill=DEEP)
        d.rectangle([x, panel_y + 30, x + panel_w, panel_y + 60], fill=DEEP)
        d.text((x + 30, panel_y + 14), kicker, font=F(28, bold=True), fill=WHITE)
        d.text((x + 200, panel_y + 22), en, font=F(20), fill=CYAN)
        iy = panel_y + 90
        for it in items:
            d.ellipse([x + 40, iy + 12, x + 56, iy + 28], fill=CYAN)
            d.text((x + 72, iy + 6), it, font=F(24, bold=True), fill=DARK)
            iy += 56
        if i < 2:
            ax = x + panel_w + 6
            d.polygon([(ax, panel_y + panel_h / 2 - 14),
                       (ax + 30, panel_y + panel_h / 2),
                       (ax, panel_y + panel_h / 2 + 14)], fill=DEEP)

    # Bottom: table of overlays
    ty = panel_y + panel_h + 30
    tw_total = W - 200
    tx = 100
    th_total = 280
    d.rounded_rectangle([tx, ty, tx + tw_total, ty + th_total],
                        radius=20, fill=CARD, outline=BORDER, width=2)
    d.text((tx + 30, ty + 18), "关键套合图层", font=F(26, bold=True), fill=DEEP)
    d.rectangle([tx + 30, ty + 58, tx + 150, ty + 62], fill=CYAN)

    rows = [
        ("地类图层", "判断是否占耕、占林、占园"),
        ("规划图层", "判断是否符合国土空间规划用途分区"),
        ("永久基本农田", "判断是否触碰耕地保护红线"),
        ("审批红线", "判断是否在合法审批范围内"),
        ("权属图层", "识别地块责任主体与权利人"),
        ("执法台账", "判断是否为历史已查处问题"),
    ]
    col_w = (tw_total - 60) / 2
    rh = 60
    rx = tx + 30
    ry = ty + 90
    for i, (name, desc) in enumerate(rows):
        c = i % 2
        r = i // 2
        x0 = rx + c * col_w
        y0 = ry + r * rh
        d.rounded_rectangle([x0, y0, x0 + col_w - 20, y0 + 50],
                            radius=10, fill=WHITE, outline=BORDER, width=2)
        d.rectangle([x0, y0, x0 + 10, y0 + 50], fill=CYAN)
        d.text((x0 + 25, y0 + 14), name, font=F(22, bold=True), fill=DEEP)
        d.text((x0 + 200, y0 + 16), desc, font=F(20), fill=DARK)

    footer(img, 6)
    img.save(OUT_DIR / "06-slide-overlay-system.png")
    return "06"


if __name__ == "__main__":
    render()
