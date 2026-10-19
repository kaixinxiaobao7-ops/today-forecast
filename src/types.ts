export type SignId =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export type ElementKey = 'fire' | 'earth' | 'air' | 'water';
export type Modality = '开创' | '固定' | '变动';

export interface PaletteColor {
  name: string;
  hex: string;
}

export interface Sign {
  id: SignId;
  name: string;
  en: string;
  glyph: string;
  dates: string;
  element: '火' | '土' | '风' | '水';
  elementKey: ElementKey;
  ruler: string;
  modality: Modality;
  order: number;
  traits: string[];
  voice: string;
  palette: PaletteColor[];
  numbers: number[];
  compatible: SignId[];
  stars: number[][];
  links: number[][];
}

export interface Theme {
  title: string;
  tag: string;
  general: string;
}

export type RankKey = 'shangshang' | 'shangji' | 'zhongji' | 'ping';
export type RankName = '上上签' | '上吉签' | '中吉签' | '平签';

export interface Fortune {
  id: number;
  rank: RankName;
  rankKey: RankKey;
  title: string;
  poem: string[];
  meaning: string;
  advice: string;
  keywords: string[];
}

export type DimensionKey = 'love' | 'career' | 'wealth' | 'health';

export interface DimensionMeta {
  name: string;
  en: string;
  color: string;
}

export type DimensionBand = 'high' | 'mid' | 'low';
export type DimensionLines = Record<DimensionKey, Record<DimensionBand, string[]>>;

export interface ScoreBand {
  min: number;
  label: string;
  sub: string;
  advice: string;
}

export interface Pools {
  directions: string[];
  times: string[];
  yi: string[];
  ji: string[];
  guidance: string[];
}

export interface TodayInfo {
  y: number;
  m: number;
  day: number;
  weekday: string;
  key: string;
  display: string;
  short: string;
  monthEn: string;
}

export interface DailyResult {
  sign: Sign;
  dims: Record<DimensionKey, number>;
  overall: number;
  band: ScoreBand;
  topKey: DimensionKey;
  lowKey: DimensionKey;
  fortune: Fortune;
  color: PaletteColor;
  luckyNumber: number;
  direction: string;
  time: string;
  compat: Sign;
  yi: string[];
  ji: string[];
  guidance: string;
  topLine: string;
  lowLine: string;
  theme: Theme;
}

export type ToastFn = (message: string) => void;
