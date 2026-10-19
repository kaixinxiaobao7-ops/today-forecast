import type { Sign } from '../types';

export const pad2 = (value: number): string => String(value).padStart(2, '0');

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export function hexToRgba(hex: string, alpha: number): string {
  let value = hex.replace('#', '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const number = Number.parseInt(value, 16);
  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${alpha})`;
}

export function mixHex(hex: string, target: string, amount: number): string {
  const parse = (input: string): [number, number, number] => {
    let value = input.replace('#', '');
    if (value.length === 3) {
      value = value
        .split('')
        .map((char) => char + char)
        .join('');
    }
    const number = Number.parseInt(value, 16);
    return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
  };
  const from = parse(hex);
  const to = parse(target);
  const mixed = from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount));
  return `rgb(${mixed[0]}, ${mixed[1]}, ${mixed[2]})`;
}

/** Force text presentation for zodiac glyphs instead of color emoji. */
export const glyphOf = (sign: Pick<Sign, 'glyph'>): string => `${sign.glyph}\uFE0E`;

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function copyText(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand('copy');
      area.remove();
      return copied;
    } catch {
      return false;
    }
  }
}
