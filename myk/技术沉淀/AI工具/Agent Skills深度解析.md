# Agent Skills 深度解析

> 本篇是 [[OpenCode入门指南]] 的续篇，深入讲解 Skills 技能包系统。

## 为什么需要 Skills？

AI 就像新员工，很聪明但不知道具体流程。每次下指令都要解释一遍细节，很累。

Skills = 给 AI 写的 SOP（标准作业流程）。

有了 Skills，AI 拿到任务就知道该怎么做，不用每次都问。

---

## Skills 工作原理

### 三级加载机制

Skills 采用**渐进式加载**，不是一股脑全塞给 AI。

| 层级  | 内容                        | 加载时机   | 大小建议   |
| --- | ------------------------- | ------ | ------ |
| L1  | name + description        | 始终在上下文 | ~100词  |
| L2  | SKILL.md 正文               | 技能触发时  | <5000词 |
| L3  | scripts/references/assets | 按需加载   | 不限     |

**AI 平时只看 L1，知道有啥技能。需要时再翻说明书（L2），用到工具再去拿（L3）。**

### 触发匹配逻辑

关键在于 **description 字段**——写明"什么时候用这个技能"。

AI 把用户说的话和所有 Skill 的 description 做匹配：

```
用户说："帮我整理下今天的AI新闻"
       ↓
匹配到 Skill：description 包含 "整理新闻"、"每日新闻" 等关键词
       ↓
触发该 Skill
```

**description 写得好不好，直接决定 Skill 能不能被正确触发。**

### 与传统工作流的本质区别

| 对比项 | 传统工作流 | Agent Skills |
|-------|-----------|--------------|
| 执行方式 | 死板流程图：步骤1→步骤2→步骤3 | 智能 SOP：目标导向，灵活绕路 |
| 异常处理 | 遇到问题就报错停止 | 自己想办法绕过，继续完成任务 |
| 典型场景 | 某个网站挂了 → 流程中断 | 跳过该源，从其他源补充 |

**本质区别**：传统工作流遇到问题装死，Agent Skills 聪明地绕路达成目标。

### Token 消耗的关键区别

| 内容类型           | Token 消耗 | 原因            |
| -------------- | -------- | ------------- |
| SKILL.md 正文    | 占用上下文    | AI 要看内容，属于提示词 |
| scripts/ 脚本    | 不占上下文    | AI 只是调用执行     |
| references/ 参考 | 不占上下文    | AI 按需读取，用完即弃  |

**结论**：SKILL.md 越长越费 token。把复杂逻辑写成脚本，AI 只需一行命令调用，零 token 消耗，结果 100% 一致。

### MCP 与 Skills 的关系

**不是替代关系，是互补关系。**

| 对比项 | MCP | Skills |
|-------|-----|--------|
| 解决什么 | AI 能做什么 | AI 怎么做 |
| 类比 | 器官/工具（手、眼、耳） | 技能/经验（打篮球、开车） |
| 形式 | 协议 + Server | Markdown 文件 |
| 作用 | 提供能力 | 编排能力 |

**MCP 给能力，Skills 给流程。两者配合，才是完整的 AI Agent。**

---

## Skill 结构详解

### 目录结构

**最简版**（只有一个文件）：
```
searchnews/
└── SKILL.md
```

**生产级**（完整结构）：
```
searchnews/
├── SKILL.md          # 技能定义
├── scripts/          # 可执行脚本
│   └── collect.sh
└── references/       # 参考资料
    └── sources.md
```

### SKILL.md 内部结构

```
┌─────────────────────────────────────┐
│ ① 头部元数据（frontmatter）│ 触发匹配依据
├─────────────────────────────────────┤
│ ② 概述（Overview）              │ 快速理解定位
├─────────────────────────────────────┤
│ ③ 工作流程（Workflow）              │ 分步骤 SOP
├─────────────────────────────────────┤
│ ④ 资源引用（References）            │ 工具路径
├─────────────────────────────────────┤
│ ⑤ 质量要求（Checklist）             │ 执行检查清单
└─────────────────────────────────────┘
```

### 示例：新闻聚合 Skill

```markdown
---
name: searchnews
description: |
  用户提到：整理新闻、每日新闻、AI新闻、抓取新闻、新闻聚合时触发
---

## 概述
自动抓取多个 AI 新闻源，去重后输出到指定目录。

## 工作流程

### 步骤1：确定日期
- 用户说"今天"就用当天日期
- 用户说"昨天"就用前一天日期

### 步骤2：抓取新闻
从以下源抓取：
- AIBase: https://www.aibase.com
- IT之家: https://www.ithome.com
- 36氪: https://36kr.com
- 量子位: https://www.qbitai.com

### 步骤3：去重
- 按标题相似度去重（>80%视为重复）

### 步骤4：格式化输出
输出到：dailynews/{日期}/news.md

## 质量要求
- [ ] 所有新闻都是目标日期的
- [ ] 没有重复内容
- [ ] 格式符合规范
```

### 简版 vs 升级版

| 类型 | 特点 | 适用场景 |
|-----|------|---------|
| 简版（纯 Markdown） | 零代码，上手快，偶尔漂移 | 快速验证、偶尔用 |
| 升级版（Markdown+脚本） | 结果稳定，长期可靠 | 每天用、要求高 |

**建议**：先用简版跑起来，发现问题再升级。

### 编写技巧

| 技巧 | 说明 |
|-----|------|
| description 要全 | 把用户可能说的话都列进去，覆盖越全匹配越准 |
| 流程要具体 | 不要写"整理后输出"，要写清楚每一步怎么做 |
| SKILL.md 要精简 | 大段配置放 references/，主文件越短 AI 越能抓住重点 |
| 复杂逻辑用脚本 | 去重、格式化写成脚本，AI 调用即可，结果稳定 |

---

## Skills 从哪来？

### 官方资源

| 名称 | 链接 | 说明 |
|-----|------|------|
| Anthropic Skills | github.com/anthropics/skills | 官方 10+ Skills |
| OpenCode Docs | opencode.ai/docs | 官方文档 |
| Claude Code Docs | code.claude.com/docs | 官方 Skills 文档 |

### GitHub Awesome 合集（推荐）

| 名称 | Stars | 链接 |
|-----|-------|------|
| everything-claude-code | 23.3k⭐ | 完整配置集合 |
| awesome-claude-code | 21.6k⭐ | 最全资源合集 |
| awesome-claude-code-subagents | 8.6k⭐ | 100+ 子代理 |
| awesome-claude-skills | 5.8k⭐ | Skills 专项 |
| awesome-agent-skills（中文） | 1.1k⭐ | 中文指南 |

### Skills 商店/市场

| 名称 | 链接 |
|-----|------|
| skills.sh | skills.sh |
| skillsmp.com | skillsmp.com |
| agentskills.me | agentskills.me |

### 让 AI 帮你写

直接跟 AI 说需求：
> 帮我创建一个技能，能够：
> 1. 每天早上抓取 Hacker News 的热门文章
> 2. 翻译成中文
> 3. 保存到 dailynews/ 目录

AI 会自动创建目录结构和 SKILL.md 文件。

---

## 常见问题

| 问题 | 解决方案 |
|-----|---------|
| Skill 没被识别 | 检查文件名是否是 `SKILL.md`（全大写），目录是否在 `.opencode/skills/` 下 |
| 多个 Skill 冲突 | 让 description 更具体、更有区分度 |
| 怎么调试 | 让 AI 告诉你它匹配到了哪个 Skill，分步执行看哪一步出问题 |
| Skill 能调用其他 Skill 吗 | 可以，在 SKILL.md 里写明依赖关系 |

---

## 来源

- 原文：[玩转 OpenCode(二)：Agent Skills 深度解析](https://mp.weixin.qq.com/s/8Q1dq6F_vPSlrMWOqCbFVA)
- 公众号：翟星人的实验室
- 收录日期：2026-03-10

---

## 相关链接


- [[OpenCode入门指南]] - 环境搭建与快速上手
- [[OpenCode多模态图像服务]] - 多模态能力详解
- [[OpenCode办公四件套]] - Word/Excel/PDF/PPT文档处理
- [[OpenCode视频生成]] - 视频生成一条龙