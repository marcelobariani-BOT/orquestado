'use client';

import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import Button from '@/components/ui/Button';
import PlasmaBall from '@/components/ui/PlasmaBall';

function WordsPullUp({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(' ');
  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: 40, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
          style={{ marginRight: i < words.length - 1 ? '0.22em' : 0 }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

/* Replica clamp(56px, 12vw, 200px) × proporciones de la "O" */
function calcPlasmaSize(vw: number): number {
  const fontSize = Math.min(Math.max(vw * 0.12, 56), 200);
  return Math.round(fontSize * 0.88 * 1.05);
}

/* ── HeroO — la "O" inicial con esfera de plasma adentro ────────── */
function HeroO() {
  const [plasmaSize, setPlasmaSize] = useState(() =>
    typeof window !== 'undefined' ? calcPlasmaSize(window.innerWidth) : 160
  );

  useEffect(() => {
    const onResize = () => setPlasmaSize(calcPlasmaSize(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <span className="inline-block relative" style={{ lineHeight: 'inherit' }}>
      {/* La "O" — transparente con solo el contorno visible */}
      <span
        style={{
          color: 'transparent',
          WebkitTextStroke: '2px rgba(240,239,234,0.6)',
          position: 'relative',
          zIndex: 1,
          display: 'inline-block',
        }}
      >
        O
      </span>

      {/* Plasma centrado sobre la "O" — sin overflow:hidden para que el glow respire */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: plasmaSize,
          height: plasmaSize,
          display: 'block',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <PlasmaBall size={plasmaSize} />
      </span>
    </span>
  );
}

export default function HeroSection() {
  const t = useTranslations('hero');
  const headline = t('headline');
  const rest = headline.slice(1);

  return (
    <section className="h-screen w-full">
      <div className="relative h-full w-full overflow-hidden">
        <video
          autoPlay loop muted playsInline preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/hero-bg.mp4"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75" />

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-3 md:px-10">
          <div className="grid grid-cols-12 items-end gap-4">
            <div className="col-span-12 lg:col-span-8">
              <h1
                className="font-medium leading-[0.88] tracking-[-0.05em] whitespace-nowrap"
                style={{ color: '#F0EFEA', fontSize: 'clamp(56px, 12vw, 200px)' }}
              >
                <HeroO />
                <WordsPullUp text={rest} className="inline-flex" />
              </h1>
            </div>

            <div className="col-span-12 lg:col-span-4 pb-5 lg:pb-8 flex flex-col gap-4">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-2xl md:text-3xl font-semibold leading-tight"
                style={{ color: '#F0EFEA' }}
              >
                {t('heroTagline')}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm md:text-base leading-relaxed"
                style={{
                  color: 'rgba(240, 239, 234, 0.82)',
                  textShadow: '0 1px 8px rgba(0,0,0,0.7), 0 0px 20px rgba(0,0,0,0.5)',
                }}
              >
                {t('subheadline')}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-3"
              >
                <Button variant="primary" size="lg">
                  {t('ctaPrimary')}
                  <ArrowIcon />
                </Button>
                <Button variant="secondary" size="lg">
                  {t('ctaSecondary')}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
