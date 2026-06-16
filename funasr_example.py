"""FunASR 使用示例 - Fun-ASR-Nano + SenseVoiceSmall"""
from funasr import AutoModel


def transcribe_with_nano(audio_path: str, language: str = "auto") -> str:
    """使用 Fun-ASR-Nano 转录音频（31种语言，带时间戳）"""
    model = AutoModel(
        model="FunAudioLLM/Fun-ASR-Nano-2512",
        vad_model="fsmn-vad",
        device="cuda",
        disable_update=True,
        hub="ms"
    )
    result = model.generate(input=audio_path, batch_size=1, language=language)
    return result[0]["text"] if result else ""


def transcribe_with_sensevoice(audio_path: str) -> dict:
    """使用 SenseVoiceSmall 转录音频（情感+事件检测）"""
    model = AutoModel(
        model="iic/SenseVoiceSmall",
        vad_model="fsmn-vad",
        device="cuda",
        disable_update=True
    )
    result = model.generate(input=audio_path, batch_size=1)
    return result[0] if result else {}


def transcribe_with_speaker(audio_path: str) -> str:
    """使用 Paraformer-zh 转录（带说话人分离）"""
    model = AutoModel(
        model="paraformer-zh",
        vad_model="fsmn-vad",
        punc_model="ct-punc",
        spk_model="cam++",
        device="cuda",
        disable_update=True
    )
    result = model.generate(input=audio_path, batch_size=1)
    return result[0]["text"] if result else ""


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("用法: python funasr_example.py <音频文件路径>")
        print("\n示例:")
        print("  python funasr_example.py meeting.wav")
        print("\n可用函数:")
        print("  - transcribe_with_nano()       # 31种语言，带时间戳")
        print("  - transcribe_with_sensevoice() # 情感+事件检测")
        print("  - transcribe_with_speaker()    # 说话人分离")
        sys.exit(1)

    audio_path = sys.argv[1]
    print(f"正在转录: {audio_path}")
    print("=" * 50)

    # 默认使用 Fun-ASR-Nano
    text = transcribe_with_nano(audio_path)
    print(f"\n转录结果:\n{text}")
