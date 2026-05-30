---
title: "Python地理绘图配色-cmocean"
created: 2026-05-11
updated: 2026-05-11
sources: ["../../技术沉淀/GIS与时空智能/cmocean！Python地理SCI绘图配色神器，无脑用就行....md"]
tags: [GIS, Python, cmocean, 配色, 科学可视化]
status: active
---

# Python地理绘图配色-cmocean

> cmocean是专为地理空间/海洋/气候/地球科学数据可视化设计的Python配色包，提供感知均匀、视觉美观的颜色映射方案。

---

## 核心要点

- cmocean由 Scripps Institution of Oceanography 开发，专门针对地理空间数据优化
- 安装简单（pip/conda均可），与matplotlib无缝集成
- 提供多种预定义色带：顺序型、发散型、周期型
- 支持色带裁剪功能，可按数据范围截取部分颜色
- 不再需要纠结颜色选择，直接选用即可满足SCI论文级别需求

---

## 详细内容

### 安装

```bash
pip install cmocean
# 或 conda（推荐）
conda install -c conda-forge cmocean
```

### 导入

```python
import cmocean
import cmocean.cm as cmo
import cmocean.tools as ctools
```

### 核心API

#### 1. 使用预定义色带

```python
import matplotlib.pyplot as plt
import cmocean.cm as cmo

data = ...  # 你的数据
plt.imshow(data, cmap=cmo.thermal)
plt.colorbar()
plt.show()
```

#### 2. 可视化色带

```python
import cmocean.cm as cmo

cmo.thermal.plot()  # 默认256色
cmo.thermal.plot(n_colors=20)  # 指定颜色数量
```

#### 3. 裁剪色带

```python
import cmocean.cm as cmo
import cmocean.tools as ctools

# 按数值范围裁剪
cmap = ctools.crop(cmo.thermal, vmin=0.2, vmax=0.9, N=128)

# 按百分比裁剪（两端各去掉30%）
cmap_trimmed = ctools.crop_by_percent(cmo.thermal, 30, which='both', N=None)
```

### 实战示例

```python
import cmocean
import matplotlib.pyplot as plt
import numpy as np

cmap = cmocean.cm.tarn
fig, axes = plt.subplots(1, 2, figsize=(8, 4))

A = np.random.randint(-5, 6, (10, 10))

# 完整色带
mappable = axes[0].pcolormesh(A, cmap=cmap)
axes[0].set_title('Full diverging colormap')
fig.colorbar(mappable, ax=axes[0])

# 裁剪后色带
newcmap = cmocean.tools.crop_by_percent(cmap, 30, which='both', N=None)
mappable = axes[1].pcolormesh(A, cmap=newcmap)
axes[1].set_title('Same colormap,\n30% removed from each end')
fig.colorbar(mappable, ax=axes[1])
```

### 常见色带类型

| 类型 | 示例色带 | 适用场景 |
|------|---------|---------|
| 顺序型 | thermal, density, rain | 温度、密度、降水量等单向递增数据 |
| 发散型 | tarn, balance, delta | 有正负之分的数据（异常值、偏差） |
| 海洋专用 | oxy, halin, chlor_a | 海水含氧量、盐度、叶绿素浓度 |

---

## 相关页面

- [[GIS专业制图提示词]] — 专题地图配色标准（ColorBrewer/viridis/cividis）
- [[地图可视化资源导航]]
- [[QGIS专题地图模板]]

---

## 来源

- [[myk/技术沉淀/GIS与时空智能/cmocean！Python地理SCI绘图配色神器，无脑用就行...|cmocean！Python地理SCI绘图配色神器]]
