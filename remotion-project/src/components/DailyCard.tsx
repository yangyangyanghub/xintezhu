import { useCurrentFrame, interpolate, useVideoConfig, Sequence } from 'remotion';

export type DailyCardProps = {
  date: string;
  title: string;
  highlights: string[];
};

export const DailyCard: React.FC<DailyCardProps> = ({ date, title, highlights }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        flex: 1,
        background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: 60,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 日期标题区域 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 12,
            height: 80,
            background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
            borderRadius: 6,
            marginRight: 24,
          }}
        />
        <div>
          <h2
            style={{
              fontSize: 56,
              fontWeight: 'bold',
              color: '#1e293b',
              margin: 0,
            }}
          >
            {date}
          </h2>
          <p
            style={{
              fontSize: 32,
              color: '#64748b',
              margin: '8px 0 0 0',
              fontWeight: 400,
            }}
          >
            {title}
          </p>
        </div>
      </div>

      {/* 工作内容列表 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 28,
        }}
      >
        {highlights.map((highlight, index) => {
          // 相对于当前 Sequence 的帧，每条间隔 0.5 秒
          const startFrame = index * 15;
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
                background: 'white',
                padding: 28,
                borderRadius: 16,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                borderLeft: '4px solid #6366f1',
              }}
            >
              <p
                style={{
                  fontSize: 32,
                  color: '#334155',
                  margin: 0,
                  lineHeight: 1.5,
                  fontWeight: 400,
                }}
              >
                {highlight}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
