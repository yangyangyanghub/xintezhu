/**
 * AHA 闪念捕获 - 用户脚本
 * 弹窗输入灵感 → 自动创建闪念卡片到 inbox
 */

module.exports = async (tp) => {
  // 获取今天时间
  const today = tp.date.now("YYYY-MM-DD");
  const nowTime = tp.date.now("HH-mm-ss");
  const nowDisplay = tp.date.now("HH:mm");
  
  // 弹窗输入闪念内容
  const content = await tp.system.prompt(" 记录一闪而过的灵感：");
  
  if (!content || content.trim() === "") {
    return;
  }
  
  // 询问标签（可选）
  const tags = await tp.system.prompt("🏷️ 标签（可选，空格分隔）", "#flash") || "#flash";
  
  // 创建文件路径
  const fileName = `myk/闪念/inbox/${today}-${nowTime}`;
  
  // 生成文件内容
  const fileContent = `---
created: ${today} ${nowDisplay}
tags:
${tags.split(" ").map(t => `  - ${t.startsWith("#") ? t : "#" + t}`).join("\n")}
type: flash
status: inbox
---

## 💡 闪念

${content}

---
## 📝 关联
- 来源：
- 关联笔记：

---
## 🔄 批注（回顾时追加）
- ${today}：
`;
  
  // 创建新文件并打开
  const file = await tp.file.create_new(fileContent, fileName, true);
  
  new Notice("✅ 闪念已保存！");
};
