import type { ReactNode } from 'react';
import { useReveal } from '../hooks/useReveal';

interface SectionHeadProps {
  eyebrow: string;
  title: string;
  titleId: string;
  description?: ReactNode;
  center?: boolean;
}

export function SectionHead({ eyebrow, title, titleId, description, center = false }: SectionHeadProps) {
  const ref = useReveal<HTMLElement>();

  return (
    <header ref={ref} data-reveal="" className={`section-head${center ? ' section-head--center' : ''}`}>
      <div>
        <p className="eyebrow">
          <span className="eyebrow-line" />
          {eyebrow}
        </p>
        <h2 id={titleId}>{title}</h2>
      </div>
      {description ? <p className="section-desc">{description}</p> : null}
    </header>
  );
}
