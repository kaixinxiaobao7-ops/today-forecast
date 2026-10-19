import { DIMENSIONS } from '../data';
import type { DailyResult } from '../types';
import { ScoreRing } from './art';

interface OverviewCardProps {
  daily: DailyResult;
  onDraw: () => void;
  onCopy: () => void;
}

export function OverviewCard({ daily, onDraw, onCopy }: OverviewCardProps) {
  const firstParagraph = `${daily.sign.voice} ${daily.theme.general}`;
  const secondParagraph = `今天的高光在${DIMENSIONS[daily.topKey].name}：${daily.topLine} ${DIMENSIONS[daily.lowKey].name}方面则要多一分照顾，${daily.lowLine}`;

  return (
    <article className="panel overview">
      <div className="overview-top">
        <ScoreRing score={daily.overall} />
        <div className="overview-heading">
          <span className="label">OVERALL · 综合运势</span>
          <h3>
            <em>{daily.band.label}</em> · {daily.band.sub}
          </h3>
          <p className="advice">{daily.band.advice}</p>
        </div>
      </div>
      <div className="overview-reading">
        <p>{firstParagraph}</p>
        <p>{secondParagraph}</p>
      </div>
      <div className="star-quote">
        「{daily.guidance}」
        <small>TODAY'S NOTE</small>
      </div>
      <div className="overview-actions">
        <button className="btn btn--gold" type="button" onClick={onDraw}>
          抽取今日运势签 <span aria-hidden="true">✦</span>
        </button>
        <button className="btn btn--ghost" type="button" onClick={onCopy}>
          复制今日运势
        </button>
      </div>
    </article>
  );
}
