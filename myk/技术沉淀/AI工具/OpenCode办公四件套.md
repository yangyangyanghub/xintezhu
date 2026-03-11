# OpenCode 办公四件套

> 来源：[玩转 OpenCode(四)](https://mp.weixin.qq.com/s/MQBbeCQASqtvxDlM5Hze9A)
> 整理时间：2026-03-11

---

## 一、核心能力矩阵

| Skill | 能力 | 典型场景 |
|-------|------|----------|
| **docx** | Word文档创建、编辑、修订追踪、批注 | 报告、合同、论文 |
| **xlsx** | Excel创建、公式计算、格式化、图表 | 数据分析、财务模型 |
| **pdf** | 文本提取、合并拆分、表单填写、创建 | 表单处理、文档归档 |
| **pptx** | PPT创建、模板套用、编辑、缩略图 | 汇报、演示、培训 |

---

## 二、协同场景

| 协同组合 | 场景 | 产出 |
|----------|------|------|
| deep-research + docx | 技术调研 | 带配图的调研报告 |
| docx + pptx | 报告转PPT | 一份内容两种形态 |
| xlsx + pptx | 数据汇报 | 数据驱动的演示文稿 |
| pdf + xlsx | 表格提取 | PDF表格转Excel |
| csv-data-summarizer + xlsx | 数据分析 | 完整分析报告 |

---

## 三、核心思想：精简SKILL.md + 脚本

办公四件套全部采用 **"精简SKILL.md + 脚本"模式**。

为什么？因为办公文档处理涉及复杂的文件格式（OOXML、PDF结构），用脚本处理更稳定。

### 目录结构

```
.opencode/skills/
├── docx/                      # Word处理
│   ├── SKILL.md               # 技能定义（精简版）
│   ├── docx-js.md             # 创建文档参考
│   ├── ooxml.md               # 编辑文档参考
│   └── scripts/                # 文档操作脚本
├── xlsx/                      # Excel处理
│   ├── SKILL.md
│   └── recalc.py              # 公式重算脚本（关键！）
├── pdf/                        # PDF处理
│   ├── SKILL.md
│   ├── forms.md               # 表单填写参考
│   └── scripts/                # PDF处理脚本
└── pptx/                       # PPT处理
    ├── SKILL.md
    ├── html2pptx.md           # HTML转PPT参考
    └── scripts/                # PPT处理脚本
```

---

## 四、Word文档处理（docx）

### 三种场景

| 场景 | 命令示例 | 产出 |
|------|----------|------|
| 读取分析 | "读取这份Word文档的内容" | markdown格式内容 |
| 创建新文档 | "创建一份Word文档《项目汇报》" | .docx文件 |
| 修订追踪 | "用修订模式修改合同" | 带修订标记的.docx |

### 关键依赖
- pandoc：文本提取
- docx：创建新文档（npm）
- LibreOffice：PDF转换

---

## 五、Excel表格处理（xlsx）

### 核心理念：用公式，不用硬编码！

| ❌ 错误 | ✅ 正确 |
|---------|---------|
| `sheet['B10'] = 5000` | `sheet['B10'] = '=SUM(B2:B9)'` |

### recalc.py 的作用

openpyxl 创建的 Excel 只有公式字符串，没有计算值。recalc.py 通过调用 LibreOffice 自动重算公式，并检测公式错误。

```bash
python recalc.py output.xlsx
# 返回: {"status": "success", "total_errors": 0}
```

### 财务模型颜色规范
- **蓝色文字**：硬编码输入（用户会更改的假设值）
- **黑色文字**：所有公式和计算
- **绿色文字**：从其他工作表引用的链接

---

## 六、PDF文档处理（pdf）

### 工作流程

```
用户: "填写这份PDF表单"
    ↓
Step 1: 检测是否有可填字段
  > python scripts/check_fillable_fields.py form.pdf
    ↓
┌──────────────┬──────────────────────────────────┐
│ 有可填字段   │ 无可填字段                        │
├──────────────┼──────────────────────────────────┤
│ 提取字段信息 │ PDF转图片分析                     │
│ 填写字段值   │ 确定填写位置                       │
│ 输出新PDF    │ 创建注释层填写                     │
└──────────────┴──────────────────────────────────┘
```

### 常用工具
| 任务 | 推荐工具 |
|------|----------|
| 合并PDF | pypdf |
| 拆分PDF | pypdf |
| 提取文本 | pdfplumber |
| 提取表格 | pdfplumber |
| 创建PDF | reportlab |

---

## 七、PPT演示文稿处理（pptx）

### 三种场景

| 场景 | 说明 |
|------|------|
| 从零创建 | 使用 html2pptx 工作流 |
| 基于模板 | 先分析模板，再替换内容 |
| 编辑现有 | 解压 → 修改XML → 打包 |

### 关键脚本：thumbnail.py

生成缩略图网格是**视觉验证的关键**：

```bash
python scripts/thumbnail.py output.pptx thumbnails --cols 4
```

产出 thumbnails.jpg，用于检查布局是否正确。

---

## 八、实战案例

### 案例1：调研报告全流程

```
deep-research → docx（生成报告）+ image-service（配图）→ pptx（汇报PPT）
```

### 案例2：销售数据分析

```
csv-summarizer → xlsx（Excel报表 + 公式 + 图表）→ recalc.py（重算验证）
```

### 案例3：合同批量处理

```
读取CSV → docx修订工作流（循环生成）→ 10份合同
```

---

## 九、常见问题

| 问题 | 解决方案 |
|------|----------|
| Word格式丢失 | 使用OOXML工作流 |
| Excel公式显示为字符串 | `python recalc.py` |
| PDF表单填不了 | 检查是否有可填字段 |
| PPT布局错乱 | 生成缩略图检查修复 |

---

## 十、关键要点

1. **一句话触发**：直接说需求，AI自动判断用哪个工作流
2. **公式优先**：Excel用公式，文件才是活的
3. **视觉验证**：PPT一定要生成缩略图检查布局
4. **Skill协同**：办公四件套可以串联其他Skill，实现全流程自动化

---

*下期预告：视频生成——故事拆镜→批量生图→配音→合成视频*

---

## 相关链接

- [[OpenCode入门指南]] - 环境搭建与快速上手
- [[Agent Skills深度解析]] - 技能包系统详解
- [[OpenCode入门指南]] - 环境搭建与快速上手
- [[Agent Skills深度解析]] - 技能包系统详解
- [[OpenCode多模态图像服务]] - 多模态能力详解
- [[OpenCode视频生成]] - 视频生成一条龙