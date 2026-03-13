# 钉钉API与日报分析技能开发实践

> 本文记录了基于钉钉开放平台API开发员工日报智能分析系统的完整过程，涵盖API对接、数据处理、智能评分、可视化报告生成等核心环节。

---

## 一、项目背景

在日常团队管理中，员工日报是了解工作进度的重要窗口。然而传统的人工查阅方式存在以下问题：

1. **效率低下**：管理者需要逐条阅读大量日报
2. **缺乏量化**：难以客观评价日报质量
3. **问题隐蔽**：流水账式日报难以被及时发现
4. **数据分散**：难以形成有价值的统计分析

为此，我们开发了 `daily-report-analyzer` 技能，实现日报数据的自动获取、智能评分和可视化报告生成。

---

## 二、技术架构

### 2.1 整体流程

```
┌─────────────────────────────────────────────────────────────┐
│                    run_all.py (入口)                        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ fetch_oa_     │    │ analyze_      │    │ generate_     │
│ reports.py    │───▶│ reports.py    │───▶│ report.py     │
│               │    │               │    │               │
│ 钉钉API调用    │    │ 六维度评分     │    │ Markdown报告  │
└───────────────┘    └───────────────┘    └───────────────┘
                                                  │
                                                  ▼
                                         ┌───────────────┐
                                         │ generate_     │
                                         │ html_report.py│
                                         │               │
                                         │ HTML可视化    │
                                         └───────────────┘
```

### 2.2 核心模块

| 模块 | 职责 | 输入 | 输出 |
|------|------|------|------|
| `fetch_oa_reports.py` | 钉钉API数据获取 | 日期、模板名 | `raw_reports.json` |
| `analyze_reports.py` | 智能评分分析 | 原始数据 | `scores.json`, `analysis.json` |
| `generate_report.py` | Markdown报告生成 | 分析结果 | `daily-report.md` |
| `generate_html_report.py` | HTML可视化报告 | 分析结果 | `report.html` |

---

## 三、钉钉API对接

### 3.1 API认证流程

钉钉开放平台采用 OAuth 2.0 认证机制，核心是获取 `access_token`：

```python
class DingTalkOAApprovalClient:
    def __init__(self, app_key: str, app_secret: str):
        self.app_key = app_key
        self.app_secret = app_secret
        self._access_token: Optional[str] = None
        self._token_expire_time: float = 0
    
    def get_access_token(self, force_refresh: bool = False) -> str:
        """获取access_token，带缓存和过期刷新"""
        if not force_refresh and self._access_token and time.time() < self._token_expire_time:
            return self._access_token
        
        url = f"{self.oapi_base}/gettoken"
        params = {
            "appkey": self.app_key,
            "appsecret": self.app_secret
        }
        
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if data.get("errcode") != 0:
            raise Exception(f"获取token失败: {data.get('errmsg')}")
        
        self._access_token = data["access_token"]
        # 提前200秒刷新，避免边界问题
        self._token_expire_time = time.time() + data.get("expires_in", 7200) - 200
        
        return self._access_token
```

**关键点**：
- Token 有效期 7200 秒，建议提前刷新
- 使用内存缓存避免频繁请求
- 配置文件建议存放在 `~/.dingtalk/config.json`

### 3.2 OA审批数据获取

钉钉提供了两套 API：
- **新版 API**：`https://api.dingtalk.com`（RESTful 风格）
- **旧版 API**：`https://oapi.dingtalk.com`（传统风格）

我们混合使用两套 API 以获取完整数据：

```python
def get_all_reports(self, process_code: str, start_date: datetime, end_date: datetime):
    """获取所有日报数据（包含审批信息）"""
    
    # Step 1: 获取审批实例ID列表（新版API）
    instance_ids = self.get_instance_ids(process_code, start_date, end_date)
    
    # Step 2: 逐个获取详情（旧版API，数据更完整）
    all_reports = []
    for instance_id in instance_ids:
        detail = self.get_instance_detail(instance_id)
        
        # 解析审批操作记录
        operation_records = parse_operation_records(detail.get("operation_records", []))
        
        # 解析审批任务
        tasks = parse_tasks(detail.get("tasks", []))
        
        # 计算审批效率
        efficiency = calculate_approval_efficiency(detail)
        
        # 构建统一格式
        report = {
            "report_id": instance_id,
            "creator_id": detail.get("originator_userid"),
            "creator_name": extract_name_from_title(detail.get("title")),
            "dept_name": detail.get("originator_dept_name"),
            "create_time": parse_time(detail.get("create_time")),
            "contents": parse_form_values(detail.get("form_component_values")),
            "approval": {
                "status": detail.get("status"),
                "operation_records": operation_records,
                "tasks": tasks,
                "efficiency": efficiency
            }
        }
        all_reports.append(report)
    
    return all_reports
```

### 3.3 审批效率计算

审批效率是管理流程的重要指标：

```python
def calculate_approval_efficiency(detail: Dict) -> Dict:
    """计算审批效率指标"""
    create_time = detail.get("create_time", "")
    finish_time = detail.get("finish_time", "")
    operation_records = detail.get("operation_records", [])
    
    efficiency = {
        "total_duration_hours": 0,
        "first_approve_delay_hours": 0,
        "is_completed": detail.get("status") == "COMPLETED"
    }
    
    if create_time and finish_time:
        create_dt = datetime.strptime(create_time, "%Y-%m-%d %H:%M:%S")
        finish_dt = datetime.strptime(finish_time, "%Y-%m-%d %H:%M:%S")
        
        # 总审批耗时
        efficiency["total_duration_hours"] = round(
            (finish_dt - create_dt).total_seconds() / 3600, 2
        )
        
        # 首审延迟（从提交到第一个审批人操作）
        if len(operation_records) >= 2:
            first_approve_time = operation_records[1].get("date", "")
            first_approve_dt = datetime.strptime(first_approve_time, "%Y-%m-%d %H:%M:%S")
            efficiency["first_approve_delay_hours"] = round(
                (first_approve_dt - create_dt).total_seconds() / 3600, 2
            )
    
    return efficiency
```

### 3.4 权限配置

需要申请以下权限：

| 权限名称 | 权限代码 | 用途 |
|---------|---------|------|
| 审批实例读权限 | `ProcessInstance.Read` | 获取审批详情 |
| 审批流程读权限 | `Workflow.Process.Read` | 获取流程模板 |
| 部门成员读权限 | `qyapi_get_department_member` | 获取部门人数 |

---

## 四、智能评分系统

### 4.1 六维度评分模型

我们设计了六个维度的评分体系，综合考虑了日报的完整性和质量：

```python
self.weights = {
    "completeness": 0.20,      # 完整度
    "content_quality": 0.25,   # 内容质量（含流水账检测）
    "ai_application": 0.20,    # AI工具应用
    "timeliness": 0.15,        # 及时性
    "workload": 0.10,          # 工作量
    "planning": 0.10           # 计划性
}
```

**权重设计理念**：
- **内容质量**权重最高（25%）：日报的核心价值在于记录工作
- **AI工具应用**权重较高（20%）：鼓励效率工具使用
- **完整度**（20%）：确保日报结构完整

### 4.2 流水账检测算法

流水账检测是本系统的亮点功能：

```python
def _detect_lazy_report(self, work_done: str) -> tuple:
    """检测流水账式日报"""
    
    # 检查1：内容过短
    if len(work_done) < 10:
        return True, "工作内容过短（少于10字）"
    
    # 检查2：只有项目名没有具体描述
    lines = work_done.replace('，', '\n').replace('、', '\n').split('\n')
    lazy_lines = 0
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # 检查是否有动作动词
        has_action = any(word in line for word in ["完成", "进行", "开展", "处理", "修改"])
        has_detail = len(line) > 15
        
        if not has_action and not has_detail:
            lazy_lines += 1
    
    total_lines = len([l for l in lines if l.strip()])
    if total_lines > 0 and lazy_lines / total_lines > 0.5:
        return True, "多行内容缺少具体工作描述"
    
    # 检查3：完全没有动作描述
    action_words = ["完成", "进行", "开展", "处理", "修改", "设计", "整理", "对接"]
    has_any_action = any(word in work_done for word in action_words)
    
    if not has_any_action and len(work_done) < 50:
        return True, "缺少具体工作动作描述"
    
    return False, None
```

**检测逻辑**：
1. 长度检测：少于10字直接判定
2. 语义检测：检查是否包含动作动词
3. 比例检测：超过50%的行缺少描述则判定

### 4.3 AI工具应用评分

AI应用评分强调"解决具体问题"：

```python
def _score_ai_application(self, ai_usage: str) -> int:
    """
    评分规则：
    - 5分: 明确使用AI解决具体问题
    - 4分: 有应用场景但不够具体
    - 3分: 只提到工具名称
    - 2分: 诚实填写未使用
    - 1分: 未填写
    """
    
    # 高价值应用词
    high_value_patterns = ["辅助", "协助", "解决", "生成", "开发", "分析", "处理"]
    
    # 具体工作词
    work_patterns = ["接口", "代码", "规范", "文档", "数据", "报告", "方案"]
    
    has_high_value = any(p in ai_usage for p in high_value_patterns)
    has_work = any(p in ai_usage for p in work_patterns)
    
    if has_high_value and has_work:
        return 5  # "使用AI协助生产管理系统接口开发"
    elif has_high_value or has_work:
        return 4  # "查询相关规范标准号"
    elif any(kw in ai_usage for kw in self.ai_keywords):
        return 3  # "AI豆包应用"
    else:
        return 2  # "无"
```

---

## 五、报告生成

### 5.1 Markdown报告

Markdown报告适合在Obsidian等工具中查看：

```python
def generate_markdown_report(analysis: Dict, scores: Dict, date_str: str) -> str:
    lines = [
        f"# 日报分析报告 - {date_str}",
        "",
        f"> 分析时间：{now} | 应提交：{total}人 | 平均分：{avg_score}",
        "",
        "## 一、整体概况",
        "",
        "| 指标 | 数值 | 说明 |",
        "|------|------|------|",
        f"| 🤖 AI使用率 | {ai_rate}% | 使用AI人数/应提交人数 |",
        f"| ⚠️ 流水账率 | {lazy_rate}% | 流水账人数/应提交人数 |",
        # ... 更多指标
    ]
    return "\n".join(lines)
```

### 5.2 HTML可视化报告

HTML报告使用模板引擎，支持图表可视化：

```python
def generate_html_report(analysis: Dict, scores: Dict, date_str: str) -> str:
    # 读取模板
    with open(TEMPLATE_FILE, "r", encoding="utf-8") as f:
        template = f.read()
    
    # 准备图表数据
    score_dist_data = json.dumps([
        dist.get("excellent", 0),
        dist.get("good", 0),
        dist.get("average", 0),
        dist.get("poor", 0),
        dist.get("bad", 0)
    ])
    
    # 替换占位符
    replacements = {
        "{{DATE}}": date_str,
        "{{AVG_SCORE}}": str(avg_score),
        "{{SCORE_DIST_DATA}}": score_dist_data,
        # ... 更多占位符
    }
    
    result = template
    for placeholder, value in replacements.items():
        result = result.replace(placeholder, value)
    
    return result
```

### 5.3 Excel数据清单

使用pandas生成多Sheet的Excel文件：

```python
def generate_excel_data(analysis: Dict, scores: Dict, output_dir: Path):
    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        # Sheet1: 员工评分明细
        df_scores = pd.DataFrame([{
            "姓名": d.get("creator_name"),
            "部门": d.get("dept_name"),
            "综合分": d.get("scores", {}).get("total"),
            # ...
        } for d in details])
        df_scores.to_excel(writer, sheet_name="员工评分明细", index=False)
        
        # Sheet2: AI应用案例
        # Sheet3: 流水账问题清单
        # Sheet4: 部门统计
```

---

## 六、技能封装

### 6.1 目录结构

```
.opencode/skill/daily-report-analyzer/
├── SKILL.md                    # 技能描述和使用文档
├── README.md                   # 详细说明文档
├── scripts/
│   ├── run_all.py              # 一键执行入口
│   ├── fetch_oa_reports.py     # 数据获取
│   ├── analyze_reports.py      # 智能分析
│   ├── generate_report.py      # Markdown报告
│   ├── generate_html_report.py # HTML报告
│   └── push_dingtalk.py        # 钉钉推送
├── references/
│   ├── scoring_config.json     # 评分配置
│   ├── 评分标准.md              # 评分标准文档
│   └── html_template.html      # HTML模板
```

### 6.2 SKILL.md规范

```yaml
---
name: daily-report-analyzer
description: 从钉钉获取员工日报，智能评分并生成可视化分析报告。当用户提到"分析日报"、"日报评分"、"日报统计"时必须使用此技能。
---

# 日报智能分析器

## 核心能力
| 能力 | 说明 |
|------|------|
| 数据获取 | 从钉钉OA审批获取日报数据 |
| 六维度评分 | 完整度、内容质量、AI应用等 |
| 流水账检测 | 自动识别敷衍内容 |
| 可视化报告 | HTML图表 + Markdown报告 |

## 快速开始
```bash
python .opencode/skill/daily-report-analyzer/scripts/run_all.py --date=today
```
```

---

## 七、踩坑经验

### 7.1 API调用频率限制

**问题**：钉钉API有频率限制，标准版每月1万次调用。

**解决方案**：
- 使用内存缓存access_token
- 避免重复请求相同数据
- 分批次获取大量数据

### 7.2 数据字段不一致

**问题**：新版API和旧版API返回的字段名称不一致。

**解决方案**：
```python
# 兼容多种字段名
should_submit = stats.get('should_submit_count') or stats.get('dept_total') or stats.get('count', 0)
```

### 7.3 时区处理

**问题**：钉钉API返回的时间戳是毫秒级。

**解决方案**：
```python
dt = datetime.fromtimestamp(create_time / 1000)  # 毫秒转秒
```

---

## 八、总结

本项目完整实现了从数据获取到可视化报告的全流程：

1. **API对接**：混合使用钉钉新旧API，获取完整审批数据
2. **智能评分**：六维度评分模型，重点检测流水账
3. **多维报告**：Markdown、HTML、Excel三种格式输出
4. **技能封装**：遵循OpenCode技能规范，易于复用

这套系统帮助管理者从"逐条阅读日报"转变为"查看分析报告"，显著提升了团队管理效率。

---

## 参考资料

- [钉钉开放平台文档](https://open.dingtalk.com/document/)
- [Python requests库文档](https://docs.python-requests.org/)
- [Chart.js可视化库](https://www.chartjs.org/)
- [OpenCode技能开发规范](/.opencode/skill/skill-creator/SKILL.md)