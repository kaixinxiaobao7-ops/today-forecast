import type { TodayInfo } from '../types';
import { pad2 } from './utils';

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function readToday(): TodayInfo {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAYS[date.getDay()];
  return {
    y: year,
    m: month,
    day,
    weekday,
    key: `${year}-${pad2(month)}-${pad2(day)}`,
    display: `${year}年${month}月${day}日 · ${weekday}`,
    short: `${year}.${pad2(month)}.${pad2(day)}`,
    monthEn: MONTHS_EN[date.getMonth()]
  };
}
