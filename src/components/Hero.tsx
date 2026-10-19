import type { SignId, Theme, TodayInfo } from '../types';
import { ArrowIcon } from './art';
import { ZodiacWheel } from './ZodiacWheel';

interface HeroProps {
  today: TodayInfo;
  theme: Theme;
  selected: SignId | null;
  hovered: SignId | null;
  wheelHint: boolean;
  onSelect: (id: SignId) => void;
  onHover: (id: SignId | null) => void;
  onDraw: () => void;
}

export function Hero({ today, theme, selected, hovered, wheelHint, onSelect, onHover, onDraw }: HeroProps) {
  return (
    <section className="hero container" aria-labelledby="heroTitle">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="eyebrow-line" />
          DAILY HOROSCOPE · 每日星象
        </p>
        <h1 id="heroTitle">
          今日<span>星座运势</span>
        </h1>
        <p className="hero-lede">
          抬头看星，也看看自己。
          <br />
          十二星座的今日星象解读，与一支只属于你的运势签。
        </p>
        <div className="hero-meta">
          <span>{today.display}</span>
          <span className="dot" aria-hidden="true" />
          <span>{theme.title}</span>
        </div>
        <div className="hero-actions">
          <a className="btn btn--gold" href="#horoscope">
            查看今日运势
            <ArrowIcon />
          </a>
          <button className="btn btn--ghost" type="button" onClick={onDraw}>
            抽取运势签 <span className="btn-star" aria-hidden="true">✦</span>
          </button>
        </div>
      </div>

      <div className="wheel-wrap">
        <ZodiacWheel
          selected={selected}
          hovered={hovered}
          today={today}
          hint={wheelHint}
          onSelect={onSelect}
          onHover={onHover}
        />
        <p className="wheel-note">
          <span aria-hidden="true">✦</span> 选择你的星座，开启今日星象
        </p>
      </div>
    </section>
  );
}
