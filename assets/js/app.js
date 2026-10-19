/* 星签 · 今日星座运势 —— 交互逻辑
 * 纯静态、零依赖；所有结果由「日期 + 星座」确定性生成。
 */
(() => {
  'use strict';

  const DATA = window.STAR_DATA;
  if (!DATA) return;

  const { signs, themes, fortunes, dimensions, dimensionLines, scoreBands, pools } = DATA;

  /* ---------------------------------------------------------------------
   * Utilities
   * ------------------------------------------------------------------- */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pad2 = (n) => String(n).padStart(2, '0');
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.innerWidth <= 720;

  function hashInt(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function random() {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rngFor = (key) => mulberry32(hashInt(key));
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const glyphOf = (sign) => `${sign.glyph}\uFE0E`;

  function pickMany(rng, arr, count) {
    const copy = arr.slice();
    const out = [];
    while (out.length < count && copy.length) {
      out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
    }
    return out;
  }

  function hexToRgba(hex, alpha) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  function mixHex(hex, target, amount) {
    const parse = (h) => {
      let s = h.replace('#', '');
      if (s.length === 3) s = s.split('').map((c) => c + c).join('');
      const n = parseInt(s, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const a = parse(hex);
    const b = parse(target);
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }

  const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const MONTHS_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  function readToday() {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const weekday = WEEKDAYS[d.getDay()];
    return {
      y,
      m,
      day,
      weekday,
      key: `${y}-${pad2(m)}-${pad2(day)}`,
      display: `${y}年${m}月${day}日 · ${weekday}`,
      short: `${y}.${pad2(m)}.${pad2(day)}`,
      monthEn: MONTHS_EN[d.getMonth()]
    };
  }

  let today = readToday();
  let dayTheme = themes[hashInt(today.key) % themes.length];

  const state = {
    sign: null,
    daily: null,
    drawn: false
  };

  /* ---------------------------------------------------------------------
   * Daily calculation
   * ------------------------------------------------------------------- */

  function bandFor(value) {
    if (value >= 85) return 'high';
    if (value >= 70) return 'mid';
    return 'low';
  }

  function computeDaily(sign, key = today.key) {
    const rng = rngFor(`${key}|${sign.id}|v1`);
    const keys = ['love', 'career', 'wealth', 'health'];
    const dims = {};

    keys.forEach((k) => {
      const score = Math.round(clamp(64 + rng() * 29 + (rng() - 0.5) * 8, 56, 98));
      dims[k] = score;
    });

    const average = keys.reduce((sum, k) => sum + dims[k], 0) / keys.length;
    const overall = Math.round(clamp(average + 1.5, 56, 99));
    const band = scoreBands.find((item) => overall >= item.min) || scoreBands[scoreBands.length - 1];
    const sorted = keys.slice().sort((a, b) => dims[b] - dims[a]);
    const topKey = sorted[0];
    let lowKey = sorted[sorted.length - 1];
    if (lowKey === topKey) lowKey = sorted[sorted.length - 2] || topKey;

    let fortunePool = fortunes;
    if (overall >= 82) {
      fortunePool = fortunes.filter((f) => f.rankKey === 'shangshang' || f.rankKey === 'shangji');
    } else if (overall >= 70) {
      fortunePool = fortunes.filter((f) => f.rankKey !== 'ping');
    } else {
      fortunePool = fortunes.filter((f) => f.rankKey === 'zhongji' || f.rankKey === 'ping');
    }

    const fortune = pick(rng, fortunePool);
    const color = pick(rng, sign.palette);
    const luckyNumber = pick(rng, sign.numbers);
    const direction = pick(rng, pools.directions);
    const time = pick(rng, pools.times);
    const compat = signs.find((s) => s.id === pick(rng, sign.compatible)) || sign;
    const yi = pickMany(rng, pools.yi, 3);
    const ji = pickMany(rng, pools.ji, 3);
    const guidance = pick(rng, pools.guidance);
    const topLine = pick(rng, dimensionLines[topKey][bandFor(dims[topKey])]);
    const lowLine = pick(rng, dimensionLines[lowKey][bandFor(dims[lowKey])]);

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
      theme: dayTheme
    };
  }

  /* ---------------------------------------------------------------------
   * Toast + scrolling helpers
   * ------------------------------------------------------------------- */

  let toastTimer = 0;
  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove('is-show'), 2800);
  }

  function scrollToElement(el, block = 'start') {
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block });
  }

  function scrollToWheel() {
    const wheel = $('#wheel');
    if (!wheel) return;
    scrollToElement(wheel, 'center');
    wheel.classList.remove('is-hint');
    // restart the hint animation
    void wheel.offsetWidth;
    wheel.classList.add('is-hint');
    window.setTimeout(() => wheel.classList.remove('is-hint'), 1600);
  }

  function pulseTube() {
    const btn = $('#drawBtn');
    if (!btn) return;
    btn.classList.remove('is-pulse');
    void btn.offsetWidth;
    btn.classList.add('is-pulse');
    window.setTimeout(() => btn.classList.remove('is-pulse'), 1600);
  }

  function goToFortune() {
    if (!state.sign) {
      toast('先选一个星座，再抽取今日运势签');
      scrollToWheel();
      return;
    }
    const section = $('#fortune');
    scrollToElement(section, 'start');
    window.setTimeout(() => {
      pulseTube();
      toast('轻点签筒，摇出今天的签');
    }, reduceMotion ? 0 : 550);
  }

  /* ---------------------------------------------------------------------
   * Starfield
   * ------------------------------------------------------------------- */

  function initStarfield() {
    const canvas = $('#starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let raf = 0;
    let last = 0;
    let nextShoot = 0;
    let shooting = null;
    let running = false;

    function makeStars() {
      const rng = rngFor(`sky|${today.key}`);
      const count = clamp(Math.round((width * height) / 9000), 60, 190);
      stars = [];
      for (let i = 0; i < count; i += 1) {
        const warm = rng() > 0.86;
        stars.push({
          x: rng() * width,
          y: rng() * height,
          r: rng() * 1.25 + 0.25,
          alpha: rng() * 0.55 + 0.14,
          phase: rng() * Math.PI * 2,
          speed: 0.35 + rng() * 0.8,
          warm
        });
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      makeStars();
      nextShoot = performance.now() + 4000;
      if (!running) draw(performance.now());
    }

    function draw(time) {
      if (!width || !height) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i += 1) {
        const star = stars[i];
        const twinkle = 0.58 + 0.42 * Math.sin(time * 0.001 * star.speed + star.phase);
        const alpha = star.alpha * twinkle;
        ctx.beginPath();
        ctx.fillStyle = star.warm
          ? `rgba(230, 199, 141, ${alpha})`
          : `rgba(223, 229, 246, ${alpha})`;
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
        if (star.r > 1.15) {
          ctx.fillStyle = star.warm
            ? `rgba(230, 199, 141, ${alpha * 0.25})`
            : `rgba(223, 229, 246, ${alpha * 0.22})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!reduceMotion) {
        if (!shooting && time > nextShoot) {
          shooting = {
            x: width * (0.15 + Math.random() * 0.6),
            y: height * (0.08 + Math.random() * 0.3),
            vx: 5 + Math.random() * 3,
            vy: 2.2 + Math.random() * 1.4,
            life: 0
          };
        }
        if (shooting) {
          shooting.life += 0.016;
          shooting.x += shooting.vx;
          shooting.y += shooting.vy;
          const fade = Math.max(0, 1 - shooting.life / 1.1);
          if (fade <= 0) {
            shooting = null;
            nextShoot = time + 6000 + Math.random() * 9000;
          } else {
            const tailX = shooting.x - shooting.vx * 13;
            const tailY = shooting.y - shooting.vy * 13;
            const grad = ctx.createLinearGradient(tailX, tailY, shooting.x, shooting.y);
            grad.addColorStop(0, 'rgba(230, 199, 141, 0)');
            grad.addColorStop(1, `rgba(244, 223, 180, ${0.55 * fade})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(shooting.x, shooting.y);
            ctx.stroke();
          }
        }
      }

      if (running) raf = window.requestAnimationFrame(draw);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      last = performance.now();
      raf = window.requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      window.cancelAnimationFrame(raf);
    }

    resize();
    window.addEventListener('resize', () => {
      window.clearTimeout(resize._timer);
      resize._timer = window.setTimeout(resize, 160);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
    start();
  }

  /* ---------------------------------------------------------------------
   * Wheel
   * ------------------------------------------------------------------- */

  function renderWheel() {
    const holder = $('#wheelButtons');
    const ticks = $('#wheelTicks');
    if (!holder) return;

    const radius = 37.4;
    holder.innerHTML = signs.map((sign) => {
      const angle = (-90 + (sign.order - 1) * 30) * (Math.PI / 180);
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      return `<button class="zodiac-btn" type="button" data-sign="${sign.id}" style="left:${x.toFixed(3)}%;top:${y.toFixed(3)}%;--sign:${sign.palette[0].hex}" aria-label="${sign.name}，${sign.dates}" aria-pressed="false">
        <span class="glyph" aria-hidden="true">${glyphOf(sign)}</span>
        <span class="name">${sign.name.replace('座', '')}</span>
      </button>`;
    }).join('');

    if (ticks) {
      let markup = '';
      for (let i = 0; i < 60; i += 1) {
        const angle = (i * 6 - 90) * (Math.PI / 180);
        const major = i % 5 === 0;
        const r1 = 46.4;
        const r2 = major ? 48.4 : 47.4;
        const x1 = 50 + r1 * Math.cos(angle);
        const y1 = 50 + r1 * Math.sin(angle);
        const x2 = 50 + r2 * Math.cos(angle);
        const y2 = 50 + r2 * Math.sin(angle);
        markup += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="#e6c78d" stroke-opacity="${major ? 0.3 : 0.12}" stroke-width="${major ? 0.24 : 0.14}" />`;
      }
      for (let i = 0; i < 12; i += 1) {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = 50 + 34 * Math.cos(angle);
        const y1 = 50 + 34 * Math.sin(angle);
        const x2 = 50 + 41.6 * Math.cos(angle);
        const y2 = 50 + 41.6 * Math.sin(angle);
        markup += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="#e6c78d" stroke-opacity="0.09" stroke-width="0.16" />`;
      }
      ticks.innerHTML = markup;
    }

    holder.addEventListener('click', (event) => {
      const btn = event.target.closest('.zodiac-btn');
      if (!btn) return;
      chooseSign(btn.dataset.sign);
    });

    holder.addEventListener('mouseover', (event) => {
      const btn = event.target.closest('.zodiac-btn');
      if (!btn) return;
      const sign = signs.find((s) => s.id === btn.dataset.sign);
      if (sign) setWheelCenter(sign);
    });
    holder.addEventListener('mouseleave', () => setWheelCenter(state.sign));
  }

  function setWheelCenter(sign) {
    const main = $('#wheelCenterMain');
    const sub = $('#wheelCenterSub');
    if (!main || !sub) return;
    if (sign) {
      main.textContent = glyphOf(sign);
      main.classList.add('is-glyph');
      sub.textContent = sign.name;
    } else {
      main.textContent = pad2(today.day);
      main.classList.remove('is-glyph');
      sub.textContent = `${today.monthEn} · 点击星座`;
    }
  }

  function refreshWheelSelection() {
    $$('.zodiac-btn').forEach((btn) => {
      const selected = state.sign && btn.dataset.sign === state.sign.id;
      btn.classList.toggle('is-selected', Boolean(selected));
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    setWheelCenter(state.sign);
  }

  /* ---------------------------------------------------------------------
   * Render: empty state
   * ------------------------------------------------------------------- */

  function renderEmpty() {
    const holder = $('#emptyState');
    if (!holder) return;

    const ranked = signs
      .map((sign) => ({ sign, daily: computeDaily(sign) }))
      .sort((a, b) => b.daily.overall - a.daily.overall)
      .slice(0, 3);

    holder.innerHTML = `
      <div class="empty-state">
        <article class="panel theme-card">
          <p class="mini-label">TODAY'S SKY · ${today.short}</p>
          <h3>${dayTheme.title}</h3>
          <p>${dayTheme.general}</p>
          <div class="theme-tags">
            ${dayTheme.tag.split(' · ').map((tag) => `<span>${tag}</span>`).join('')}
            <span>十二星座共享</span>
          </div>
        </article>
        <aside class="empty-side">
          <p class="mini-label">今日能量 TOP 3</p>
          <div class="top-list">
            ${ranked.map((item, index) => `
              <button class="top-card" type="button" data-sign="${item.sign.id}">
                <span class="rank">0${index + 1}</span>
                <span class="glyph" aria-hidden="true">${glyphOf(item.sign)}</span>
                <span class="info">
                  <strong>${item.sign.name}</strong>
                  <small>${dimensions[item.daily.topKey].name}高光 · ${item.daily.band.label} · ${item.daily.band.sub}</small>
                </span>
                <span class="score">${item.daily.overall}</span>
              </button>`).join('')}
          </div>
          <button class="btn btn--ghost" type="button" id="emptySelectBtn">在上方星盘选择我的星座 ↑</button>
        </aside>
      </div>`;

    holder.hidden = false;
    const result = $('#result');
    if (result) result.hidden = true;

    $$('.top-card', holder).forEach((card) => {
      card.addEventListener('click', () => chooseSign(card.dataset.sign));
    });
    const selectBtn = $('#emptySelectBtn', holder);
    if (selectBtn) {
      selectBtn.addEventListener('click', () => {
        scrollToWheel();
        toast('点击星盘上的星座符号');
      });
    }
  }

  /* ---------------------------------------------------------------------
   * Render: constellation
   * ------------------------------------------------------------------- */

  function constellationSvg(sign) {
    const mapPoint = ([x, y]) => [8 + x * 1.44, y];
    const lines = sign.links.map(([a, b]) => {
      const p1 = mapPoint(sign.stars[a]);
      const p2 = mapPoint(sign.stars[b]);
      return `<line class="c-line" x1="${p1[0].toFixed(2)}" y1="${p1[1]}" x2="${p2[0].toFixed(2)}" y2="${p2[1]}" />`;
    }).join('');
    const stars = sign.stars.map((point, index) => {
      const [x, y] = mapPoint(point);
      const r = index % 3 === 0 ? 2 : index % 2 === 0 ? 1.35 : 0.95;
      return `<circle class="c-star" cx="${x.toFixed(2)}" cy="${y}" r="${r}" style="animation-delay:${(index * 0.37).toFixed(2)}s" />`;
    }).join('');
    return `<svg viewBox="0 0 160 100" role="img" aria-label="${sign.name}星图">${lines}${stars}</svg>`;
  }

  /* ---------------------------------------------------------------------
   * Render: result
   * ------------------------------------------------------------------- */

  function renderResult() {
    const holder = $('#result');
    if (!holder || !state.sign || !state.daily) return;

    const d = state.daily;
    const sign = d.sign;
    const dimKeys = ['love', 'career', 'wealth', 'health'];
    const circumference = (2 * Math.PI * 54).toFixed(3);
    const offset = (2 * Math.PI * 54 * (1 - d.overall / 100)).toFixed(3);

    const p1 = `${sign.voice} ${d.theme.general}`;
    const p2 = `今天的高光在${dimensions[d.topKey].name}：${d.topLine} ${dimensions[d.lowKey].name}方面则要多一分照顾，${d.lowLine}`;

    holder.style.setProperty('--sign', d.color.hex);
    holder.style.setProperty('--sign-soft', hexToRgba(d.color.hex, 0.22));

    holder.innerHTML = `
      <div class="result-grid">
        <aside class="panel identity">
          <div class="identity-glow" aria-hidden="true"></div>
          <div class="identity-inner">
            <div class="identity-head">
              <span class="identity-glyph" aria-hidden="true">${glyphOf(sign)}</span>
              <span class="identity-index">NO.${pad2(sign.order)} / 12</span>
            </div>
            <h3 class="identity-name">${sign.name}</h3>
            <div class="identity-sub"><span>${sign.en}</span><span class="dot" aria-hidden="true"></span><span>${sign.dates}</span></div>
            <div class="identity-meta">
              <div class="meta-cell"><span>元素</span><strong>${sign.element}</strong></div>
              <div class="meta-cell"><span>守护星</span><strong>${sign.ruler}</strong></div>
              <div class="meta-cell"><span>模式</span><strong>${sign.modality}</strong></div>
            </div>
            <div class="traits">${sign.traits.map((t) => `<span>${t}</span>`).join('')}</div>
            <div class="constellation">
              <span class="constellation-label">CONSTELLATION · 星图</span>
              ${constellationSvg(sign)}
            </div>
            <div class="identity-foot">
              <span>今日幸运色 · ${d.color.name}</span>
              <button class="link-btn" type="button" id="changeSign">切换星座</button>
            </div>
          </div>
        </aside>

        <div class="result-main">
          <article class="panel overview">
            <div class="overview-top">
              <div class="score-ring" role="img" aria-label="综合运势 ${d.overall} 分">
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stop-color="#f7e8c6" />
                      <stop offset=".55" stop-color="#e6c78d" />
                      <stop offset="1" stop-color="#b98b4a" />
                    </linearGradient>
                  </defs>
                  <circle class="ring-bg" cx="60" cy="60" r="54" />
                  <circle class="ring-value" cx="60" cy="60" r="54" style="stroke-dasharray:${circumference};stroke-dashoffset:${circumference}" data-offset="${offset}" />
                </svg>
                <div class="score-ring__num">${d.overall}<small>SCORE</small></div>
              </div>
              <div class="overview-heading">
                <span class="label">OVERALL · 综合运势</span>
                <h3><em>${d.band.label}</em> · ${d.band.sub}</h3>
                <p class="advice">${d.band.advice}</p>
              </div>
            </div>
            <div class="overview-reading">
              <p>${p1}</p>
              <p>${p2}</p>
            </div>
            <div class="star-quote">「${d.guidance}」<small>TODAY'S NOTE</small></div>
            <div class="overview-actions">
              <button class="btn btn--gold" type="button" id="overviewDraw">抽取今日运势签 <span aria-hidden="true">✦</span></button>
              <button class="btn btn--ghost" type="button" id="overviewShare">复制今日运势</button>
            </div>
          </article>

          <article class="panel dimensions">
            <div class="card-head">
              <h3>四维能量</h3>
              <span class="card-note">今日高光 · <strong>${dimensions[d.topKey].name}</strong></span>
            </div>
            <div class="dim-grid">
              ${dimKeys.map((key) => {
                const dim = dimensions[key];
                return `<div class="dim-item ${key === d.topKey ? 'is-top' : ''}">
                  <div class="dim-top">
                    <span class="dim-name"><i style="background:${dim.color}" aria-hidden="true"></i>${dim.name}</span>
                    <span class="dim-score">${d.dims[key]}</span>
                  </div>
                  <div class="dim-bar"><span class="dim-fill" data-width="${d.dims[key]}"></span></div>
                </div>`;
              }).join('')}
            </div>
            <p class="dim-foot">${d.theme.title} · 分数由日期与星座生成，仅供娱乐参考</p>
          </article>

          <article class="panel kit">
            <div class="card-head">
              <h3>今日锦囊</h3>
              <span class="card-note">LUCKY KIT</span>
            </div>
            <div class="lucky-grid">
              <div class="lucky-item">
                <span class="lucky-label">幸运色</span>
                <span class="lucky-value"><i class="swatch" style="background:${d.color.hex};color:${d.color.hex}"></i>${d.color.name}</span>
              </div>
              <div class="lucky-item">
                <span class="lucky-label">幸运数字</span>
                <span class="lucky-value">${d.luckyNumber}</span>
              </div>
              <div class="lucky-item">
                <span class="lucky-label">幸运方位</span>
                <span class="lucky-value">${d.direction}</span>
              </div>
              <div class="lucky-item">
                <span class="lucky-label">幸运时段</span>
                <span class="lucky-value">${d.time}</span>
              </div>
              <div class="lucky-item">
                <span class="lucky-label">速配星座</span>
                <span class="lucky-value">${glyphOf(d.compat)} ${d.compat.name}</span>
              </div>
            </div>
            <div class="yiji">
              <div class="yiji-block yi">
                <div class="yiji-head"><span class="yiji-mark">宜</span><span>适合去做</span></div>
                <div class="yiji-tags">${d.yi.map((item) => `<span>${item}</span>`).join('')}</div>
              </div>
              <div class="yiji-block ji">
                <div class="yiji-head"><span class="yiji-mark">忌</span><span>尽量避开</span></div>
                <div class="yiji-tags">${d.ji.map((item) => `<span>${item}</span>`).join('')}</div>
              </div>
            </div>
          </article>
        </div>
      </div>`;

    const empty = $('#emptyState');
    if (empty) empty.hidden = true;
    holder.hidden = false;

    // Animate ring + bars after paint.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const ring = $('.ring-value', holder);
        if (ring) ring.style.strokeDashoffset = ring.dataset.offset;
        $$('.dim-fill', holder).forEach((bar) => {
          bar.style.width = `${bar.dataset.width}%`;
        });
      });
    });

    bindResultActions(holder);
  }

  function bindResultActions(holder) {
    const change = $('#changeSign', holder);
    if (change) {
      change.addEventListener('click', () => {
        scrollToWheel();
        toast('选择另一个星座，查看今日运势');
      });
    }

    const draw = $('#overviewDraw', holder);
    if (draw) draw.addEventListener('click', goToFortune);

    const share = $('#overviewShare', holder);
    if (share) {
      share.addEventListener('click', async () => {
        const ok = await copyText(buildShareText(false));
        toast(ok ? '今日运势已复制' : '复制失败，请手动选择文本');
      });
    }
  }

  /* ---------------------------------------------------------------------
   * Sign selection
   * ------------------------------------------------------------------- */

  function chooseSign(id, options = {}) {
    const sign = signs.find((item) => item.id === id);
    if (!sign) return;

    state.sign = sign;
    state.daily = computeDaily(sign);
    state.drawn = false;

    try {
      window.localStorage.setItem('starsign.sign.v1', sign.id);
    } catch (error) {
      /* localStorage may be unavailable */
    }

    refreshWheelSelection();
    renderResult();
    renderFortuneIdle();

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('sign', sign.id);
      url.searchParams.delete('draw');
      window.history.replaceState(null, '', url);
    } catch (error) {
      /* ignore */
    }

    if (options.scroll !== false) {
      window.setTimeout(() => {
        scrollToElement($('#horoscope'), 'start');
      }, 90);
    }

    if (options.draw) {
      window.setTimeout(() => {
        scrollToElement($('#fortune'), 'start');
        drawFortune();
      }, options.scroll === false ? 300 : 900);
    }
  }

  /* ---------------------------------------------------------------------
   * Fortune draw
   * ------------------------------------------------------------------- */

  let drawing = false;

  function renderFortuneIdle() {
    const placeholder = $('#slipPlaceholder');
    const content = $('#slipContent');
    const label = $('#drawLabel');
    const note = $('#drawNote');
    if (!placeholder || !content) return;

    content.hidden = true;
    content.innerHTML = '';
    placeholder.hidden = false;

    const seal = $('#sealWait');
    const title = placeholder.querySelector('p');
    const hint = placeholder.querySelector('small');

    if (state.sign) {
      if (seal) {
        seal.textContent = glyphOf(state.sign);
        seal.style.color = state.sign.palette[0].hex;
      }
      if (title) title.textContent = `为 ${state.sign.name} 摇一签`;
      if (hint) hint.textContent = '轻点签筒 · 今日签文即将揭晓';
      if (label) label.textContent = '摇一摇，抽取今日签';
      if (note) {
        note.textContent = `${state.sign.name} · 今日签待抽取`;
        note.classList.add('is-ready');
      }
    } else {
      if (seal) {
        seal.textContent = '待';
        seal.style.color = '';
      }
      if (title) title.textContent = '签筒未启';
      if (hint) hint.textContent = '选择星座 · 摇动签筒 · 收下今日签文';
      if (label) label.textContent = '摇一摇，抽取今日签';
      if (note) {
        note.textContent = '先在上方选择星座';
        note.classList.remove('is-ready');
      }
    }
  }

  function drawFortune() {
    if (!state.sign) {
      toast('先选一个星座，再抽取今日运势签');
      scrollToWheel();
      return;
    }
    if (drawing) return;

    drawing = true;
    const btn = $('#drawBtn');
    const label = $('#drawLabel');
    const note = $('#drawNote');

    if (btn) btn.classList.add('is-shaking');
    if (label) label.textContent = '签筒摇动中…';
    if (note) note.textContent = '凝神，听签落之声';

    if (!reduceMotion && navigator.vibrate) {
      try {
        navigator.vibrate([25, 40, 25]);
      } catch (error) {
        /* ignore */
      }
    }

    window.setTimeout(() => {
      if (btn) btn.classList.remove('is-shaking');
      revealFortune();
      drawing = false;
    }, reduceMotion ? 120 : 980);
  }

  function revealFortune() {
    if (!state.sign) return;
    if (!state.daily) state.daily = computeDaily(state.sign);

    const d = state.daily;
    const f = d.fortune;
    const sign = state.sign;
    const placeholder = $('#slipPlaceholder');
    const content = $('#slipContent');
    const label = $('#drawLabel');
    const note = $('#drawNote');

    if (!content) return;
    state.drawn = true;

    content.innerHTML = `
      <div class="slip-card">
        <div class="slip">
          <div class="slip-inner">
            <div class="slip-top"><span>第 ${pad2(f.id)} 签</span><span>${today.short}</span></div>
            <div class="slip-rank" data-rank="${f.rankKey}">${f.rank}</div>
            <h3 class="slip-title">${f.title}</h3>
            <div class="slip-rule" aria-hidden="true"></div>
            <div class="slip-poem">
              ${f.poem.map((line) => `<p>${line}</p>`).join('')}
            </div>
            <div class="slip-bottom">
              <span class="slip-sign">${sign.name} · 今日运势签<small>${today.display}</small></span>
              <span class="slip-seal" aria-hidden="true">星签</span>
            </div>
          </div>
        </div>
      </div>
      <div class="reading">
        <div class="reading-head">
          <h4>解签</h4>
          <span>NO.${pad2(f.id)} · ${f.rank}</span>
        </div>
        <p>${f.meaning}</p>
        <p class="reading-advice"><b>今日建议</b>${f.advice}</p>
        <div class="reading-tags">${f.keywords.map((tag) => `<span>${tag}</span>`).join('')}</div>
      </div>
      <div class="slip-actions">
        <button class="btn btn--gold" type="button" id="saveCard">保存运势签</button>
        <button class="btn btn--ghost" type="button" id="copyFortune">复制签文</button>
        <button class="btn btn--ghost" type="button" id="shareFortune">分享</button>
      </div>
      <p class="slip-note">每日一签 · ${today.short} · ${sign.name} · 仅供娱乐参考</p>`;

    if (placeholder) placeholder.hidden = true;
    content.hidden = false;
    if (label) label.textContent = '重温今日签';
    if (note) {
      note.textContent = '今日签已定 · 明日再来';
      note.classList.add('is-ready');
    }

    spawnSparks($('.slip-card', content));

    const saveBtn = $('#saveCard', content);
    if (saveBtn) saveBtn.addEventListener('click', saveCard);
    const copyBtn = $('#copyFortune', content);
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const ok = await copyText(buildShareText(true));
        toast(ok ? '签文已复制' : '复制失败，请手动选择文本');
      });
    }
    const shareBtn = $('#shareFortune', content);
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: `星签 · ${sign.name}今日运势`,
              text: buildShareText(true),
              url: shareUrl()
            });
            return;
          } catch (error) {
            if (error && error.name === 'AbortError') return;
          }
        }
        const ok = await copyText(buildShareText(true));
        toast(ok ? '签文已复制，可粘贴分享' : '复制失败，请手动选择文本');
      });
    }

    // Bring the slip into view on smaller screens.
    window.setTimeout(() => {
      const stage = $('#slipStage');
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (rect.top < 70 || rect.bottom > window.innerHeight + 40) {
        stage.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
    }, 500);
  }

  function spawnSparks(container) {
    if (!container || reduceMotion) return;
    for (let i = 0; i < 22; i += 1) {
      const spark = document.createElement('span');
      spark.className = 'spark';
      const angle = Math.random() * Math.PI * 2;
      const distance = 70 + Math.random() * 170;
      spark.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
      spark.style.animationDelay = `${Math.random() * 0.18}s`;
      spark.style.opacity = String(0.4 + Math.random() * 0.6);
      container.appendChild(spark);
      window.setTimeout(() => spark.remove(), 1600);
    }
  }

  /* ---------------------------------------------------------------------
   * Share helpers
   * ------------------------------------------------------------------- */

  function shareUrl() {
    if (!/^https?:$/.test(window.location.protocol) || !state.sign) return '';
    const url = new URL(window.location.href);
    url.searchParams.set('sign', state.sign.id);
    url.hash = '';
    return url.toString();
  }

  function buildShareText(includeFortune) {
    if (!state.sign || !state.daily) return '';
    const d = state.daily;
    const lines = [
      '✦ 星签 · 今日运势 ✦',
      `${today.display} · ${state.sign.name}`,
      `综合 ${d.overall} · ${d.band.label} · ${d.band.sub}`,
      `爱情 ${d.dims.love} · 事业 ${d.dims.career} · 财运 ${d.dims.wealth} · 健康 ${d.dims.health}`,
      ''
    ];

    if (includeFortune && state.drawn) {
      const f = d.fortune;
      lines.push(
        `今日签文：第 ${f.id} 签 · ${f.rank} · ${f.title}`,
        ...f.poem.map((line) => `「${line}」`),
        '',
        `解签：${f.meaning}`,
        `建议：${f.advice}`,
        ''
      );
    } else {
      lines.push(`今日星语：${d.guidance}`, '');
    }

    lines.push(
      `幸运色 ${d.color.name} · 幸运数字 ${d.luckyNumber} · 幸运方位 ${d.direction}`,
      '—— 星签 Starsign'
    );

    const url = shareUrl();
    if (url) lines.push(url);
    return lines.join('\n');
  }

  async function copyText(text) {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.top = '-1000px';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        area.remove();
        return ok;
      } catch (fallbackError) {
        return false;
      }
    }
  }

  /* ---------------------------------------------------------------------
   * Share card (canvas)
   * ------------------------------------------------------------------- */

  function drawTracked(ctx, text, x, y, spacing, align = 'center') {
    const chars = Array.from(text);
    const widths = chars.map((char) => ctx.measureText(char).width);
    const total = widths.reduce((sum, width) => sum + width, 0) + spacing * (chars.length - 1);
    let cursor = align === 'center' ? x - total / 2 : x;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    chars.forEach((char, index) => {
      ctx.fillText(char, cursor + widths[index] / 2, y);
      cursor += widths[index] + spacing;
    });
  }

  function drawSparkle(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.moveTo(x, y - radius);
    ctx.quadraticCurveTo(x + radius * 0.16, y - radius * 0.16, x + radius, y);
    ctx.quadraticCurveTo(x + radius * 0.16, y + radius * 0.16, x, y + radius);
    ctx.quadraticCurveTo(x - radius * 0.16, y + radius * 0.16, x - radius, y);
    ctx.quadraticCurveTo(x - radius * 0.16, y - radius * 0.16, x, y - radius);
    ctx.closePath();
    ctx.fill();
  }

  function buildCardCanvas() {
    const W = 1080;
    const H = 1440;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const d = state.daily;
    const sign = state.sign;
    const f = d.fortune;
    const serif = '"Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", serif';
    const sans = '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif';

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#070911');
    bg.addColorStop(0.48, '#0c1122');
    bg.addColorStop(1, '#080a13');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const glow = (x, y, radius, color) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    };
    glow(850, 140, 520, 'rgba(64, 86, 158, 0.32)');
    glow(170, 1190, 480, 'rgba(103, 62, 136, 0.22)');
    glow(540, 700, 600, 'rgba(230, 199, 141, 0.055)');

    // Stars
    const rng = rngFor(`${today.key}|share|${sign.id}`);
    for (let i = 0; i < 190; i += 1) {
      const x = rng() * W;
      const y = rng() * H;
      const r = rng() * 1.7 + 0.35;
      const alpha = rng() * 0.55 + 0.12;
      const warm = rng() > 0.84;
      ctx.fillStyle = warm ? `rgba(230,199,141,${alpha})` : `rgba(221,228,246,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(230,199,141,0.6)';
    drawSparkle(ctx, 132, 226, 7);
    drawSparkle(ctx, 944, 346, 5);
    drawSparkle(ctx, 882, 1250, 6);

    // Border
    ctx.strokeStyle = 'rgba(230,199,141,0.34)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(42, 42, W - 84, H - 84);
    ctx.strokeStyle = 'rgba(230,199,141,0.12)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(54, 54, W - 108, H - 108);

    // Brand
    ctx.fillStyle = '#e6c78d';
    drawSparkle(ctx, W / 2, 106, 11);
    ctx.font = `500 34px ${serif}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    drawTracked(ctx, '星签', W / 2, 162, 20);
    ctx.fillStyle = 'rgba(163,169,187,0.8)';
    ctx.font = `400 12px ${sans}`;
    drawTracked(ctx, 'STARSIGN · DAILY HOROSCOPE', W / 2, 198, 5);

    ctx.fillStyle = 'rgba(243,238,228,0.66)';
    ctx.font = `400 18px ${sans}`;
    drawTracked(ctx, `${today.display}`, W / 2, 246, 2);

    // Sign emblem
    const glyphColor = mixHex(sign.palette[0].hex, '#ffffff', 0.28);
    ctx.strokeStyle = 'rgba(230,199,141,0.22)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(W / 2, 356, 102, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([3, 9]);
    ctx.strokeStyle = 'rgba(230,199,141,0.16)';
    ctx.beginPath();
    ctx.arc(W / 2, 356, 116, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = glyphColor;
    ctx.font = `400 118px "Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols 2", ${sans}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(glyphOf(sign), W / 2, 360);

    ctx.fillStyle = '#f3eee4';
    ctx.font = `500 54px ${serif}`;
    drawTracked(ctx, sign.name, W / 2, 520, 10);
    ctx.fillStyle = 'rgba(163,169,187,0.82)';
    ctx.font = `400 15px ${sans}`;
    drawTracked(ctx, `${sign.en.toUpperCase()}  ·  ${sign.dates}`, W / 2, 566, 3);

    // Overall score
    ctx.fillStyle = 'rgba(230,199,141,0.88)';
    ctx.font = `400 14px ${sans}`;
    drawTracked(ctx, 'OVERALL · 综合运势', W / 2, 642, 5);

    const scoreGrad = ctx.createLinearGradient(0, 690, 0, 790);
    scoreGrad.addColorStop(0, '#f8ecd0');
    scoreGrad.addColorStop(0.5, '#e6c78d');
    scoreGrad.addColorStop(1, '#bd8f4d');
    ctx.fillStyle = scoreGrad;
    ctx.font = `400 128px ${serif}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(String(d.overall), W / 2, 782);

    ctx.fillStyle = 'rgba(243,238,228,0.92)';
    ctx.font = `400 25px ${serif}`;
    drawTracked(ctx, `${d.band.label} · ${d.band.sub}`, W / 2, 826, 5);

    // Dimensions
    const dims = [
      ['爱情', d.dims.love],
      ['事业', d.dims.career],
      ['财运', d.dims.wealth],
      ['健康', d.dims.health]
    ];
    const columnX = [190, 423, 656, 890];
    dims.forEach(([label, value], index) => {
      ctx.fillStyle = 'rgba(163,169,187,0.8)';
      ctx.font = `400 14px ${sans}`;
      drawTracked(ctx, label, columnX[index], 888, 4);
      ctx.fillStyle = '#f3eee4';
      ctx.font = `400 34px ${serif}`;
      ctx.textAlign = 'center';
      drawTracked(ctx, String(value), columnX[index], 930, 1);
      // faint bar
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(columnX[index] - 52, 948, 104, 2);
      const color = index === 0 ? '#e7a6b0' : index === 1 ? '#e6c78d' : index === 2 ? '#8fc7a8' : '#9db7e8';
      ctx.fillStyle = color;
      ctx.fillRect(columnX[index] - 52, 948, 104 * (value / 100), 2);
    });

    // Divider
    ctx.strokeStyle = 'rgba(230,199,141,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(150, 1000);
    ctx.lineTo(930, 1000);
    ctx.stroke();
    ctx.fillStyle = 'rgba(230,199,141,0.6)';
    drawSparkle(ctx, W / 2, 1000, 5);

    // Fortune
    ctx.fillStyle = 'rgba(230,199,141,0.9)';
    ctx.font = `400 14px ${sans}`;
    drawTracked(ctx, `今日运势签 · 第 ${f.id} 签`, W / 2, 1042, 4);

    ctx.fillStyle = '#f3eee4';
    ctx.font = `500 40px ${serif}`;
    drawTracked(ctx, `${f.rank} · ${f.title}`, W / 2, 1098, 6);

    ctx.fillStyle = 'rgba(243,238,228,0.82)';
    ctx.font = `400 25px ${serif}`;
    f.poem.forEach((line, index) => {
      drawTracked(ctx, line, W / 2, 1158 + index * 46, 3);
    });

    // Footer
    ctx.fillStyle = 'rgba(163,169,187,0.72)';
    ctx.font = `400 14px ${serif}`;
    drawTracked(ctx, '抬头看星，也看看自己。', W / 2, 1352, 3);
    ctx.fillStyle = 'rgba(163,169,187,0.42)';
    ctx.font = `400 11px ${sans}`;
    drawTracked(ctx, 'STARSIGN · 每日星象 · 仅供娱乐参考', W / 2, 1382, 3);

    return canvas;
  }

  async function saveCard() {
    if (!state.sign || !state.daily) return;
    if (!state.drawn) {
      toast('先抽取今日签，再保存运势卡');
      return;
    }

    toast('正在生成运势卡…');
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const canvas = buildCardCanvas();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('empty blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `星签_${state.sign.name}_${today.key}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast('运势签已保存，愿今日顺遂');
    } catch (error) {
      toast('生成失败，请稍后再试');
    }
  }

  /* ---------------------------------------------------------------------
   * Date + header
   * ------------------------------------------------------------------- */

  function updateDateUI() {
    const headerDate = $('#headerDate');
    const todayDate = $('#todayDate');
    const themeTag = $('#themeTag');
    const copyright = $('#copyright');
    if (headerDate) headerDate.textContent = today.display;
    if (todayDate) todayDate.textContent = today.display;
    if (themeTag) themeTag.textContent = dayTheme.title;
    if (copyright) copyright.textContent = `© ${today.y} 星签`;
    if (!state.sign) setWheelCenter(null);
  }

  function initHeader() {
    const header = $('#siteHeader');
    const onScroll = () => {
      if (!header) return;
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const drawBtn = $('#drawBtn');
    if (drawBtn) drawBtn.addEventListener('click', drawFortune);

    const cta = $('#headerCta');
    if (cta) cta.addEventListener('click', goToFortune);

    const heroDraw = $('#heroDraw');
    if (heroDraw) heroDraw.addEventListener('click', goToFortune);
  }

  function initReveal() {
    const elements = $$('.section-head, .about-card, .disclaimer');
    if (!elements.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.setAttribute('data-reveal', ''));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach((el) => {
      el.setAttribute('data-reveal', '');
      observer.observe(el);
    });
  }

  function initMidnightWatch() {
    window.setInterval(() => {
      const next = readToday();
      if (next.key === today.key) return;
      today = next;
      dayTheme = themes[hashInt(today.key) % themes.length];
      updateDateUI();

      if (state.sign) {
        state.daily = computeDaily(state.sign);
        state.drawn = false;
        refreshWheelSelection();
        renderResult();
        renderFortuneIdle();
        toast('新的一天，今日星象已更新');
      } else {
        renderEmpty();
        toast('新的一天，今日星象已更新');
      }
    }, 60000);
  }

  /* ---------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------- */

  function init() {
    updateDateUI();
    renderWheel();
    renderEmpty();
    renderFortuneIdle();
    initHeader();
    initReveal();
    initStarfield();
    initMidnightWatch();

    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('sign');
    let saved = '';
    try {
      saved = window.localStorage.getItem('starsign.sign.v1') || '';
    } catch (error) {
      saved = '';
    }
    const initial = signs.some((s) => s.id === fromUrl) ? fromUrl : (signs.some((s) => s.id === saved) ? saved : null);

    if (initial) {
      chooseSign(initial, { scroll: false, draw: params.get('draw') === '1' });
    }

    if (params.get('draw') === '1' && !initial) {
      toast('请先选择你的星座');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
