# -*- coding: utf-8 -*-
"""Slide 07: satellite + low altitude collaboration."""
from PIL import ImageDraw
from slide_lib import (
    W, H, WHITE, DEEP, CYAN, DARK, MUTED, BORDER, CARD, OUT_DIR, F,
    make_canvas, title_band, footer, draw_wrapped, text_size,
)


def render():
    img = make_canvas()
    title_band(img, "核心能力三：卫星 + 低空协同",
               "卫星看全域 · 低空看细节 · 套合判属性 · 平台管闭环",
               kicker="06")
    d = ImageDraw.Draw(img)

    # Two columns
    col_y = 260
    col_h = 480
    col_w = 880
    gap = 40
    left_x = (W - col_w * 2 - gap) // 2

    cols = [
        ("卫星遥感", "SATELLITE  ·  全域", DEEP, [
            ("覆盖全县域", "周期性获取卫星影像，覆盖全县耕地、建设用地、自然资源全要素。"),
            ("变化检测", "对比不同时相影像，自动识别新增建设、地类变化、扰动迹象。"),
            ("疑似图斑", "输出疑似违法、占耕、新增建设图斑，作为低空与现场核查的线索。"),
            ("宏观研判", "支撑县域监管态势分析与上级核查比对。"),
        ]),
        ("低空巡查", "UAV  ·  细节", CYAN, [
            ("高分辨率", "厘米级低空影像，可清晰识别建筑物边界、用途、施工状态。"),
            ("精细核查", "针对疑似图斑进行定点核查，获取多角度、近距离影像证据。"),
            ("三维取证", "倾斜摄影与建模支撑违建房等场景的体量与高度判定。"),
            ("机动响应", "应对突发线索快速出动，弥补卫星周期长、分辨率粗的不足。"),
        ]),
    ]
    for i, (title, en, accent, rows) in enumerate(cols):
        x = left_x + i * (col_w + gap)
        d.rounded_rectangle([x, col_y, x + col_w, col_y + col_h],
                            radius=20, fill=WHITE, outline=BORDER, width=2)
        d.rounded_rectangle([x, col_y, x + col_w, col_y + 80],
                            radius=20, fill=accent)
        d.rectangle([x, col_y + 40, x + col_w, col_y + 80], fill=accent)
        d.text((x + 30, col_y + 18), title, font=F(36, bold=True), fill=WHITE)
        d.text((x + 250, col_y + 32), en, font=F(20), fill=WHITE)
        iy = col_y + 110
        for k, body in rows:
            d.ellipse([x + 30, iy + 8, x + 56, iy + 34], fill=accent, outline=accent)
            d.text((x + 70, iy + 4), k, font=F(24, bold=True), fill=DEEP)
            draw_wrapped(d, (x + 70, iy + 40), body, F(20), DARK,
                         col_w - 100, line_height=32)
            iy += 95

    # Bottom closed-loop flow
    fy = col_y + col_h + 30
    d.rounded_rectangle([100, fy, W - 100, fy + 140], radius=20,
                        fill=DEEP, outline=DEEP, width=2)
    d.text((130, fy + 18), "卫星 + 低空闭环", font=F(26, bold=True), fill=WHITE)
    d.rectangle([130, fy + 58, 230, fy + 62], fill=CYAN)

    steps = ["卫星发现", "疑似图斑", "套合研判", "低空核查", "整改复核", "归档"]
    sx = 130
    sy = fy + 80
    step_w = (W - 260) / len(steps)
    for i, s in enumerate(steps):
        x0 = sx + i * step_w
        d.rounded_rectangle([x0, sy, x0 + step_w - 20, sy + 50],
                            radius=12, fill=WHITE, outline=CYAN, width=2)
        tw, th = text_size(d, s, F(22, bold=True))
        d.text((x0 + (step_w - 20) / 2 - tw / 2, sy + 12),
               s, font=F(22, bold=True), fill=DEEP)
        if i < len(steps) - 1:
            ax = x0 + step_w - 20
            d.polygon([(ax, sy + 18), (ax + 14, sy + 25), (ax, sy + 32)], fill=CYAN)

    footer(img, 7)
    img.save(OUT_DIR / "07-slide-satellite-low-altitude.png")
    return "07"


if __name__ == "__main__":
    render()
