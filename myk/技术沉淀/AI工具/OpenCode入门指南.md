# OpenCode 入门指南

## 什么是 OpenCode

OpenCode 是一个开源的 AI Agent 终端工具，让 AI 能够真正"干活"——操作文件、执行命令、调用工具，而不是仅仅输出文字。

## 核心价值

**传统 AI**：你问 → 它回答文字 → 你自己动手
**AI Agent**：你下指令 → 它理解 → 调用工具 → 真正执行 → 反馈结果

本质：AI 大脑 + 工具箱 = 能执行任务的智能体

## OpenCode vs Claude Code

| 对比项 | OpenCode | Claude Code |
|-------|----------|-------------|
| 开发方 | 社区开源（SST 团队） | Anthropic 官方 |
| 价格 | 免费模型可用 | 需付费 |
| 模型支持 | 所有模型 | 仅 Claude |
| Skills | 完全兼容 | 支持 |

**结论**：两者功能几乎一致，Skills 格式兼容。先用 OpenCode 上手，后续可无缝迁移到 Claude Code。

## 快速上手流程

### 1. 安装

```bash
# macOS/Linux
curl -fsSL https://get.opencode.ai | sh

# Windows
scoop install opencode

# npm（全平台）
npm i -g opencode-ai@latest
```

### 2. 创建工作目录

```bash
mkdir ~/my-ai-workspace
cd ~/my-ai-workspace
echo "# AI 工作手册" > AGENTS.md
```

### 3. 配置模型

三种方式：
- **免费体验**：选择 free 模型
- **官方 API**：配置 Claude/OpenAI API Key
- **第三方中转**：配置 OpenAI 兼容的 API

配置文件位置：`~/.config/opencode/opencode.json`

### 4. 验证

启动后输入指令测试，如"创建一个 test.md 文件"。

## AGENTS.md：AI 的工作手册

AGENTS.md 是定义 AI 行为的核心文件，告诉 AI：
- 身份设定（你是谁）
- 性格特点（怎么说话）
- 工作规则（该怎么做）
- 文件规范（放哪里）

**示例结构**：
```markdown
# AI 管家工作规范

## 身份设定
- 名字、角色、搭档关系

## 性格特点
- 沟通风格、工作态度

## 工作空间
- 目录结构、文件规范

## 每日工作流程
- 早间、日间、下班任务

## 技能清单
- 已安装技能及触发场景
```

## Agent Skills 技能包

Skills 是告诉 AI 遇到特定任务该怎么做的"说明书"。

**作用**：
- 让 AI 学会特定领域的工作流程
- 一句话触发，全流程自动化
- 替代传统固定工作流，更灵活智能

**安装方式**：
1. 下载 Skill 文件
2. 放到 `.opencode/skills/` 目录
3. 在 AGENTS.md 里注册
4. 重启 OpenCode

## 常见问题

| 问题 | 解决方案 |
|-----|---------|
| Provider not configured | 运行 `/connect` 配置模型 |
| API Key invalid | 检查 Key 是否正确 |
| Rate limit exceeded | 等待或换模型 |
| File not found: AGENTS.md | 确保在正确目录启动 |

## 注意事项

1. **安全性**：在专门的工作目录启动，避免操作敏感文件
2. **模型选择**：新手先用 free 模型体验，后续按需调整
3. **非程序员也能用**：只需要会说话，把需求说清楚即可

---

## 来源

- 原文：[玩转 OpenCode(一)：5分钟搭建一个专属个人超级的智能体](https://mp.weixin.qq.com/s/gbxNIHHhLEGfbZQLh0lqWQ)
- 公众号：翟星人的实验室
- 收录日期：2026-03-10

> 注：原文提及 "Claude 4 Sonnet"、"GPT-5" 等版本号，截至目前尚未发布，可能为作者笔误或预想，请以实际发布为准。

---

## 相关链接

- [[Agent Skills深度解析]] - Skills 原理、结构与编写实战