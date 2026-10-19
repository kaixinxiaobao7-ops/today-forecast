import { rngFor } from './random';
import { glyphOf, mixHex } from './utils';
import type { DailyResult, Sign, TodayInfo } from '../types';

const SERIF = '"Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", serif';
const SANS = '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif';

export function buildShareText(options: {
  sign: Sign;
  daily: DailyResult;
  today: TodayInfo;
  drawn: boolean;
  url: string;
}): string {
  const { sign, daily, today, drawn, url } = options;
  const lines = [
    '✦ 星签 · 今日运势 ✦',
    `${today.display} · ${sign.name}`,
    `综合 ${daily.overall} · ${daily.band.label} · ${daily.band.sub}`,
    `爱情 ${daily.dims.love} · 事业 ${daily.dims.career} · 财运 ${daily.dims.wealth} · 健康 ${daily.dims.health}`,
    ''
  ];

  if (drawn) {
    const fortune = daily.fortune;
    lines.push(
      `今日签文：第 ${fortune.id} 签 · ${fortune.rank} · ${fortune.title}`,
      ...fortune.poem.map((line) => `「${line}」`),
      '',
      `解签：${fortune.meaning}`,
      `建议：${fortune.advice}`,
      ''
    );
  } else {
    lines.push(`今日星语：${daily.guidance}`, '');
  }

  lines.push(
    `幸运色 ${daily.color.name} · 幸运数字 ${daily.luckyNumber} · 幸运方位 ${daily.direction}`,
    '—— 星签 Starsign'
  );

  if (url) lines.push(url);
  return lines.join('\n');
}

function drawTracked(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number
): void {
  const characters = Array.from(text);
  const widths = characters.map((character) => context.measureText(character).width);
  const total = widths.reduce((sum, width) => sum + width, 0) + spacing * (characters.length - 1);
  let cursor = x - total / 2;
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  characters.forEach((character, index) => {
    context.fillText(character, cursor + widths[index] / 2, y);
    cursor += widths[index] + spacing;
  });
}

function drawSparkle(context: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  context.beginPath();
  context.moveTo(x, y - radius);
  context.quadraticCurveTo(x + radius * 0.16, y - radius * 0.16, x + radius, y);
  context.quadraticCurveTo(x + radius * 0.16, y + radius * 0.16, x, y + radius);
  context.quadraticCurveTo(x - radius * 0.16, y + radius * 0.16, x - radius, y);
  context.quadraticCurveTo(x - radius * 0.16, y - radius * 0.16, x, y - radius);
  context.closePath();
  context.fill();
}

export function createShareCard(sign: Sign, daily: DailyResult, today: TodayInfo): HTMLCanvasElement {
  const width = 1080;
  const height = 1440;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported');

  const fortune = daily.fortune;

  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#070911');
  background.addColorStop(0.48, '#0c1122');
  background.addColorStop(1, '#080a13');
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const glow = (x: number, y: number, radius: number, color: string): void => {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };
  glow(850, 140, 520, 'rgba(64, 86, 158, 0.32)');
  glow(170, 1190, 480, 'rgba(103, 62, 136, 0.22)');
  glow(540, 700, 600, 'rgba(230, 199, 141, 0.055)');

  const rng = rngFor(`${today.key}|share|${sign.id}`);
  for (let index = 0; index < 190; index += 1) {
    const x = rng() * width;
    const y = rng() * height;
    const radius = rng() * 1.7 + 0.35;
    const alpha = rng() * 0.55 + 0.12;
    const warm = rng() > 0.84;
    context.fillStyle = warm ? `rgba(230,199,141,${alpha})` : `rgba(221,228,246,${alpha})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = 'rgba(230,199,141,0.6)';
  drawSparkle(context, 132, 226, 7);
  drawSparkle(context, 944, 346, 5);
  drawSparkle(context, 882, 1250, 6);

  context.strokeStyle = 'rgba(230,199,141,0.34)';
  context.lineWidth = 1.4;
  context.strokeRect(42, 42, width - 84, height - 84);
  context.strokeStyle = 'rgba(230,199,141,0.12)';
  context.lineWidth = 0.8;
  context.strokeRect(54, 54, width - 108, height - 108);

  context.fillStyle = '#e6c78d';
  drawSparkle(context, width / 2, 106, 11);
  context.font = `500 34px ${SERIF}`;
  drawTracked(context, '星签', width / 2, 162, 20);
  context.fillStyle = 'rgba(163,169,187,0.8)';
  context.font = `400 12px ${SANS}`;
  drawTracked(context, 'STARSIGN · DAILY HOROSCOPE', width / 2, 198, 5);

  context.fillStyle = 'rgba(243,238,228,0.66)';
  context.font = `400 18px ${SANS}`;
  drawTracked(context, today.display, width / 2, 246, 2);

  const glyphColor = mixHex(sign.palette[0].hex, '#ffffff', 0.28);
  context.strokeStyle = 'rgba(230,199,141,0.22)';
  context.lineWidth = 1.2;
  context.beginPath();
  context.arc(width / 2, 356, 102, 0, Math.PI * 2);
  context.stroke();
  context.setLineDash([3, 9]);
  context.strokeStyle = 'rgba(230,199,141,0.16)';
  context.beginPath();
  context.arc(width / 2, 356, 116, 0, Math.PI * 2);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = glyphColor;
  context.font = `400 118px "Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", ${SANS}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(glyphOf(sign), width / 2, 360);

  context.fillStyle = '#f3eee4';
  context.font = `500 54px ${SERIF}`;
  drawTracked(context, sign.name, width / 2, 520, 10);
  context.fillStyle = 'rgba(163,169,187,0.82)';
  context.font = `400 15px ${SANS}`;
  drawTracked(context, `${sign.en.toUpperCase()}  ·  ${sign.dates}`, width / 2, 566, 3);

  context.fillStyle = 'rgba(230,199,141,0.88)';
  context.font = `400 14px ${SANS}`;
  drawTracked(context, 'OVERALL · 综合运势', width / 2, 642, 5);

  const scoreGradient = context.createLinearGradient(0, 690, 0, 790);
  scoreGradient.addColorStop(0, '#f8ecd0');
  scoreGradient.addColorStop(0.5, '#e6c78d');
  scoreGradient.addColorStop(1, '#bd8f4d');
  context.fillStyle = scoreGradient;
  context.font = `400 128px ${SERIF}`;
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  context.fillText(String(daily.overall), width / 2, 782);

  context.fillStyle = 'rgba(243,238,228,0.92)';
  context.font = `400 25px ${SERIF}`;
  drawTracked(context, `${daily.band.label} · ${daily.band.sub}`, width / 2, 826, 5);

  const dimensions: Array<[string, number, string]> = [
    ['爱情', daily.dims.love, '#e7a6b0'],
    ['事业', daily.dims.career, '#e6c78d'],
    ['财运', daily.dims.wealth, '#8fc7a8'],
    ['健康', daily.dims.health, '#9db7e8']
  ];
  const columnX = [190, 423, 656, 890];

  dimensions.forEach(([label, value, color], index) => {
    context.fillStyle = 'rgba(163,169,187,0.8)';
    context.font = `400 14px ${SANS}`;
    drawTracked(context, label, columnX[index], 888, 4);
    context.fillStyle = '#f3eee4';
    context.font = `400 34px ${SERIF}`;
    drawTracked(context, String(value), columnX[index], 930, 1);
    context.fillStyle = 'rgba(255,255,255,0.08)';
    context.fillRect(columnX[index] - 52, 948, 104, 2);
    context.fillStyle = color;
    context.fillRect(columnX[index] - 52, 948, 104 * (value / 100), 2);
  });

  context.strokeStyle = 'rgba(230,199,141,0.2)';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(150, 1000);
  context.lineTo(930, 1000);
  context.stroke();
  context.fillStyle = 'rgba(230,199,141,0.6)';
  drawSparkle(context, width / 2, 1000, 5);

  context.fillStyle = 'rgba(230,199,141,0.9)';
  context.font = `400 14px ${SANS}`;
  drawTracked(context, `今日运势签 · 第 ${fortune.id} 签`, width / 2, 1042, 4);

  context.fillStyle = '#f3eee4';
  context.font = `500 40px ${SERIF}`;
  drawTracked(context, `${fortune.rank} · ${fortune.title}`, width / 2, 1098, 6);

  context.fillStyle = 'rgba(243,238,228,0.82)';
  context.font = `400 25px ${SERIF}`;
  fortune.poem.forEach((line, index) => {
    drawTracked(context, line, width / 2, 1158 + index * 46, 3);
  });

  context.fillStyle = 'rgba(163,169,187,0.72)';
  context.font = `400 14px ${SERIF}`;
  drawTracked(context, '抬头看星，也看看自己。', width / 2, 1352, 3);
  context.fillStyle = 'rgba(163,169,187,0.42)';
  context.font = `400 11px ${SANS}`;
  drawTracked(context, 'STARSIGN · 每日星象 · 仅供娱乐参考', width / 2, 1382, 3);

  return canvas;
}

export async function downloadShareCard(
  sign: Sign,
  daily: DailyResult,
  today: TodayInfo
): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  const canvas = createShareCard(sign, daily, today);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
  if (!blob) throw new Error('Could not create image');

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `星签_${sign.name}_${today.key}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}
