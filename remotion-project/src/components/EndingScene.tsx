import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const EndingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 标题动画
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const titleScale = interpolate(titleProgress, [0, 1], [0.9, 1], {
    extrapolateRight: 'clamp',
  });

  // 副标题动画
  const subtitleOpacity = interpolate(
    frame,
    [0.5 * fps, 1.5 * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        flex: 1,
        background: 'linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 80,
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            color: '#6366f1',
            margin: 0,
            textShadow: '0 4px 20px rgba(99,102,241,0.3)',
          }}
        >
          本周新闻摘要
        </h1>
      </div>

      <div
        style={{
          opacity: subtitleOpacity,
          textAlign: 'center',
          marginTop: 30,
        }}
      >
        <p
          style={{
            fontSize: 28,
            color: '#a0a0a0',
            margin: 0,
          }}
        >
          由 AI 自动整理生成
        </p>
      </div>

      {/* 装饰性圆点 */}
      <div
        style={{
          position: 'absolute',
          bottom: 150,
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {[0, 1, 2].map((i) => {
          const dotOpacity = interpolate(
            frame,
            [1 * fps + i * 5, 1.5 * fps + i * 5],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <div
              key={i}
              style={{
                opacity: dotOpacity,
                width: 12,
                height: 12,
                borderRadius: 6,
                background: '#6366f1',
                margin: 8,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};