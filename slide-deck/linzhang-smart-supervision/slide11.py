# -*- coding: utf-8 -*-
"""Slide 11: post-approval supervision."""
from slide_usecase import render_use_case


def render():
    sections = [
        ("发现方式", "DISCOVERY", [
            "项目审批红线叠加低空影像",
            "周期性巡查掌握施工进度",
            "结合项目台账推送复核任务",
        ]),
        ("套合判断", "OVERLAY", [
            "是否超出审批红线建设",
            "是否长期闲置未开工",
            "是否擅自改变审批用途",
        ]),
        ("输出成果", "OUTPUT", [
            "批后监管全过程台账",
            "项目施工进度报告",
            "问题项目预警清单",
        ]),
    ]
    chips = [
        "超红线建设",
        "长期闲置",
        "改变用途",
        "批后台账",
    ]
    return render_use_case(
        page=11, kicker="10", scene_no="四",
        title="场景四：建设项目批后监管",
        subtitle="看建设是否按审批范围落地 · 推动批后闭环",
        main_message="看建设是否按审批范围落地，推动批后监管闭环。",
        sections=sections, accent_chips=chips,
        filename="11-slide-post-approval-supervision.png",
    )


if __name__ == "__main__":
    render()
