import React from 'react';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { Cover } from './components/Cover';
import { DailyCard } from './components/DailyCard';
import { Summary } from './components/Summary';

export type WeeklyReportProps = {
  coverTitle: string;
  coverSubtitle: string;
  days: Array<{
    date: string;
    title: string;
    highlights: string[];
  }>;
  weekHighlights: string[];
};

// 时长配置（单位：帧，fps=30）
const COVER_DURATION = 90; // 3 秒
const DAY_DURATION = 150; // 5 秒
const SUMMARY_DURATION = 180; // 6 秒
const TRANSITION_DURATION = 15; // 0.5 秒

export const WeeklyReport: React.FC<WeeklyReportProps> = ({
  coverTitle,
  coverSubtitle,
  days,
  weekHighlights,
}) => {
  return (
    <div style={{ flex: 1 }}>
      <TransitionSeries>
        {/* 封面 */}
        <TransitionSeries.Sequence durationInFrames={COVER_DURATION}>
          <Cover title={coverTitle} subtitle={coverSubtitle} />
        </TransitionSeries.Sequence>

        {/* 封面→第一天过渡 */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 日报卡片 */}
        {days.map((day, index) => (
          <React.Fragment key={index}>
            <TransitionSeries.Sequence durationInFrames={DAY_DURATION}>
              <DailyCard
                date={day.date}
                title={day.title}
                highlights={day.highlights}
              />
            </TransitionSeries.Sequence>

            {/* 过渡（最后一天除外） */}
            {index < days.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
              />
            )}
          </React.Fragment>
        ))}

        {/* 日报→总结过渡 */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* 周总结 */}
        <TransitionSeries.Sequence durationInFrames={SUMMARY_DURATION}>
          <Summary highlights={weekHighlights} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </div>
  );
};
