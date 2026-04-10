import React from 'react';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { WeeklyBriefCover } from './components/WeeklyBriefCover';
import { CategorySection, NewsItem } from './components/CategorySection';
import { WeeklyStats, DailyStats, CategoryStats } from './components/WeeklyStats';
import { EndingScene } from './components/EndingScene';

export type WeeklyBriefProps = {
  title: string;
  weekRange: string;
  totalNews: number;
  highScoreNews: number;
  days: number;
  categories: Array<{
    name: string;
    image: string;
    totalCount: number;
    newsItems: NewsItem[];
  }>;
  dailyStats: DailyStats[];
  categoryStats: CategoryStats[];
};

// 时长配置（单位：帧，fps=30）
const COVER_DURATION = 90; // 3 秒
const CATEGORY_DURATION = 90; // 3 秒
const STATS_DURATION = 180; // 6 秒
const ENDING_DURATION = 60; // 2 秒
const TRANSITION_DURATION = 15; // 0.5 秒

export const WeeklyBrief: React.FC<WeeklyBriefProps> = ({
  title,
  weekRange,
  totalNews,
  highScoreNews,
  days,
  categories,
  dailyStats,
  categoryStats,
}) => {
  return (
    <div style={{ flex: 1 }}>
      <TransitionSeries>
        {/* 封面 */}
        <TransitionSeries.Sequence durationInFrames={COVER_DURATION}>
          <WeeklyBriefCover
            title={title}
            weekRange={weekRange}
            totalNews={totalNews}
            highScoreNews={highScoreNews}
            days={days}
          />
        </TransitionSeries.Sequence>

        {/* 封面→第一个分类过渡 */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 分类场景 */}
        {categories.map((category, index) => (
          <React.Fragment key={index}>
            <TransitionSeries.Sequence durationInFrames={CATEGORY_DURATION}>
              <CategorySection
                categoryName={category.name}
                categoryImage={category.image}
                totalCount={category.totalCount}
                newsItems={category.newsItems}
              />
            </TransitionSeries.Sequence>

            {/* 过渡（最后一个分类除外） */}
            {index < categories.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
              />
            )}
          </React.Fragment>
        ))}

        {/* 分类→统计过渡 */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 统计页 */}
        <TransitionSeries.Sequence durationInFrames={STATS_DURATION}>
          <WeeklyStats dailyStats={dailyStats} categoryStats={categoryStats} />
        </TransitionSeries.Sequence>

        {/* 统计→结尾过渡 */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 结尾页 */}
        <TransitionSeries.Sequence durationInFrames={ENDING_DURATION}>
          <EndingScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </div>
  );
};