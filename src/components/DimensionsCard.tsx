import { useEffect, useState } from 'react';
import { DIMENSIONS } from '../data';
import { DIMENSION_ORDER } from '../lib/daily';
import type { DailyResult, DimensionKey } from '../types';

function DimensionItem({ dimension, value, isTop }: { dimension: DimensionKey; value: number; isTop: boolean }) {
  const meta = DIMENSIONS[dimension];
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setWidth(value), 40);
    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <div className={`dim-item${isTop ? ' is-top' : ''}`}>
      <div className="dim-top">
        <span className="dim-name">
          <i style={{ background: meta.color }} aria-hidden="true" />
          {meta.name}
        </span>
        <span className="dim-score">{value}</span>
      </div>
      <div className="dim-bar">
        <span className="dim-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function DimensionsCard({ daily }: { daily: DailyResult }) {
  return (
    <article className="panel dimensions">
      <div className="card-head">
        <h3>四维能量</h3>
        <span className="card-note">
          今日高光 · <strong>{DIMENSIONS[daily.topKey].name}</strong>
        </span>
      </div>
      <div className="dim-grid">
        {DIMENSION_ORDER.map((key) => (
          <DimensionItem
            key={key}
            dimension={key}
            value={daily.dims[key]}
            isTop={key === daily.topKey}
          />
        ))}
      </div>
      <p className="dim-foot">{daily.theme.title} · 分数由日期与星座生成，仅供娱乐参考</p>
    </article>
  );
}
