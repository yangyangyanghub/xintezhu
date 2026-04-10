import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from 'remotion';

export type NewsItem = {
  title: string;
  date: string;
  source: string;
  summary: string;
};

export type CategorySectionProps = {
  categoryName: string;
  categoryImage: string;
  totalCount: number;
  newsItems: NewsItem[];
};

const STAGGER_DELAY = 5; // 每条新闻间隔5帧

export const CategorySection: React.FC<CategorySectionProps> = ({
  categoryName,
  categoryImage,
  totalCount,
  newsItems,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 分类标题动画
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(titleProgress, [0, 1], [-30, 0], {
    extrapolateRight: 'clamp',
  });

  // 图片动画
  const imageOpacity = interpolate(
    frame,
    [0, 0.5 * fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const imageScale = interpolate(
    frame,
    [0, 1 * fps],
    [0.9, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 新闻列表动画（stagger）
  const newsElements = newsItems.slice(0, 5).map((item, index) => {
    const itemOpacity = interpolate(
      frame,
      [0.5 * fps + index * STAGGER_DELAY, 1 * fps + index * STAGGER_DELAY],
      [0, 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
    const itemX = interpolate(
      frame,
      [0.5 * fps + index * STAGGER_DELAY, 1 * fps + index * STAGGER_DELAY],
      [50, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
      <div
        key={index}
        style={{
          opacity: itemOpacity,
          transform: `translateX(${itemX}px)`,
          marginBottom: 20,
          paddingLeft: 20,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: 15,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: 8,
            lineHeight: 1.3,
          }}
        >
          {item.title}
        </div>
        <div style={{ fontSize: 18, color: '#a0a0a0' }}>
          {item.date} | {item.source}
        </div>
      </div>
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
      {/* 顶部标题栏 */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 30,
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
          {categoryName}
        </h2>
        <div style={{ fontSize: 24, color: '#6366f1', marginTop: 10 }}>
          本周收录 {totalCount} 条资讯
        </div>
      </div>

      {/* 内容区域：左侧图片 + 右侧新闻列表 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
        }}
      >
        {/* 左侧图片 */}
        <div
          style={{
            opacity: imageOpacity,
            transform: `scale(${imageScale})`,
            width: 400,
            marginRight: 40,
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          }}
        >
          <Img
            src={staticFile(`images/${categoryImage}`)}
            style={{
              width: 400,
              height: 500,
              objectFit: 'cover',
            }}
          />
        </div>

        {/* 右侧新闻列表 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {newsElements}
        </div>
      </div>
    </div>
  );
};