import type { CSSProperties } from 'react';
import { hexToRgba } from '../lib/utils';
import type { DailyResult } from '../types';
import { DimensionsCard } from './DimensionsCard';
import { LuckyKit } from './LuckyKit';
import { OverviewCard } from './OverviewCard';
import { SignIdentity } from './SignIdentity';

interface ResultViewProps {
  daily: DailyResult;
  onSwitch: () => void;
  onDraw: () => void;
  onCopy: () => void;
}

export function ResultView({ daily, onSwitch, onDraw, onCopy }: ResultViewProps) {
  const style = {
    '--sign': daily.color.hex,
    '--sign-soft': hexToRgba(daily.color.hex, 0.22)
  } as CSSProperties;

  return (
    <div className="result" style={style}>
      <div className="result-grid">
        <SignIdentity sign={daily.sign} color={daily.color} onSwitch={onSwitch} />
        <div className="result-main">
          <OverviewCard daily={daily} onDraw={onDraw} onCopy={onCopy} />
          <DimensionsCard daily={daily} />
          <LuckyKit daily={daily} />
        </div>
      </div>
    </div>
  );
}
