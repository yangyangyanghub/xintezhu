# -*- coding: utf-8 -*-
"""Common use-case slide layout (slides 08-11)."""
from PIL import ImageDraw
from slide_lib import (
    W, H, WHITE, DEEP, CYAN, DARK, MUTED, BORDER, CARD, OUT_DIR, F,
    make_canvas, title_band, footer, draw_wrapped, text_size,
)


def render_use_case(page, kicker, scene_no, title, subtitle,
                    main_message, sections, accent_chips, filename):
    img = make_canvas()
    title_band(img, title, subtitle, kicker=kicker)
    d = ImageDraw.Draw(img)

    # Top message bar
    d.rounded_rectangle([80, 240, W - 80, 330], radius=16,
                        fill=DEEP, outline=DEEP, width=2)
    d.text((110, 258), f"场景 {scene_no}", font=F(22, bold=True), fill=CYAN)
    d.text((110, 290), main_message, font=F(28, bold=True), fill=WHITE)

    # Three section cards
    card_y = 360
    card_h = 480
    card_w = 540
    gap = 40
    total = card_w * 3 + gap * 2
    start_x = (W - total) // 2

    for i, (sec_title, sec_kicker, items) in enumerate(sections):
        x = start_x + i * (card_w + gap)
        d.rounded_rectangle([x, card_y, x + card_w, card_y + card_h],
                            radius=20, fill=WHITE, outline=BORDER, width=2)
        # number
        d.ellipse([x + 30, card_y + 30, x + 90, card_y + 90], fill=DEEP)
        ns = str(i + 1)
        nf = F(30, bold=True)
        nw, nh = text_size(d, ns, nf)
        d.text((x + 60 - nw / 2, card_y + 60 - nh / 2 - 4), ns,
               font=nf, fill=WHITE)
        d.text((x + 110, card_y + 38), sec_title, font=F(30, bold=True), fill=DEEP)
        d.text((x + 110, card_y + 78), sec_kicker, font=F(18), fill=CYAN)
        d.rectangle([x + 30, card_y + 120, x + 150, card_y + 124], fill=CYAN)

        iy = card_y + 150
        for it in items:
            d.ellipse([x + 30, iy + 10, x + 46, iy + 26], fill=CYAN)
            draw_wrapped(d, (x + 60, iy), it, F(22), DARK,
                         card_w - 100, line_height=34)
            # advance by text height
            lines = max(1, len([1 for ln in [it] for c in [ln]]))
            # better: re-measure
            from slide_lib import wrap_lines as _wl
            lc = max(1, len(_wl(d, it, F(22), card_w - 100)))
            iy += 34 * lc + 20

    # Bottom chips
    by = card_y + card_h + 30
    d.rounded_rectangle([80, by, W - 80, by + 110], radius=16,
                        fill=CARD, outline=BORDER, width=2)
    d.text((110, by + 18), "成果形态", font=F(24, bold=True), fill=DEEP)
    d.rectangle([110, by + 56, 200, by + 60], fill=CYAN)
    cx = 280
    for chip_text in accent_chips:
        f = F(22, bold=True)
        tw, th = text_size(d, chip_text, f)
        pad_x = 22
        pad_y = 12
        d.rounded_rectangle([cx, by + 32, cx + tw + pad_x * 2, by + 32 + th + pad_y * 2 + 4],
                            radius=10, fill=WHITE, outline=DEEP, width=2)
        d.text((cx + pad_x, by + 32 + pad_y), chip_text, font=f, fill=DEEP)
        cx += tw + pad_x * 2 + 16

    footer(img, page)
    img.save(OUT_DIR / filename)
    return f"{page:02d}"
