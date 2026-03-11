---
date: 2026-03-11
type: 调研报告
领域: AI API
tags: [调研, API, 大模型, OpenAI, Claude, Gemini, 百炼, 混元, 智谱, 豆包, 图像生成]
---

# 国内外AI API接入深度调研报告

> 调研日期：2026年3月11日

---

## 目录

- 一、简介
- 二、启示
- 三、国内厂商API接入
  - 3.1 阿里云百炼
  - 3.2 腾讯混元
  - 3.3 智谱AI
  - 3.4 字节火山引擎
- 四、国外厂商API接入
  - 4.1 OpenAI
  - 4.2 Google Gemini
  - 4.3 Anthropic Claude
- 五、图像生成模型专项
- 六、Coding Plan编程套餐
- 七、接入配置速查表
- 八、附录

---

## 一、简介

本次调研系统梳理了国内外主流AI大模型厂商的API接入方式，涵盖国内阿里云百炼、腾讯混元、智谱AI、字节火山引擎，以及国外OpenAI、Google Gemini、Anthropic Claude等厂商的完整配置信息。

调研内容包括各厂商的base_url、API Key获取方式、文本模型、图像生成模型、多模态模型、定价策略、购买渠道，以及国内用户访问国外API的替代方案。

核心发现：

1. **国内厂商普遍支持OpenAI兼容协议**，迁移成本低，只需替换base_url和api_key即可
2. **阿里云百炼已升级为大模型服务平台**，集成千问系列和第三方模型，提供文本、图像、视频、语音全模态能力
3. **图像生成模型价格差异显著**，国内厂商如智谱CogView约0.06元/张，OpenAI DALL-E 3约0.04-0.12美元/张
4. **Coding Plan套餐**是性价比最高的编程场景解决方案，月费低至¥7.9起

---

## 二、启示

1. **统一接口标准降低迁移成本**
   主流厂商均支持OpenAI兼容协议，开发者可快速在不同厂商间切换，降低厂商锁定风险。

2. **阿里云百炼提供全栈能力**
   从文本、图像、视频、语音到向量嵌入，一站式服务覆盖全模态需求，适合需要多种AI能力的企业。

3. **图像生成成本可控**
   国内图像生成模型如万相、CogView价格亲民，智谱CogView-3低至0.06元/张，适合大规模应用。

4. **Coding Plan是编程场景最优解**
   固定月费、多模型聚合、无欠费风险，适合IDE工具集成和日常编码场景。

5. **国外API需评估访问稳定性**
   OpenAI、Claude、Gemini在国内无法直连，需通过代理或中转服务，增加延迟和成本。

---

## 三、国内厂商API接入

### 3.1 阿里云百炼

阿里云百炼（大模型服务平台）是阿里云推出的一站式大模型服务平台，集成千问系列自研模型和第三方模型，覆盖文本、图像、视频、语音、向量全模态能力。

#### 基本信息

| 项目 | 信息 |
|------|------|
| 官网 | https://www.aliyun.com/product/bailian |
| 文档 | https://help.aliyun.com/zh/model-studio/ |
| 控制台 | https://bailian.console.aliyun.com/cn-beijing/?tab=doc#/doc |

#### API配置

| 部署模式 | Base URL（OpenAI兼容） |
|----------|------------------------|
| 中国内地（北京） | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| 全球（弗吉尼亚） | `https://dashscope-us.aliyuncs.com/compatible-mode/v1` |
| 国际（新加坡） | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |

**认证方式**：API Key，在百炼控制台创建

#### 文本模型（千问系列）

| 模型 | 定位 | 输入价格 | 输出价格 | 上下文 |
|------|------|----------|----------|--------|
| qwen3-max | 旗舰通用 | ¥2.5/百万token | ¥10/百万token | 262K |
| qwen3.5-plus | 均衡之选 | ¥0.8/百万token | ¥2/百万token | 1M |
| qwen-flash | 轻量快速 | ¥0.15/百万token | ¥1.5/百万token | 1M |
| qwen3-coder-plus | 编程专用 | ¥1/百万token | ¥4/百万token | 1M |
| qwen-long | 长文本 | ¥0.5/百万token | ¥2/百万token | 10M |

**第三方模型**：DeepSeek、Kimi、GLM、MiniMax等

#### 图像生成模型

| 模型 | 定位 | 价格 | 特点 |
|------|------|------|------|
| 千问文生图 | 旗舰生图 | 按token计费 | 复杂指令、中英文渲染、高清写实 |
| 万相文生图 | 多风格生图 | 按张计费 | 证件照、电商图、动漫、国风等 |
| Z-Image | 轻量生图 | 按token计费 | 快速生成、中英双语、多风格 |
| Stable Diffusion | 开源生图 | 按token计费 | 社区生态成熟 |
| FLUX | 高质量生图 | 按token计费 | 最新开源模型 |

**图像编辑模型**：千问图像编辑、万相图像编辑、人像风格重绘、虚拟模特、AI试衣等

#### 多模态模型

| 模型 | 能力 | 说明 |
|------|------|------|
| 千问Plus | 视觉理解 | 支持文本+图像+视频输入 |
| 千问VL | 视觉理解 | 专业视觉理解模型 |
| QVQ | 视觉推理 | 视觉推理增强版 |
| 千问Omni | 全模态 | 支持文本、图像、音频、视频 |
| 千问Omni-Realtime | 实时多模态 | 实时音视频交互 |

#### 视频生成模型

| 类型 | 模型 | 说明 |
|------|------|------|
| 文生视频 | 文生视频 | 一句话生成视频 |
| 图生视频 | 首帧生视频 | 图片+提示词生成视频 |
| 数字人 | 万相-数字人、悦动人像EMO | 图+音频生成口型视频 |

#### 语音模型

| 类型 | 模型 | 说明 |
|------|------|------|
| 语音合成 | 千问实时语音合成、CosyVoice | 文本转语音 |
| 语音识别 | 千问实时语音识别、Paraformer | 语音转文本 |

#### 向量模型

| 模型 | 维度 | 说明 |
|------|------|------|
| 文本向量 | 1536维 | 文本向量化，用于搜索、分类 |
| 多模态向量 | - | 文本、图像、语音向量化 |

#### 代码示例

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-bailian-api-key",
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

# 文本对话
response = client.chat.completions.create(
    model="qwen-plus",
    messages=[{"role": "user", "content": "你好"}]
)

# 图像生成
response = client.images.generate(
    model="wanx-v1",
    prompt="一只可爱的猫咪",
    size="1024x1024"
)
```

#### 购买方式

1. 登录阿里云账号
2. 开通百炼服务
3. 控制台充值或购买资源包
4. 新用户有免费额度（100万token）

---

### 3.2 腾讯混元

腾讯混元大模型支持OpenAI兼容接口，提供文本生成和图像生成能力。

#### 基本信息

| 项目 | 信息 |
|------|------|
| 官网 | https://cloud.tencent.com/product/hunyuan |
| 文档 | https://cloud.tencent.com/document/product/1729 |
| 控制台 | https://console.cloud.tencent.com/hunyuan |

#### API配置

| 项目 | 信息 |
|------|------|
| Base URL | `https://api.hunyuan.cloud.tencent.com/v1` |
| 完整端点 | `https://api.hunyuan.cloud.tencent.com/v1/chat/completions` |
| 认证方式 | API Key（控制台创建） |

#### 文本模型与定价

| 模型 | 定位 | 输入价格 | 输出价格 | 上下文 |
|------|------|----------|----------|--------|
| hunyuan-turbos-latest | 旗舰通用 | ¥0.8/百万token | ¥2/百万token | 128K |
| hunyuan-pro | 专业版 | ¥4/百万token | ¥12/百万token | 128K |
| hunyuan-lite | 轻量版（免费） | 免费 | 免费 | 128K |

**免费额度**：新用户100万token免费额度

#### 图像生成模型

| 接口 | 价格 | 说明 |
|------|------|------|
| 混元生图（3.0） | ¥0.2/张 | 旗舰版，高质量 |
| 混元生图（2.0） | ¥0.5/张 | 标准版 |
| 混元生图（极速版） | ¥0.099/张 | 快速生成 |
| 文生图轻量版 | ¥0.099/张 | 轻量级 |

**免费额度**：首次开通赠送50次免费调用

#### 代码示例

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-hunyuan-api-key",
    base_url="https://api.hunyuan.cloud.tencent.com/v1"
)

response = client.chat.completions.create(
    model="hunyuan-turbos-latest",
    messages=[{"role": "user", "content": "你好"}]
)
```

---

### 3.3 智谱AI

智谱AI由清华大学团队创立，GLM系列模型在编程能力上表现优异，CogView图像生成模型支持中文渲染。

#### 基本信息

| 项目 | 信息 |
|------|------|
| 官网 | https://bigmodel.cn |
| 文档 | https://open.bigmodel.cn/dev/api |
| 控制台 | https://open.bigmodel.cn/console |

#### API配置

| 项目 | 信息 |
|------|------|
| Base URL | `https://open.bigmodel.cn/api/paas/v4` |
| 认证方式 | API Key（控制台创建） |

#### 文本模型与定价

| 模型 | 定位 | 输入价格 | 输出价格 | 上下文 |
|------|------|----------|----------|--------|
| GLM-4.7 | 最新旗舰 | ¥5/百万token | ¥15/百万token | 128K |
| GLM-4.6 | 编程优化 | ¥5/百万token | ¥15/百万token | 200K |
| GLM-4-Plus | 高性能 | ¥5/百万token | ¥15/百万token | 128K |
| GLM-4-Air | 高性价比 | ¥0.5/百万token | ¥0.5/百万token | 128K |
| GLM-4-Flash | 免费版 | 免费 | 免费 | 128K |
| GLM-4-Long | 长文本 | ¥1/百万token | ¥1/百万token | 1M |

#### 图像生成模型

| 模型 | 价格 | 特点 |
|------|------|------|
| CogView-3 | ¥0.06/张 | 企业优惠价 |
| CogView-4 | 开源免费 | 首个支持汉字生成的开源模型，6B参数 |

**CogView-4特点**：
- 支持原生中文输入
- 支持汉字绘画
- Apache 2.0开源协议
- DPG-Bench基准测试排名第一

#### 代码示例

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-zhipu-api-key",
    base_url="https://open.bigmodel.cn/api/paas/v4"
)

response = client.chat.completions.create(
    model="glm-4-plus",
    messages=[{"role": "user", "content": "你好"}]
)
```

---

### 3.4 字节火山引擎

字节跳动火山引擎提供豆包大模型，日均处理50万亿tokens，实战能力强。

#### 基本信息

| 项目 | 信息 |
|------|------|
| 官网 | https://www.volcengine.com/product/ark |
| 文档 | https://www.volcengine.com/docs/82379 |
| 控制台 | https://console.volcengine.com/ark |

#### API配置

| 项目 | 信息 |
|------|------|
| Base URL | `https://ark.cn-beijing.volces.com/api/v3` |
| 认证方式 | API Key（控制台创建） |

#### 文本模型与定价

| 模型 | 定位 | 输入价格 | 输出价格 | 上下文 |
|------|------|----------|----------|--------|
| doubao-pro-256k | 旗舰通用 | ¥0.8/百万token | ¥2/百万token | 256K |
| doubao-lite-128k | 轻量版 | ¥0.3/百万token | ¥0.6/百万token | 128K |

#### 支持的第三方模型

- DeepSeek-V3.2
- GLM-4.7
- Kimi-K2.5
- Kimi-K2-Thinking

---

## 四、国外厂商API接入

### 4.1 OpenAI

OpenAI是全球领先的AI公司，GPT系列模型应用最广泛，DALL-E图像生成质量出众。

#### 基本信息

| 项目 | 信息 |
|------|------|
| 官网 | https://openai.com |
| API文档 | https://platform.openai.com/docs |
| 控制台 | https://platform.openai.com |
| 国内访问 | 需代理或中转服务 |

#### API配置

| 项目 | 信息 |
|------|------|
| Base URL | `https://api.openai.com/v1` |
| 认证方式 | API Key（控制台创建） |

#### 文本模型与定价

| 模型 | 定位 | 输入价格 | 输出价格 | 上下文 |
|------|------|----------|----------|--------|
| gpt-5.4 | 最新旗舰 | $2.5/百万token | $15/百万token | 272K |
| gpt-5-mini | 轻量版 | $0.25/百万token | $2/百万token | 272K |
| gpt-4.1 | 通用旗舰 | $2/百万token | $8/百万token | 1M |
| gpt-4.1-mini | 轻量版 | $0.4/百万token | $1.6/百万token | 1M |
| gpt-4o | 多模态 | $2.5/百万token | $10/百万token | 128K |
| gpt-4o-mini | 轻量多模态 | $0.15/百万token | $0.6/百万token | 128K |
| o3 | 推理模型 | $2/百万token | $8/百万token | 200K |

#### 图像生成模型

| 模型 | 价格 | 分辨率 | 特点 |
|------|------|--------|------|
| GPT-Image-1.5 | $0.009-0.2/张 | 多种分辨率 | 最新旗舰，高质量 |
| GPT-Image-1 | $0.011-0.25/张 | 多种分辨率 | 上一代旗舰 |
| GPT-Image-1-Mini | $0.005-0.052/张 | 多种分辨率 | 经济版 |
| DALL-E 3 | $0.04-0.12/张 | 1024x1024~1792x1024 | 高质量，标准/HD两种质量 |
| DALL-E 2 | $0.016-0.02/张 | 最大1024x1024 | 旧版模型 |

**免费额度**：新用户$5免费额度（无需信用卡）

---

### 4.2 Google Gemini

Google的Gemini系列模型，性价比高，支持长上下文，Imagen图像生成能力出众。

#### 基本信息

| 项目 | 信息 |
|------|------|
| 官网 | https://ai.google.dev |
| API文档 | https://ai.google.dev/docs |
| 控制台 | https://aistudio.google.com |
| 国内访问 | 需代理 |

#### API配置

| 项目       | 信息                                                 |
| -------- | -------------------------------------------------- |
| Base URL | `https://generativelanguage.googleapis.com/v1beta` |
| 认证方式     | API Key（AI Studio创建）                               |

#### 文本模型与定价

| 模型                    | 定位  | 输入价格          | 输出价格         | 上下文  |
| --------------------- | --- | ------------- | ------------ | ---- |
| gemini-3.1-pro        | 旗舰  | $2/百万token    | $12/百万token  | 200K |
| gemini-3-flash        | 均衡  | $0.5/百万token  | $3/百万token   | 1M   |
| gemini-2.5-pro        | 高性能 | $1.25/百万token | $10/百万token  | 200K |
| gemini-2.5-flash      | 轻量  | $0.3/百万token  | $2.5/百万token | 1M   |
| gemini-2.5-flash-lite | 超轻量 | $0.1/百万token  | $0.4/百万token | 1M   |
|                       |     |               |              |      |

**免费额度**：无需信用卡，每天1000次请求

#### 图像生成模型

| 模型                     | 价格            | 说明                              |
| ---------------------- | ------------- | ------------------------------- |
| Gemini 3.1 Pro Image   | $0.134-0.24/张 | 旗舰图像生成，支持4K，社区代号Nano Banana Pro |
| Gemini 3.1 Flash Image | $0.039/张      | 高性价比，社区代号Nano Banana 2          |
| Gemini 2.5 Flash Image | $0.039/张      | 高性价比，社区代号Nano Banana            |
| Imagen 4 Fast          | $0.02/张       | 最便宜选项                           |
| Imagen 4 Standard      | $0.04/张       | 标准质量                            |
| Imagen 4 Ultra         | $0.06/张       | 高质量                             |



**社区代号说明**：Google图像生成模型在开发者社区中有独特的代号命名传统。Nano Banana系列是Gemini原生图像生成能力，而Imagen系列则是独立的图像生成模型。
---

### 4.3 Anthropic Claude

Anthropic的Claude系列模型在编程和推理任务上表现优异，暂不支持图像生成。

#### 基本信息

| 项目 | 信息 |
|------|------|
| 官网 | https://www.anthropic.com |
| API文档 | https://docs.anthropic.com |
| 控制台 | https://console.anthropic.com |
| 国内访问 | 需代理或中转服务 |

#### API配置

| 项目 | 信息 |
|------|------|
| Base URL | `https://api.anthropic.com/v1` |
| 认证方式 | API Key（控制台创建） |

#### 文本模型与定价

| 模型 | 定位 | 输入价格 | 输出价格 | 上下文 |
|------|------|----------|----------|--------|
| claude-opus-4.6 | 旗舰 | $5/百万token | $25/百万token | 200K |
| claude-sonnet-4.6 | 均衡 | $3/百万token | $15/百万token | 200K |
| claude-haiku-4.5 | 轻量 | $1/百万token | $5/百万token | 200K |

**图像生成**：Claude不支持图像生成，但支持图像理解（视觉输入）

---

## 五、图像生成模型专项

### 价格对比

| 厂商 | 模型 | 价格 | 特点 |
|------|------|------|------|
| 智谱AI | CogView-3 | ¥0.06/张 | 性价比最高，支持中文 |
| 智谱AI | CogView-4 | 开源免费 | 首个支持汉字的开源模型 |
| 腾讯混元 | 混元生图极速版 | ¥0.099/张 | 快速生成 |
| 腾讯混元 | 混元生图3.0 | ¥0.2/张 | 高质量 |
| Google | Imagen 4 Fast | $0.02/张 | 国外最便宜 |
| OpenAI | DALL-E 3 | $0.04-0.12/张 | 高质量，HD选项 |
| 阿里云百炼 | 万相文生图 | 按张计费 | 多风格，支持电商场景 |

### 选型建议

| 场景 | 推荐模型 | 理由 |
|------|----------|------|
| 大规模低成本 | CogView-3 | ¥0.06/张，性价比最高 |
| 中文文字生成 | CogView-4 | 首个支持汉字的开源模型 |
| 高质量商用 | DALL-E 3 / GPT-Image-1.5 | 质量出众，生态成熟 |
| 电商场景 | 万相文生图 | 支持模特图、商品图 |
| 快速生成 | 混元生图极速版 | ¥0.099/张，速度快 |

---

## 六、Coding Plan编程套餐

Coding Plan是云厂商推出的AI编程订阅套餐，固定月费、多模型聚合、无欠费风险。

### 对比一览

| 平台 | 首月价格 | 模型数量 | API Key格式 |
|------|----------|----------|-------------|
| 阿里云百炼 | ¥7.9/月 | 8款 | `sk-sp-xxxxx` |
| 火山方舟 | ¥9.9/月 | 5款 | 火山方舟API Key |
| 智谱GLM | 限售中 | 5款 | 智谱API Key |

### 阿里云百炼 Coding Plan

| 项目 | 信息 |
|------|------|
| 购买页 | https://www.aliyun.com/benefit/scene/codingplan |
| OpenAI兼容 | `https://coding-intl.dashscope.aliyuncs.com/v1` |
| Anthropic兼容 | `https://coding-intl.dashscope.aliyuncs.com/apps/anthropic` |

**支持模型（8款）**：qwen3.5-plus、qwen3-max、qwen3-coder-next、qwen3-coder-plus、MiniMax-M2.5、GLM-5、GLM-4.7、Kimi-K2.5

**套餐价格**：
| 套餐 | 原价 | 首月优惠 | 每月额度 |
|------|------|----------|----------|
| Lite | ¥40/月 | ¥7.9/月 | 18,000次 |
| Pro | ¥200/月 | ¥39.9/月 | 90,000次 |

### 火山方舟 Coding Plan

| 项目 | 信息 |
|------|------|
| 文档 | https://www.volcengine.com/docs/82379/1925115 |
| Base URL | `https://ark.cn-beijing.volces.com/api/coding` |

**支持模型（5款）**：Doubao-Seed-Code、GLM-4.7、DeepSeek-V3.2、Kimi-K2-Thinking、Kimi-K2.5

---

## 七、接入配置速查表

### 文本模型

| 厂商               | Base URL                                            | 推荐模型                  | 输入价格         |
| ---------------- | --------------------------------------------------- | --------------------- | ------------ |
| 阿里云百炼            | `https://dashscope.aliyuncs.com/compatible-mode/v1` | qwen3.5-plus          | ¥0.8/百万token |
| 腾讯混元             | `https://api.hunyuan.cloud.tencent.com/v1`          | hunyuan-turbos-latest | ¥0.8/百万token |
| 智谱AI             | `https://open.bigmodel.cn/api/paas/v4`              | glm-4-plus            | ¥5/百万token   |
| 火山引擎             | `https://ark.cn-beijing.volces.com/api/v3`          | doubao-pro-256k       | ¥0.8/百万token |
| OpenAI           | `https://api.openai.com/v1`                         | gpt-4.1               | $2/百万token   |
| Google Gemini    | `https://generativelanguage.googleapis.com/v1beta`  | gemini-2.5-flash      | $0.3/百万token |
| Anthropic Claude | `https://api.anthropic.com/v1`                      | claude-sonnet-4-6     | $3/百万token   |

### 图像模型

| 厂商 | 模型 | 价格 |
|------|------|------|
| 智谱AI | CogView-3 | ¥0.06/张 |
| 腾讯混元 | 混元生图极速版 | ¥0.099/张 |
| OpenAI | DALL-E 3 | $0.04-0.12/张 |
| Google | Imagen 4 Fast | $0.02/张 |

---

## 八、附录

### 官方文档链接

**国内厂商**
- 阿里云百炼: https://help.aliyun.com/zh/model-studio/
- 腾讯混元: https://cloud.tencent.com/document/product/1729
- 智谱AI: https://open.bigmodel.cn/dev/api
- 火山引擎: https://www.volcengine.com/docs/82379

**国外厂商**
- OpenAI: https://platform.openai.com/docs
- Google Gemini: https://ai.google.dev/docs
- Anthropic Claude: https://docs.anthropic.com

**Coding Plan**
- 阿里云百炼: https://help.aliyun.com/zh/model-studio/coding-plan
- 火山方舟: https://www.volcengine.com/docs/82379/1925115

### 开源模型仓库

- CogView-4: https://github.com/THUDM/CogView4
- Qwen: https://github.com/QwenLM/Qwen

---

*报告完成于 2026年3月11日*