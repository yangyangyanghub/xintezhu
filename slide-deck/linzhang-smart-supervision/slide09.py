# -*- coding: utf-8 -*-
"""Slide 09: illegal land use."""
from slide_usecase import render_use_case


def render():
    sections = [
        ("发现方式", "DISCOVERY", [
            "新增建设变化图斑自动识别",
            "低空巡查发现现场异常",
            "结合群众举报与日常线索",
        ]),
        ("套合判断", "OVERLAY", [
            "比对审批红线与规划用途",
            "识别超范围建设、少批多占",
            "判断是否未批先建、违规占地",
        ]),
        ("输出成果", "OUTPUT", [
            "未批先建问题清单",
            "少批多占问题清单",
            "违法占地结构化执法清单",
        ]),
    ]
    chips = [
        "未批先建",
        "少批多占",
        "违法占地",
        "执法清单",
    ]
    return render_use_case(
        page=9, kicker="08", scene_no="二",
        title="场景二：违法用地监管",
        subtitle="把零散违法线索变成结构化执法清单",
        main_message="把零散违法线索沉淀为结构化、可执行的执法清单。",
        sections=sections, accent_chips=chips,
        filename="09-slide-illegal-land-use.png",
    )


if __name__ == "__main__":
    render()
