import { useMemo } from 'react';
import { SIGNS } from '../data';
import { computeDaily } from '../lib/daily';
import type { DailyResult, Sign, SignId, Theme, TodayInfo } from '../types';
import { EmptyState } from './EmptyState';
import { ResultView } from './ResultView';
import { SectionHead } from './SectionHead';

interface HoroscopeSectionProps {
  sign: Sign | null;
  daily: DailyResult | null;
  today: TodayInfo;
  theme: Theme;
  onSelect: (id: SignId) => void;
  onWheel: () => void;
  onDraw: () => void;
  onCopy: () => void;
}

export function HoroscopeSection({
  sign,
  daily,
  today,
  theme,
  onSelect,
  onWheel,
  onDraw,
  onCopy
}: HoroscopeSectionProps) {
  const ranked = useMemo(
    () =>
      SIGNS.map((item) => ({ sign: item, daily: computeDaily(item, today.key, theme) }))
        .sort((a, b) => b.daily.overall - a.daily.overall)
        .slice(0, 3),
    [today.key, theme]
  );

  return (
    <section className="section container" id="horoscope" aria-labelledby="horoscopeTitle">
      <SectionHead
        eyebrow="01 / YOUR DAY"
        title="今日运势"
        titleId="horoscopeTitle"
        description={
          <>
            由今日星象与你的星座共同写成，
            <br />
            分数只是提醒，选择才是答案。
          </>
        }
      />
      {sign && daily ? (
        <ResultView
          key={`${sign.id}-${today.key}`}
          daily={daily}
          onSwitch={onWheel}
          onDraw={onDraw}
          onCopy={onCopy}
        />
      ) : (
        <EmptyState theme={theme} today={today} ranked={ranked} onSelect={onSelect} onWheel={onWheel} />
      )}
    </section>
  );
}
