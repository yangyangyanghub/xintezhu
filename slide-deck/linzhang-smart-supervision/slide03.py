# -*- coding: utf-8 -*-
"""Slide 03: background - supervision transformation."""
from PIL import ImageDraw
from slide_lib import (
    W, H, WHITE, DEEP, CYAN, DARK, MUTED, BORDER, CARD, OUT_DIR, F,
    make_canvas, title_band, footer, draw_wrapped, text_size,
)


def render():
    img = make_canvas()
    title_band(img, "建设背景：监管方式转型",
               "从「人工找问题」转向「空天地协同发现问题」", kicker="02")
    d = ImageDraw.Draw(img)

    # Top message strip
    d.rounded_rectangle([80, 240, W - 80, 320], radius=16,
                        fill=CARD, outline=BORDER, width=2)
    d.text((110, 260),
           "自然资源监管正在从 “人工找问题” 转向 “空天地协同发现问题”，",
           font=F(26, bold=True), fill=DEEP)
    d.text((110, 290),
           "县级层面亟需统一的智能监管能力。",
           font=F(22), fill=DARK)

    # Three problem cards
    cards = [
        ("面太广", "AREA WIDE",
         "乡镇执法力量有限，难以覆盖全县范围内的耕地、林地、村庄、建设用地等监管面。"),
        ("发现慢", "SLOW DISCOVERY",
         "问题往往等到群众举报、上级督查或卫片下发后才发现，被动应对、整改滞后。"),
        ("判断难", "HARD JUDGEMENT",
         "现场难以快速判断地类、审批、权属及责任主体，问题定性需要反复跑台账。"),
    ]
    card_w = 540
    gap = 40
    total = card_w * 3 + gap * 2
    start_x = (W - total) // 2
    card_y = 360
    card_h = 380
    for i, (title, en, body) in enumerate(cards):
        x = start_x + i * (card_w + gap)
        d.rounded_rectangle([x, card_y, x + card_w, card_y + card_h],
                            radius=20, fill=WHITE, outline=BORDER, width=2)
        # top color bar
        d.rounded_rectangle([x, card_y, x + card_w, card_y + 12],
                            radius=20, fill=DEEP)
        d.rectangle([x, card_y + 6, x + card_w, card_y + 12], fill=DEEP)
        # icon circle
        d.ellipse([x + 40, card_y + 50, x + 110, card_y + 120], fill=CARD,
                  outline=DEEP, width=3)
        nf = F(34, bold=True)
        s = str(i + 1)
        tw, th = text_size(d, s, nf)
        d.text((x + 75 - tw / 2, card_y + 85 - th / 2 - 2), s, font=nf, fill=DEEP)
        # title
        d.text((x + 130, card_y + 56), title, font=F(38, bold=True), fill=DARK)
        d.text((x + 130, card_y + 108), en, font=F(18), fill=CYAN)
        d.rectangle([x + 40, card_y + 150, x + 110, card_y + 154], fill=CYAN)
        # body
        draw_wrapped(d, (x + 40, card_y + 180), body,
                     F(22), DARK, card_w - 80, line_height=38)

    # Executive concerns strip
    cy = card_y + card_h + 40
    d.rounded_rectangle([80, cy, W - 80, cy + 130], radius=16,
                        fill=DEEP, outline=DEEP, width=2)
    d.text((110, cy + 22), "局长关切", font=F(26, bold=True), fill=WHITE)
    d.rectangle([110, cy + 60, 200, cy + 64], fill=CYAN)
    concerns = ["数据能否汇聚", "属性能否快判", "问题能否闭环"]
    cx = 360
    for txt in concerns:
        d.rounded_rectangle([cx, cy + 30, cx + 360, cy + 100],
                            radius=14, fill=WHITE, outline=CYAN, width=2)
        d.text((cx + 30, cy + 50), "? ", font=F(28, bold=True), fill=CYAN)
        d.text((cx + 70, cy + 50), txt, font=F(26, bold=True), fill=DEEP)
        cx += 400

    footer(img, 3)
    img.save(OUT_DIR / "03-slide-background.png")
    return "03"


if __name__ == "__main__":
    render()
