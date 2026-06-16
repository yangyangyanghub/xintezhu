# Meeting Realtime Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a terminal-based realtime meeting transcription console with visible recording status, pause/resume, recent transcript preview, and safe JSON autosave.

**Architecture:** Add one standalone script beside the existing meeting-minutes scripts. Reuse `get_model()` from `transcribe.py`; keep keyboard handling, audio loop, state, and persistence inside the new script so existing `transcribe.py` behavior remains unchanged.

**Tech Stack:** Python 3.10, FunASR, PyAudio, NumPy, Windows `msvcrt`, UTF-8 JSON, PowerShell validation.

---

## File Structure

- Create: `.opencode/skills/meeting-minutes/scripts/realtime_console.py`
  - Terminal UI, keyboard commands, microphone capture, streaming FunASR calls, autosave JSON.
- Reference only: `.opencode/skills/meeting-minutes/scripts/transcribe.py`
  - Provides `get_model()` and existing realtime implementation details.
- Reference only: `.opencode/skills/meeting-minutes/scripts/format_minutes.py`
  - Confirms JSON output shape remains compatible with later minutes generation.
- Test artifact: `temp/realtime-console-test.json`
  - Disposable validation output.

---

## Task 1: Create script skeleton

**Files:**
- Create: `.opencode/skills/meeting-minutes/scripts/realtime_console.py`

- [ ] Write a Python script with imports, constants, `TranscriptSegment`, `ConsoleState`, `format_clock()`, `parse_args()`, and `main()`.
- [ ] Use 2-space indentation to match workspace preference.
- [ ] Include arguments: `--output/-o`, `--device`, `--language/-l`.
- [ ] Validate with:

```powershell
& ".opencode/skills/meeting-minutes/funasr-env/Scripts/python.exe" ".opencode/skills/meeting-minutes/scripts/realtime_console.py" --help
```

Expected: exits 0 and shows `实时会议转录小控制台`, `--output`, `--device`, `--language`.

---

## Task 2: Add JSON output helpers

**Files:**
- Modify: `.opencode/skills/meeting-minutes/scripts/realtime_console.py`

- [ ] Add `build_output(state)` returning this shape:

```json
{
  "metadata": {
    "mode": "realtime-console",
    "duration": 0.0,
    "model": "paraformer-zh-streaming",
    "language": "zh",
    "device": "cpu",
    "audio_input": "系统默认输入设备",
    "timestamp": "ISO datetime"
  },
  "segments": [],
  "full_text": ""
}
```

- [ ] Add `save_output(state)` that creates parent directories and writes UTF-8 JSON with `ensure_ascii=False`.
- [ ] Validate with:

```powershell
& ".opencode/skills/meeting-minutes/funasr-env/Scripts/python.exe" ".opencode/skills/meeting-minutes/scripts/realtime_console.py" --output "temp/realtime-console-test.json" --device cpu --language zh
python -c "import json; data=json.load(open('temp/realtime-console-test.json', encoding='utf-8')); assert data['metadata']['mode']=='realtime-console'; assert isinstance(data['segments'], list); print('json ok')"
```

Expected: prints `json ok`.

---

## Task 3: Add terminal rendering and controls

**Files:**
- Modify: `.opencode/skills/meeting-minutes/scripts/realtime_console.py`

- [ ] Add `render_screen(state)` displaying title, status, elapsed time, output path, microphone label, command list, latest recognized text.
- [ ] Add `print_recent_segments(state)` showing the latest 10 confirmed segments with timestamps.
- [ ] Add `handle_keypress(state)` using `msvcrt.kbhit()` and `msvcrt.getwch()`:
  - `p`: toggle pause/resume, save state, rerender.
  - `v`: show recent segments, wait for any key, rerender.
  - `s` or `q`: set `state.stopping = True`.
- [ ] Validate by running the script and confirming the static control panel appears.

---

## Task 4: Add audio lifecycle

**Files:**
- Modify: `.opencode/skills/meeting-minutes/scripts/realtime_console.py`

- [ ] Add guarded imports for `numpy` and `pyaudio`; on failure print:

```text
缺少实时转录依赖，请先安装：
uv pip install pyaudio numpy --python ".opencode/skills/meeting-minutes/funasr-env/Scripts/python.exe"
```

- [ ] Add `open_audio_stream()` with `pyaudio.PyAudio().open(format=paInt16, channels=1, rate=16000, input=True, frames_per_buffer=1600)`.
- [ ] Add `close_audio_stream(audio, stream)` that stops active stream, closes it, and terminates PyAudio.
- [ ] Validate microphone open/close smoke test by running the script once and confirming no traceback.

---

## Task 5: Add realtime transcription loop

**Files:**
- Modify: `.opencode/skills/meeting-minutes/scripts/realtime_console.py`

- [ ] Add `append_segment_if_changed(state, text, end_time)` to append non-empty recognized text and update `current_start`.
- [ ] Add `run_console(model, state)`:
  - Open microphone stream.
  - Maintain FunASR `cache = {}` and `chunk_size = [0, 10, 5]`.
  - In a loop, process keypresses first.
  - If paused, skip microphone reads but keep rerendering every second.
  - If recording, read `CHUNK`, convert `int16` audio to float32, call `model.generate(..., is_final=False)`.
  - On changed recognized text, update `latest_text`, append segment, and autosave JSON.
  - On stop, call final `model.generate(..., is_final=True)`, save JSON, release microphone.
- [ ] Update `main()` to call `get_model("streaming", args.device)` and `run_console(model, state)`.
- [ ] Manual validation:

```powershell
& ".opencode/skills/meeting-minutes/funasr-env/Scripts/python.exe" ".opencode/skills/meeting-minutes/scripts/realtime_console.py" --output "temp/realtime-console-test.json" --device cpu --language zh
```

Expected manual checks:

1. Say `这是实时转录测试`.
2. `最近识别` updates.
3. Press `v`; recent transcript list appears.
4. Press any key; panel returns.
5. Press `p`; status changes to `暂停中`.
6. Press `p`; status changes back to `录音中`.
7. Press `s`; script prints saved path and exits.

---

## Task 6: Compatibility verification

**Files:**
- Read: `temp/realtime-console-test.json`
- Execute: `.opencode/skills/meeting-minutes/scripts/format_minutes.py`

- [ ] Check JSON schema:

```powershell
python -c "import json; data=json.load(open('temp/realtime-console-test.json', encoding='utf-8')); assert 'metadata' in data; assert 'segments' in data; assert 'full_text' in data; print(len(data['segments']), 'segments')"
```

Expected: prints a segment count and no assertion error.

- [ ] Run minutes formatter:

```powershell
& ".opencode/skills/meeting-minutes/funasr-env/Scripts/python.exe" ".opencode/skills/meeting-minutes/scripts/format_minutes.py" -i "temp/realtime-console-test.json" -o "temp/realtime-console-test-minutes.md" -t "实时转录测试"
```

Expected: exits 0 and creates `temp/realtime-console-test-minutes.md`.

---

## Self-Review

- Spec coverage: startup status, microphone label, pause/resume, stop/save, recent preview, autosave, UTF-8 JSON, compatibility verification are all mapped to tasks.
- Placeholder scan: no TBD/TODO/implement-later placeholders.
- Type consistency: `ConsoleState`, `TranscriptSegment`, `build_output`, `save_output`, `run_console`, and helper names are consistent across tasks.
