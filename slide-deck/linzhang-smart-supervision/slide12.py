# -*- coding: utf-8 -*-
"""Slide 12: illegal building supervision (priority demo)."""
from PIL import ImageDraw
from slide_lib import (
    W, H, WHITE, DEEP, CYAN, DARK, MUTED, BORDER, CARD, OUT_DIR, F,
    make_canvas, title_band, footer, draw_wrapped, text_size,
)


def render():
    img = make_canvas()
    title_band(img, "场景五：县城及村庄违建房监管",
               "适合作为体系建设的第一个示范场景", kicker="11")
    d = ImageDraw.Draw(img)

    # Highlight banner
    by = 240
    d.rounded_rectangle([80, by, W - 80, by + 130], radius=16,
                        fill=DEEP, outline=DEEP, width=2)
    d.text((110, by + 22), "示范场景推荐", font=F(22, bold=True), fill=CYAN)
    d.text((110, by + 60), "违建房监管 = 痛点突出 + 见效快 + 风险可控",
           font=F(34, bold=True), fill=WHITE)
    d.text((110, by + 102),
           "建议作为「低空巡查 + 套合监管」体系建设的第一个示范场景。",
           font=F(20), fill=(200, 225, 245))

    # Three "why first" cards
    card_y = 400
    card_h = 320
    card_w = 540
    gap = 40
    total = card_w * 3 + gap * 2
    start_x = (W - total) // 2

    reasons = [
        ("痛 点 突 出", "PAIN POINT", DEEP, [
            "城中村、乡镇集镇新增违建房屡禁不止",
            "群众关切度高，舆情风险较大",
            "日常巡查难以全面覆盖、固定证据",
        ]),
        ("见 效 快", "QUICK WIN", CYAN, [
            "低空高分辨率影像可清晰识别新增建筑",
            "套合系统可快速判定违建属性",
            "示范成效易于量化展示给上级",
        ]),
        ("风 险 可 控", "LOW RISK", DEEP, [
            "示范范围可控、责任主体明确",
            "依托现有执法体系平稳推进",
            "技术路径成熟、落地难度可承受",
        ]),
    ]
    for i, (kicker, en, color, items) in enumerate(reasons):
        x = start_x + i * (card_w + gap)
        d.rounded_rectangle([x, card_y, x + card_w, card_y + card_h],
                            radius=20, fill=WHITE, outline=BORDER, width=2)
        d.rounded_rectangle([x, card_y, x + card_w, card_y + 70],
                            radius=20, fill=color)
        d.rectangle([x, card_y + 35, x + card_w, card_y + 70], fill=color)
        d.text((x + 30, card_y + 14), kicker, font=F(30, bold=True), fill=WHITE)
        d.text((x + 360, card_y + 26), en, font=F(20), fill=WHITE)
        iy = card_y + 100
        for it in items:
            d.ellipse([x + 30, iy + 10, x + 46, iy + 26], fill=color)
            draw_wrapped(d, (x + 60, iy + 4), it, F(22), DARK,
                         card_w - 100, line_height=32)
            iy += 70

    # Bottom output strip
    oy = card_y + card_h + 30
    d.rounded_rectangle([80, oy, W - 80, oy + 130], radius=16,
                        fill=CARD, outline=BORDER, width=2)
    d.text((110, oy + 18), "成果输出", font=F(24, bold=True), fill=DEEP)
    d.rectangle([110, oy + 56, 200, oy + 60], fill=CYAN)
    chips = [
        "新增违建清单",
        "三维取证影像",
        "整改前后对比图",
        "闭环监管台账",
    ]
    cx = 280
    for txt in chips:
        f = F(22, bold=True)
        tw, th = text_size(d, txt, f)
        d.rounded_rectangle([cx, oy + 32, cx + tw + 44, oy + 88],
                            radius=10, fill=WHITE, outline=DEEP, width=2)
        d.text((cx + 22, oy + 48), txt, font=f, fill=DEEP)
        cx += tw + 60

    footer(img, 12)
    img.save(OUT_DIR / "12-slide-illegal-building-demo.png")
    return "12"


if __name__ == "__main__":
    render()
