import type { TodayInfo } from '../types';
import { BrandMark } from './art';

interface HeaderProps {
  today: TodayInfo;
  scrolled: boolean;
  onCta: () => void;
}

export function Header({ today, scrolled, onCta }: HeaderProps) {
  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container header-inner">
        <a className="brand" href="./" aria-label="星签首页">
          <BrandMark />
          <span className="brand-text">
            <strong>星签</strong>
            <small>STARSIGN</small>
          </span>
        </a>
        <p className="header-date">{today.display}</p>
        <nav className="header-nav" aria-label="主导航">
          <a href="#horoscope">今日运势</a>
          <a href="#fortune">运势签</a>
          <button className="btn btn--sm btn--gold" type="button" onClick={onCta}>
            求今日签
          </button>
        </nav>
      </div>
    </header>
  );
}
