# 教育资源优质均衡发展评估系统 Implementation Plan

> **For agentic workers:** You have zero context about this project. Read the spec first: `docs/superpowers/specs/2026-05-14-education-assessment-design.md`
> Follow each step exactly. Commit after each task. Run tests when instructed.

## Spec

`docs/superpowers/specs/2026-05-14-education-assessment-design.md`

## File Structure

### 后端 (SpringBoot)

```
edu-assessment/
├── src/main/java/com/edu/assessment/
│   ├── EduAssessmentApplication.java          # 启动类
│   ├── config/
│   │   └── WebConfig.java                     # CORS等配置
│   ├── entity/
│   │   ├── EduInstitution.java                # 教育机构实体
│   │   ├── IndicatorDict.java                 # 指标字典实体
│   │   ├── IndicatorRawData.java              # 原始数据实体
│   │   ├── IndicatorResult.java               # 计算结果实体
│   │   ├── DiagnosisResult.java               # 诊断结果实体
│   │   ├── SurveyRecord.java                  # 问卷记录实体
│   │   └── IndicatorTrend.java                # 趋势追踪实体
│   ├── mapper/
│   │   ├── EduInstitutionMapper.java
│   │   ├── IndicatorDictMapper.java
│   │   ├── IndicatorRawDataMapper.java
│   │   ├── IndicatorResultMapper.java
│   │   ├── DiagnosisResultMapper.java
│   │   ├── SurveyRecordMapper.java
│   │   └── IndicatorTrendMapper.java
│   ├── service/
│   │   ├── IndicatorCalculateService.java     # 指标计算核心服务
│   │   ├── StandardizationService.java        # 标准化服务
│   │   ├── CvCalculator.java                  # 差异系数计算器
│   │   ├── DiagnosisService.java              # 诊断引擎
│   │   ├── SuggestionService.java             # 建议引擎
│   │   ├── TrendService.java                  # 趋势引擎
│   │   ├── AssessmentService.java             # 综合评估服务
│   │   └── DataImportService.java             # 年报导入服务
│   ├── controller/
│   │   ├── InstitutionController.java         # 机构管理API
│   │   ├── IndicatorController.java           # 指标查询API
│   │   ├── AssessmentController.java          # 评估计算API
│   │   ├── DiagnosisController.java           # 诊断建议API
│   │   ├── DataImportController.java          # 数据导入API
│   │   └── DashboardController.java           # 仪表盘API
│   └── dto/
│       ├── AssessmentOverviewDTO.java          # 仪表盘概览
│       ├── DimensionScoreDTO.java              # 维度得分
│       ├── DiagnosisDTO.java                   # 诊断结果
│       └── TrendDTO.java                       # 趋势数据
├── src/main/resources/
│   ├── application.yml
│   ├── mapper/                                 # MyBatis XML
│   └── db/
│       └── schema.sql                          # 建表SQL
│       └── indicator_dict_seed.sql             # 指标字典初始数据
│       └── suggestion_template_seed.sql         # 建议模板初始数据
└── pom.xml
```

### 前端 (Vue)

```
edu-assessment-web/
├── src/
│   ├── views/
│   │   ├── Dashboard.vue                       # 仪表盘主页
│   │   ├── IndicatorDetail.vue                 # 指标详情
│   │   ├── DiagnosisReport.vue                 # 诊断报告
│   │   └── DataImport.vue                      # 数据导入
│   ├── components/
│   │   ├── ScoreCard.vue                       # 得分卡片
│   │   ├── RadarChart.vue                      # 雷达图
│   │   ├── WeaknessList.vue                    # 薄弱环节列表
│   │   ├── SuggestionPanel.vue                 # 建议面板
│   │   └── TrendChart.vue                      # 趋势折线图
│   ├── api/
│   │   └── assessment.js                       # API调用
│   └── utils/
│       └── format.js                           # 格式化工具
└── package.json
```

---

## Tasks

### Phase 1: 项目骨架与数据库（Day 1-2）

---

#### Task 1: 创建SpringBoot项目骨架

- 用 Spring Initializr 创建项目，引入 Web / MyBatis Plus / MySQL 驱动
- 配置 `application.yml`：数据库连接、端口8081、MyBatis Plus配置
- 创建 `EduAssessmentApplication.java` 启动类
- 配置 `WebConfig.java` 允许前端跨域
- 启动验证：`mvn spring-boot:run` 能正常启动

**Verify**: 访问 `http://localhost:8081/actuator/health` 返回 UP

**Commit**: `feat: 初始化SpringBoot项目骨架`

---

#### Task 2: 创建数据库表与初始数据

- 编写 `schema.sql`：创建设计规格中7张表（edu_institution / indicator_dict / indicator_raw_data / indicator_result / diagnosis_result / survey_record / indicator_trend）
- 编写 `indicator_dict_seed.sql`：录入义务教育优质均衡32项指标的基础数据（编码、名称、维度、量化方法、阈值、权重等）
- 编写 `suggestion_template_seed.sql`：录入至少10条建议模板（覆盖诊断系数最高的指标）
- 本地执行建表和种子数据导入
- 验证：`SELECT COUNT(*) FROM indicator_dict` 应返回32

**Verify**: 所有7张表创建成功，indicator_dict有32条记录

**Commit**: `feat: 创建数据库表与指标字典初始数据`

---

#### Task 3: 创建实体类与Mapper

- 为7张表创建对应的Java实体类（`entity/`目录），使用MyBatis Plus注解
- 创建对应的Mapper接口（`mapper/`目录），继承BaseMapper
- 编写单元测试：验证Mapper的CRUD操作正常
- 特别注意：`IndicatorRawData`的三值字段（numeric_value/text_value/enum_value）需要正确映射

**Verify**: 运行Mapper CRUD单元测试全部通过

**Commit**: `feat: 创建实体类与Mapper`

---

### Phase 2: 指标计算核心（Day 3-5）

---

#### Task 4: 实现标准化服务

- 创建 `StandardizationService.java`
- 实现6种标准化方法：
  - `binaryNormalize(rawValue)` → 0或100
  - `completionNormalize(completed, partial, total)` → 0-100
  - `coverageNormalize(rate, thresholds)` → 阶梯映射0-100
  - `expertScoreNormalize(scores)` → 多人取均值
  - `cvReverseNormalize(cv, threshold)` → 反向映射0-100
  - `vetoNormalize(triggered)` → 0或100
- 为每种方法编写单元测试，覆盖边界值：
  - binary: 0→0, 1→100
  - completion: 5完成/2部分/10总数→60
  - coverage: 95%→100, 90%→80, 70%→65.88
  - cvReverse: CV=0,threshold=0.5→100; CV=0.5,threshold=0.5→0; CV=0.3→40
  - veto: triggered=true→0, triggered=false→100

**Verify**: 所有6种标准化方法单元测试通过

**Commit**: `feat: 实现指标标准化服务`

---

#### Task 5: 实现差异系数计算器

- 创建 `CvCalculator.java`
- 实现加权差异系数计算：
  - 输入：各学校某指标值数组 + 各学校学生数数组（加权因子）
  - 输出：{ 平均值, 标准差, CV值, 是否达标(threshold比对) }
- 计算公式：
  - 加权均值 = Σ(xi × pi) / Σpi
  - 加权标准差 = sqrt(Σ(pi × (xi - 加权均值)²) / Σpi)
  - CV = 加权标准差 / 加权均值
- 单元测试：
  - 等值数据→CV=0
  - 已知数据集→验证CV精确到小数点后4位
  - 阈值判定：CV=0.48 < 0.50 → 达标；CV=0.51 > 0.50 → 不达标

**Verify**: 差异系数计算器单元测试通过

**Commit**: `feat: 实现差异系数计算器`

---

#### Task 6: 实现指标计算核心服务

- 创建 `IndicatorCalculateService.java`
- 实现单指标计算流程：
  1. 从indicator_raw_data读取某指标所有机构原始数据
  2. 根据indicator_dict的quant_method选择标准化方法
  3. 调用StandardizationService标准化
  4. 若需差异系数，调用CvCalculator
  5. 将结果写入indicator_result
- 实现批量计算：遍历所有指标，逐个计算
- 实现维度得分聚合：按dimension分组汇总
- 实现综合得分：Σ(维度得分 × 维度权重)
- 实现达标判定逻辑（含一票否决检查）
- 单元测试：使用mock数据验证端到端计算流程

**Verify**: 指标计算服务端到端单元测试通过

**Commit**: `feat: 实现指标计算核心服务`

---

### Phase 3: 诊断与建议引擎（Day 5-6）

---

#### Task 7: 实现诊断引擎

- 创建 `DiagnosisService.java`
- 实现诊断系数计算：`指标权重 × (100 - 指标标准化得分) / 100`
- 实现县域维度的诊断结果排序（诊断系数从高到低）
- 实现维度内排名
- 将诊断结果写入diagnosis_result表
- 单元测试：验证排序和排名逻辑

**Verify**: 诊断引擎单元测试通过

**Commit**: `feat: 实现薄弱环节诊断引擎`

---

#### Task 8: 实现建议引擎

- 创建 `SuggestionService.java`
- 从数据库读取建议模板（suggestion_template表）
- 实现匹配逻辑：取诊断系数TOP5指标，匹配模板
- 无模板时生成通用建议
- 将建议写回diagnosis_result的suggestion字段
- 单元测试：验证模板匹配和通用建议生成

**Verify**: 建议引擎单元测试通过

**Commit**: `feat: 实现改进建议引擎`

---

#### Task 9: 实现趋势引擎

- 创建 `TrendService.java`
- 实现同比变化率计算：`(本年得分 - 去年得分) / 去年得分 × 100%`
- 实现趋势方向判定：变化率>2%=up，<-2%=down，其余=stable
- 将趋势数据写入indicator_trend表
- 单元测试：验证变化率和趋势方向

**Verify**: 趋势引擎单元测试通过

**Commit**: `feat: 实现趋势追踪引擎`

---

### Phase 4: API与数据导入（Day 7-8）

---

#### Task 10: 实现REST API

- `InstitutionController`: 机构列表、机构详情、机构新增
- `IndicatorController`: 指标字典列表、指标详情
- `AssessmentController`: 触发评估计算、查询评估结果
- `DiagnosisController`: 查询诊断结果、建议
- `DashboardController`: 仪表盘概览数据（综合得分、维度得分、TOP5薄弱、预警）
- `DataImportController`: 年报导入接口
- 为每个Controller编写集成测试（使用MockMvc）
- 统一响应格式：`{ code: 200, data: {}, message: "success" }`

**Verify**: 所有API集成测试通过

**Commit**: `feat: 实现REST API`

---

#### Task 11: 实现年报导入服务

- 创建 `DataImportService.java`
- 实现Excel解析：使用Apache POI或EasyExcel
- 实现年报模板映射：预置年报字段到指标编码的映射配置
- 实现数据清洗：空值处理、类型转换、异常值过滤
- 实现批量写入indicator_raw_data
- 实现导入结果反馈：成功数/失败数/失败原因
- 集成测试：使用样例年报Excel验证导入流程

**Verify**: 样例Excel导入成功，数据正确写入indicator_raw_data

**Commit**: `feat: 实现年报数据导入`

---

### Phase 5: 前端仪表盘（Day 9-11）

---

#### Task 12: 创建Vue项目与基础配置

- 使用Vue CLI/Vite创建项目
- 安装依赖：ECharts（图表）、Axios（HTTP）、Element Plus（UI组件）
- 配置API代理到后端8081
- 创建基础布局（侧边栏导航 + 主内容区）
- 页面路由：仪表盘/指标详情/诊断报告/数据导入

**Verify**: `npm run dev` 启动成功，路由跳转正常

**Commit**: `feat: 初始化Vue前端项目`

---

#### Task 13: 实现仪表盘主页

- `ScoreCard.vue`: 综合得分卡片（得分+同比变化+达标状态）
- `RadarChart.vue`: 四维度雷达图（ECharts radar）
- `WeaknessList.vue`: 薄弱环节TOP5（诊断系数排序，红/橙/黄预警色）
- `SuggestionPanel.vue`: 改进建议面板
- `TrendChart.vue`: 近3年趋势折线图
- `Dashboard.vue`: 组装以上组件，调用DashboardController API

**Verify**: 仪表盘展示正常，各组件数据联动

**Commit**: `feat: 实现仪表盘主页`

---

#### Task 14: 实现数据导入页面

- `DataImport.vue`: 年报Excel上传页面
- 实现文件拖拽上传
- 上传后显示导入结果（成功数/失败数/失败原因列表）
- 支持下载年报模板（预置Excel模板）

**Verify**: 上传Excel文件，后端正确解析并返回导入结果

**Commit**: `feat: 实现数据导入页面`

---

#### Task 15: 实现指标详情与诊断报告页面

- `IndicatorDetail.vue`: 单指标详情页（原始值、标准化得分、差异系数、阈值对比、趋势图）
- `DiagnosisReport.vue`: 诊断报告页（综合评估结论 + 薄弱环节列表 + 改进建议 + 预警清单）

**Verify**: 指标详情和诊断报告页面展示正常

**Commit**: `feat: 实现指标详情与诊断报告页面`

---

### Phase 6: 集成与验证（Day 12）

---

#### Task 16: 端到端集成测试

- 使用样例数据（模拟一个县域的教育年报数据）走完整流程：
  1. 导入年报Excel → 原始数据入库
  2. 手工填报制度建设类指标
  3. 触发评估计算 → 指标标准化 → 差异系数 → 综合得分
  4. 诊断引擎 → 薄弱环节TOP5
  5. 建议引擎 → 改进建议
  6. 仪表盘展示 → 验证所有数据一致性
- 验证一票否决逻辑：插入一条安全事故记录，确认综合评估变为"不通过"
- 验证趋势计算：插入两年数据，确认同比变化率正确

**Verify**: 端到端流程全部通过，仪表盘数据与计算结果一致

**Commit**: `test: 端到端集成测试`

---

#### Task 17: 手工填报与问卷模块骨架

- 后端：手工填报API（POST /api/raw-data）、审核流程API（PUT /api/raw-data/{id}/review）
- 后端：问卷提交API（POST /api/survey）、社会认可度统计API（GET /api/survey/statistics）
- 前端：手工填报表单页面
- 前端：社会认可度问卷页面（基础版，8维度评分）
- 注意：问卷页面需支持移动端访问（二维码扫码场景）

**Verify**: 手工填报提交成功，审核流程正常，问卷提交和统计正常

**Commit**: `feat: 手工填报与问卷模块骨架`

---

## Summary

| Phase | 内容 | 工期 | 交付物 |
|-------|------|------|-------|
| Phase 1 | 项目骨架与数据库 | Day 1-2 | 可启动的SpringBoot + 7张表 + 32条指标字典 |
| Phase 2 | 指标计算核心 | Day 3-5 | 标准化+差异系数+综合评估 计算引擎 |
| Phase 3 | 诊断与建议引擎 | Day 5-6 | 诊断+建议+趋势 三个引擎 |
| Phase 4 | API与数据导入 | Day 7-8 | REST API + 年报Excel导入 |
| Phase 5 | 前端仪表盘 | Day 9-11 | Vue仪表盘+数据导入+诊断报告 |
| Phase 6 | 集成验证 | Day 12 | 端到端测试通过 + 手工填报/问卷骨架 |

**总计：12个工作日，V1.0可交付。**
