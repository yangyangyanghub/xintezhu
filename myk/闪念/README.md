# 💡 闪念胶囊使用指南

> 类似 flomo 的碎片化灵感记录系统

---

## 快速记录

| 操作 | 方式 |
|------|------|
| **快捷键记录** | 按下 `Alt+N`（或你设置的快捷键）→ 弹窗输入 → 回车 |
| **直接创建** | 在 `myk/闪念/inbox/` 下手动新建笔记 |

---

## 闪念流转

```
灵感出现 → QuickAdd 弹窗记录 → inbox（待处理）
                                    ↓
                              定期回顾
                                    ↓
              ┌─────────────────────┴─────────────────────┐
              ↓                                           ↓
        有价值 → 沉淀到 wiki                          无价值 → 删除/归档
              ↓
        移动到 processed/
```

---

## 沉淀规则

### 什么时候沉淀？
- **每周回顾时**：翻看 inbox 里的旧闪念
- **写文章时**：发现某个闪念可以展开
- **整理 wiki 时**：发现闪念可以补充到 topics/concepts

### 怎么沉淀？
1. 打开闪念文件
2. 把核心观点提取出来
3. 写入 `myk/wiki/topics/` 或 `myk/wiki/concepts/`
4. 把闪念文件移动到 `myk/闪念/processed/`
5. 修改 `status: processed`

---

## QuickAdd 配置（补全流程）

### Capture 设置

| 配置项 | 值 |
|-------|-----|
| **Enter capture file name** | `myk/闪念/inbox/{{date:YYYY-MM-DD}}-{{time:HH-mm-ss}}` |
| **Choose a template** | `00 templates/闪念模板.md` |

### 快捷键设置

- `Alt+N` → 触发 QuickAdd 闪念胶囊

---

## 标签规范

```markdown
#flash/技术        ← 技术类闪念
#flash/产品        ← 产品灵感
#flash/生活        ← 日常想法
#flash/待验证      ← 需要进一步验证的观点
```

---

## Dataview 查询

### 查看闪念看板
- 打开 `myk/闪念/闪念看板.md`

### 查看今日闪念
- 在 daily note 底部自动显示

---

## 与 wiki 的关系

| 层级 | 内容 | 存储位置 |
|------|------|---------|
| **闪念** | 原始灵感，一句话 | `myk/闪念/inbox/` |
| **知识点** | 验证后的观点 | `myk/wiki/concepts/` |
| **主题** | 系统化的知识 | `myk/wiki/topics/` |
| **综合** | 多源对比分析 | `myk/wiki/synthesis/` |

闪念是 wiki 的**原材料**，经过验证和扩展后进入正式知识库。
