---
name: qgis-map-maker
description: >
  基于 PyQGIS 的自动化地图制图技能。支持一键加载 Shapefile / GeoJSON 矢量数据，
  智能读取数据结构和字段信息，提供预制样式模板，交互式选择图层、样式、输出规格后
  自动生成出版级地图（PNG / PDF）。
  当用户提到 "制图"、"地图"、"出图"、"map"、"Shapefile"，
  或要求生成/制作任何类型的专题地图时必须使用此技能。
  也适用于 "帮我做一张图"、"把 shp 导出图片"、"GIS 出图" 等场景。
---

# QGIS 地图制图师

基于 PyQGIS 引擎的自动化制图工具。从数据加载到图片导出，全流程自动化。

## 核心能力

| 功能 | 说明 |
|------|------|
| 🔍 数据探查 | 自动读取 Shapefile/GeoJSON 的 CRS、几何类型、要素数、字段列表 |
| 📂 图层选择 | 列出数据目录所有 shp 文件，用户勾选需要显示的图层 |
| 🎨 模板样式 | 预制 5 种专业地图模板，一键应用配色方案 |
| 📐 输出规格 | A4/A3 纵横、DPI、PNG/PDF 可选 |
| 🏷️ 智能标注 | 自动检测名称字段，支持中文标注避让 |
| 🗺️ 地图要素 | 标题、图例、比例尺、指北针自动生成 |

## 交互流程

### 第一步：数据探查

**环境检测**：先确认 QGIS 可用。
1. 尝试默认路径：`C:\Program Files\QGIS 3.40.9\bin\python-qgis-ltr.bat`
2. 若不存在，自动搜索：`dir "C:\Program Files\QGIS*" /b` 找到最新版本
3. 仍未找到时，询问用户："未检测到 QGIS，请提供 python-qgis-ltr.bat 路径"
4. 记住检测到的路径，后续步骤复用。

当用户提供数据目录路径时，运行数据探查脚本：

```bash
& "<QGIS路径>\python-qgis-ltr.bat" scripts/inspect_data.py --data <数据目录路径>
```

向用户展示探测结果后，**询问确认**：
```
📊 数据探查完成，共 4 个图层，坐标系 EPSG:4499。
请问：
1. 是否需要调整图层显示顺序？（默认底→顶）
2. 是否需要排除某个图层？（直接告诉我图层名）
3. 确认可用？（回复"可以"进入下一步）
```

### 第二步：图层选择与模板选择

**数据探查结果展示格式**（供参考）：
```
📂 检测到 4 个图层：
  ☑ 水体_p.shp      面(Polygon)   300 要素
  ☑ 市_点_p.shp    点(Point)      9 要素   [可标注字段: NAME]
  ☑ 市级行政区划.shp  面(Polygon)  9 要素
  ☑ 道路_p.shp      线(Polyline)  1198 要素

🌍 坐标系: EPSG:4499 (CGCS2000 / Gauss-Kruger zone 21)
```

向用户展示选项，让用户确认：

**图层列表**（默认全选，用户可去掉不需要的）

**地图模板**（14 种预制方案，详见 `references/templates.md`）：
```
🎨 请选择模板（输入编号或关键词）：
【基础类】1.水系  2.政区  3.交通  4.极简黑白
【自然类】5.土地利用  6.地质  7.植被
【经济类】8.人口  9.经济
【规划类】10.空间规划  11.环境评价
【特殊类】12.热力  13.军事  14.航海
💡 常见场景：行政区划→2，河流湖泊→1，交通规划→3，论文插图→4
```

**输出规格**（可选，默认 A3 横向 300DPI）：
```
📐 输出设置（可选项，跳过则使用默认值）：

📄 纸张尺寸：
  A4 (210×297mm) | A3 (297×420mm) | A2 (420×594mm) | A1 (594×841mm) | A0 (841×1189mm)

🔄 纸张方向：
  纵向 (Portrait) | 横向 (Landscape)

⚙️ 分辨率：
  150 DPI (预览) | 300 DPI (标准) | 600 DPI (印刷)

📁 输出格式：
  PNG | PDF

💡 快捷预设：
  • A4 纵向 300DPI  — 文档插入
  • A3 横向 300DPI  — 默认推荐
  • A2 横向 300DPI  — 展板海报
  • A1 横向 600DPI  — 大幅印刷
```

### 第三步：执行制图

收集完所有参数后，调用核心制图引擎：

```bash
& "<QGIS路径>\python-qgis-ltr.bat" scripts/map_engine.py \
  --data <数据目录> \
  --layers <逗号分隔的图层名> \
  --template <模板名> \
  --output <输出 PNG 路径> \
  --paper-size <A4|A3|A2|A1|A0> \
  --orientation <portrait|landscape> \
  --dpi <DPI值>
```

### 参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| `--data` | ✅ | Shapefile 所在目录 |
| `--layers` | ✅ | 要渲染的图层名，逗号分隔（顺序=从底到顶） |
| `--template` | ❌ | 模板名，默认 `water`（水系）。映射关系：1→water, 2→admin, 3→road, 4→minimal, 5→landuse, 6→geology, 7→vegetation, 8→population, 9→economy, 10→planning, 11→environment, 12→heatmap, 13→military, 14→navigation |
| `--output` | ❌ | 输出路径，默认 `assets/generated/地图.png` |
| `--paper-size` | ❌ | 纸张尺寸，可选：`A4` `A3` `A2` `A1` `A0`，默认 `A3` |
| `--orientation` | ❌ | 纸张方向，可选：`portrait`（纵向） `landscape`（横向），默认 `landscape` |
| `--dpi` | ❌ | 分辨率，默认 300 |
| `--title` | ❌ | 地图标题，默认根据模板自动生成 |
| `--graticule` | ❌ | 是否添加经纬度格网（默认关闭，加此参数开启） |
| `--source` | ❌ | 数据来源标注，如 `"自然资源局"`，默认 `"公开地理信息数据"` |

> **注意**：`--paper-size` 和 `--orientation` 组合自动计算 `--width` 和 `--height`，无需手动指定毫米值。
> 如需自定义尺寸，仍可使用 `--width` 和 `--height`（单位 mm）。

### 纸张尺寸参考

| 尺寸 | 纵向 (宽×高 mm) | 横向 (宽×高 mm) |
|------|----------------|----------------|
| A4 | 210 × 297 | 297 × 210 |
| A3 | 297 × 420 | 420 × 297 |
| A2 | 420 × 594 | 594 × 420 |
| A1 | 594 × 841 | 841 × 594 |
| A0 | 841 × 1189 | 1189 × 841 |

## 模板体系

详见 `references/templates.md`。每个模板定义了：
- 各图层类型的配色方案（填充色、描边色、线宽）
- 字体和字号设置
- 默认标题文本

## 模板扩展方式

在 `references/templates.md` 中添加新模板块，格式：
```json
{
  "name": "模板名",
  "icon": "emoji",
  "description": "描述",
  "title": "默认标题",
  "styles": {
    "polygon": { "color": "R,G,B,A", "outline_color": "R,G,B", "outline_width": "0.5" },
    "line": { "color": "R,G,B", "width": "0.3" },
    "point": { "color": "R,G,B", "size": "2.5" },
    "label": { "font_family": "Microsoft YaHei", "font_size": 9, "color": "R,G,B" }
  }
}
```

## 异常处理与 Fallback

### QGIS 环境问题
- **路径不存在**：默认 `C:\Program Files\QGIS 3.40.9\bin\python-qgis-ltr.bat` 找不到时，执行 `where qgis` 或 `dir "C:\Program Files\QGIS*" /b` 自动搜索安装路径，或询问用户。
- **QGIS 未安装**：提示 "检测到未安装 QGIS，请先安装 QGIS 3.x 或指定 python-qgis-ltr.bat 路径"。

### 数据问题
- **数据目录为空/无 shp**：提示 "目录中未找到 .shp 文件，请确认路径正确"，停止后续步骤。
- **shp 文件损坏**：`inspect_data.py` 报错时，提示 "[文件名] 无法读取，可能已损坏"，跳过该文件继续探查其他。
- **CRS 不一致**：探测到多个图层 CRS 不同时，**必须警告用户**："⚠️ 检测到不同坐标系（图层A: EPSG:XXXX, 图层B: EPSG:YYYY），叠加可能偏移。建议统一 CRS 后重试。" 但**仍允许用户确认后继续**。

### 制图执行失败
- **引擎报错**：`map_engine.py` 返回非零退出码时，输出完整错误日志，并提供排查指引：
  ```
  ❌ 制图失败，常见原因：
  1. 图层名拼写错误 → 检查 --layers 参数是否与探查结果一致
  2. 模板名无效 → 运行不带 --template 参数查看可用模板
  3. 数据文件被占用（如 QGIS 桌面版打开）→ 关闭 QGIS 后重试
  4. 输出路径无权限 → 检查磁盘空间或更换输出目录
  ```
- **输出路径不存在**：自动创建父目录（`os.makedirs(output_dir, exist_ok=True)`）。
- **输出目录无权限**：自动回退到 `assets/generated/` 并提示用户。

### 执行前确认
调用 `map_engine.py` **之前**，必须向用户展示最终参数并确认：
```
🚀 即将开始制图，参数如下：
  📂 数据目录：D:/gis_data/
  📑 图层：水体_p, 市_点_p, 市级行政区划, 道路_p（4个）
  🎨 模板：政区地图（典雅）
  📐 输出：A3 横向 300DPI → PNG
  💾 保存到：assets/generated/政区地图_20260414.png

确认开始？[是/否]
```

## 脚本目录维护

`scripts/` 目录仅保留核心脚本，定期清理临时文件：
- ✅ 保留：`map_engine.py`, `inspect_data.py`, `create_od_lines.py`, `read_excel.py`, `relationship_map.py`
- ❌ 清理：`temp_inspect.py`, `inspect_result.txt`, `quick_inspect.py`, `__pycache__/`（运行残留）

## 注意事项

- 坐标系自动从数据文件中读取，无需手动指定
- 中文标注优先使用 NAME/名称/市名 等常见字段
- QGIS 安装路径可根据实际版本调整（见"异常处理"章节的自动搜索机制）
