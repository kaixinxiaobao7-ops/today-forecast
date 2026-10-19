import { useEffect, useState } from 'react';
import type { Sign } from '../types';

export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="17.2" fill="none" stroke="currentColor" strokeOpacity=".38" />
      <path
        d="M20 3.6 23.4 16.6 36.4 20 23.4 23.4 20 36.4 16.6 23.4 3.6 20 16.6 16.6Z"
        fill="currentColor"
      />
      <circle cx="20" cy="20" r="2.2" fill="#0a0d18" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M4 10h11M11 5l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WheelRings() {
  const ticks = Array.from({ length: 60 }, (_, index) => {
    const angle = (index * 6 - 90) * (Math.PI / 180);
    const major = index % 5 === 0;
    const r1 = 46.4;
    const r2 = major ? 48.4 : 47.4;
    return (
      <line
        key={`tick-${index}`}
        x1={50 + r1 * Math.cos(angle)}
        y1={50 + r1 * Math.sin(angle)}
        x2={50 + r2 * Math.cos(angle)}
        y2={50 + r2 * Math.sin(angle)}
        stroke="#e6c78d"
        strokeOpacity={major ? 0.3 : 0.12}
        strokeWidth={major ? 0.24 : 0.14}
      />
    );
  });

  const spokes = Array.from({ length: 12 }, (_, index) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    return (
      <line
        key={`spoke-${index}`}
        x1={50 + 34 * Math.cos(angle)}
        y1={50 + 34 * Math.sin(angle)}
        x2={50 + 41.6 * Math.cos(angle)}
        y2={50 + 41.6 * Math.sin(angle)}
        stroke="#e6c78d"
        strokeOpacity="0.09"
        strokeWidth="0.16"
      />
    );
  });

  return (
    <svg className="wheel-rings" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="wheelHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e6c78d" stopOpacity=".13" />
          <stop offset="62%" stopColor="#8c7bd8" stopOpacity=".06" />
          <stop offset="100%" stopColor="#070911" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="49" fill="url(#wheelHalo)" />
      <circle cx="50" cy="50" r="48.7" fill="none" stroke="#e6c78d" strokeOpacity=".2" strokeWidth=".18" />
      <circle cx="50" cy="50" r="41.8" fill="none" stroke="#e6c78d" strokeOpacity=".16" strokeWidth=".18" />
      <circle
        cx="50"
        cy="50"
        r="33.2"
        fill="none"
        stroke="#e6c78d"
        strokeOpacity=".14"
        strokeWidth=".18"
        strokeDasharray=".4 1.6"
      />
      <circle
        className="ring-dash"
        cx="50"
        cy="50"
        r="45.4"
        fill="none"
        stroke="#e6c78d"
        strokeOpacity=".34"
        strokeWidth=".24"
        strokeDasharray="1.2 2.6"
      />
      {ticks}
      {spokes}
    </svg>
  );
}

export function TubeIllustration() {
  return (
    <svg className="tube" viewBox="0 0 180 300" aria-hidden="true">
      <defs>
        <linearGradient id="tubeBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4a241a" />
          <stop offset=".18" stopColor="#8d5236" />
          <stop offset=".45" stopColor="#d99a67" />
          <stop offset=".68" stopColor="#a2643f" />
          <stop offset="1" stopColor="#3f1e16" />
        </linearGradient>
        <linearGradient id="stickGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4e7cb" />
          <stop offset="1" stopColor="#c3a97f" />
        </linearGradient>
        <radialGradient id="tubeMouth" cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#160d0a" />
          <stop offset=".7" stopColor="#2c1711" />
          <stop offset="1" stopColor="#5e3424" />
        </radialGradient>
        <linearGradient id="bandGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6d241f" />
          <stop offset=".5" stopColor="#b64a3a" />
          <stop offset="1" stopColor="#6d241f" />
        </linearGradient>
        <linearGradient id="tapeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d8b678" />
          <stop offset="1" stopColor="#9f7434" />
        </linearGradient>
      </defs>

      <g className="sticks">
        <g transform="rotate(-8 90 168)">
          <rect x="52" y="34" width="7" height="140" rx="3.5" fill="url(#stickGrad)" />
          <rect x="52" y="34" width="7" height="10" rx="3.5" fill="#a43b2e" />
        </g>
        <g transform="rotate(-5 90 168)">
          <rect x="63" y="24" width="7" height="150" rx="3.5" fill="url(#stickGrad)" />
          <rect x="63" y="24" width="7" height="10" rx="3.5" fill="#a43b2e" />
        </g>
        <g transform="rotate(-2 90 168)">
          <rect x="74" y="30" width="7" height="145" rx="3.5" fill="url(#stickGrad)" />
          <rect x="74" y="30" width="7" height="10" rx="3.5" fill="#a43b2e" />
        </g>
        <g transform="rotate(1 90 168)">
          <rect x="85" y="18" width="7" height="155" rx="3.5" fill="url(#stickGrad)" />
          <rect x="85" y="18" width="7" height="10" rx="3.5" fill="#a43b2e" />
        </g>
        <g transform="rotate(4 90 168)">
          <rect x="96" y="26" width="7" height="148" rx="3.5" fill="url(#stickGrad)" />
          <rect x="96" y="26" width="7" height="10" rx="3.5" fill="#a43b2e" />
        </g>
        <g transform="rotate(7 90 168)">
          <rect x="107" y="36" width="7" height="140" rx="3.5" fill="url(#stickGrad)" />
          <rect x="107" y="36" width="7" height="10" rx="3.5" fill="#a43b2e" />
        </g>
        <g transform="rotate(10 90 168)">
          <rect x="118" y="44" width="7" height="132" rx="3.5" fill="url(#stickGrad)" />
          <rect x="118" y="44" width="7" height="10" rx="3.5" fill="#a43b2e" />
        </g>
        <g transform="rotate(-12 90 168)">
          <rect x="42" y="48" width="7" height="128" rx="3.5" fill="url(#stickGrad)" />
          <rect x="42" y="48" width="7" height="10" rx="3.5" fill="#a43b2e" />
        </g>
      </g>

      <path
        d="M36 130 C36 118 144 118 144 130 L132 264 C131 278 119 284 106 284 L74 284 C61 284 49 278 48 264 Z"
        fill="url(#tubeBody)"
      />
      <path
        d="M44 150 C58 158 122 158 136 150 L132 264 C131 278 119 284 106 284 L74 284 C61 284 49 278 48 264 Z"
        fill="#000"
        opacity=".08"
      />
      <ellipse cx="90" cy="130" rx="54" ry="15" fill="#351a12" />
      <ellipse cx="90" cy="130" rx="46" ry="10" fill="url(#tubeMouth)" />
      <path d="M48 190 C62 198 118 198 132 190 L129 222 C116 230 64 230 51 222 Z" fill="url(#bandGrad)" />
      <text
        x="90"
        y="214"
        textAnchor="middle"
        fill="#f4e4c2"
        fontSize="15"
        fontFamily="serif"
        letterSpacing="7"
      >
        星签
      </text>
      <path d="M136 174 q22 18 11 44" fill="none" stroke="#8c2f2a" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="147" cy="221" r="5" fill="url(#tapeGrad)" />
      <path d="M144 226 l-3 18 M147 226 l1 20 M150 226 l4 17" stroke="#b64a3a" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M60 140 C60 210 66 250 72 272" fill="none" stroke="#fff" strokeOpacity=".14" strokeWidth="3" strokeLinecap="round" />
      <path d="M118 142 C120 205 116 248 111 270" fill="none" stroke="#000" strokeOpacity=".14" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Constellation({ sign }: { sign: Sign }) {
  const mapPoint = ([x, y]: number[]): [number, number] => [8 + x * 1.44, y];
  return (
    <svg viewBox="0 0 160 100" role="img" aria-label={`${sign.name}星图`}>
      {sign.links.map(([a, b], index) => {
        const pointA = mapPoint(sign.stars[a]);
        const pointB = mapPoint(sign.stars[b]);
        return (
          <line
            key={`line-${index}`}
            className="c-line"
            x1={pointA[0].toFixed(2)}
            y1={pointA[1]}
            x2={pointB[0].toFixed(2)}
            y2={pointB[1]}
          />
        );
      })}
      {sign.stars.map((point, index) => {
        const [x, y] = mapPoint(point);
        const radius = index % 3 === 0 ? 2 : index % 2 === 0 ? 1.35 : 0.95;
        return (
          <circle
            key={`star-${index}`}
            className="c-star"
            cx={x.toFixed(2)}
            cy={y}
            r={radius}
            style={{ animationDelay: `${(index * 0.37).toFixed(2)}s` }}
          />
        );
      })}
    </svg>
  );
}

export function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    let first = 0;
    let second = 0;
    first = window.requestAnimationFrame(() => {
      second = window.requestAnimationFrame(() => {
        setOffset(circumference * (1 - score / 100));
      });
    });
    return () => {
      window.cancelAnimationFrame(first);
      window.cancelAnimationFrame(second);
    };
  }, [circumference, score]);

  return (
    <div className="score-ring" role="img" aria-label={`综合运势 ${score} 分`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f7e8c6" />
            <stop offset=".55" stopColor="#e6c78d" />
            <stop offset="1" stopColor="#b98b4a" />
          </linearGradient>
        </defs>
        <circle className="ring-bg" cx="60" cy="60" r="54" />
        <circle
          className="ring-value"
          cx="60"
          cy="60"
          r="54"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <div className="score-ring__num">
        {score}
        <small>SCORE</small>
      </div>
    </div>
  );
}
