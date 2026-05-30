# FreeCAD 别墅外观建模执行计划

## 目标

生成一个可编辑的 FreeCAD 外观模型文件：`exports/freecad-villa-13x11-exterior.fcstd`。

## 文件结构

- `docs/superpowers/specs/2026-05-27-freecad-villa-design.md`
  - 已批准的设计范围与默认假设。
- `docs/superpowers/plans/2026-05-27-freecad-villa-exterior.md`
  - 本执行计划。
- `exports/freecad-villa-13x11-exterior.fcstd`
  - 最终 FreeCAD 模型。
- `temp/freecad-villa-13x11-exterior.json`
  - CLI 中间项目状态（若命令链需要）。

## 任务拆分

### 任务 1：建立基础项目

1. 创建使用 `metric_large` 或 `m` 单位的新文档。
2. 确认文档可保存到 `exports/`。

验证点：

- 文档成功创建。
- 输出路径不在根目录。

### 任务 2：建立主体体块

1. 建立一层、二层、三层主体体块。
2. 建立门厅前凸体块。
3. 建立二层、三层阳台板与外挑关系。

验证点：

- 主体总尺度接近 13m × 11m。
- 三层关系清晰。

### 任务 3：补关键立面特征

1. 补前立柱体量。
2. 补主入口门洞和主窗洞。
3. 补四坡浅屋顶。

验证点：

- 正立面与参考图风格接近。
- 入口、阳台、屋顶三大识别特征存在。

### 任务 4：保存与验证

1. 保存 FCStd。
2. 重新打开或读取文档信息，确认文件有效。
3. 如 CLI 支持，生成一张预览图用于自检。

验证点：

- `exports/freecad-villa-13x11-exterior.fcstd` 存在。
- 文件可重新打开或至少能被 FreeCAD 读取。

## 执行原则

- 优先最小可用模型，不在本轮补过细装饰线条。
- 只围绕用户确认的外观建模范围执行。
- 不提交 git，不修改无关目录。
