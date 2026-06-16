---
title: "AI 内容创作工具"
created: 2026-04-19
updated: 2026-06-11
sources:
  - "../技术沉淀/技术工具/技术工具收藏索引.md"
  - "myk/项目文档/2026-06-10系统讲解视频自动化方案.md"
tags: [AI, 内容创作, PPT, 视频, 设计, UI, 系统讲解, 自动化]
status: active
---

# AI 内容创作工具

> 从 PPT 到视频，从 UI 设计到数字孪生——2026 年 AI 内容创作工具全景。

---

## PPT 生成

| 工具/Skill | 说明 |
|------------|------|
| **62 个大厂设计师 PPT Skill** | 苏格拉底写申辩篇 PPT，skill 一键直出 |
| **PPT 拆分 10 步** | 把"做 PPT"拆成 10 步，每一步可停下来确认 |
| **DeepSeek 赋能职场应用** | 中央民大+清华 75 页 PPT 含下载 |

## 视频生成

| 工具 | 特点 |
|------|------|
| **35+ 开源视频短剧项目** | 找到最适合你的工具 |
| **35K Star 视频生成** | 用自然语言生成专业视频 |
| **35+ 无人机航拍平台** | 微小目标检测 |

## UI 设计

| 资源 | 说明 |
|------|------|
| **2026 UI 设计全景** | 12 家顶级科技公司的 UI 风格 |
| **12+ 前端设计 Skills** | 附仓库链接 |
| **Google Stitch** | AI 重塑产品设计，跨越设计与代码鸿沟 |
| **AntV Chart Skill** | 产品经理的数据可视化神器 |

## 系统讲解视频自动化

2026-06-10 新增系统 walkthrough / explainer 视频自动化方案。核心判断：已有 Web 系统讲解视频不适合直接用 HTML 视频生成工具替代真实录屏，更稳的路线是分层流水线：

```text
Playwright 自动操作真实系统
→ 录制原始系统操作视频
→ cli-anything-openscreen 自动剪辑、缩放、标注
→ 可选 Hyperframes/html-video 做品牌化包装和 TTS
→ 输出最终 MP4
```

| 层级 | 工具 | 角色 |
|---|---|---|
| 采集层 | Playwright | 自动登录、点击、填写、跳转、录制真实系统操作 |
| 编辑层 | cli-anything-openscreen | 基于操作日志添加 zoom、trim、crop、annotation 并导出 MP4 |
| 包装层 | Hyperframes / html-video | 片头、片尾、章节页、品牌色模板、TTS、字幕条、转场 |

落地建议：先做路线 A（Playwright 录制 + OpenScreen 自动剪辑）跑通 MVP，再扩展路线 B（Hyperframes 品牌包装、字幕条、讲解词、批量队列）。

## 其他创作工具

| 工具 | 说明 |
|------|------|
| **OpenScreen** | 开源取代 Screen Studio，Demo 直接专业 10 倍 |
| **Hyperframes** | HTML/CSS/media/seekable animations 到 MP4 的确定性渲染框架，适合视频包装层 |
| **数字孪生平台** | 即服务平台，完全开源 |
| **科研神器 DeepScientist** | 西湖大学开源，7 天干完博士生一年活 |

## 相关页面
- [[AI-Skill-生态|AI Skill 生态]] — 设计 Skills 生态
- [[GIS数据资源与工具链|GIS 数据资源与工具链]] — 数据可视化

## 来源
- [[myk/技术沉淀/技术工具/技术工具收藏索引|技术工具收藏索引]]
