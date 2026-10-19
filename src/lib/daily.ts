import {
  DIMENSION_LINES,
  FORTUNES,
  POOLS,
  SCORE_BANDS,
  SIGNS
} from '../data';
import type {
  DailyResult,
  DimensionBand,
  DimensionKey,
  Fortune,
  Sign,
  Theme
} from '../types';
import { pick, pickMany, rngFor } from './random';
import { clamp } from './utils';

const DIMENSION_KEYS: DimensionKey[] = ['love', 'career', 'wealth', 'health'];

function bandFor(value: number): DimensionBand {
  if (value >= 85) return 'high';
  if (value >= 70) return 'mid';
  return 'low';
}

function fortunePoolFor(overall: number): Fortune[] {
  if (overall >= 82) {
    return FORTUNES.filter((fortune) => fortune.rankKey === 'shangshang' || fortune.rankKey === 'shangji');
  }
  if (overall >= 70) {
    return FORTUNES.filter((fortune) => fortune.rankKey !== 'ping');
  }
  return FORTUNES.filter((fortune) => fortune.rankKey === 'zhongji' || fortune.rankKey === 'ping');
}

export function computeDaily(sign: Sign, dateKey: string, theme: Theme): DailyResult {
  const rng = rngFor(`${dateKey}|${sign.id}|v1`);
  const dims = {} as Record<DimensionKey, number>;

  DIMENSION_KEYS.forEach((key) => {
    dims[key] = Math.round(clamp(64 + rng() * 29 + (rng() - 0.5) * 8, 56, 98));
  });

  const average = DIMENSION_KEYS.reduce((sum, key) => sum + dims[key], 0) / DIMENSION_KEYS.length;
  const overall = Math.round(clamp(average + 1.5, 56, 99));
  const band = SCORE_BANDS.find((item) => overall >= item.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
  const sorted = DIMENSION_KEYS.slice().sort((a, b) => dims[b] - dims[a]);
  const topKey = sorted[0];
  let lowKey = sorted[sorted.length - 1];
  if (lowKey === topKey) lowKey = sorted[sorted.length - 2] ?? topKey;

  const fortune = pick(rng, fortunePoolFor(overall));
  const color = pick(rng, sign.palette);
  const luckyNumber = pick(rng, sign.numbers);
  const direction = pick(rng, POOLS.directions);
  const time = pick(rng, POOLS.times);
  const compat = SIGNS.find((item) => item.id === pick(rng, sign.compatible)) ?? sign;
  const yi = pickMany(rng, POOLS.yi, 3);
  const ji = pickMany(rng, POOLS.ji, 3);
  const guidance = pick(rng, POOLS.guidance);
  const topLine = pick(rng, DIMENSION_LINES[topKey][bandFor(dims[topKey])]);
  const lowLine = pick(rng, DIMENSION_LINES[lowKey][bandFor(dims[lowKey])]);

  return {
    sign,
    dims,
    overall,
    band,
    topKey,
    lowKey,
    fortune,
    color,
    luckyNumber,
    direction,
    time,
    compat,
    yi,
    ji,
    guidance,
    topLine,
    lowLine,
    theme
  };
}

export const DIMENSION_ORDER = DIMENSION_KEYS;
