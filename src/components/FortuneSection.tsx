import { glyphOf } from '../lib/utils';
import type { DailyResult, Sign, TodayInfo } from '../types';
import { SectionHead } from './SectionHead';
import { TubeIllustration } from './art';
import { FortuneSlip } from './FortuneSlip';

interface FortuneSectionProps {
  sign: Sign | null;
  daily: DailyResult | null;
  today: TodayInfo;
  drawn: boolean;
  drawing: boolean;
  pulse: boolean;
  onDraw: () => void;
  onSave: () => void;
  onCopy: () => void;
  onShare: () => void;
}

export function FortuneSection({
  sign,
  daily,
  today,
  drawn,
  drawing,
  pulse,
  onDraw,
  onSave,
  onCopy,
  onShare
}: FortuneSectionProps) {
  const label = drawing ? '签筒摇动中…' : drawn ? '重温今日签' : '摇一摇，抽取今日签';
  const note = drawing ? '凝神，听签落之声' : drawn ? '今日签已定 · 明日再来' : sign ? `${sign.name} · 今日签待抽取` : '先在上方选择星座';
  const noteReady = Boolean(sign);
  const ariaLabel = drawing ? '签筒摇动中' : drawn ? '重温今日运势签' : '摇一摇，抽取今日运势签';

  return (
    <section className="section section--fortune" id="fortune" aria-labelledby="fortuneTitle">
      <div className="fortune-watermark" aria-hidden="true">籤</div>
      <div className="container">
        <SectionHead
          eyebrow="02 / DAILY FORTUNE"
          title="今日运势签"
          titleId="fortuneTitle"
          center
          description={
            <>
              摇一支签，看看宇宙今天想对你说什么。
              <br />
              每日一签，同一星座当日签文固定。
            </>
          }
        />

        <div className="fortune-grid">
          <div className="draw-stage panel">
            <p className="stage-label">SHAKE &amp; DRAW</p>
            <button
              className={`tube-btn${drawing ? ' is-shaking' : ''}${pulse ? ' is-pulse' : ''}`}
              id="drawBtn"
              type="button"
              aria-label={ariaLabel}
              onClick={onDraw}
            >
              <span className="tube-glow" aria-hidden="true" />
              <TubeIllustration />
              <span className="tube-label">{label}</span>
            </button>
            <p className={`draw-note${noteReady ? ' is-ready' : ''}`}>{note}</p>
            <div className="draw-rule" aria-hidden="true" />
            <p className="draw-sub">诚心默念你的问题，轻点签筒</p>
          </div>

          <div className="slip-stage panel" id="slipStage">
            {drawn && sign && daily ? (
              <FortuneSlip
                key={`${sign.id}-${today.key}`}
                sign={sign}
                daily={daily}
                today={today}
                onSave={onSave}
                onCopy={onCopy}
                onShare={onShare}
              />
            ) : (
              <div className="slip-placeholder">
                <span
                  className="seal-wait"
                  style={sign ? { color: sign.palette[0].hex } : undefined}
                >
                  {sign ? glyphOf(sign) : '待'}
                </span>
                <p>{sign ? `为 ${sign.name} 摇一签` : '签筒未启'}</p>
                <small>
                  {sign
                    ? '轻点签筒 · 今日签文即将揭晓'
                    : '选择星座 · 摇动签筒 · 收下今日签文'}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
