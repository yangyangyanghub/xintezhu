# 实时会议转录小控制台设计

## 背景

现有实时转录入口位于 `.opencode/skills/meeting-minutes/scripts/transcribe.py`，其中 `transcribe_streaming()` 可以读取麦克风并调用 FunASR 流式模型转写。当前问题是运行体验像黑箱：启动后只能通过日志猜测是否在录音，停止依赖 `Ctrl+C` 或杀进程，不支持暂停、状态查看、最近转录预览，也不会在运行中持续保存结构化结果。

## 目标

新增一个终端交互式小控制台，让用户能清楚看到实时转录状态，并能用键盘命令控制录音过程。

成功标准：

- 启动后显示当前录音设备、运行状态、时长、输出文件路径。
- 支持 `p` 暂停/继续、`s` 停止并保存、`v` 查看最近转录、`q` 退出。
- 运行中持续保存 JSON，避免异常退出导致内容丢失。
- 停止后输出完整 JSON，字段兼容现有纪要生成流程。
- 中文输出文件使用 UTF-8 编码，避免转录内容乱码。

## 非目标

- 不做网页 UI。
- 不做多设备图形化选择；本版默认使用系统默认麦克风。
- 不重写 FunASR 模型调用逻辑。
- 不修改历史会议纪要生成格式。

## 推荐方案

新增脚本：

```text
.opencode/skills/meeting-minutes/scripts/realtime_console.py
```

该脚本复用 `transcribe.py` 中的 `get_model()`，但自己管理麦克风循环和键盘交互。这样能避免大改原脚本，也便于保留原有命令兼容性。

## 交互设计

启动命令：

```powershell
& ".opencode/skills/meeting-minutes/funasr-env/Scripts/python.exe" ".opencode/skills/meeting-minutes/scripts/realtime_console.py" --output "temp/live-meeting.json" --device cpu --language zh
```

运行界面文本：

```text
实时会议转录控制台
状态：录音中
时长：00:03:21
输出：temp/live-meeting.json
麦克风：系统默认输入设备

命令：p 暂停/继续 | v 最近转录 | s 停止保存 | q 退出
最近识别：这里显示最新一句转录文本
```

快捷键语义：

- `p`：暂停时继续读取键盘但不读取麦克风；再次按下恢复录音。
- `v`：打印最近 10 条已确认片段。
- `s`：停止录音，做 final flush，保存 JSON 后退出。
- `q`：等同于停止保存后退出，避免误丢数据。

## 数据结构

输出 JSON 保持与现有结构一致，并补充控制台元数据：

```json
{
  "metadata": {
    "mode": "realtime-console",
    "duration": 123.4,
    "model": "paraformer-zh-streaming",
    "language": "zh",
    "device": "cpu",
    "audio_input": "default",
    "timestamp": "2026-06-15T..."
  },
  "segments": [
    {
      "text": "识别文本",
      "start": 12.3,
      "end": 15.6
    }
  ],
  "full_text": "识别文本 ..."
}
```

运行中每次新增片段或状态变化后保存一次 JSON。

## 实现边界

- 使用 Python 标准库 `threading`、`queue`、`msvcrt` 处理 Windows 终端按键。
- 使用 `pyaudio` 读取麦克风。
- 使用 `numpy` 转换音频数据。
- 使用现有 FunASR streaming 模型参数：`cache`、`chunk_size=[0,10,5]`、`is_final`。
- 暂停时不关闭音频设备，只跳过读取，恢复更快。
- 停止时关闭 stream、terminate PyAudio，确保释放麦克风。

## 错误处理

- 缺少 `pyaudio` / `numpy`：提示安装命令。
- 麦克风打开失败：提示检查 Windows 麦克风权限和默认输入设备。
- 模型加载失败：原样输出错误，避免吞掉根因。
- 保存 JSON 失败：打印错误并继续运行，防止转录中断。

## 验证方式

1. 运行 `python realtime_console.py --help`，确认参数可见。
2. 启动控制台 10 秒，说一句测试文本，确认界面显示最新识别。
3. 按 `v`，确认能看到最近转录。
4. 按 `p` 暂停，说话不应新增片段；再次按 `p` 恢复。
5. 按 `s` 停止，确认 JSON 文件存在且包含 `metadata`、`segments`、`full_text`。
6. 用现有 `format_minutes.py` 读取输出 JSON，确认不破坏纪要流程。

## 自检

- 无 TBD / TODO 占位。
- 范围聚焦在终端控制台，不引入网页服务。
- 不修改现有 `transcribe.py` 行为，降低回归风险。
- 输出结构兼容现有纪要生成流程。
