# OpenCode 视频生成

> 来源：[玩转 OpenCode(五)](https://mp.weixin.qq.com/s/ipuF7k9xoTSn_VyJS1tTWQ)
> 整理时间：2026-03-11

---

## 一、核心能力

| 能力 | 说明 | 对应脚本 |
|------|------|----------|
| **TTS配音** | 文字转语音，支持多种音色 | tts_generator.py |
| **时间戳提取** | 精确到每句话的起止时间 | tts_generator.py |
| **视频合成** | 图片+音频→视频，带转场 | video_maker.py |
| **字幕烧录** | SRT/ASS字幕，底部居中 | video_maker.py |
| **片尾拼接** | 自动拼接品牌片尾 | video_maker.py |
| **BGM混合** | 背景音乐，可调音量 | video_maker.py |

---

## 二、协同场景

| 协同组合 | 场景 | 产出 |
|----------|------|------|
| deep-research + video-creator | 技术解读视频 | 调研内容→解说视频 |
| image-service + video-creator | 产品介绍 | 批量配图→产品视频 |
| story-to-scenes + video-creator | 儿童动画 | 故事拆镜→动画视频 |
| docx + video-creator | 文档转视频 | Word报告→讲解视频 |
| searchnews + video-creator | 新闻播报 | 每日新闻→视频早报 |
| pptx + video-creator | PPT转视频 | 演示文稿→讲解视频 |

---

## 三、核心流程

### 3.1 套娃流程（故事类视频）

```
故事文本 → 场景拆分 → 文生图(主图) → 图生图(细镜头) → 配音+时间戳 → 合成视频
```

**三层套娃**：
1. **第一层**：故事 → 拆分场景 → 并发生成场景主图
2. **第二层**：主图 → 图生图拆出细镜头（保持角色一致）
3. **第三层**：配音+字幕+合成视频

### 3.2 简化流程（讲解类视频）

```
文案 → 批量生图 → 配音 → 合成视频
```

---

## 四、目录结构

```
video-creator/
├── SKILL.md               # 技能定义
├── scripts/
│   ├── video_maker.py     # 主脚本：图片+音频→视频
│   ├── tts_generator.py   # TTS 语音生成
│   └── scene_splitter.py  # 场景拆分器
├── assets/
│   ├── outro.mp4          # 通用片尾（16:9）
│   ├── outro_9x16.mp4     # 竖版片尾
│   └── bgm_technology.mp3 # 默认BGM
└── references/
    └── edge_tts_voices.md # 音色参考
```

---

## 五、TTS配音

### 常用音色

| 音色ID | 风格 | 适用场景 |
|--------|------|----------|
| zh-CN-YunxiNeural | 男声，阳光活泼 | 教程、vlog |
| zh-CN-YunyangNeural | 男声，新闻播报 | 新闻、正式场合 |
| zh-CN-XiaoxiaoNeural | 女声，温暖自然 | 故事、治愈系 |
| zh-CN-XiaoyiNeural | 女声，活泼可爱 | 儿童、萌系 |

### 时间戳格式

```json
[
  {
    "text": "每天写Word报告...",
    "start": 0.1,
    "end": 9.4
  }
]
```

---

## 六、视频合成

### 配置文件格式

```yaml
ratio: "16:9"        # 必须加引号！
bgm_volume: 0.08
outro: true
scenes:
  - audio: narration.mp3
    images:
      - file: scene1.png
        duration: 9.4
      - file: scene2.png
        duration: 6.5
```

### 时长分配铁律

1. **必须先读取 narration.json 时间戳**，不能凭感觉估算
2. **按句子语义边界划分**，不能平均分配
3. **生成配置前必须校验**，确保图片总时长 ≈ 音频总时长（误差<1秒）

---

## 七、支持的视频比例

| 比例 | 分辨率 | 适用场景 |
|------|--------|----------|
| 9:16 | 1080×1920 | 抖音、视频号 |
| 16:9 | 1920×1080 | B站、YouTube |
| 3:4 | 1080×1440 | 小红书 |
| 1:1 | 1024×1024 | 朋友圈 |

---

## 八、实战案例

### 案例1：文章转视频

```
文章内容 → 180字解说词 → 8个场景配图 → 配音+时间戳 → 合成视频
```

### 案例2：产品介绍视频

```
产品文档 → 核心卖点 → 产品配图 → 配音 → 合成视频
```

### 案例3：儿童绘本动画

```
故事 → 拆分场景 → 批量生图(保持角色一致) → 女声配音 → 合成动画
```

### 案例4：新闻视频早报

```
searchnews → 新闻稿 → 配图 → 男声播报 → 合成早报
```

---

## 九、命令参考

### TTS配音
```bash
python tts_generator.py --text "文本内容" --output narration.mp3 --timestamps
python tts_generator.py --text "文本" --output audio.mp3 --voice zh-CN-XiaoxiaoNeural
```

### 视频合成
```bash
python video_maker.py video_config.yaml --srt subtitles.srt --fade 0.5
python video_maker.py config.yaml --no-outro --bgm-volume 0.05
```

---

## 十、常见问题

| 问题 | 解决 |
|------|------|
| 音画不同步 | 必须按时间戳分配duration |
| 字幕位置不对 | 使用ASS格式，底部居中 |
| 片尾不匹配 | 自动匹配 ratio 对应的片尾 |
| BGM太吵 | 调整 --bgm-volume 参数 |
| 角色不一致 | 保持角色描述一致，用图生图 |

---

## 十一、关键要点

1. **套娃流程**：故事类视频要用三层套娃保持角色一致
2. **时间戳铁律**：生成配置前必须校验总时长
3. **片尾必加**：所有视频自动拼接对应尺寸片尾
4. **Skill协同**：串联前面所有Skill，实现一条龙产出

---

*下期预告：个人知识库管理——Obsidian搭建、双链笔记、提示词库、技术沉淀工作流*

---

## 相关链接

- [[OpenCode入门指南]] - 环境搭建与快速上手
- [[Agent Skills深度解析]] - 技能包系统详解
- [[OpenCode多模态图像服务]] - 多模态能力详解
- [[OpenCode办公四件套]] - Word/Excel/PDF/PPT文档处理