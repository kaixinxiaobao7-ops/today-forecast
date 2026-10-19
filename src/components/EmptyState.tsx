import { DIMENSIONS } from '../data';
import { glyphOf } from '../lib/utils';
import type { DailyResult, Sign, SignId, Theme, TodayInfo } from '../types';

interface EmptyStateProps {
  theme: Theme;
  today: TodayInfo;
  ranked: Array<{ sign: Sign; daily: DailyResult }>;
  onSelect: (id: SignId) => void;
  onWheel: () => void;
}

export function EmptyState({ theme, today, ranked, onSelect, onWheel }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <article className="panel theme-card">
        <p className="mini-label">TODAY'S SKY · {today.short}</p>
        <h3>{theme.title}</h3>
        <p>{theme.general}</p>
        <div className="theme-tags">
          {theme.tag.split(' · ').map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
          <span>十二星座共享</span>
        </div>
      </article>

      <aside className="empty-side">
        <p className="mini-label">今日能量 TOP 3</p>
        <div className="top-list">
          {ranked.map(({ sign, daily }, index) => (
            <button
              key={sign.id}
              className="top-card"
              type="button"
              onClick={() => onSelect(sign.id)}
            >
              <span className="rank">0{index + 1}</span>
              <span className="glyph" aria-hidden="true">{glyphOf(sign)}</span>
              <span className="info">
                <strong>{sign.name}</strong>
                <small>
                  {DIMENSIONS[daily.topKey].name}高光 · {daily.band.label} · {daily.band.sub}
                </small>
              </span>
              <span className="score">{daily.overall}</span>
            </button>
          ))}
        </div>
        <button className="btn btn--ghost" type="button" onClick={onWheel}>
          在上方星盘选择我的星座 ↑
        </button>
      </aside>
    </div>
  );
}
