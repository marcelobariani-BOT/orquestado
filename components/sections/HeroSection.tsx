'use client';

import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';
import Button from '@/components/ui/Button';
import PlasmaBall from '@/components/ui/PlasmaBall';

/* ── WordsPullUp — animación de entrada por palabra ────────────── */
function WordsPullUp({ text, className = '', baseDelay = 0 }: {
  text: string; className?: string; baseDelay?: number;
}) {
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
          transition={{ duration: 0.7, delay: baseDelay + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
          style={{ marginRight: i < words.length - 1 ? '0.22em' : 0 }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

/* ── HeroO — la "O" inicial con esfera de plasma adentro ────────── */
function HeroO({ isInView }: { isInView: boolean }) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [plasmaSize, setPlasmaSize] = useState(0);

  /* Medir la "O" después de que el layout se estabilice */
  useEffect(() => {
    if (!spanRef.current) return;
    const measure = () => {
      const rect = spanRef.current!.getBoundingClientRect();
      /* El plasma debe ser levemente más grande que el alto del carácter */
      setPlasmaSize(Math.round(rect.height * 1.15));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <motion.span
      initial={{ y: 40, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.7, delay: 0, ease: [0.16, 1, 0.3, 1] }}
      className="inline-block relative"
      style={{ lineHeight: 'inherit' }}
    >
      {/* La "O" — transparente con solo el contorno visible */}
      <span
        ref={spanRef}
        style={{
          color: 'transparent',
          WebkitTextStroke: '1px rgba(240,239,234,0.45)',
          position: 'relative',
          zIndex: 1,
          display: 'inline-block',
        }}
      >
        O
      </span>

      {/* Plasma dentro de la "O": se posiciona en el centro del span */}
      {plasmaSize > 0 && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            /* Centrar verticalmente — line-height del h1 es 0.88 */
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width:  plasmaSize,
            height: plasmaSize,
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'block',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <PlasmaBall size={plasmaSize} />
        </span>
      )}
    </motion.span>
  );
}

/* ── HeroSection ─────────────────────────────────────────────────── */
export default function HeroSection() {
  const t = useTranslations('hero');

  /* Ref compartido para activar la entrada de la "O" y "rquestado" */
  const headlineRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headlineRef, { once: true });

  return (
    <section className="h-screen w-full">
      <div className="relative h-full w-full overflow-hidden">

        {/* Video de fondo */}
        <video
          autoPlay loop muted playsInline preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/hero-bg.mp4"
        />

        {/* Overlay ruido */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.55] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/75" />

        {/* Contenido pegado abajo */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-3 md:px-10">
          <div className="grid grid-cols-12 items-end gap-4">

            {/* Columna izquierda: título enorme */}
            <div className="col-span-12 lg:col-span-8">
              <h1
                className="font-medium leading-[0.88] tracking-[-0.05em] whitespace-nowrap"
                style={{ color: '#F0EFEA', fontSize: 'clamp(56px, 12vw, 200px)' }}
              >
                {/* Ref en el contenedor para detectar entrada */}
                <div ref={headlineRef} className="inline-flex items-baseline">
                  {/* "O" — plasma */}
                  <HeroO isInView={isInView} />
                  {/* "rquestado" — pullup con delay mínimo */}
                  <motion.span
                    initial={{ y: 40, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block"
                  >
                    rquestado
                  </motion.span>
                </div>
              </h1>
            </div>

            {/* Columna derecha */}
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
