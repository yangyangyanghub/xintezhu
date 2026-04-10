import { useCurrentFrame, interpolate, useVideoConfig } from 'remotion';

export type SummaryProps = {
  highlights: string[];
};

export const Summary: React.FC<SummaryProps> = ({ highlights }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        flex: 1,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: 60,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 标题 */}
      <div
        style={{
          marginBottom: 60,
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#ffffff',
            margin: 0,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            letterSpacing: '6px',
          }}
        >
          本周亮点
        </h2>
        <div
          style={{
            width: 200,
            height: 4,
            background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
            margin: '24px auto 0',
            borderRadius: 2,
          }}
        />
      </div>

      {/* 亮点列表 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 32,
        }}
      >
        {highlights.map((highlight, index) => {
          // 相对于当前 Sequence 的帧，每条间隔 0.6 秒
          const startFrame = index * 18;
          const itemOpacity = interpolate(
            frame,
            [startFrame, startFrame + 20],
            [0, 1],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );

          return (
            <div
              key={index}
              style={{
                opacity: itemOpacity,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                padding: 32,
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 20,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
              <p
                style={{
                  fontSize: 36,
                  color: '#e2e8f0',
                  margin: 0,
                  lineHeight: 1.5,
                  fontWeight: 300,
                }}
              >
                {highlight}
              </p>
            </div>
          );
        })}
      </div>

      {/* 底部装饰 */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 40,
          opacity: interpolate(frame, [(highlights.length + 3) * fps, (highlights.length + 4.5) * fps], [0, 0.6], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <p
          style={{
            fontSize: 28,
            color: '#94a3b8',
            margin: 0,
            letterSpacing: '3px',
          }}
        >
          感谢观看
        </p>
      </div>
    </div>
  );
};
