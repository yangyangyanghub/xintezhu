# 教育资源优质均衡发展评估系统——分层评估模型设计规格

> 日期：2026-05-14
> 状态：待审查
> 关联调研：[[义务教育优质均衡发展评估指标调研报告]] / [[Education-Resource-Evaluation调研报告]] / [[教育质量监测与评估指标调研报告]]
> 关联方案：[[教育资源优质均衡发展评估指标量化方案]]

---

## 1. 概述

### 1.1 系统定位

**智能决策支持系统**——不仅判定达标与否，还能追踪趋势、诊断薄弱环节、输出改进建议。

### 1.2 关键决策记录

| 决策项 | 选择 | 理由 |
|-------|------|------|
| 系统定位 | 智能决策支持系统 | 满足督导评估+日常管理+领导决策三重需求 |
| 权重来源 | 政策文件直接取 | 省事、有依据，后续可迭代AHP |
| 质量数据源 | 督导评估+日常自评混合 | 权威性与实时性兼顾 |
| 技术栈 | Vue + SpringBoot + MySQL | 团队主力栈，GitHub有参考实现 |
| 数据基础 | 教育年报已有，学区数据在整理 | 年报可立即开工，学区数据后续接入 |

### 1.3 指标覆盖范围

| 教育阶段 | 总指标数 | 已量化 | 缺数据可量化 | 不可量化 |
|---------|:-------:|:-----:|:----------:|:-------:|
| 学前教育（普及普惠） | 36项 | 4项 | 2项 | 30项 |
| 义务教育（优质均衡） | 32项 | 7项 | 12项 | 13项 |

---

## 2. 整体架构

```
┌─────────────────────────────────────────────────────┐
│                   前端展示层 (Vue)                     │
│  监测仪表盘 │ 达标判定 │ 趋势追踪 │ 诊断报告 │ 改进建议    │
├─────────────────────────────────────────────────────┤
│                   评估服务层 (SpringBoot)              │
│  综合评估引擎 │ 诊断引擎 │ 建议引擎 │ 趋势引擎              │
├─────────────────────────────────────────────────────┤
│                   指标计算层                           │
│  标准化器 │ 差异系数 │ 覆盖率 │ 二元判定 │ 评分聚合        │
├─────────────────────────────────────────────────────┤
│                   数据采集层                           │
│  年报导入 │ 问卷系统 │ 督导评估 │ 手工填报               │
├─────────────────────────────────────────────────────┤
│                   数据存储层 (MySQL)                   │
│  机构库 │ 指标字典 │ 原始数据 │ 计算结果 │ 时间序列        │
└─────────────────────────────────────────────────────┘
```

### 模块职责

| 模块 | 做什么 | 依赖谁 | 被谁依赖 |
|------|--------|--------|---------|
| 数据存储层 | 存所有原始数据、指标定义、计算结果 | 无 | 数据采集层 |
| 数据采集层 | 从年报/问卷/督导/手工四个管道拿数据 | 存储层 | 指标计算层 |
| 指标计算层 | 将原始数据转化为0-100标准化得分 | 采集层 | 评估服务层 |
| 评估服务层 | 综合评估、诊断、建议、趋势 | 计算层 | 前端展示层 |
| 前端展示层 | 可视化呈现所有评估结果 | 服务层 | 用户 |

---

## 3. 指标标准化

不同量化方法产出不同尺度的值，必须统一映射到0-100分。

### 3.1 标准化规则库

| 量化方法 | 原始值域 | 标准化公式 | 适用指标类型 |
|---------|---------|-----------|------------|
| 二元判定 | 0 或 1 | `原始值 × 100` | 制度建设类 |
| 完成度 | 0%-100% | `(已完成数 + 部分完成数×0.5) / 总数 × 100` | 制度建设类 |
| 覆盖率 | 0%-100% | 阶梯映射：≥95%→100，85-94%→80，<85%→按比例 | 政策落实类 |
| 专家评分 | 0-100 | 直接使用（多人取均值） | 质量水平类 |
| 差异系数 | 0-1（越小越好） | `max(0, (阈值-CV)/阈值 × 100)` | 均衡度指标 |
| 一票否决 | 触发/未触发 | `触发→0，未触发→100` | 安全底线类 |

### 3.2 特殊处理规则

- **差异系数反向映射**：CV越小越好，映射公式翻转
- **一票否决传导**：触发时不仅自身0分，所属维度整体不达标
- **覆盖率阶梯阈值可配置**：不同指标可在指标字典中设不同阈值

### 3.3 指标字典核心字段

```yaml
指标编码: 义务-05
指标名称: 生均体育运动场馆面积
指标类型: 资源配置
量化方法: cv_reverse
小学阈值: 7.5㎡
初中阈值: 10.2㎡
CV阈值: 0.50(小学) / 0.45(初中)
数据来源: annual_report
更新周期: 年度
veto_flag: false
```

---

## 4. 权重体系与综合评估

### 4.1 维度权重（义务教育优质均衡）

| 维度 | 指标数 | 权重 | 依据 |
|------|:-----:|:----:|------|
| 资源配置 | 7项 | 30% | 文件核心要求+差异系数双判定 |
| 政府保障 | 15项 | 30% | 指标数量最多，项项达标 |
| 教育质量 | 9项 | 30% | 评估终极目标 |
| 社会认可度 | 1项 | 10% | 单项但独立调查 |

### 4.2 维度权重（学前教育普及普惠）

| 维度 | 指标数 | 权重 | 依据 |
|------|:-----:|:----:|------|
| 普及普惠水平 | 3项 | 30% | 核心覆盖率指标 |
| 政府保障情况 | 17项 | 40% | 指标数量最多，制度保障是基础 |
| 保教质量保障 | 16项 | 30% | 最终质量体现 |

### 4.3 维度内指标权重

同一维度内各指标等权分配。如资源配置7项，每项 = 30%/7 ≈ 4.3%。后续可按需在指标字典中调整。

### 4.4 综合得分计算

```
综合得分 = Σ(维度得分 × 维度权重)
维度得分 = Σ(指标标准化得分 × 指标权重)
```

### 4.5 达标判定逻辑

```
if 任何一票否决指标触发:
    结论 = "不通过（一票否决）"
elif 综合得分 ≥ 85:
    结论 = "通过"
elif 综合得分 ≥ 70:
    结论 = "基本达标（需整改）"
else:
    结论 = "不通过"
```

### 4.6 薄弱环节诊断

```
诊断系数 = 指标权重 × (100 - 指标标准化得分) / 100

排序规则：诊断系数从高到低
含义：系数越高 = 拖后腿越严重 = 投入改进性价比越高
```

---

## 5. 数据采集层

### 5.1 四条数据管道

#### 管道一：教育年报导入（优先级最高）

```
Excel/CSV 年报文件 → 模板校验 → 数据清洗 → 写入原始数据表
```

年报可覆盖指标（义务教育侧约12项）：

| 指标 | 年报字段 | 量化方法 |
|------|---------|---------|
| 每百名学生拥有高于规定学历教师数 | 教师数+学历+学生数 | 水平值+差异系数 |
| 每百名学生拥有县级以上骨干教师数 | 骨干教师数+学生数 | 水平值+差异系数 |
| 每百名学生拥有体育艺术专任教师数 | 体艺教师数+学生数 | 水平值+差异系数 |
| 生均教学及辅助用房面积 | 用房面积+学生数 | 水平值+差异系数 |
| 生均体育运动场馆面积 | 场馆面积+学生数 | 水平值+差异系数 |
| 生均教学仪器设备值 | 设备值+学生数 | 水平值+差异系数 |
| 每百名学生拥有网络多媒体教室数 | 教室数+学生数 | 水平值+差异系数 |
| 学校规模 | 在校生数 | 水平值判定 |
| 班额 | 班级数+学生数 | 水平值判定 |
| 专任教师持证率 | 持证教师数/教师总数 | 覆盖率 |

年报字段映射表：系统预置年报模板，自动映射到指标字段。年报格式变化时只需调整映射配置。

#### 管道二：在线问卷

```
问卷模板生成 → 二维码/链接投放 → 回收 → 统计计算 → 写入结果表
```

两套问卷：

| 问卷类型 | 对象 | 内容 | 周期 |
|---------|------|------|------|
| 社会认可度调查 | 家长/教师/人大政协 | 按教育部标准8维度设计 | 督导评估前 |
| 学校自评表 | 学校管理员 | 质量类指标自评 | 每学期 |

社会认可度抽样规则（教育部标准）：最低样本量 = 常住人口 × 1‰，家长占比 ≥ 50%，合格线 = 85%。

#### 管道三：督导评估导入

```
督导评估报告 → 标准化评分提取 → 与自评数据加权融合 → 写入结果表
```

融合逻辑：`质量类指标最终得分 = 自评得分 × 0.3 + 督导评估得分 × 0.7`

督导评估作为校准基准权重更高。若当年无督导评估，则纯用自评数据。

#### 管道四：手工填报

```
填报表单 → 必填校验 → 审核流程 → 写入原始数据表
```

适用指标：制度建设类、安全事件记录、无证园治理台账等。填报流程：填写 → 上传证明材料 → 科室负责人审核 → 审核通过进入计算。

#### 管道汇总

| 管道 | 覆盖指标数 | 自动化程度 | 数据新鲜度 |
|------|:---------:|:---------:|:---------:|
| 年报导入 | ~12项 | 高（模板映射） | 年度 |
| 在线问卷 | ~3项 | 高（自动统计） | 按需 |
| 督导评估 | ~10项 | 低（人工提取） | 年度/半年 |
| 手工填报 | ~18项 | 低（人工录入） | 实时 |

---

## 6. 数据库设计

### 6.1 教育机构表

```sql
CREATE TABLE edu_institution (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(32) NOT NULL UNIQUE COMMENT '机构编码',
    name VARCHAR(128) NOT NULL COMMENT '机构名称',
    type TINYINT NOT NULL COMMENT '1=幼儿园 2=小学 3=初中 4=一贯制',
    region_code VARCHAR(12) COMMENT '行政区划编码',
    address VARCHAR(256) COMMENT '地址',
    status TINYINT DEFAULT 1 COMMENT '1=正常 0=停办',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 6.2 指标字典表

```sql
CREATE TABLE indicator_dict (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(32) NOT NULL UNIQUE COMMENT '指标编码',
    name VARCHAR(128) NOT NULL COMMENT '指标名称',
    stage TINYINT NOT NULL COMMENT '1=学前教育 2=义务教育',
    dimension VARCHAR(32) NOT NULL COMMENT '所属维度',
    quant_method VARCHAR(32) NOT NULL COMMENT '量化方法',
    threshold_primary DECIMAL(10,4) COMMENT '小学阈值',
    threshold_junior DECIMAL(10,4) COMMENT '初中阈值',
    cv_threshold_primary DECIMAL(6,4) COMMENT '小学CV阈值',
    cv_threshold_junior DECIMAL(6,4) COMMENT '初中CV阈值',
    data_source VARCHAR(32) COMMENT '数据来源',
    weight_in_dimension DECIMAL(6,4) COMMENT '维度内权重',
    update_cycle VARCHAR(16) COMMENT '更新周期',
    veto_flag TINYINT DEFAULT 0 COMMENT '1=一票否决指标',
    description TEXT COMMENT '指标说明',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 6.3 原始数据表

```sql
CREATE TABLE indicator_raw_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    institution_id BIGINT NOT NULL COMMENT '机构ID',
    indicator_code VARCHAR(32) NOT NULL COMMENT '指标编码',
    data_year SMALLINT NOT NULL COMMENT '数据年度',
    data_semester TINYINT COMMENT '学期',
    numeric_value DECIMAL(16,4) COMMENT '数值型原始值',
    text_value VARCHAR(512) COMMENT '文本型原始值',
    enum_value VARCHAR(32) COMMENT '枚举型原始值',
    source_type VARCHAR(32) NOT NULL COMMENT '数据来源',
    source_file VARCHAR(256) COMMENT '来源文件路径',
    submitter_id BIGINT COMMENT '提交人ID',
    reviewer_id BIGINT COMMENT '审核人ID',
    review_status TINYINT DEFAULT 0 COMMENT '0=待审核 1=已通过 2=已驳回',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_data (institution_id, indicator_code, data_year, data_semester, source_type)
);
```

### 6.4 计算结果表

```sql
CREATE TABLE indicator_result (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    institution_id BIGINT COMMENT '机构ID null=县域汇总',
    indicator_code VARCHAR(32) NOT NULL,
    data_year SMALLINT NOT NULL,
    data_semester TINYINT,
    raw_value DECIMAL(16,4) COMMENT '原始值',
    standardized_score DECIMAL(6,2) COMMENT '标准化得分0-100',
    cv_value DECIMAL(8,4) COMMENT '差异系数',
    is_qualified TINYINT COMMENT '1=达标 0=不达标',
    dimension VARCHAR(32) COMMENT '所属维度',
    dimension_score DECIMAL(6,2) COMMENT '维度得分',
    total_score DECIMAL(6,2) COMMENT '综合得分',
    pass_status VARCHAR(16) COMMENT '通过/基本达标/不通过/一票否决',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_result (institution_id, indicator_code, data_year, data_semester)
);
```

### 6.5 诊断结果表

```sql
CREATE TABLE diagnosis_result (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    region_code VARCHAR(12) NOT NULL COMMENT '区划编码',
    data_year SMALLINT NOT NULL,
    data_semester TINYINT,
    indicator_code VARCHAR(32) NOT NULL,
    diagnosis_coefficient DECIMAL(6,4) NOT NULL COMMENT '诊断系数',
    rank_in_dimension INT COMMENT '维度内排名',
    suggestion TEXT COMMENT '改进建议',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_diagnosis (region_code, indicator_code, data_year, data_semester)
);
```

### 6.6 问卷记录表

```sql
CREATE TABLE survey_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    survey_type VARCHAR(32) NOT NULL COMMENT 'social_recognition/self_evaluation',
    respondent_type VARCHAR(16) NOT NULL COMMENT 'parent/teacher/principal/representative',
    institution_id BIGINT COMMENT '关联机构',
    satisfaction_score DECIMAL(4,2) COMMENT '满意度评分',
    data_year SMALLINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 6.7 趋势追踪表

```sql
CREATE TABLE indicator_trend (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    institution_id BIGINT,
    indicator_code VARCHAR(32) NOT NULL,
    data_year SMALLINT NOT NULL,
    data_semester TINYINT,
    score DECIMAL(6,2) NOT NULL,
    change_rate DECIMAL(6,2) COMMENT '同比变化率%',
    trend_direction VARCHAR(8) COMMENT 'up/down/stable',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_trend (institution_id, indicator_code, data_year, data_semester)
);
```

### 6.8 设计要点

1. **原始数据表通用结构**：numeric_value/text_value/enum_value三字段覆盖所有指标类型
2. **唯一键防重复**：同一年同一指标同一来源只存一条
3. **计算结果表冗余维度和综合得分**：查询时无需JOIN聚合
4. **诊断结果表独立**：诊断是县域维度的，不挂在机构上

---

## 7. 前端仪表盘与改进建议引擎

### 7.1 仪表盘核心模块

| 模块 | 展示内容 | 数据来源 |
|------|---------|---------|
| 综合得分卡 | 综合得分+同比变化 | indicator_result |
| 雷达图 | 四维度得分对比 | indicator_result |
| 薄弱环节TOP5 | 诊断系数排序+原因说明 | diagnosis_result |
| 改进建议 | 匹配模板的建议内容 | diagnosis_result + 建议模板 |
| 趋势对比 | 近3年得分变化折线图 | indicator_trend |

### 7.2 改进建议引擎

预置建议策略模板，按指标匹配：

```yaml
指标编码: 义务-11
指标名称: 教师交流轮岗
条件: 标准化得分 < 60
建议: |
  1. 确保交流比例≥符合条件教师总数的10%
  2. 其中骨干教师占交流总数比例≥20%
  3. 建立交流教师保障机制（住房、交通、待遇）
  4. 将交流轮岗情况纳入学校和教师考核
```

建议生成逻辑：
1. 取诊断系数TOP5指标
2. 匹配指标编码查找建议模板
3. 若无预置模板，生成通用建议
4. 按诊断系数从高到低排序输出

### 7.3 预警规则

| 预警级别 | 触发条件 | 展示方式 |
|---------|---------|---------|
| 红色 | 一票否决触发 / 综合得分<60 | 顶部横幅 |
| 橙色 | 单项指标得分<40 / 维度得分<70 | 指标卡片高亮 |
| 黄色 | 指标同比下降>5% / 接近阈值(差值<5分) | 标签标注 |

---

## 8. 后续迭代方向

| 版本 | 内容 | 前置条件 |
|------|------|---------|
| V1.0 | 年报导入+指标计算+达标判定+仪表盘 | 教育年报数据到位 |
| V1.5 | 在线问卷+社会认可度+手工填报 | 问卷模板设计完成 |
| V2.0 | AHP权重精化+模糊综合评价 | 专家团队到位+数据积累 |
| V2.5 | GIS学区可视化+空间分析 | 学区数据整理完成 |
