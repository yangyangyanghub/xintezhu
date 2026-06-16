# -*- coding: utf-8 -*-
"""Slide 14: closing summary."""
from PIL import ImageDraw
from slide_lib import (
    W, H, WHITE, DEEP, CYAN, DARK, MUTED, BORDER, CARD, OUT_DIR, F,
    make_canvas, title_band, footer, draw_wrapped, text_size,
)


def render():
    img = make_canvas()
    title_band(img, "总结：监管新范式",
               "构建临漳县自然资源智能监管新范式", kicker="14  ·  CLOSING")
    d = ImageDraw.Draw(img)

    # Four capability cards in 2x2
    cards = [
        ("平台底座", "PLATFORM",
         "时空数据智能开放平台统一汇聚多源数据，构建监管底账与底图。"),
        ("智能核心", "OVERLAY  CORE",
         "套合监管系统对疑似图斑自动研判属性，输出可执行核查任务。"),
        ("感知抓手", "SENSING",
         "卫星看全域、低空看细节，主动发现疑似问题与现场证据。"),
        ("业务闭环", "CLOSED  LOOP",
         "覆盖发现、套合、核查、整改、归档全流程，形成可追溯闭环。"),
    ]
    grid_x = 100
    grid_y = 250
    card_w = 850
    card_h = 220
    gap_x = 40
    gap_y = 30
    for i, (name, en, body) in enumerate(cards):
        col = i % 2
        row = i // 2
        x = grid_x + col * (card_w + gap_x)
        y = grid_y + row * (card_h + gap_y)
        d.rounded_rectangle([x, y, x + card_w, y + card_h], radius=20,
                            fill=WHITE, outline=BORDER, width=2)
        d.rounded_rectangle([x, y, x + 14, y + card_h], radius=10, fill=DEEP)
        d.rectangle([x, y, x + 14, y + card_h - 6], fill=DEEP)
        d.text((x + 40, y + 30), name, font=F(36, bold=True), fill=DEEP)
        d.text((x + 40, y + 80), en, font=F(20), fill=CYAN)
        d.rectangle([x + 40, y + 118, x + 160, y + 122], fill=CYAN)
        draw_wrapped(d, (x + 40, y + 140), body, F(22), DARK,
                     card_w - 80, line_height=36)

    # Bottom closing formula band
    fy = grid_y + 2 * (card_h + gap_y) + 5
    band_h = 150
    d.rounded_rectangle([100, fy, W - 100, fy + band_h], radius=20,
                        fill=DEEP, outline=DEEP, width=2)
    d.text((130, fy + 18), "监管心法 · 感谢聆听，请局长指导。",
           font=F(22, bold=True), fill=CYAN)
    d.rectangle([130, fy + 56, 280, fy + 60], fill=CYAN)
    line1 = "卫星看全域  ·  低空看细节"
    line2 = "套合判属性  ·  平台管闭环"
    f1 = F(38, bold=True)
    tw1, _ = text_size(d, line1, f1)
    tw2, _ = text_size(d, line2, f1)
    d.text(((W - tw1) / 2, fy + 50), line1, font=f1, fill=WHITE)
    d.text(((W - tw2) / 2, fy + 96), line2, font=f1, fill=WHITE)

    footer(img, 14)
    img.save(OUT_DIR / "14-slide-closing-summary.png")
    return "14"


if __name__ == "__main__":
    render()
