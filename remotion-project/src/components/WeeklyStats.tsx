import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export type DailyStats = {
  date: string;
  weekday: string;
  count: number;
};

export type CategoryStats = {
  name: string;
  count: number;
  ratio: number;
};

export type WeeklyStatsProps = {
  dailyStats: DailyStats[];
  categoryStats: CategoryStats[];
};

const STAGGER_DELAY = 3; // 每个柱子间隔3帧
const BAR_MAX_HEIGHT = 300;
const BAR_WIDTH = 80;

export const WeeklyStats: React.FC<WeeklyStatsProps> = ({
  dailyStats,
  categoryStats,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 标题动画
  const titleOpacity = interpolate(
    frame,
    [0, 0.5 * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 每日柱状图动画（stagger）
  const maxCount = Math.max(...dailyStats.map((d) => d.count));
  const bars = dailyStats.map((item, index) => {
    const barProgress = spring({
      frame: frame - index * STAGGER_DELAY,
      fps,
      config: { damping: 200 },
    });
    const barHeight = interpolate(
      barProgress,
      [0, 1],
      [0, (item.count / maxCount) * BAR_MAX_HEIGHT],
      { extrapolateRight: 'clamp' }
    );
    const barOpacity = interpolate(
      frame,
      [index * STAGGER_DELAY, 0.5 * fps + index * STAGGER_DELAY],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // 颜色根据数量变化
    const barColor = item.count > 150 ? '#22c55e' : item.count > 100 ? '#6366f1' : '#f59e0b';

    return (
      <div
        key={index}
        style={{
          opacity: barOpacity,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginRight: 20,
        }}
      >
        {/* 柱子 */}
        <div
          style={{
            width: BAR_WIDTH,
            height: barHeight,
            background: barColor,
            borderRadius: 10,
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            marginBottom: 10,
          }}
        />
        {/* 数量 */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#ffffff',
          }}
        >
          {item.count}
        </div>
        {/* 日期 */}
        <div style={{ fontSize: 16, color: '#a0a0a0', marginTop: 5 }}>
          {item.weekday}
        </div>
      </div>
    );
  });

  // 饼图动画
  const pieProgress = interpolate(
    frame,
    [2 * fps, 4 * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 绘制简化饼图（使用圆环）
  const pieRadius = 120;
  const pieCenter = 150;
  const circumference = 2 * Math.PI * pieRadius;
  
  const pieSegments = categoryStats.slice(0, 5).map((item, index) => {
    const segmentLength = (item.ratio / 100) * circumference;
    const offset = interpolate(pieProgress, [0, 1], [segmentLength, 0]);
    const rotation = -90 + index * 72; // 每72度一个segment（简化）

    // 颜色
    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
    const color = colors[index % colors.length];

    return (
      <circle
        key={index}
        r={pieRadius}
        cx={pieCenter}
        cy={pieCenter}
        fill="none"
        stroke={color}
        strokeWidth={40}
        strokeDasharray={`${segmentLength} ${circumference}`}
        strokeDashoffset={offset}
        transform={`rotate(${rotation} ${pieCenter} ${pieCenter})`}
        opacity={interpolate(pieProgress, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' })}
      />
    );
  });

  return (
    <div
      style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: 60,
      }}
    >
      {/* 标题 */}
      <div
        style={{
          opacity: titleOpacity,
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        <h2
          style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: '#ffffff',
            margin: 0,
          }}
        >
          本周数据统计
        </h2>
      </div>

      {/* 每日新闻量柱状图 */}
      <div
        style={{
          marginBottom: 60,
        }}
      >
        <h3
          style={{
            fontSize: 32,
            color: '#e0e0e0',
            marginBottom: 20,
          }}
        >
          每日新闻量
        </h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            height: BAR_MAX_HEIGHT + 60,
            padding: '20px 0',
          }}
        >
          {bars}
        </div>
      </div>

      {/* 分类占比饼图 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {/* 饼图 */}
        <svg width={300} height={300} style={{ marginRight: 40 }}>
          {pieSegments}
        </svg>

        {/* 图例 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {categoryStats.slice(0, 5).map((item, index) => {
            const legendOpacity = interpolate(
              frame,
              [2 * fps + index * 3, 2.5 * fps + index * 3],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
            const color = colors[index % colors.length];

            return (
              <div
                key={index}
                style={{
                  opacity: legendOpacity,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 15,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    background: color,
                    borderRadius: 4,
                    marginRight: 15,
                  }}
                />
                <div style={{ fontSize: 24, color: '#ffffff' }}>
                  {item.name}: {item.ratio.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};