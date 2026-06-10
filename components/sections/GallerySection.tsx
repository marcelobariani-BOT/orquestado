'use client';

// Fuente carousel: https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/three-d-carousel.tsx
// Fuente frame: https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/texture-card.tsx
// Adaptados para servicios de Orquesta (dark mode, service data, sin imágenes externas)

import { memo, useEffect, useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';

// ── useMediaQuery ────────────────────────────────────────────
const IS_SERVER = typeof window === 'undefined';
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function useMediaQuery(query: string, { defaultValue = false, initializeWithValue = true } = {}): boolean {
  const getMatches = (q: string) => IS_SERVER ? defaultValue : window.matchMedia(q).matches;
  const [matches, setMatches] = useState(() => initializeWithValue ? getMatches(query) : defaultValue);
  useIsomorphicLayoutEffect(() => {
    const mm = window.matchMedia(query);
    setMatches(mm.matches);
    const handler = () => setMatches(mm.matches);
    mm.addEventListener('change', handler);
    return () => mm.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

// ── Tipos y datos ──────────────────────────────────────────────
type ServiceKey = 'mostrador' | 'bots' | 'llamadas' | 'recepcion' | 'turnos' | 'sitios';

const SERVICE_KEYS: ServiceKey[] = ['mostrador', 'bots', 'llamadas', 'recepcion', 'turnos', 'sitios'];

const SERVICE_COLORS: Record<ServiceKey, string> = {
  mostrador: 'rgba(30, 210, 255, 1)',
  bots:      'rgba(130, 90, 255, 1)',
  llamadas:  'rgba(60, 220, 130, 1)',
  recepcion: 'rgba(255, 130, 60, 1)',
  turnos:    'rgba(220, 60, 220, 1)',
  sitios:    'rgba(235, 175, 40, 1)',
};

// ── TextureFrame — glassmorphism + spin border + border beam ─────
const SPIN_DURATION: Record<'slow' | 'fast', string> = {
  slow: '4s',
  fast: '1.5s',
};

function TextureFrame({
  children,
  color,
  isActive,
  animationSpeed = 'slow',
}: {
  children: React.ReactNode;
  color: string;
  isActive: boolean;
  animationSpeed?: 'slow' | 'fast';
}) {
  const c = (a: number) => color.replace('1)', `${a})`);
  const spinDur = SPIN_DURATION[animationSpeed];
  const beamDur = isActive ? '2s' : '3s';

  return (
    <div
      className="relative w-full h-full"
      style={{ borderRadius: 16, overflow: 'hidden' }}
    >
      {/* Keyframes — off-JS-thread */}
      <style>{`
        @keyframes spin-border {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes beam-run {
          from { offset-distance: 0%; }
          to   { offset-distance: 100%; }
        }
      `}</style>

      {/* ① Conic-gradient giratorio (spin existente) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '150%',
          height: '150%',
          animation: `spin-border ${spinDur} linear infinite`,
          background: `conic-gradient(from 0deg, transparent 0%, transparent 60%, ${c(0.9)} 80%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* ② Borde base estático — tenue, siempre visible, encima del spin */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 16,
          border: `2px solid ${c(0.5)}`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ③ Border beam — viaja por el perímetro con offset-path */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          width: 90,
          height: 3,
          borderRadius: 9999,
          background: `linear-gradient(90deg, transparent 0%, ${color} 40%, ${c(0.8)} 60%, transparent 100%)`,
          offsetPath: 'inset(1px round 15px)',
          animation: `beam-run ${beamDur} linear infinite`,
          pointerEvents: 'none',
          zIndex: 3,
          filter: `drop-shadow(0 0 5px ${color})`,
        } as React.CSSProperties}
      />

      {/* ④ Superficie interior: contenido de la card, encima de todo */}
      <div
        className="absolute inset-[1px] overflow-hidden"
        style={{
          borderRadius: 15,
          background: isActive
            ? 'oklch(16% 0.016 260 / 0.95)'
            : 'oklch(14% 0.014 260 / 0.92)',
          boxShadow: isActive
            ? `0 0 60px ${c(0.25)}, 0 20px 60px rgba(0,0,0,0.6)`
            : `0 0 30px ${c(0.12)}, 0 20px 60px rgba(0,0,0,0.5)`,
          transition: 'box-shadow 0.4s ease, background 0.4s ease',
          zIndex: 4,
        }}
      >
        {children}

        {/* Highlight de vidrio */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: '40%',
            borderRadius: '15px 15px 0 0',
            background: `linear-gradient(180deg, ${c(0.06)} 0%, transparent 100%)`,
          }}
        />
      </div>
    </div>
  );
}

// ── Artwork SVG por servicio ───────────────────────────────────
function ServiceArtwork({ id, color }: { id: ServiceKey; color: string }) {
  const a = (o: number) => color.replace('1)', `${Math.min(1, o)})`);
  if (id === 'mostrador') return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      {[0,1,2,3].map(i => <rect key={i} x="8" y={8+i*18} width={55+i*14} height="11" rx="5.5" style={{ fill: i===0 ? color : a(1.0) }} />)}
      <circle cx="100" cy="40" r="16" style={{ fill: a(0.24), stroke: color, strokeWidth: 1.5 }} />
      <text x="100" y="45" textAnchor="middle" style={{ fill: color, fontSize: 16, fontFamily: 'sans-serif' }}>✓</text>
    </svg>
  );
  if (id === 'bots') return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect x="8" y="8" width="72" height="20" rx="10" style={{ fill: color }} />
      <rect x="40" y="36" width="72" height="20" rx="10" style={{ fill: a(0.36), stroke: color, strokeWidth: 1 }} />
      <rect x="8" y="58" width="56" height="16" rx="8" style={{ fill: color }} />
      <circle cx="96" cy="18" r="6" style={{ fill: color }} />
    </svg>
  );
  if (id === 'llamadas') return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      {[8,20,32,22,14,28,18].map((h,i) => <rect key={i} x={8+i*16} y={40-h} width="10" height={h*2} rx="5" style={{ fill: color, opacity: Math.min(1, 0.6+(i%3)*0.5) }} />)}
      <line x1="6" y1="40" x2="114" y2="40" style={{ stroke: color, strokeWidth: 0.5, opacity: 0.6 }} />
    </svg>
  );
  if (id === 'recepcion') return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <circle cx="60" cy="40" r="28" style={{ fill: a(0.2), stroke: color, strokeWidth: 1.5 }} />
      <circle cx="60" cy="40" r="16" style={{ fill: 'oklch(10% 0.01 260)', stroke: color, strokeWidth: 1 }} />
      <circle cx="60" cy="40" r="5" style={{ fill: color }} />
      {[0,60,120,180,240,300].map(deg => (
        <line key={deg}
          x1={60+20*Math.cos(deg*Math.PI/180)} y1={40+20*Math.sin(deg*Math.PI/180)}
          x2={60+28*Math.cos(deg*Math.PI/180)} y2={40+28*Math.sin(deg*Math.PI/180)}
          style={{ stroke: color, strokeWidth: 1.5, opacity: 1 }} />
      ))}
    </svg>
  );
  if (id === 'sitios') return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect x="6" y="6" width="108" height="68" rx="7" style={{ fill: a(0.16), stroke: color, strokeWidth: 1.5 }} />
      <rect x="6" y="6" width="108" height="18" rx="7" style={{ fill: a(0.44) }} />
      <rect x="6" y="18" width="108" height="6" style={{ fill: a(0.24) }} />
      <circle cx="20" cy="15" r="3.5" style={{ fill: 'rgba(255,95,87,0.9)' }} />
      <circle cx="31" cy="15" r="3.5" style={{ fill: 'rgba(255,189,46,0.9)' }} />
      <circle cx="42" cy="15" r="3.5" style={{ fill: 'rgba(40,200,64,0.9)' }} />
      <rect x="55" y="10" width="48" height="10" rx="5" style={{ fill: a(0.36), stroke: color, strokeWidth: 0.8 }} />
      <rect x="14" y="32" width="60" height="8" rx="4" style={{ fill: color, opacity: 1 }} />
      <rect x="14" y="44" width="45" height="6" rx="3" style={{ fill: color, opacity: 1 }} />
      <rect x="14" y="55" width="28" height="12" rx="6" style={{ fill: color, opacity: 1 }} />
      <rect x="82" y="30" width="26" height="36" rx="4" style={{ fill: a(0.4), stroke: color, strokeWidth: 1 }} />
    </svg>
  );
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      {[0,1,2,3].map(row => [0,1,2,3,4].map(col => (
        <rect key={`${row}-${col}`} x={6+col*24} y={6+row*18} width="18" height="12" rx="3"
          style={{ fill: (row+col)%3===0 ? color : a(0.5), opacity: (row+col)%3===0 ? 1 : 0.8 }} />
      )))}
    </svg>
  );
}

// ── Service card face ──────────────────────────────────────────
function ServiceFaceCard({
  id, color, name, number, tagline,
}: { id: ServiceKey; color: string; name: string; number: string; tagline: string }) {
  const c = (a: number) => color.replace('1)', `${a})`);
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-5 pt-6">
        <div style={{ width: '100%', height: 90 }}>
          <ServiceArtwork id={id} color={color} />
        </div>
      </div>
      <div className="mx-4 h-px" style={{ background: c(0.2) }} />
      <div className="p-4 pb-5">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-mono text-[10px]" style={{ color: c(0.65) }}>{number}</span>
          <h3 className="text-sm font-bold text-[var(--text-primary)] leading-tight">{name}</h3>
        </div>
        <p className="text-[10px] leading-snug mt-1" style={{ color: c(0.7) }}>{tagline}</p>
        <div className="mt-3 flex items-center gap-1">
          <span className="text-[9px] font-mono tracking-widest" style={{ color: c(0.55) }}>
            VER MÁS →
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Carousel cilíndrico ────────────────────────────────────────
const TRANSITION = { duration: 0.15, ease: [0.32, 0.72, 0, 1] as const };
const TRANSITION_OVERLAY = { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const };

const Carousel = memo((
  {
    handleClick,
    controls,
    services,
    isCarouselActive,
    t,
  }: {
    handleClick: (id: ServiceKey) => void;
    controls: ReturnType<typeof useAnimation>;
    services: ServiceKey[];
    isCarouselActive: boolean;
    t: ReturnType<typeof useTranslations>;
  }
) => {
  const isSmall = useMediaQuery('(max-width: 640px)');
  const cylinderWidth = isSmall ? 1100 : 1900;
  const faceCount = services.length;
  const faceWidth = cylinderWidth / faceCount;
  const radius = cylinderWidth / (2 * Math.PI);
  const rotation = useMotionValue(0);
  const transform = useTransform(rotation, (v) => `rotate3d(0, 1, 0, ${v}deg)`);

  return (
    <div
      className="flex h-full items-center justify-center"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      <motion.div
        drag={isCarouselActive ? 'x' : false}
        className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
        style={{ transform, rotateY: rotation, width: cylinderWidth, transformStyle: 'preserve-3d' }}
        onDrag={(_, info) =>
          isCarouselActive && rotation.set(rotation.get() + info.delta.x * 0.3)
        }
        onDragEnd={(_, info) => {
          if (isCarouselActive) {
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.015,
              transition: { type: 'spring', stiffness: 100, damping: 30, mass: 0.1 },
            });
          }
        }}
        animate={controls}
      >
        {services.map((id, i) => {
          const color = SERVICE_COLORS[id];
          const name = t(`services.items.${id}.name`);
          const number = t(`services.items.${id}.number`);
          const tagline = t(`services.items.${id}.tagline`);

          return (
            <div
              key={id}
              className="absolute flex h-full origin-center items-center justify-center p-2"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)`,
              }}
            >
              <motion.div
                className="w-full cursor-pointer"
                style={{ height: isSmall ? 260 : 320 }}
                initial={{ filter: 'blur(4px)' }}
                animate={{ filter: 'blur(0px)' }}
                transition={TRANSITION}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                onTap={(e) => { e.stopPropagation(); handleClick(id); }}
              >
                <TextureFrame color={color} isActive={false}>
                  <ServiceFaceCard id={id} color={color} name={name} number={number} tagline={tagline} />
                </TextureFrame>
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
});
Carousel.displayName = 'Carousel';

// ── Overlay expandido ──────────────────────────────────────────
function ServiceOverlay({
  id, onClose, t,
}: { id: ServiceKey; onClose: () => void; t: ReturnType<typeof useTranslations> }) {
  const color = SERVICE_COLORS[id];
  const name = t(`services.items.${id}.name`);
  const number = t(`services.items.${id}.number`);
  const tagline = t(`services.items.${id}.tagline`);
  const desc = t(`services.items.${id}.description`);
  const features = t.raw(`services.items.${id}.features`) as string[];
  const cta = t(`services.items.${id}.cta`);
  const c = (a: number) => color.replace('1)', `${a})`);

  return (
    <motion.div
      className="fixed z-50 overflow-hidden flex flex-col"
      style={{
        top: '50%', left: '50%',
        x: '-50%', y: '-50%',
        width: 'min(640px, 90vw)',
        maxHeight: '85vh',
        minHeight: '500px',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={TRANSITION_OVERLAY}
    >
      <TextureFrame color={color} isActive={true}>
        <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 'calc(85vh - 36px)' }}>
          <div className="flex items-start justify-between p-6 pb-4 border-b"
            style={{ borderColor: c(0.15) }}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs" style={{ color: c(0.7) }}>{number}</span>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{name}</h2>
              </div>
              <p className="text-sm font-medium" style={{ color }}>{tagline}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0 cursor-pointer"
              style={{ background: 'oklch(14% 0.01 260)' }}>
              ×
            </button>
          </div>

          <div className="p-6 pb-0">
            <div className="rounded-lg flex items-center justify-center mb-6"
              style={{ height: 110, background: c(0.07), border: `1px solid ${c(0.2)}` }}>
              <div style={{ width: 220, height: 85 }}>
                <ServiceArtwork id={id} color={color} />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">{desc}</p>
            <ul className="flex flex-col gap-3 mb-8">
              {features.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="primary" size="md"
              style={{ '--accent-cyan': color } as React.CSSProperties}>
              {cta}
            </Button>
          </div>
        </div>
      </TextureFrame>
    </motion.div>
  );
}

// ── GallerySection principal ───────────────────────────────────
export default function GallerySection() {
  const t = useTranslations();
  const [activeId, setActiveId] = useState<ServiceKey | null>(null);
  const [isCarouselActive, setIsCarouselActive] = useState(true);
  const controls = useAnimation();

  const handleClick = (id: ServiceKey) => {
    setActiveId(id);
    setIsCarouselActive(false);
    controls.stop();
  };

  const handleClose = () => {
    setActiveId(null);
    setIsCarouselActive(true);
  };

  return (
    <section className="relative overflow-hidden" id="services">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, oklch(14% 0.014 45) 0%, oklch(9.5% 0.01 50) 20%, oklch(7.5% 0.008 260) 55%, oklch(5.5% 0.006 260) 100%)',
        }} />
        <div className="absolute inset-0 opacity-[0.018]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(90deg, oklch(5% 0.005 260 / 0.7) 0%, transparent 12%, transparent 88%, oklch(5% 0.005 260 / 0.7) 100%)',
        }} />
        <div className="absolute bottom-32 left-0 right-0 h-px bg-[oklch(20%_0.01_260)]" />
      </div>

      <div className="relative pt-20 pb-16">
        <div className="container-orquesta mb-14">
          <FadeIn direction="up">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8" style={{ background: 'oklch(78% 0.18 55)' }} />
              <p className="text-[11px] font-bold tracking-[0.28em] uppercase"
                style={{ color: 'oklch(78% 0.18 55)' }}>
                {t('gallery.eyebrow')}
              </p>
            </div>
            <h2 className="text-display-xl font-bold leading-[0.97] tracking-tight whitespace-pre-line mb-5"
              style={{
                color: 'oklch(96% 0.008 260)',
                textShadow: '0 2px 40px oklch(74% 0.17 200 / 0.15)',
              }}>
              {t('gallery.heading')}
            </h2>
            <p className="text-sm font-mono tracking-wide"
              style={{ color: 'oklch(72% 0.01 260)' }}>
              {t('gallery.subheading')}
            </p>
          </FadeIn>
        </div>

        <motion.div layout className="relative h-[380px] sm:h-[430px] w-full overflow-hidden">
          <Carousel
            handleClick={handleClick}
            controls={controls}
            services={SERVICE_KEYS}
            isCarouselActive={isCarouselActive}
            t={t}
          />
        </motion.div>

        <FadeIn direction="up" delay={0.4} className="flex justify-center mt-8">
          <p className="text-xs font-mono tracking-wider flex items-center gap-2"
            style={{ color: 'oklch(55% 0.01 260)' }}>
            <span>←</span>
            <span>arrastrá para girar</span>
            <span>→</span>
          </p>
        </FadeIn>
      </div>

      <AnimatePresence mode="sync">
        {activeId && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-40 cursor-pointer"
              style={{ background: 'oklch(4% 0.005 260 / 0.9)' }}
              onClick={handleClose}
            />
            <ServiceOverlay key={activeId} id={activeId} onClose={handleClose} t={t} />
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
