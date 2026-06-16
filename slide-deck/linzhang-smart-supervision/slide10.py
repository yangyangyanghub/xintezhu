# -*- coding: utf-8 -*-
"""Slide 10: facility agricultural land."""
from slide_usecase import render_use_case


def render():
    sections = [
        ("发现方式", "DISCOVERY", [
            "低空高分辨率影像识别设施现状",
            "结合备案数据与历史影像比对",
            "日常巡查与举报线索接入",
        ]),
        ("套合判断", "OVERLAY", [
            "是否超出备案范围",
            "是否出现硬化、住人等迹象",
            "是否改变设施农用地用途",
        ]),
        ("输出成果", "OUTPUT", [
            "大棚房等问题台账",
            "前后影像对比",
            "现场核查与整改建议",
        ]),
    ]
    chips = [
        "大棚房风险",
        "超范围硬化",
        "改变用途",
        "问题台账",
    ]
    return render_use_case(
        page=10, kicker="09", scene_no="三",
        title="场景三：设施农用地监管",
        subtitle="防止大棚房 · 超范围 · 擅自改变用途",
        main_message="重点防止大棚房、超备案范围及擅自改变用途行为。",
        sections=sections, accent_chips=chips,
        filename="10-slide-facility-agricultural-land.png",
    )


if __name__ == "__main__":
    render()
