import { useCurrentFrame, interpolate, useVideoConfig } from 'remotion';

export type CoverProps = {
  title: string;
  subtitle: string;
};

export const Cover: React.FC<CoverProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 标题动画：0-2 秒淡入放大
  const titleOpacity = interpolate(frame, [0, 1.5 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleScale = interpolate(frame, [0, 2 * fps], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 副标题动画：2-4 秒淡入
  const subtitleOpacity = interpolate(frame, [2 * fps, 3.5 * fps], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
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
          marginBottom: 60,
        }}
      >
        <h1
          style={{
            fontSize: 120,
            fontWeight: 'bold',
            color: '#ffffff',
            margin: 0,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            letterSpacing: '8px',
          }}
        >
          {title}
        </h1>
      </div>

      <div
        style={{
          opacity: subtitleOpacity,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: 42,
            color: '#e0e0e0',
            margin: 0,
            fontWeight: 300,
            letterSpacing: '4px',
          }}
        >
          {subtitle}
        </p>
      </div>

      {/* 装饰性底部线条 */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          width: 300,
          height: 4,
          background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
          borderRadius: 2,
        }}
      />
    </div>
  );
};
