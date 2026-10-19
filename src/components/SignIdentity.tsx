import { glyphOf, pad2 } from '../lib/utils';
import type { PaletteColor, Sign } from '../types';
import { Constellation } from './art';

interface SignIdentityProps {
  sign: Sign;
  color: PaletteColor;
  onSwitch: () => void;
}

export function SignIdentity({ sign, color, onSwitch }: SignIdentityProps) {
  return (
    <aside className="panel identity">
      <div className="identity-glow" aria-hidden="true" />
      <div className="identity-inner">
        <div className="identity-head">
          <span className="identity-glyph" aria-hidden="true">{glyphOf(sign)}</span>
          <span className="identity-index">NO.{pad2(sign.order)} / 12</span>
        </div>
        <h3 className="identity-name">{sign.name}</h3>
        <div className="identity-sub">
          <span>{sign.en}</span>
          <span className="dot" aria-hidden="true" />
          <span>{sign.dates}</span>
        </div>
        <div className="identity-meta">
          <div className="meta-cell">
            <span>元素</span>
            <strong>{sign.element}</strong>
          </div>
          <div className="meta-cell">
            <span>守护星</span>
            <strong>{sign.ruler}</strong>
          </div>
          <div className="meta-cell">
            <span>模式</span>
            <strong>{sign.modality}</strong>
          </div>
        </div>
        <div className="traits">
          {sign.traits.map((trait) => (
            <span key={trait}>{trait}</span>
          ))}
        </div>
        <div className="constellation">
          <span className="constellation-label">CONSTELLATION · 星图</span>
          <Constellation sign={sign} />
        </div>
        <div className="identity-foot">
          <span>今日幸运色 · {color.name}</span>
          <button className="link-btn" type="button" onClick={onSwitch}>
            切换星座
          </button>
        </div>
      </div>
    </aside>
  );
}
