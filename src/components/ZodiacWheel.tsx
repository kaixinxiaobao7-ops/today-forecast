import type { CSSProperties } from 'react';
import { SIGNS } from '../data';
import { glyphOf } from '../lib/utils';
import type { SignId, TodayInfo } from '../types';
import { WheelRings } from './art';

interface ZodiacWheelProps {
  selected: SignId | null;
  hovered: SignId | null;
  today: TodayInfo;
  hint: boolean;
  onSelect: (id: SignId) => void;
  onHover: (id: SignId | null) => void;
}

export function ZodiacWheel({ selected, hovered, today, hint, onSelect, onHover }: ZodiacWheelProps) {
  const active = SIGNS.find((sign) => sign.id === hovered) ?? SIGNS.find((sign) => sign.id === selected) ?? null;

  return (
    <div className={`wheel${hint ? ' is-hint' : ''}`} id="wheel">
      <WheelRings />
      <div className="wheel-center">
        <span className={`wheel-center__main${active ? ' is-glyph' : ''}`}>
          {active ? glyphOf(active) : String(today.day).padStart(2, '0')}
        </span>
        <span className="wheel-center__sub">
          {active ? active.name : `${today.monthEn} · 点击星座`}
        </span>
      </div>
      <div className="wheel-buttons" onMouseLeave={() => onHover(null)}>
        {SIGNS.map((sign) => {
          const angle = (-90 + (sign.order - 1) * 30) * (Math.PI / 180);
          const x = 50 + 37.4 * Math.cos(angle);
          const y = 50 + 37.4 * Math.sin(angle);
          const style = {
            left: `${x.toFixed(3)}%`,
            top: `${y.toFixed(3)}%`,
            '--sign': sign.palette[0].hex
          } as CSSProperties;
          const isSelected = selected === sign.id;

          return (
            <button
              key={sign.id}
              className={`zodiac-btn${isSelected ? ' is-selected' : ''}`}
              type="button"
              data-sign={sign.id}
              style={style}
              aria-label={`${sign.name}，${sign.dates}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(sign.id)}
              onMouseEnter={() => onHover(sign.id)}
              onFocus={() => onHover(sign.id)}
              onBlur={() => onHover(null)}
            >
              <span className="glyph" aria-hidden="true">{glyphOf(sign)}</span>
              <span className="name">{sign.name.replace('座', '')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
