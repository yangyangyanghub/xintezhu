import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export type WeeklyBriefCoverProps = {
  title: string;
  weekRange: string;
  totalNews: number;
  highScoreNews: number;
  days: number;
};

export const WeeklyBriefCover: React.FC<WeeklyBriefCoverProps> = ({
  title,
  weekRange,
  totalNews,
  highScoreNews,
  days,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 标题动画：spring效果淡入放大
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const titleScale = interpolate(titleProgress, [0, 1], [0.8, 1], {
    extrapolateRight: 'clamp',
  });

  // 副标题动画：延迟淡入
  const subtitleOpacity = interpolate(
    frame,
    [1 * fps, 2 * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 统计数字动画：stagger出现
  const stat1Opacity = interpolate(
    frame,
    [1.5 * fps, 2.5 * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const stat2Opacity = interpolate(
    frame,
    [1.7 * fps, 2.7 * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const stat3Opacity = interpolate(
    frame,
    [1.9 * fps, 2.9 * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 数字计数动画
  const count1 = Math.floor(interpolate(frame, [1.5 * fps, 2.5 * fps], [0, totalNews], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));
  const count2 = Math.floor(interpolate(frame, [1.7 * fps, 2.7 * fps], [0, highScoreNews], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));
  const count3 = Math.floor(interpolate(frame, [1.9 * fps, 2.9 * fps], [0, days], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));

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
      {/* 主标题 */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        <h1
          style={{
            fontSize: 100,
            fontWeight: 'bold',
            color: '#ffffff',
            margin: 0,
            textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            letterSpacing: '6px',
          }}
        >
          {title}
        </h1>
      </div>

      {/* 周范围 */}
      <div
        style={{
          opacity: subtitleOpacity,
          textAlign: 'center',
          marginBottom: 80,
        }}
      >
        <p
          style={{
            fontSize: 36,
            color: '#e0e0e0',
            margin: 0,
            fontWeight: 300,
          }}
        >
          {weekRange}
        </p>
      </div>

      {/* 统计卡片 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: '100%',
          maxWidth: 800,
        }}
      >
        {/* 新闻总数 */}
        <div
          style={{
            opacity: stat1Opacity,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: 30,
            textAlign: 'center',
            minWidth: 200,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#6366f1',
              marginBottom: 10,
            }}
          >
            {count1}
          </div>
          <div style={{ fontSize: 24, color: '#a0a0a0' }}>新闻总数</div>
        </div>

        {/* 高分新闻 */}
        <div
          style={{
            opacity: stat2Opacity,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: 30,
            textAlign: 'center',
            minWidth: 200,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#22c55e',
              marginBottom: 10,
            }}
          >
            {count2}
          </div>
          <div style={{ fontSize: 24, color: '#a0a0a0' }}>高分新闻</div>
        </div>

        {/* 覆盖天数 */}
        <div
          style={{
            opacity: stat3Opacity,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: 30,
            textAlign: 'center',
            minWidth: 200,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#f59e0b',
              marginBottom: 10,
            }}
          >
            {count3}
          </div>
          <div style={{ fontSize: 24, color: '#a0a0a0' }}>覆盖天数</div>
        </div>
      </div>

      {/* 底部装饰线条 */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          width: interpolate(frame, [0, 2 * fps], [0, 400], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          height: 4,
          background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
          borderRadius: 2,
        }}
      />
    </div>
  );
};