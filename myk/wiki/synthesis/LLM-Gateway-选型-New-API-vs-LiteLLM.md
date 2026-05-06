---
title: "LLM Gateway 选型：New-API vs LiteLLM"
created: 2026-04-19
updated: 2026-04-19
sources: ["../调研笔记/new-api-vs-LiteLLM/new-api-vs-LiteLLM调研报告.md"]
tags: [LLM, Gateway, LLM 路由, New-API, LiteLLM, 选型决策]
status: active
related_concepts: ["concepts/MCP-协议"]
---

# LLM Gateway 选型：New-API vs LiteLLM

> LLM 网关是企业 AI 基础设施的核心，New-API 和 LiteLLM 定位截然不同：前者是商业运营平台，后者是企业级 AI 网关。

---

## 一句话决策

**并行使用（推荐方案 A）**：LiteLLM 作为主网关服务国际模型，New-API 作为国内网关服务国内模型。两者都提供 OpenAI 兼容接口，迁移成本为零。

---

## 核心差异定位

| 维度 | New-API | LiteLLM Gateway |
|------|---------|-----------------|
| **本质定位** | LLM 商业运营平台（API 售卖、渠道分发） | 企业 AI 网关（统一调用、成本追踪、策略治理） |
| **开发语言** | Go（单二进制部署，<5ms 延迟） | Python（异步 FastAPI，12-15ms 中位数） |
| **许可证** | ⚠️ AGPLv3（网络服务须开源） | MIT（几乎无限制） |
| **中文生态** | 原生支持通义/文心/智谱/豆包/混元 + 易支付 | 需手动配置，英文为主 |
| **企业功能** | 基础 RBAC、Token 额度 | 完善 RBAC、SSO、审计、Guardrails、MCP |

---

## 全面对比

### 模型支持

| 类型 | New-API | LiteLLM |
|------|---------|---------|
| 国际主流 | 通过 OpenAI 兼容 | 原生支持 100+ 提供商 |
| 国内大模型 | **原生支持**（通义/文心/智谱/豆包/混元） | 需手动配置 OpenAI 兼容 |
| 创意模型 | **Midjourney、Suno 原生支持** | 不支持 |
| 云厂商 | 不支持 AWS/Vertex | 支持 Bedrock、Vertex AI |

### 企业功能

| 功能 | New-API | LiteLLM |
|------|---------|---------|
| 多租户 | 用户组 + 渠道组 | 组织→团队→用户（层级架构） |
| RBAC | 基础（root/admin/user） | 完善（proxy_admin/org_admin/team_admin 等） |
| SSO | GitHub/微信/OIDC | 企业版 SSO/SAML |
| 计费追踪 | Token 额度 + 倍率分组 | 多维度 + 预算上限 + 预警 + 自动限流 |
| 在线支付 | **易支付/Stripe 原生** | 无内置 |
| Guardrails | ❌ 不支持 | 内容审查 + 关键词屏蔽 + Secret 检测 |
| 负载均衡 | 渠道加权随机 | 权重路由 + 语义路由 + Tag 路由 |
| MCP 协议 | ❌ 不支持 | ✅ 支持 |
| A/B 测试 | ❌ 不支持 | 流量镜像 |
| 可观测性 | 基础数据看板 | Langfuse/Langsmith/Datadog/Prometheus/Slack |

### 风险识别

| 风险项 | 严重程度 | 说明 |
|--------|---------|------|
| AGPLv3 许可证 | 🔴 高 | 修改后需开源，网络服务也视为分发 |
| 仅供个人学习声明 | 🟡 中 | README 标注不保证稳定性 |
| 缺乏企业级治理 | 🟡 中 | 无 SSO/审计日志/完善 RBAC |
| 无可观测性集成 | 🟡 中 | 内置看板不够专业 |
| 缺少 MCP/A2A 支持 | 🟢 低 | 如果未来需要 Agent 框架集成 |

---

## 三个方案对比

| 方案 | 架构 | 优势 | 劣势 | 适用场景 |
|------|------|------|------|---------|
| **A：并行使用（推荐）** | LiteLLM 主 + New-API 国内 | 零迁移成本，各取所长 | 需要维护两套 | 国际+国内混合 |
| **B：LiteLLM + 适配** | 单一 LiteLLM 网关 | 统一管理，企业功能完整 | 国内模型适配工作量大 | 以国际模型为主 |
| **C：完全替换 New-API** | 单一 New-API 网关 | 国内模型开箱即用 | AGPLv3 风险，失去企业功能 | 国内模型核心业务 |

---

## 相关页面
- [[Harness-Engineering-技能工程|Harness Engineering 技能工程]] — LLM 技能工程方法论
- [[Agent-as-Teammate]] — 多 Agent 协作范式
- [[MCP-协议|MCP 协议]] — LiteLLM 支持的 AI 工具标准桥接协议

## 来源
- [[myk/调研笔记/new-api-vs-LiteLLM/new-api-vs-LiteLLM调研报告|New-API vs LiteLLM 深度调研报告]]
