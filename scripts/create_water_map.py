# -*- coding: utf-8 -*-
"""
水系地图自动生成脚本 - PyQGIS Headless 版本
运行：& "C:\Program Files\QGIS 3.40.9\bin\python-qgis-ltr.bat" E:\code\my-ai-workspace\scripts\create_water_map.py
"""

import os
import sys

# 必须先初始化 QgsApplication
from qgis.core import QgsApplication
qgs = QgsApplication([], False)  # 无 GUI 模式
qgs.initQgis()

# 所有 QGIS 核心导入必须在 initQgis() 之后
from qgis.core import (
    QgsProject,
    QgsVectorLayer,
    QgsCoordinateReferenceSystem,
    QgsFillSymbol,
    QgsLineSymbol,
    QgsMarkerSymbol,
    QgsSingleSymbolRenderer,
    QgsPrintLayout,
    QgsLayoutItemMap,
    QgsLayoutItemLabel,
    QgsLayoutItemLegend,
    QgsLayoutItemScaleBar,
    QgsLayoutItemPicture,
    QgsLayoutExporter,
    QgsLayoutPoint,
    QgsLayoutSize,
    QgsLayoutMeasurement,
    QgsUnitTypes,
    QgsRectangle,
    QgsPalLayerSettings,
    QgsTextFormat,
    QgsTextBufferSettings,
    QgsVectorLayerSimpleLabeling,
    QgsLayerTreeGroup,
    QgsLayerTreeLayer,
)
from PyQt5.QtGui import QColor, QFont
from PyQt5.QtCore import Qt

# ======================== 配置区域 ========================
DATA_DIR = r"E:\BaiduNetdiskDownload\制图Data\制图Data\Data1"
OUTPUT_DIR = r"E:\code\my-ai-workspace\assets\generated"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "水系地图.png")
PROJECT_FILE = os.path.join(OUTPUT_DIR, "水系地图.qgz")

os.makedirs(OUTPUT_DIR, exist_ok=True)

DPI = 600
PAGE_WIDTH = 297   # A3 横向 (mm)
PAGE_HEIGHT = 210

def log(msg):
    print(msg)
    sys.stdout.flush()

log("=" * 60)
log("   水系地图自动生成 - PyQGIS Headless")
log("=" * 60)

# ======================== 1. 初始化项目 ========================
log("\n[1/6] 初始化 QGIS 项目...")
project = QgsProject.instance()
project.clear()
project.setTitle("水系地图")

crs = QgsCoordinateReferenceSystem("EPSG:4499")  # CGCS2000 / Gauss-Kruger zone 21
if not crs.isValid():
    log("  ⚠️ EPSG:4499 不可用，尝试 EPSG:4547")
    crs = QgsCoordinateReferenceSystem("EPSG:4547")
project.setCrs(crs)
log(f"  CRS: {crs.authid()}")

# ======================== 2. 加载图层 ========================
log("\n[2/6] 加载矢量数据...")

layer_files = {
    "行政区划": os.path.join(DATA_DIR, "市级行政区划_p.shp"),
    "道路": os.path.join(DATA_DIR, "道路_p.shp"),
    "水体": os.path.join(DATA_DIR, "水体_p.shp"),
    "城市": os.path.join(DATA_DIR, "市_点_p.shp"),
}

layers = {}
for name, filepath in layer_files.items():
    if not os.path.exists(filepath):
        log(f"  ⚠️ 跳过: {filepath} 不存在")
        continue

    layer = QgsVectorLayer(filepath, name, "ogr")
    if not layer.isValid():
        log(f"  ❌ 加载失败: {name}")
        continue

    layers[name] = layer
    project.addMapLayer(layer)
    geom_type = ["点", "线", "面"][layer.geometryType()]
    log(f"  ✅ {name}: {layer.featureCount()} 要素, 类型={geom_type}, 字段={[f.name() for f in layer.fields()]}")

# 设置图层顺序（从底到顶）
root = project.layerTreeRoot()
for child in root.children():
    root.removeChildNode(child)
for name in ["行政区划", "道路", "水体", "城市"]:
    if name in layers:
        root.addLayer(layers[name])
log("  图层顺序: 行政区划 → 道路 → 水体 → 城市")

# ======================== 3. 设置样式 ========================
log("\n[3/6] 配置图层样式...")

# 行政区划
if "行政区划" in layers:
    sym = QgsFillSymbol.createSimple({
        'color': '245,245,220,50',
        'outline_color': '180,180,180',
        'outline_width': '0.4',
    })
    layers["行政区划"].setRenderer(QgsSingleSymbolRenderer(sym))
    log("  ✅ 行政区划: 米色半透明 + 灰色边框")

# 道路
if "道路" in layers:
    sym = QgsLineSymbol.createSimple({
        'color': '200,200,200',
        'width': '0.3',
    })
    layers["道路"].setRenderer(QgsSingleSymbolRenderer(sym))
    log("  ✅ 道路: 灰色细线")

# 水体
if "水体" in layers:
    sym = QgsFillSymbol.createSimple({
        'color': '100,180,255,200',       # 更深一点的湖水蓝
        'outline_color': '25,100,200',    # 深蓝描边
        'outline_width': '0.5',
    })
    layers["水体"].setRenderer(QgsSingleSymbolRenderer(sym))
    log("  ✅ 水体: 湖水蓝填充 + 深蓝描边")

# 城市
if "城市" in layers:
    sym = QgsMarkerSymbol.createSimple({
        'color': '50,50,50',
        'size': '2.5',
        'outline_color': '255,255,255',
        'outline_width': '0.5',
    })
    layers["城市"].setRenderer(QgsSingleSymbolRenderer(sym))

    # 查找标注字段
    fields = layers["城市"].fields()
    label_field = None
    for f in fields:
        if f.name() in ("NAME", "name", "名称", "市名", "NAME_CHN"):
            label_field = f.name()
            break
    if not label_field:
        for f in fields:
            if f.type() == 10:  # QString
                label_field = f.name()
                break
    if not label_field and len(fields) > 0:
        label_field = fields[0].name()

    if label_field:
        fmt = QgsTextFormat()
        fmt.setFont(QFont("Microsoft YaHei", 9))
        fmt.setColor(QColor(30, 30, 30))
        buf = QgsTextBufferSettings()
        buf.setEnabled(True)
        buf.setSize(0.8)
        buf.setColor(QColor(255, 255, 255))
        fmt.setBuffer(buf)

        pal = QgsPalLayerSettings()
        pal.fieldName = label_field
        pal.setFormat(fmt)
        pal.enabled = True
        pal.dist = 1.0

        layers["城市"].setLabelsEnabled(True)
        layers["城市"].setLabeling(QgsVectorLayerSimpleLabeling(pal))
        log(f"  ✅ 城市: 点位 + 标注(字段={label_field})")
    else:
        log("  ⚠️ 城市: 未找到合适的标注字段")

# ======================== 4. 创建打印布局 ========================
log("\n[4/6] 创建打印布局...")

layout = QgsPrintLayout(project)
layout.setName("水系地图布局")
layout.initializeDefaults()

page_collection = layout.pageCollection()
page = page_collection.page(0)
page.setPageSize(QgsLayoutSize(PAGE_WIDTH, PAGE_HEIGHT, QgsUnitTypes.LayoutMillimeters))

# --- 主地图 ---
map_item = QgsLayoutItemMap(layout)
map_item.attemptResize(QgsLayoutSize(PAGE_WIDTH - 115, PAGE_HEIGHT - 50, QgsUnitTypes.LayoutMillimeters))
map_item.attemptMove(QgsLayoutPoint(20, 18, QgsUnitTypes.LayoutMillimeters))

if "水体" in layers:
    extent = layers["水体"].extent()
    if not extent.isEmpty():
        dx = extent.width() * 0.08
        dy = extent.height() * 0.08
        map_extent = QgsRectangle(
            extent.xMinimum() - dx, extent.yMinimum() - dy,
            extent.xMaximum() + dx, extent.yMaximum() + dy
        )
        map_item.setExtent(map_extent)

map_item.setFrameEnabled(True)
map_item.setFrameStrokeWidth(QgsLayoutMeasurement(0.5))
layout.addLayoutItem(map_item)
log("  ✅ 主地图")

# --- 标题 ---
title = QgsLayoutItemLabel(layout)
title.setText("水  系  地  图")
f = QFont("Microsoft YaHei", 20)
f.setBold(True)
title.setFont(f)
title.setHAlign(Qt.AlignCenter)
title.setVAlign(Qt.AlignVCenter)
title.setFrameEnabled(False)
title.attemptResize(QgsLayoutSize(PAGE_WIDTH - 40, 12, QgsUnitTypes.LayoutMillimeters))
title.attemptMove(QgsLayoutPoint(20, 3, QgsUnitTypes.LayoutMillimeters))
layout.addLayoutItem(title)
log("  ✅ 标题")

# --- 图例 ---
legend = QgsLayoutItemLegend(layout)
legend.setTitle("图 例")
legend.setFrameEnabled(True)
legend.setBoxSpace(3)
legend.setSymbolWidth(10)
legend.setSymbolHeight(6)

# 手动构建图例 - 使用 setAutoUpdateModel 结合图层树
legend.setAutoUpdateModel(True)
# 通过调整图层可见性来控制图例显示
for name in ["行政区划", "道路", "水体", "城市"]:
    if name in layers:
        node = root.findLayer(layers[name].id())
        if node:
            node.setItemVisibilityChecked(True)

legend.attemptResize(QgsLayoutSize(70, 55, QgsUnitTypes.LayoutMillimeters))
legend.attemptMove(QgsLayoutPoint(PAGE_WIDTH - 95, PAGE_HEIGHT - 72, QgsUnitTypes.LayoutMillimeters))
layout.addLayoutItem(legend)
log("  ✅ 图例")

# --- 比例尺 ---
scalebar = QgsLayoutItemScaleBar(layout)
scalebar.setLinkedMap(map_item)
scalebar.setStyle("Single Box")
scalebar.setUnits(QgsUnitTypes.DistanceMeters)
sf = scalebar.font()
sf.setFamily("Microsoft YaHei")
sf.setPointSize(8)
scalebar.setFont(sf)
scalebar.applyDefaultSize()
scalebar.attemptMove(QgsLayoutPoint(25, PAGE_HEIGHT - 18, QgsUnitTypes.LayoutMillimeters))
layout.addLayoutItem(scalebar)
log("  ✅ 比例尺")

# --- 指北针 ---
north = QgsLayoutItemPicture(layout)
svg_paths = [
    r"C:\Program Files\QGIS 3.40.9\share\svg\north_arrows\default.svg",
    r"C:\Program Files\QGIS 3.40.9\share\svg\north_arrows\arrow.svg",
    r"C:\Program Files\QGIS 3.40.9\share\svg\gis\north_arrow.svg",
]
for svg_path in svg_paths:
    if os.path.exists(svg_path):
        north.setPicturePath(svg_path)
        break

if not north.picturePath():
    import glob
    patterns = [
        r"C:\Program Files\QGIS 3.40.9\share\svg\**\*north*.svg",
    ]
    for pattern in patterns:
        matches = glob.glob(pattern, recursive=True)
        if matches:
            north.setPicturePath(matches[0])
            break

north.attemptResize(QgsLayoutSize(12, 12, QgsUnitTypes.LayoutMillimeters))
north.attemptMove(QgsLayoutPoint(PAGE_WIDTH - 40, 20, QgsUnitTypes.LayoutMillimeters))
layout.addLayoutItem(north)
if north.picturePath():
    log(f"  ✅ 指北针: {os.path.basename(north.picturePath())}")
else:
    log("  ⚠️ 指北针: 未找到 SVG 文件（跳过）")

# 保存布局
QgsProject.instance().layoutManager().addLayout(layout)
log("  布局已保存到项目")

# ======================== 5. 导出 ========================
log("\n[5/6] 导出图片...")

exporter = QgsLayoutExporter(layout)
settings = QgsLayoutExporter.ImageExportSettings()
settings.dpi = DPI

result = exporter.exportToImage(OUTPUT_FILE, settings)
if result == QgsLayoutExporter.Success:
    log(f"\n  ✅ 导出成功!")
    log(f"     路径: {OUTPUT_FILE}")
    log(f"     规格: {PAGE_WIDTH}x{PAGE_HEIGHT}mm @ {DPI}DPI")
else:
    log(f"\n  ❌ 导出失败: 错误码 {result}")

# 保存项目
log("\n[6/6] 保存项目...")
project.write(PROJECT_FILE)
log(f"  项目: {PROJECT_FILE}")

# 清理
qgs.exitQgis()

log("\n" + "=" * 60)
log("   全部完成!")
log("=" * 60)
print("   水系地图自动生成 - PyQGIS")
print("=" * 60)

# ======================== 1. 初始化项目 ========================
print("\n[1/6] 初始化 QGIS 项目...")
project = QgsProject.instance()
project.clear()
project.setTitle("水系地图")

# 设置项目 CRS（CGCS2000 GK Zone 21）
crs = QgsCoordinateReferenceSystem("EPSG:4547")  # CGCS2000 / 3-degree Gauss-Kruger zone 41
# 如果 EPSG:4547 不可用，用自定义 CRS
if not crs.isValid():
    crs.createFromWkt('PROJCS["CGCS2000_3_degree_GK_CM_123E",GEOGCS["China Geodetic Coordinate System 2000",DATUM["China_2000",SPHEROID["CGCS2000",6378137,298.25722]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",123],PARAMETER["scale_factor",1],PARAMETER["false_easting",41500000],PARAMETER["false_northing",0],UNIT["metre",1]]')

project.setCrs(crs)
print(f"  CRS: {crs.authid()}")

# ======================== 2. 加载图层 ========================
print("\n[2/6] 加载矢量数据...")

layers = {}
layer_files = {
    "行政区划": os.path.join(DATA_DIR, "市级行政区划_p.shp"),
    "道路": os.path.join(DATA_DIR, "道路_p.shp"),
    "水体": os.path.join(DATA_DIR, "水体_p.shp"),
    "城市": os.path.join(DATA_DIR, "市_点_p.shp"),
}

for name, filepath in layer_files.items():
    if not os.path.exists(filepath):
        print(f"  ⚠️ 跳过: {filepath} 不存在")
        continue

    uri = filepath
    layer = QgsVectorLayer(uri, name, "ogr")

    if not layer.isValid():
        print(f"  ❌ 加载失败: {name}")
        continue

    layers[name] = layer
    project.addMapLayer(layer)
    print(f"  ✅ {name}: {layer.featureCount()} 个要素, 类型={layer.geometryType()}")

# 设置图层顺序（从下到上）
root = project.layerTreeRoot()
# 移除所有
for child in root.children():
    root.removeChildNode(child)
# 按顺序添加
for name in ["行政区划", "道路", "水体", "城市"]:
    if name in layers:
        root.addLayer(layers[name])

print("  图层顺序已设置")

# ======================== 3. 设置图层样式 ========================
print("\n[3/6] 配置图层样式...")

# --- 行政区划（底图） ---
if "行政区划" in layers:
    sym = QgsFillSymbol.createSimple({
        'color': '245,245,220,50',       # 米色，半透明
        'outline_color': '180,180,180',
        'outline_width': '0.4',
        'outline_style': 'solid',
    })
    layers["行政区划"].setRenderer(QgsSingleSymbolRenderer(sym))
    print("  ✅ 行政区划：米色半透明底图")

# --- 道路 ---
if "道路" in layers:
    sym = QgsLineSymbol.createSimple({
        'color': '200,200,200',
        'width': '0.3',
        'line_style': 'solid',
    })
    layers["道路"].setRenderer(QgsSingleSymbolRenderer(sym))
    print("  ✅ 道路：灰色细线")

# --- 水体（核心图层） ---
if "水体" in layers:
    sym = QgsFillSymbol.createSimple({
        'color': '135,206,250,180',       # 湖水蓝 半透明
        'outline_color': '30,144,255',    # 道奇蓝描边
        'outline_width': '0.6',
        'outline_style': 'solid',
    })
    layers["水体"].setRenderer(QgsSingleSymbolRenderer(sym))
    print("  ✅ 水体：湖泊蓝 + 道奇蓝描边")

# --- 城市点 ---
if "城市" in layers:
    sym = QgsMarkerSymbol.createSimple({
        'color': '50,50,50',
        'size': '2.5',
        'outline_color': '255,255,255',
        'outline_width': '0.5',
    })
    layers["城市"].setRenderer(QgsSingleSymbolRenderer(sym))

    # 添加标注（城市名称）
    label_settings = QgsPalLayerSettings()
    label_settings.fieldName = "NAME"  # 尝试 NAME 字段
    # 如果没有 NAME 字段，尝试其他可能字段
    fields = layers["城市"].fields()
    field_names = [f.name() for f in fields]
    if "NAME" not in field_names:
        # 查找包含"名"或"name"的字段
        for f in field_names:
            if "名" in f.lower() or "name" in f.lower():
                label_settings.fieldName = f
                break
        else:
            # 用第一个文本字段
            for f in fields:
                if f.type() == QVariant.String:
                    label_settings.fieldName = f.name()
                    break

    label_settings.enabled = True
    label_settings.font = QFont("Microsoft YaHei", 8)
    label_settings.textColor = QColor(30, 30, 30)

    # 标注背景
    label_settings.setFormat(QgsTextFormat())
    fmt = label_settings.format()
    fmt.setFont(QFont("Microsoft YaHei", 8))
    fmt.setColor(QColor(30, 30, 30))
    # 标注缓冲区（白色背景）
    fmt.buffer().setEnabled(True)
    fmt.buffer().setColor(QColor(255, 255, 255))
    fmt.buffer().setSize(1.0)
    label_settings.setFormat(fmt)

    layers["城市"].setLabelsEnabled(True)
    from qgis.core import QgsVectorLayerSimpleLabeling
    layers["城市"].setLabeling(QgsVectorLayerSimpleLabeling(label_settings))
    print(f"  ✅ 城市：点位 + 标注（字段: {label_settings.fieldName}）")

# 刷新
layers.get("水体", QgsVectorLayer()).triggerRepaint()
print("  样式已应用")

# ======================== 4. 创建打印布局 ========================
print("\n[4/6] 创建打印布局...")

# 检查是否已存在同名布局
existing_layouts = QgsProject.instance().layoutManager().layouts()
for layout in existing_layouts:
    if layout.name() == "水系地图布局":
        QgsProject.instance().layoutManager().removeLayout(layout)

layout = QgsPrintLayout(project)
layout.setName("水系地图布局")
layout.initializeDefaults()

# 页面设置 A3 横向
page_size = QgsLayoutSize(PAGE_WIDTH, PAGE_HEIGHT, QgsUnitTypes.LayoutMillimeters)
layout.pageCollection().page(0).setPageSize(page_size)

# --- 添加主地图 ---
map_item = QgsLayoutItemMap(layout)
# 留出边距：左80mm, 上20mm, 右20mm, 下40mm（给图例和比例尺留空间）
map_item.setRect(QRectF(20, 15, PAGE_WIDTH - 120, PAGE_HEIGHT - 50))

# 设置地图范围（以水体图层范围为准）
if "水体" in layers and layers["水体"].extent().isEmpty() is False:
    extent = layers["水体"].extent()
    # 加 10% 缓冲
    buffer = max(extent.width(), extent.height()) * 0.1
    extent.setXMinimum(extent.xMinimum() - buffer)
    extent.setXMaximum(extent.xMaximum() + buffer)
    extent.setYMinimum(extent.yMinimum() - buffer)
    extent.setYMaximum(extent.yMaximum() + buffer)
    map_item.setExtent(extent)

map_item.setLayers(list(layers.values()))
map_item.setFrameEnabled(True)
layout.addLayoutItem(map_item)
print("  ✅ 主地图已添加")

# --- 标题 ---
title_label = QgsLayoutItemLabel(layout)
title_label.setText("水 系 地 图")
title_label.setFont(QFont("Microsoft YaHei", 22, QFont.Bold))
title_label.setHAlign(Qt.AlignCenter)
title_label.setFrameEnabled(False)
title_label.attemptMove(QgsLayoutPoint(20, 3, QgsUnitTypes.LayoutMillimeters))
title_label.attemptResize(QgsLayoutSize(PAGE_WIDTH - 40, 12, QgsUnitTypes.LayoutMillimeters))
layout.addLayoutItem(title_label)
print("  ✅ 标题已添加")

# --- 图例 ---
legend = QgsLayoutItemLegend(layout)
legend.setTitle("图 例")
legend.setFont(QFont("Microsoft YaHei", 8))
legend.setFrameEnabled(True)
legend.setFrameStrokeWidth(QgsLayoutMeasurement(0.3))
legend.setBoxSpace(2.0)
legend.setSymbolWidth(8)
legend.setSymbolHeight(5)
legend.setColumnSpace(5)
legend.setWrapString("")
# 设置为平铺模式（不按图层树）
legend.setAutoUpdateModel(False)

# 手动添加图例项
legend_group = QgsLayerTreeGroup()
for name, layer in layers.items():
    tree_layer = QgsLayerTreeLayer(layer)
    tree_layer.setName(name)
    legend_group.addLayerTreeLayer(tree_layer)
legend.model().setRootGroup(legend_group)

# 更新图例
legend.updateLegend()
legend.attemptMove(QgsLayoutPoint(PAGE_WIDTH - 95, PAGE_HEIGHT - 65, QgsUnitTypes.LayoutMillimeters))
legend.attemptResize(QgsLayoutSize(75, 50, QgsUnitTypes.LayoutMillimeters))
layout.addLayoutItem(legend)
print("  ✅ 图例已添加")

# --- 比例尺 ---
scalebar = QgsLayoutItemScaleBar(layout)
scalebar.setLinkedMap(map_item)
scalebar.setStyle("Numeric")  # 数字式比例尺
scalebar.setUnits("meters")
scalebar.setNumberOfSegments(4)
scalebar.setNumberOfSegmentsLeft(1)
scalebar.setFont(QFont("Microsoft YaHei", 8))
scalebar.setFrameEnabled(False)
scalebar.attemptMove(QgsLayoutPoint(25, PAGE_HEIGHT - 22, QgsUnitTypes.LayoutMillimeters))
layout.addLayoutItem(scalebar)
print("  ✅ 比例尺已添加")

# --- 指北针 ---
north_arrow = QgsLayoutItemPicture(layout)
# 使用 QGIS 内置指北针 SVG
svg_path = r"C:\Program Files\QGIS 3.40.9\share\svg\qgis\north_arrow.svg"
if os.path.exists(svg_path):
    north_arrow.setPicturePath(svg_path)
else:
    # 尝试其他可能的路径
    for p in [
        r"C:\Program Files\QGIS 3.40.9\share\svg\classic\north_arrow.svg",
        r"C:\OSGeo4W\share\svg\qgis\north_arrow.svg",
    ]:
        if os.path.exists(p):
            north_arrow.setPicturePath(p)
            break

north_arrow.setPictureWidth(QgsLayoutMeasurement(15, QgsUnitTypes.LayoutMillimeters))
north_arrow.setPictureHeight(QgsLayoutMeasurement(15, QgsUnitTypes.LayoutMillimeters))
north_arrow.attemptMove(QgsLayoutPoint(PAGE_WIDTH - 40, 18, QgsUnitTypes.LayoutMillimeters))
layout.addLayoutItem(north_arrow)
print("  ✅ 指北针已添加")

# --- 添加布局到项目 ---
QgsProject.instance().layoutManager().addLayout(layout)
print("  布局已保存到项目")

# ======================== 5. 导出图片 ========================
print("\n[5/6] 导出图片...")

exporter = QgsLayoutExporter(layout)
export_settings = QgsLayoutExporter.ImageExportSettings()
export_settings.dpi = DPI
export_settings.cropToContents = False

result = exporter.exportToImage(OUTPUT_FILE, export_settings)

if result == QgsLayoutExporter.Success:
    print(f"\n  ✅ 导出成功: {OUTPUT_FILE}")
    print(f"     尺寸: {PAGE_WIDTH}x{PAGE_HEIGHT} mm @ {DPI} DPI")
else:
    print(f"\n  ❌ 导出失败: 错误代码 {result}")

# ======================== 6. 保存项目 ========================
print("\n[6/6] 保存 QGIS 项目...")
project_path = os.path.join(OUTPUT_DIR, "水系地图.qgz")
project.write(project_path)
print(f"  项目已保存: {project_path}")

print("\n" + "=" * 60)
print("   制图完成！")
print("=" * 60)
