import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { pad2, prefersReducedMotion } from '../lib/utils';
import type { DailyResult, Sign, TodayInfo } from '../types';

interface FortuneSlipProps {
  sign: Sign;
  daily: DailyResult;
  today: TodayInfo;
  onSave: () => void;
  onCopy: () => void;
  onShare: () => void;
}

export function FortuneSlip({ sign, daily, today, onSave, onCopy, onShare }: FortuneSlipProps) {
  const fortune = daily.fortune;
  const sparks = useMemo(() => {
    if (prefersReducedMotion()) return [];
    return Array.from({ length: 22 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 70 + Math.random() * 170;
      return {
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        delay: Math.random() * 0.18,
        opacity: 0.4 + Math.random() * 0.6
      };
    });
  }, []);

  return (
    <div className="slip-content">
      <div className="slip-card">
        {sparks.map((spark, index) => {
          const style = {
            '--tx': `${spark.tx}px`,
            '--ty': `${spark.ty}px`,
            animationDelay: `${spark.delay}s`,
            opacity: spark.opacity
          } as CSSProperties;
          return <span key={index} className="spark" style={style} />;
        })}
        <div className="slip">
          <div className="slip-inner">
            <div className="slip-top">
              <span>第 {pad2(fortune.id)} 签</span>
              <span>{today.short}</span>
            </div>
            <div className="slip-rank" data-rank={fortune.rankKey}>{fortune.rank}</div>
            <h3 className="slip-title">{fortune.title}</h3>
            <div className="slip-rule" aria-hidden="true" />
            <div className="slip-poem">
              {fortune.poem.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <div className="slip-bottom">
              <span className="slip-sign">
                {sign.name} · 今日运势签
                <small>{today.display}</small>
              </span>
              <span className="slip-seal" aria-hidden="true">星签</span>
            </div>
          </div>
        </div>
      </div>

      <div className="reading">
        <div className="reading-head">
          <h4>解签</h4>
          <span>NO.{pad2(fortune.id)} · {fortune.rank}</span>
        </div>
        <p>{fortune.meaning}</p>
        <p className="reading-advice">
          <b>今日建议</b>
          {fortune.advice}
        </p>
        <div className="reading-tags">
          {fortune.keywords.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      <div className="slip-actions">
        <button className="btn btn--gold" id="saveCard" type="button" onClick={onSave}>保存运势签</button>
        <button className="btn btn--ghost" id="copyFortune" type="button" onClick={onCopy}>复制签文</button>
        <button className="btn btn--ghost" id="shareFortune" type="button" onClick={onShare}>分享</button>
      </div>
      <p className="slip-note">每日一签 · {today.short} · {sign.name} · 仅供娱乐参考</p>
    </div>
  );
}
