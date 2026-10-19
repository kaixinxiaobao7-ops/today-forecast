import { useEffect, useMemo, useRef, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { FortuneSection } from './components/FortuneSection';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HoroscopeSection } from './components/HoroscopeSection';
import { Starfield } from './components/Starfield';
import { Toast } from './components/Toast';
import { SIGNS, THEMES } from './data';
import { useHeaderScroll } from './hooks/useHeaderScroll';
import { useToast } from './hooks/useToast';
import { computeDaily } from './lib/daily';
import { readToday } from './lib/date';
import { hashInt } from './lib/random';
import { buildShareText, downloadShareCard } from './lib/share';
import { copyText, prefersReducedMotion } from './lib/utils';
import type { SignId, TodayInfo } from './types';

const STORAGE_KEY = 'starsign.sign.v1';

function isValidSignId(value: string | null): value is SignId {
  return Boolean(value && SIGNS.some((sign) => sign.id === value));
}

function getInitialSignId(): SignId | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('sign');
    if (isValidSignId(fromUrl)) return fromUrl;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isValidSignId(saved)) return saved;
  } catch {
    /* localStorage / URL may be unavailable */
  }
  return null;
}

export default function App() {
  const [today, setToday] = useState<TodayInfo>(readToday);
  const [signId, setSignId] = useState<SignId | null>(getInitialSignId);
  const [drawn, setDrawn] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [tubePulse, setTubePulse] = useState(false);
  const [wheelHint, setWheelHint] = useState(false);
  const [hoveredSign, setHoveredSign] = useState<SignId | null>(null);
  const scrolled = useHeaderScroll();
  const { message, visible, toast } = useToast();

  const theme = useMemo(() => THEMES[hashInt(today.key) % THEMES.length], [today.key]);
  const sign = useMemo(() => SIGNS.find((item) => item.id === signId) ?? null, [signId]);
  const daily = useMemo(
    () => (sign ? computeDaily(sign, today.key, theme) : null),
    [sign, today.key, theme]
  );

  const drawTimer = useRef<number | null>(null);
  const pulseTimer = useRef<number | null>(null);
  const hintTimer = useRef<number | null>(null);
  const scrollTimer = useRef<number | null>(null);
  const drawRef = useRef<(withHaptic?: boolean) => void>(() => undefined);
  const previousDate = useRef(today.key);

  useEffect(
    () => () => {
      [drawTimer, pulseTimer, hintTimer, scrollTimer].forEach((timer) => {
        if (timer.current !== null) window.clearTimeout(timer.current);
      });
    },
    []
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setToday((previous) => {
        const next = readToday();
        return previous.key === next.key ? previous : next;
      });
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (previousDate.current === today.key) return;
    previousDate.current = today.key;
    if (drawTimer.current !== null) window.clearTimeout(drawTimer.current);
    setDrawn(false);
    setDrawing(false);
    toast('新的一天，今日星象已更新');
  }, [today.key, toast]);

  const scrollToWheel = () => {
    document.getElementById('wheel')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'center'
    });
    setWheelHint(false);
    window.requestAnimationFrame(() => setWheelHint(true));
    if (hintTimer.current !== null) window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setWheelHint(false), 1600);
  };

  const pulseTube = () => {
    setTubePulse(false);
    window.requestAnimationFrame(() => setTubePulse(true));
    if (pulseTimer.current !== null) window.clearTimeout(pulseTimer.current);
    pulseTimer.current = window.setTimeout(() => setTubePulse(false), 1600);
  };

  const goToFortune = () => {
    if (!sign) {
      toast('先选一个星座，再抽取今日运势签');
      scrollToWheel();
      return;
    }
    document.getElementById('fortune')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start'
    });
    if (scrollTimer.current !== null) window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(
      () => {
        pulseTube();
        toast('轻点签筒，摇出今天的签');
      },
      prefersReducedMotion() ? 0 : 550
    );
  };

  const chooseSign = (id: SignId) => {
    if (drawTimer.current !== null) window.clearTimeout(drawTimer.current);
    setSignId(id);
    setDrawn(false);
    setDrawing(false);
    setHoveredSign(null);

    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* localStorage may be unavailable */
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('sign', id);
      url.searchParams.delete('draw');
      window.history.replaceState(null, '', url);
    } catch {
      /* ignore */
    }

    window.requestAnimationFrame(() => {
      document.getElementById('horoscope')?.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  };

  const drawFortune = (withHaptic = false) => {
    if (!sign) {
      toast('先选一个星座，再抽取今日运势签');
      scrollToWheel();
      return;
    }
    if (drawing) return;

    setDrawn(false);
    setDrawing(true);
    if (drawTimer.current !== null) window.clearTimeout(drawTimer.current);

    if (withHaptic && !prefersReducedMotion() && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([25, 40, 25]);
      } catch {
        /* ignore */
      }
    }

    drawTimer.current = window.setTimeout(
      () => {
        setDrawing(false);
        setDrawn(true);
        drawTimer.current = null;
      },
      prefersReducedMotion() ? 120 : 980
    );
  };

  useEffect(() => {
    drawRef.current = drawFortune;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('draw') !== '1' || !signId) return;

    const first = window.setTimeout(() => {
      document.getElementById('fortune')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 250);
    const second = window.setTimeout(() => drawRef.current(), 850);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [signId]);

  useEffect(() => {
    if (!drawn) return;
    const timer = window.setTimeout(() => {
      const stage = document.getElementById('slipStage');
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (rect.top < 70 || rect.bottom > window.innerHeight + 40) {
        stage.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'center'
        });
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [drawn]);

  const getShareUrl = (): string => {
    if (!sign || !/^https?:$/.test(window.location.protocol)) return '';
    const url = new URL(window.location.href);
    url.searchParams.set('sign', sign.id);
    url.hash = '';
    return url.toString();
  };

  const copyToday = async () => {
    if (!sign || !daily) return;
    const ok = await copyText(
      buildShareText({ sign, daily, today, drawn: false, url: getShareUrl() })
    );
    toast(ok ? '今日运势已复制' : '复制失败，请手动选择文本');
  };

  const copyFortune = async () => {
    if (!sign || !daily) return;
    const ok = await copyText(
      buildShareText({ sign, daily, today, drawn: true, url: getShareUrl() })
    );
    toast(ok ? '签文已复制' : '复制失败，请手动选择文本');
  };

  const saveCard = async () => {
    if (!sign || !daily) return;
    if (!drawn) {
      toast('先抽取今日签，再保存运势卡');
      return;
    }
    toast('正在生成运势卡…');
    try {
      await downloadShareCard(sign, daily, today);
      toast('运势签已保存，愿今日顺遂');
    } catch {
      toast('生成失败，请稍后再试');
    }
  };

  const shareFortune = async () => {
    if (!sign || !daily) return;
    const text = buildShareText({ sign, daily, today, drawn: true, url: getShareUrl() });

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `星签 · ${sign.name}今日运势`,
          text,
          url: getShareUrl()
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    const ok = await copyText(text);
    toast(ok ? '签文已复制，可粘贴分享' : '复制失败，请手动选择文本');
  };

  return (
    <>
      <Starfield dateKey={today.key} />
      <div className="grain" aria-hidden="true" />
      <a className="skip-link" href="#main">跳到主要内容</a>

      <Header today={today} scrolled={scrolled} onCta={goToFortune} />

      <main id="main">
        <Hero
          today={today}
          theme={theme}
          selected={signId}
          hovered={hoveredSign}
          wheelHint={wheelHint}
          onSelect={chooseSign}
          onHover={setHoveredSign}
          onDraw={goToFortune}
        />
        <HoroscopeSection
          sign={sign}
          daily={daily}
          today={today}
          theme={theme}
          onSelect={chooseSign}
          onWheel={scrollToWheel}
          onDraw={goToFortune}
          onCopy={copyToday}
        />
        <FortuneSection
          sign={sign}
          daily={daily}
          today={today}
          drawn={drawn}
          drawing={drawing}
          pulse={tubePulse}
          onDraw={() => drawFortune(true)}
          onSave={saveCard}
          onCopy={copyFortune}
          onShare={shareFortune}
        />
        <AboutSection />
      </main>

      <Footer year={today.y} />
      <Toast message={message} visible={visible} />
    </>
  );
}
