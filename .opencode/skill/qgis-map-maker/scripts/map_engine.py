# -*- coding: utf-8 -*-
"""
QGIS 核心制图引擎 - 基于 PyQGIS 的自动化地图生成
用法:
  python-qgis-ltr.bat scripts/map_engine.py \\
    --data 数据目录 \\
    --layers 图层名,逗号分隔 \\
    --template water
"""

import os
import sys
import glob
import argparse
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

# 必须先初始化 QgsApplication（在 import 任何 qgis.core 符号之前不需要，但必须在 import Qgs* 之后）

# 必须先初始化 QgsApplication，再 import qgis.core 中其他符号
from qgis.core import QgsApplication
_qgs = QgsApplication([], False)
_qgs.initQgis()

from qgis.core import (
    QgsProject, QgsVectorLayer,
    QgsFillSymbol, QgsLineSymbol, QgsMarkerSymbol, QgsSingleSymbolRenderer,
    QgsPrintLayout, QgsLayoutItemMap, QgsLayoutItemLabel,
    QgsLayoutItemLegend, QgsLayoutItemScaleBar, QgsLayoutItemPicture,
    QgsLayoutExporter, QgsLayoutPoint, QgsLayoutSize, QgsLayoutMeasurement,
    QgsUnitTypes, QgsRectangle, QgsLayoutItemMapGrid,
    QgsPalLayerSettings, QgsTextFormat, QgsTextBufferSettings,
    QgsVectorLayerSimpleLabeling,
)
from PyQt5.QtGui import QColor, QFont
from PyQt5.QtCore import Qt

# ======================== 模板定义 ========================
TEMPLATES = {
    # ----- 基础类 -----
    "water": {
        "title": "水 系 地 图",
        "styles": {
            "polygon": {"color": "100,180,255,200", "outline_color": "25,100,200", "outline_width": "0.5"},
            "line":     {"color": "65,105,225", "width": "0.8", "capstyle": "round"},
            "point":    {"color": "50,50,50", "size": "2.5", "outline_color": "255,255,255", "outline_width": "0.5"},
        },
        "label": {"font_family": "Microsoft YaHei", "font_size": 9, "color": "30,30,30",
                   "buffer_color": "255,255,255", "buffer_size": 0.8},
    },
    "admin": {
        "title": "行 政 区 划 图",
        "styles": {
            "polygon": {"color": "255,248,220,200", "outline_color": "139,115,85", "outline_width": "0.6"},
            "line":     {"color": "169,169,169", "width": "0.4", "capstyle": "square"},
            "point":    {"color": "200,0,0", "size": "3.0", "outline_color": "255,255,255", "outline_width": "0.8"},
        },
        "label": {"font_family": "Microsoft YaHei", "font_size": 10, "color": "20,20,20",
                   "buffer_color": "255,255,255", "buffer_size": 1.0},
    },
    "transport": {
        "title": "交 通 路 网 图",
        "styles": {
            "polygon": {"color": "245,245,245,80", "outline_color": "200,200,200", "outline_width": "0.3"},
            "line":     {"color": "100,100,100", "width": "0.5", "capstyle": "round"},
            "point":    {"color": "255,140,0", "size": "3.0", "outline_color": "50,50,50", "outline_width": "0.5"},
        },
        "label": {"font_family": "Microsoft YaHei", "font_size": 8, "color": "50,50,50",
                   "buffer_color": "255,255,255", "buffer_size": 0.6},
    },
    "minimal": {
        "title": "地 图",
        "styles": {
            "polygon": {"color": "240,240,240,100", "outline_color": "60,60,60", "outline_width": "0.5"},
            "line":     {"color": "80,80,80", "width": "0.5", "capstyle": "round"},
            "point":    {"color": "0,0,0", "size": "2.0", "outline_color": "255,255,255", "outline_width": "0.5"},
        },
        "label": {"font_family": "SimSun", "font_size": 8, "color": "0,0,0",
                   "buffer_color": "255,255,255", "buffer_size": 0.5},
    },
    # ----- 自然地理类 -----
    "landuse": {
        "title": "土 地 利 用 图",
        "styles": {
            "polygon": {"color": "144,238,144,180", "outline_color": "34,139,34", "outline_width": "0.5"},
            "line":     {"color": "139,69,19", "width": "0.4", "capstyle": "square"},
            "point":    {"color": "255,69,0", "size": "2.5", "outline_color": "255,255,255", "outline_width": "0.5"},
        },
        "label": {"font_family": "Microsoft YaHei", "font_size": 8, "color": "34,34,34",
                   "buffer_color": "255,255,255", "buffer_size": 0.6},
    },
    "geology": {
        "title": "地 质 图",
        "styles": {
            "polygon": {"color": "210,180,140,180", "outline_color": "160,82,45", "outline_width": "0.6"},
            "line":     {"color": "160,82,45", "width": "0.6", "capstyle": "square"},
            "point":    {"color": "139,0,0", "size": "3.0", "outline_color": "255,255,255", "outline_width": "0.8"},
        },
        "label": {"font_family": "Microsoft YaHei", "font_size": 8, "color": "60,40,20",
                   "buffer_color": "255,255,255", "buffer_size": 0.6},
    },
    "vegetation": {
        "title": "植 被 覆 盖 图",
        "styles": {
            "polygon": {"color": "50,205,50,150", "outline_color": "0,100,0", "outline_width": "0.5"},
            "line":     {"color": "139,195,74", "width": "0.8", "capstyle": "round"},
            "point":    {"color": "0,128,0", "size": "2.5", "outline_color": "255,255,255", "outline_width": "0.5"},
        },
        "label": {"font_family": "Microsoft YaHei", "font_size": 8, "color": "20,60,20",
                   "buffer_color": "255,255,255", "buffer_size": 0.6},
    },
    # ----- 人文经济类 -----
    "population": {
        "title": "人 口 分 布 图",
        "styles": {
            "polygon": {"color": "255,182,193,180", "outline_color": "199,21,133", "outline_width": "0.5"},
            "line":     {"color": "200,200,200", "width": "0.3"},
            "point":    {"color": "199,21,133", "size": "3.5", "outline_color": "255,255,255", "outline_width": "0.8"},
        },
        "label": {"font_family": "Microsoft YaHei", "font_size": 8, "color": "80,20,60",
                   "buffer_color": "255,255,255", "buffer_size": 0.6},
    },
    "economy": {
        "title": "经 济 分 布 图",
        "styles": {
            "polygon": {"color": "255,215,0,150", "outline_color": "184,134,11", "outline_width": "0.5"},
            "line":     {"color": "200,200,200", "width": "0.3"},
            "point":    {"color": "218,165,32", "size": "3.0", "outline_color": "255,255,255", "outline_width": "0.5"},
        },
        "label": {"font_family": "Microsoft YaHei", "font_size": 8, "color": "50,30,0",
                   "buffer_color": "255,255,255", "buffer_size": 0.6},
    },
    # ----- 规划工程类 -----
    "planning": {
        "title": "空 间 规 划 图",
        "styles": {
            "polygon": {"color": "221,160,221,150", "outline_color": "148,0,211", "outline_width": "0.8"},
            "line":     {"color": "148,0,211", "width": "0.6", "capstyle": "square"},
            "point":    {"color": "148,0,211", "size": "3.0", "outline_color": "255,255,255", "outline_width": "0.5"},
        },
        "label": {"font_family": "Microsoft YaHei", "font_size": 8, "color": "75,0,130",
                   "buffer_color": "255,255,255", "buffer_size": 0.6},
    },
    "environment": {
        "title": "环 境 评 价 图",
        "styles": {
            "polygon": {"color": "144,238,144,150", "outline_color": "255,69,0", "outline_width": "0.6"},
            "line":     {"color": "200,200,200", "width": "0.3"},
            "point":    {"color": "255,0,0", "size": "3.0", "outline_color": "255,255,255", "outline_width": "0.8"},
        },
        "label": {"font_family": "Microsoft YaHei", "font_size": 8, "color": "30,30,30",
                   "buffer_color": "255,255,255", "buffer_size": 0.6},
    },
    # ----- 特殊用途 -----
    "heatmap": {
        "title": "专 题 统 计 图",
        "styles": {
            "polygon": {"color": "255,100,50,200", "outline_color": "180,20,20", "outline_width": "0.4"},
            "line":     {"color": "200,200,200", "width": "0.3"},
            "point":    {"color": "220,20,60", "size": "3.0", "outline_color": "255,255,255", "outline_width": "0.5"},
        },
        "label": {"font_family": "Microsoft YaHei", "font_size": 8, "color": "30,30,30",
                   "buffer_color": "255,255,255", "buffer_size": 0.5},
    },
    "military": {
        "title": "军 事 地 形 图",
        "styles": {
            "polygon": {"color": "107,142,35,120", "outline_color": "85,107,47", "outline_width": "0.6"},
            "line":     {"color": "85,107,47", "width": "0.5", "capstyle": "square"},
            "point":    {"color": "0,0,0", "size": "2.5", "outline_color": "255,255,255", "outline_width": "0.5"},
        },
        "label": {"font_family": "SimHei", "font_size": 8, "color": "0,0,0",
                   "buffer_color": "255,255,255", "buffer_size": 0.5},
    },
    "nautical": {
        "title": "航 海 图",
        "styles": {
            "polygon": {"color": "173,216,230,180", "outline_color": "0,0,139", "outline_width": "0.5"},
            "line":     {"color": "0,0,139", "width": "0.5", "capstyle": "round"},
            "point":    {"color": "255,0,0", "size": "3.0", "outline_color": "0,0,0", "outline_width": "0.5"},
        },
        "label": {"font_family": "Microsoft YaHei", "font_size": 8, "color": "0,0,80",
                   "buffer_color": "255,255,255", "buffer_size": 0.6},
    },
}

# 画幅预设
PAPER_SIZES = {
    "a4v": (210, 297),
    "a4h": (297, 210),
    "a3v": (297, 420),
    "a3h": (420, 297),
}

def log(msg):
    print(msg)
    sys.stdout.flush()

def find_label_field(layer):
    """智能查找标注字段"""
    candidates = ["NAME", "name", "名称", "市名", "NAME_CHN", "县名", "省名"]
    for f in layer.fields():
        if f.name() in candidates:
            return f.name()
    for f in layer.fields():
        if f.type() == 10:  # QString
            return f.name()
    return layer.fields()[0].name() if layer.fields() else None

def apply_label(layer, template):
    """对图层应用标注（适用于所有几何类型）"""
    label_field = find_label_field(layer)
    if not label_field or not template.get("label"):
        return
    lbl = template["label"]
    fmt = QgsTextFormat()
    font = QFont(lbl.get("font_family", "Microsoft YaHei"), int(lbl.get("font_size", 9)))
    fmt.setFont(font)
    r, g, b = lbl["color"].split(",")
    fmt.setColor(QColor(int(r), int(g), int(b)))

    buf = QgsTextBufferSettings()
    buf.setEnabled(True)
    buf.setSize(float(lbl.get("buffer_size", 0.5)))
    bc = lbl.get("buffer_color", "255,255,255")
    br, bg, bb = bc.split(",")
    buf.setColor(QColor(int(br), int(bg), int(bb)))
    fmt.setBuffer(buf)

    pal = QgsPalLayerSettings()
    pal.fieldName = label_field
    pal.setFormat(fmt)
    pal.enabled = True
    pal.dist = 1.0
    # 面图层启用标注避让
    if layer.geometryType() == 2:
        pal.fitInPolygon = True

    layer.setLabelsEnabled(True)
    layer.setLabeling(QgsVectorLayerSimpleLabeling(pal))

def apply_style(layer, style_type, template):
    """对图层应用模板样式"""
    style = template["styles"].get(style_type)
    if not style:
        return

    if style_type == "polygon":
        params = {
            "color": style["color"],
            "outline_color": style["outline_color"],
            "outline_width": style["outline_width"],
        }
        sym = QgsFillSymbol.createSimple(params)
        layer.setRenderer(QgsSingleSymbolRenderer(sym))

    elif style_type == "line":
        params = {
            "color": style["color"],
            "width": style["width"],
        }
        if "capstyle" in style:
            params["capstyle"] = style["capstyle"]
        sym = QgsLineSymbol.createSimple(params)
        layer.setRenderer(QgsSingleSymbolRenderer(sym))

    elif style_type == "point":
        params = {
            "color": style["color"],
            "size": style["size"],
            "outline_color": style["outline_color"],
            "outline_width": style["outline_width"],
        }
        sym = QgsMarkerSymbol.createSimple(params)
        layer.setRenderer(QgsSingleSymbolRenderer(sym))

    # 所有几何类型都应用标注
    apply_label(layer, template)

def find_shp(data_dir, layer_name):
    for f in sorted(glob.glob(os.path.join(data_dir, "*.shp"))):
        basename = os.path.basename(f).replace(".shp", "")
        if basename == layer_name or layer_name in basename or basename in layer_name:
            return f
    return None

# ======================== 纸张尺寸定义 ========================
PAPER_SIZES = {
    "A4": {"width": 210, "height": 297},
    "A3": {"width": 297, "height": 420},
    "A2": {"width": 420, "height": 594},
    "A1": {"width": 594, "height": 841},
    "A0": {"width": 841, "height": 1189},
}

def get_page_dimensions(paper_size="A3", orientation="landscape"):
    """根据纸张尺寸和方向返回 (width, height) 单位 mm"""
    size = PAPER_SIZES.get(paper_size.upper(), PAPER_SIZES["A3"])
    if orientation.lower() in ("landscape", "横向", "horizontal"):
        return size["height"], size["width"]  # 横向：宽 > 高
    else:
        return size["width"], size["height"]   # 纵向

def main():
    parser = argparse.ArgumentParser(description="QGIS 自动化制图引擎")
    parser.add_argument("--data", required=True)
    parser.add_argument("--layers", required=True, help="逗号分隔")
    parser.add_argument("--template", default="water", choices=list(TEMPLATES.keys()))
    parser.add_argument("--output", default=None)
    parser.add_argument("--paper-size", dest="paper_size", default="A3",
                        choices=["A4", "A3", "A2", "A1", "A0"],
                        help="纸张尺寸，默认 A3")
    parser.add_argument("--orientation", default="landscape",
                        choices=["portrait", "landscape", "纵向", "横向"],
                        help="纸张方向，默认 landscape(横向)")
    parser.add_argument("--width", type=int, default=None,
                        help="自定义页面宽度 mm（覆盖 --paper-size）")
    parser.add_argument("--height", type=int, default=None,
                        help="自定义页面高度 mm（覆盖 --paper-size）")
    parser.add_argument("--dpi", type=int, default=300)
    parser.add_argument("--title", default=None)
    parser.add_argument("--graticule", action="store_true",
                        help="是否添加经纬度格网（默认关闭）")
    parser.add_argument("--source", default=None,
                        help="数据来源标注文本，如 '自然资源局'")
    args = parser.parse_args()

    # 计算页面尺寸：优先使用自定义 width/height，否则根据 paper-size + orientation 计算
    if args.width is not None and args.height is not None:
        page_width, page_height = args.width, args.height
    else:
        page_width, page_height = get_page_dimensions(args.paper_size, args.orientation)

    template = TEMPLATES[args.template]
    if args.output is None:
        out_dir = r"E:\code\my-ai-workspace\assets\generated"
        os.makedirs(out_dir, exist_ok=True)
        args.output = os.path.join(out_dir, f"地图_{args.template}.png")
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)

    log("=" * 60)
    log("   QGIS 制图引擎")
    log("=" * 60)
    log(f"\n  📐 纸张: {args.paper_size.upper()} ({'纵向' if args.orientation in ('portrait', '纵向') else '横向'})")
    log(f"  📏 尺寸: {page_width}mm × {page_height}mm")
    log(f"  🎯 DPI: {args.dpi}")

    # 1. 项目初始化
    log("\n[1/5] 初始化项目...")
    project = QgsProject.instance()
    project.clear()
    first_shp = glob.glob(os.path.join(args.data, "*.shp"))[0]
    probe = QgsVectorLayer(first_shp, "probe", "ogr")
    crs = probe.crs()
    log(f"  坐标系: {crs.authid()}")
    project.setCrs(crs)

    # 2. 加载图层
    log("\n[2/5] 加载图层...")
    layer_names = [n.strip() for n in args.layers.split(",")]
    layers = []
    for lname in layer_names:
        shp_path = find_shp(args.data, lname)
        if not shp_path:
            log(f"  跳过: 未找到 '{lname}' 对应的 .shp 文件")
            continue
        layer = QgsVectorLayer(shp_path, lname, "ogr")
        if not layer.isValid():
            log(f"  失败: {lname}")
            continue
        geom_type = ["point", "line", "polygon"][layer.geometryType()]
        type_name = ["点", "线", "面"][layer.geometryType()]
        apply_style(layer, geom_type, template)
        layers.append((lname, layer))
        project.addMapLayer(layer)
        log(f"  OK: {lname} ({type_name}, {layer.featureCount()} 要素)")

    root = project.layerTreeRoot()
    for child in root.children():
        root.removeChildNode(child)
    # 按几何类型排序：面(2)→线(1)→点(0)，确保点在顶层不被遮挡
    layers.sort(key=lambda pair: pair[1].geometryType(), reverse=True)
    for _, layer in layers:
        root.addLayer(layer)

    # 3. 创建布局
    log("\n[3/5] 创建布局...")
    layout = QgsPrintLayout(project)
    layout.setName("地图布局")
    layout.initializeDefaults()
    page_collection = layout.pageCollection()
    page_collection.page(0).setPageSize(QgsLayoutSize(page_width, page_height, QgsUnitTypes.LayoutMillimeters))

    pw = page_width
    ph = page_height
    # === 布局参数：地图框与图例框完全分离 ===
    margin_left = 20       # 地图框左边距
    margin_top = 18        # 地图框顶边距

    # 底部空间：图例框 + 间距 + 比例尺 + 页面底边距
    legend_frame_h = 55    # 图例内容区高度
    legend_gap = 6         # 图例与地图框间距
    scalebar_h = 12        # 比例尺高度
    margin_bottom = 10     # 页面底边距
    bottom_total = legend_frame_h + legend_gap + scalebar_h + margin_bottom

    # 右侧空间：图例框 + 页面右边距 + 地图框与图例框间距
    legend_w = 70          # 图例框宽度
    page_right = 5         # 图例框外到页面边界
    legend_gap = 15        # 地图框与图例框间距（加大防压盖）

    map_w = pw - margin_left - page_right - legend_w - legend_gap
    map_h = ph - margin_top - bottom_total

    # 图例框位置：地图框右侧，保持间距
    legend_x = margin_left + map_w + legend_gap

    map_item = QgsLayoutItemMap(layout)
    map_item.attemptResize(QgsLayoutSize(map_w, map_h, QgsUnitTypes.LayoutMillimeters))
    map_item.attemptMove(QgsLayoutPoint(margin_left, margin_top, QgsUnitTypes.LayoutMillimeters))

    full_extent = None
    for _, layer in layers:
        ext = layer.extent()
        if not ext.isEmpty():
            if full_extent is None:
                full_extent = QgsRectangle(ext)
            else:
                full_extent.combineExtentWith(ext)
    if full_extent:
        dx = full_extent.width() * 0.05
        dy = full_extent.height() * 0.05
        full_extent.setXMinimum(full_extent.xMinimum() - dx)
        full_extent.setXMaximum(full_extent.xMaximum() + dx)
        full_extent.setYMinimum(full_extent.yMinimum() - dy)
        full_extent.setYMaximum(full_extent.yMaximum() + dy)
        map_item.setExtent(full_extent)

    map_item.setFrameEnabled(True)
    map_item.setFrameStrokeWidth(QgsLayoutMeasurement(0.5))
    layout.addLayoutItem(map_item)

    title_text = args.title or template.get("title", "地 图")
    title = QgsLayoutItemLabel(layout)
    title.setText(title_text)
    title.setFont(QFont("Microsoft YaHei", 20, QFont.Bold))
    title.setHAlign(Qt.AlignCenter)
    title.setFrameEnabled(False)
    # 根据文本长度动态调整宽度：中文约 4mm/字，英文约 2mm/字
    est_width = len(title_text) * 3.5  # 估算字符宽度
    title_w = min(est_width + 20, pw - 40)  # 最宽不超过页面减边距
    title.attemptResize(QgsLayoutSize(title_w, 15, QgsUnitTypes.LayoutMillimeters))
    title.attemptMove(QgsLayoutPoint((pw - title_w) / 2, 3, QgsUnitTypes.LayoutMillimeters))
    layout.addLayoutItem(title)

    # 图例：放在地图框下方右下角，不与地图框重叠
    legend = QgsLayoutItemLegend(layout)
    legend.setTitle("图 例")
    legend.setFrameEnabled(True)
    legend.setBoxSpace(3)
    legend.setSymbolWidth(10)
    legend.setSymbolHeight(6)
    legend.setAutoUpdateModel(True)
    legend.updateLegend()
    legend.attemptResize(QgsLayoutSize(70, 55, QgsUnitTypes.LayoutMillimeters))
    # 图例位置：地图框外右侧
    legend_x = pw - margin_left - 65 - 15  # 留出地图框+间距+右侧空间
    legend_y = margin_top + map_h + 4
    legend.attemptMove(QgsLayoutPoint(legend_x, legend_y, QgsUnitTypes.LayoutMillimeters))
    layout.addLayoutItem(legend)

    # 比例尺：放在地图框下方左下角，自动适配规整单位
    scalebar = QgsLayoutItemScaleBar(layout)
    scalebar.setLinkedMap(map_item)
    scalebar.setStyle("Single Box")
    # 根据地图范围选择合适单位（米/公里）
    map_extent = map_item.extent()
    extent_width = map_extent.width() if map_extent else 1000
    extent_height = map_extent.height() if map_extent else 1000
    sf = scalebar.font()
    sf.setFamily("Microsoft YaHei")
    sf.setPointSize(8)
    scalebar.setFont(sf)
    # 显式设置分段数和适配长度，避免显示 "1.37米" 这种不规整值
    scalebar.setNumberOfSegmentsLeft(0)
    scalebar.setNumberOfSegmentsRight(2)
    scalebar.setUnitsPerSegment(extent_width / 10)  # 按地图范围 1/10 设置
    scalebar.applyDefaultSize()
    scalebar.attemptMove(QgsLayoutPoint(margin_left + 5, margin_top + map_h + 5, QgsUnitTypes.LayoutMillimeters))
    layout.addLayoutItem(scalebar)

    # 指北针：右上角，找不到 SVG 时用文字替代
    north_x = pw - 40
    north_y = margin_top + 5
    north_svg_path = None
    for p in [r"C:\Program Files\QGIS 3.40.9\share\svg\north_arrows\default.svg",
              r"C:\Program Files\QGIS 3.40.9\share\svg\north_arrows\arrow.svg"]:
        if os.path.exists(p):
            north_svg_path = p
            break
    if north_svg_path:
        north = QgsLayoutItemPicture(layout)
        north.setPicturePath(north_svg_path)
        north.attemptResize(QgsLayoutSize(12, 12, QgsUnitTypes.LayoutMillimeters))
        north.attemptMove(QgsLayoutPoint(north_x, north_y, QgsUnitTypes.LayoutMillimeters))
        layout.addLayoutItem(north)
        log("  OK: 指北针 (SVG)")
    else:
        # Fallback：用文字 "N ↑" 代替
        north_label = QgsLayoutItemLabel(layout)
        north_label.setText("N ↑")
        north_label.setFont(QFont("Microsoft YaHei", 14, QFont.Bold))
        north_label.setHAlign(Qt.AlignCenter)
        north_label.setFrameEnabled(False)
        north_label.attemptResize(QgsLayoutSize(15, 15, QgsUnitTypes.LayoutMillimeters))
        north_label.attemptMove(QgsLayoutPoint(north_x, north_y, QgsUnitTypes.LayoutMillimeters))
        layout.addLayoutItem(north_label)
        log("  OK: 指北针 (文字替代)")

    # 经纬度格网（可选）
    if args.graticule:
        grid = QgsLayoutItemMapGrid("graticule", map_item)
        grid.setCrs(crs)
        grid.setAnnotationEnabled(True)
        grid.setDrawAnnotation(True)
        grid.setAnnotationFont(QFont("Microsoft YaHei", 6))
        grid.setAnnotationPrecision(2)
        grid.setGridLineType(QgsLayoutItemMapGrid.Solid)
        grid.setBlendMode(0)  # 正常混合
        grid.setPenStyle(Qt.DashLine)
        grid.setPenColor(QColor(150, 150, 150, 128))
        grid.setPenWidth(0.2)
        grid.setIntervalX(extent_width / 5)
        grid.setIntervalY(extent_height / 5)
        map_item.grids().addGrid(grid)
        log("  OK: 经纬度格网")

    # 数据来源标注（放在底部居中）
    today_str = __import__("datetime").datetime.now().strftime("%Y-%m-%d")
    source_text = args.source if args.source else "数据来源：公开地理信息数据"
    footer_label = QgsLayoutItemLabel(layout)
    footer_label.setText(f"{source_text}  |  制图日期：{today_str}")
    footer_label.setFont(QFont("Microsoft YaHei", 6))
    footer_label.setHAlign(Qt.AlignCenter)
    footer_label.setFrameEnabled(False)
    footer_label.attemptResize(QgsLayoutSize(pw - 40, 6, QgsUnitTypes.LayoutMillimeters))
    footer_label.attemptMove(QgsLayoutPoint(20, ph - 10, QgsUnitTypes.LayoutMillimeters))
    layout.addLayoutItem(footer_label)

    QgsProject.instance().layoutManager().addLayout(layout)

    # 4. 导出
    log(f"\n[4/5] 导出图片...")
    exporter = QgsLayoutExporter(layout)
    settings = QgsLayoutExporter.ImageExportSettings()
    settings.dpi = args.dpi
    if os.path.exists(args.output):
        os.remove(args.output)
    result = exporter.exportToImage(args.output, settings)
    if result == QgsLayoutExporter.Success:
        log(f"  OK: {args.output}")
        log(f"      {args.width}x{args.height}mm @ {args.dpi}DPI")
    else:
        log(f"  失败: 错误码 {result}")

    qgz_path = args.output.replace(".png", ".qgz")
    project.write(qgz_path)
    log(f"  项目: {qgz_path}")

    QgsApplication.instance().exitQgis()
    log(f"\n{'=' * 60}")
    log("   制图完成!")
    log(f"{'=' * 60}")


if __name__ == "__main__":
    main()
