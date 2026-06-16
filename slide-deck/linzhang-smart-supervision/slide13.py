# -*- coding: utf-8 -*-
"""Slide 13: implementation roadmap."""
from PIL import ImageDraw
from slide_lib import (
    W, H, WHITE, DEEP, CYAN, DARK, MUTED, BORDER, CARD, OUT_DIR, F,
    make_canvas, title_band, footer, draw_wrapped, text_size,
)


def render():
    img = make_canvas()
    title_band(img, "实施路径：三步走",
               "先跑示范 · 再扩场景 · 最终成体系", kicker="13  ·  ROADMAP")
    d = ImageDraw.Draw(img)

    # Top message strip
    d.rounded_rectangle([80, 240, W - 80, 320], radius=16,
                        fill=DEEP, outline=DEEP, width=2)
    d.text((110, 260), "实施节奏建议",
           font=F(22, bold=True), fill=CYAN)
    d.text((110, 290), "3 个月见效 → 半年覆盖 → 一年成型",
           font=F(28, bold=True), fill=WHITE)

    # Timeline
    phases = [
        ("第一阶段", "PHASE  01", "违建房监管示范", "前 3 个月", [
            "选取 1-2 个示范乡镇 / 街道",
            "打通低空巡查 + 套合监管流程",
            "形成首批违建闭环案例与汇报材料",
        ]),
        ("第二阶段", "PHASE  02", "五类场景全面铺开", "3-6 个月", [
            "依次接入耕地、违法用地、设施农用地、批后等场景",
            "统一图层与台账，沉淀监管标准与流程",
            "完善「发现 - 套合 - 核查 - 整改」全链路",
        ]),
        ("第三阶段", "PHASE  03", "体系化运营", "6-12 个月", [
            "形成稳定的「平台 + 业务 + 队伍」运营模式",
            "支撑年度卫片整改、上级核查、领导决策",
            "向乡镇下沉，形成全县一体化监管能力",
        ]),
    ]
    ty = 360
    th_total = 540
    tw_total = W - 200
    tx = 100

    # Background card
    d.rounded_rectangle([tx, ty, tx + tw_total, ty + th_total],
                        radius=24, fill=WHITE, outline=BORDER, width=2)

    # Horizontal timeline bar
    bar_y = ty + 90
    d.line([(tx + 100, bar_y), (tx + tw_total - 100, bar_y)],
           fill=DEEP, width=6)

    col_w = (tw_total - 100) / 3
    for i, (name, en, sub, duration, items) in enumerate(phases):
        cx = tx + 100 + col_w * i + col_w / 2
        # node
        d.ellipse([cx - 36, bar_y - 36, cx + 36, bar_y + 36],
                  fill=DEEP, outline=CYAN, width=4)
        s = str(i + 1)
        nf = F(34, bold=True)
        tw, th = text_size(d, s, nf)
        d.text((cx - tw / 2, bar_y - th / 2 - 4), s, font=nf, fill=WHITE)

        # phase card
        cx0 = tx + 60 + col_w * i
        cy0 = bar_y + 80
        cwd = col_w - 30
        chh = th_total - 200
        d.rounded_rectangle([cx0, cy0, cx0 + cwd, cy0 + chh],
                            radius=16, fill=CARD, outline=BORDER, width=2)
        d.text((cx0 + 26, cy0 + 18), en, font=F(20), fill=CYAN)
        d.text((cx0 + 26, cy0 + 46), name, font=F(28, bold=True), fill=DEEP)
        d.text((cx0 + 26, cy0 + 86), sub, font=F(26, bold=True), fill=DARK)
        d.rectangle([cx0 + 26, cy0 + 124, cx0 + 146, cy0 + 128], fill=CYAN)
        # duration chip
        df = F(20, bold=True)
        dw, dh = text_size(d, duration, df)
        d.rounded_rectangle([cx0 + cwd - dw - 50, cy0 + 30,
                             cx0 + cwd - 20, cy0 + 30 + dh + 16],
                            radius=8, fill=DEEP)
        d.text((cx0 + cwd - dw - 35, cy0 + 38), duration, font=df, fill=WHITE)

        iy = cy0 + 150
        for it in items:
            d.ellipse([cx0 + 26, iy + 10, cx0 + 42, iy + 26], fill=CYAN)
            draw_wrapped(d, (cx0 + 56, iy + 4), it, F(20), DARK,
                         cwd - 80, line_height=30)
            # measure lines
            from slide_lib import wrap_lines as _wl
            lc = max(1, len(_wl(d, it, F(20), cwd - 80)))
            iy += 30 * lc + 18

    footer(img, 13)
    img.save(OUT_DIR / "13-slide-implementation-roadmap.png")
    return "13"


if __name__ == "__main__":
    render()
