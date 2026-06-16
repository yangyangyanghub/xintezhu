# -*- coding: utf-8 -*-
"""Slide 08: cropland protection."""
from slide_usecase import render_use_case


def render():
    sections = [
        ("发现方式", "DISCOVERY", [
            "卫星变化检测识别新增建设占耕",
            "低空巡查复核地块现状",
            "结合田长制日常巡查线索",
        ]),
        ("套合判断", "OVERLAY", [
            "是否占用耕地图斑",
            "是否占用永久基本农田",
            "是否存在非农化、非粮化风险",
        ]),
        ("输出成果", "OUTPUT", [
            "疑似占耕图斑清单",
            "占用面积、坐标位置统计",
            "影像证据链与现场对比",
        ]),
    ]
    chips = [
        "疑似占耕图斑",
        "面积位置清单",
        "影像证据链",
        "整改台账",
    ]
    return render_use_case(
        page=8, kicker="07", scene_no="一",
        title="场景一：耕地保护监管",
        subtitle="守住耕地红线 · 服务自查整改与上级核查",
        main_message="守住耕地红线，服务自查整改与上级核查任务。",
        sections=sections, accent_chips=chips,
        filename="08-slide-farmland-protection.png",
    )


if __name__ == "__main__":
    render()
