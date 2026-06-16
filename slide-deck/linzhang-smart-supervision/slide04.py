# -*- coding: utf-8 -*-
"""Slide 04: four pillars architecture."""
from PIL import ImageDraw
from slide_lib import (
    W, H, WHITE, DEEP, CYAN, DARK, MUTED, BORDER, CARD, OUT_DIR, F,
    make_canvas, title_band, footer, draw_wrapped, text_size,
)


def render():
    img = make_canvas()
    title_band(img, "总体思路：四梁体系",
               "一底座 · 一核心 · 一抓手 · 一闭环", kicker="03")
    d = ImageDraw.Draw(img)

    pillars = [
        ("一 底 座", "时空数据智能开放平台",
         "统一汇聚多源数据，构建县域监管「底账 · 底图 · 底线」。"),
        ("一 核 心", "套合监管系统",
         "对疑似图斑进行多图层套合，自动研判地类、规划、审批、权属属性。"),
        ("一 抓 手", "卫星遥感 + 低空巡查",
         "卫星看全域变化，低空看现场细节，形成主动发现的监管前哨。"),
        ("一 闭 环", "自然资源业务监管流程",
         "从发现、套合、研判、核查到整改归档，形成可追溯的全流程闭环。"),
    ]
    grid_x = 100
    grid_y = 260
    card_w = 850
    card_h = 230
    gap_x = 40
    gap_y = 30
    for i, (kicker, name, body) in enumerate(pillars):
        col = i % 2
        row = i // 2
        x = grid_x + col * (card_w + gap_x)
        y = grid_y + row * (card_h + gap_y)
        d.rounded_rectangle([x, y, x + card_w, y + card_h], radius=20,
                            fill=WHITE, outline=BORDER, width=2)
        # left color band
        d.rounded_rectangle([x, y, x + 14, y + card_h], radius=20, fill=DEEP)
        d.rectangle([x, y, x + 14, y + card_h - 6], fill=DEEP)
        # kicker
        d.text((x + 40, y + 30), kicker, font=F(28, bold=True), fill=CYAN)
        d.text((x + 40, y + 75), name, font=F(36, bold=True), fill=DEEP)
        d.rectangle([x + 40, y + 130, x + 160, y + 134], fill=CYAN)
        draw_wrapped(d, (x + 40, y + 155), body, F(22), DARK,
                     card_w - 80, line_height=36)

    # Bottom flow band
    fy = grid_y + 2 * (card_h + gap_y) + 10
    d.rounded_rectangle([100, fy, W - 100, fy + 160], radius=20,
                        fill=CARD, outline=BORDER, width=2)
    d.text((130, fy + 20), "业务闭环流程", font=F(26, bold=True), fill=DEEP)
    d.rectangle([130, fy + 60, 230, fy + 64], fill=CYAN)

    steps = ["数据汇聚", "智能识别", "疑似图斑", "自动套合",
             "属性研判", "人工核查", "整改复核", "台账归档"]
    sx = 130
    sy = fy + 90
    step_w = 195
    for i, s in enumerate(steps):
        x0 = sx + i * step_w
        d.rounded_rectangle([x0, sy, x0 + step_w - 20, sy + 50],
                            radius=12, fill=WHITE, outline=DEEP, width=2)
        tw, th = text_size(d, s, F(22, bold=True))
        d.text((x0 + (step_w - 20) / 2 - tw / 2, sy + 12),
               s, font=F(22, bold=True), fill=DEEP)
        if i < len(steps) - 1:
            ax = x0 + step_w - 20
            d.polygon([(ax, sy + 18), (ax + 14, sy + 25), (ax, sy + 32)],
                      fill=CYAN)

    footer(img, 4)
    img.save(OUT_DIR / "04-slide-four-pillars.png")
    return "04"


if __name__ == "__main__":
    render()
