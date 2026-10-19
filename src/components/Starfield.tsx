import { useEffect, useRef } from 'react';
import { rngFor } from '../lib/random';
import { clamp, prefersReducedMotion } from '../lib/utils';

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  phase: number;
  speed: number;
  warm: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export function Starfield({ dateKey }: { dateKey: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const reduced = prefersReducedMotion();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let frame = 0;
    let running = false;
    let nextShoot = 0;
    let shooting: ShootingStar | null = null;
    let resizeTimer: number | null = null;

    const makeStars = () => {
      const random = rngFor(`sky|${dateKey}`);
      const count = clamp(Math.round((width * height) / 9000), 60, 190);
      stars = [];
      for (let index = 0; index < count; index += 1) {
        stars.push({
          x: random() * width,
          y: random() * height,
          r: random() * 1.25 + 0.25,
          alpha: random() * 0.55 + 0.14,
          phase: random() * Math.PI * 2,
          speed: 0.35 + random() * 0.8,
          warm: random() > 0.86
        });
      }
    };

    const draw = (time: number) => {
      if (!width || !height) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        const twinkle = 0.58 + 0.42 * Math.sin(time * 0.001 * star.speed + star.phase);
        const alpha = star.alpha * twinkle;
        context.beginPath();
        context.fillStyle = star.warm
          ? `rgba(230, 199, 141, ${alpha})`
          : `rgba(223, 229, 246, ${alpha})`;
        context.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        context.fill();
        if (star.r > 1.15) {
          context.fillStyle = star.warm
            ? `rgba(230, 199, 141, ${alpha * 0.25})`
            : `rgba(223, 229, 246, ${alpha * 0.22})`;
          context.beginPath();
          context.arc(star.x, star.y, star.r * 3.2, 0, Math.PI * 2);
          context.fill();
        }
      });

      if (!reduced) {
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
            const gradient = context.createLinearGradient(tailX, tailY, shooting.x, shooting.y);
            gradient.addColorStop(0, 'rgba(230, 199, 141, 0)');
            gradient.addColorStop(1, `rgba(244, 223, 180, ${0.55 * fade})`);
            context.strokeStyle = gradient;
            context.lineWidth = 1.2;
            context.beginPath();
            context.moveTo(tailX, tailY);
            context.lineTo(shooting.x, shooting.y);
            context.stroke();
          }
        }
      }

      if (running) frame = window.requestAnimationFrame(draw);
    };

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      frame = window.requestAnimationFrame(draw);
    };

    const resize = () => {
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
    };

    const onResize = () => {
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 160);
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    resize();
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);
    start();

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
    };
  }, [dateKey]);

  return <canvas id="starfield" ref={canvasRef} aria-hidden="true" />;
}
