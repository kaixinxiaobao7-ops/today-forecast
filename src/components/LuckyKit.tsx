import { glyphOf } from '../lib/utils';
import type { DailyResult } from '../types';

export function LuckyKit({ daily }: { daily: DailyResult }) {
  return (
    <article className="panel kit">
      <div className="card-head">
        <h3>今日锦囊</h3>
        <span className="card-note">LUCKY KIT</span>
      </div>
      <div className="lucky-grid">
        <div className="lucky-item">
          <span className="lucky-label">幸运色</span>
          <span className="lucky-value">
            <i className="swatch" style={{ background: daily.color.hex, color: daily.color.hex }} />
            {daily.color.name}
          </span>
        </div>
        <div className="lucky-item">
          <span className="lucky-label">幸运数字</span>
          <span className="lucky-value">{daily.luckyNumber}</span>
        </div>
        <div className="lucky-item">
          <span className="lucky-label">幸运方位</span>
          <span className="lucky-value">{daily.direction}</span>
        </div>
        <div className="lucky-item">
          <span className="lucky-label">幸运时段</span>
          <span className="lucky-value">{daily.time}</span>
        </div>
        <div className="lucky-item">
          <span className="lucky-label">速配星座</span>
          <span className="lucky-value">
            {glyphOf(daily.compat)} {daily.compat.name}
          </span>
        </div>
      </div>
      <div className="yiji">
        <div className="yiji-block yi">
          <div className="yiji-head">
            <span className="yiji-mark">宜</span>
            <span>适合去做</span>
          </div>
          <div className="yiji-tags">
            {daily.yi.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="yiji-block ji">
          <div className="yiji-head">
            <span className="yiji-mark">忌</span>
            <span>尽量避开</span>
          </div>
          <div className="yiji-tags">
            {daily.ji.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
