'use client';

// Fuente carousel: https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/three-d-carousel.tsx
// Fuente frame: https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/texture-card.tsx
// Adaptados para servicios de Orquesta (dark mode, service data, sin imágenes externas)

import { memo, useEffect, useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';

// ── useMediaQuery (de cult-ui three-d-carousel) ────────────────
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

// ── Tipos y datos de Orquesta ──────────────────────────────────
type ServiceKey = 'mostrador' | 'bots' | 'llamadas' | 'recepcion' | 'turnos';

const SERVICE_KEYS: ServiceKey[] = ['mostrador', 'bots', 'llamadas', 'recepcion', 'turnos'];

const SERVICE_COLORS: Record<ServiceKey, string> = {
  mostrador: 'rgba(30, 210, 255, 1)',   // oklch(72% 0.16 200)
  bots:      'rgba(130, 90, 255, 1)',    // oklch(70% 0.15 280)
  llamadas:  'rgba(60, 220, 130, 1)',    // oklch(75% 0.17 145)
  recepcion: 'rgba(255, 130, 60, 1)',    // oklch(73% 0.16 25)
  turnos:    'rgba(220, 60, 220, 1)',    // oklch(74% 0.15 320)
};

// ── TextureCard (de cult-ui) — adaptado dark mode ──────────────
// Fuente original usa gradientes claros; aquí invertimos para dark background
function TextureFrame({
  children,
  color,
  isActive,
}: {
  children: React.ReactNode;
  color: string;
  isActive: boolean;
}) {
  const borderAlpha = color.replace('1)', '0.3)');
  const borderFaint = color.replace('1)', '0.12)');
  const bgAlpha = color.replace('1)', '0.04)');

  return (
    // Capa exterior: marco (TextureCard outer)
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        borderRadius: 16,
        padding: 7,
        background: isActive
          ? 'linear-gradient(145deg, oklch(26% 0.018 50) 0%, oklch(18% 0.013 45) 50%, oklch(24% 0.016 50) 100%)'
          : 'linear-gradient(145deg, oklch(18% 0.012 260) 0%, oklch(13% 0.009 260) 50%, oklch(16% 0.011 260) 100%)',
        boxShadow: isActive
          ? `0 24px 60px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 ${borderAlpha}`
          : `0 12px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 oklch(28% 0.012 260)`,
        transition: 'box-shadow 0.4s ease, background 0.4s ease',
      }}
    >
      {/* Capa 1 (TextureCard nested border 1) */}
      <div style={{ borderRadius: 10, border: `1px solid ${borderAlpha}`, height: '100%' }}>
        {/* Capa 2 */}
        <div style={{ borderRadius: 9, border: `1px solid ${borderFaint}`, height: '100%' }}>
          {/* Capa 3 — interior matte */}
          <div
            style={{
              borderRadius: 8,
              height: '100%',
              background: `linear-gradient(160deg, oklch(10% 0.009 260) 0%, oklch(8% 0.007 260) 100%)`,
              border: `1px solid ${bgAlpha}`,
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Tornillos de esquina — detalle TextureCard */}
      {[[3,3],[isActive?196:185,3],[3,isActive?376:285],[isActive?196:185,isActive?376:285]].map(([x,y],i) => (
        <div key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: x, top: y,
            background: isActive ? 'oklch(30% 0.015 50)' : 'oklch(22% 0.01 260)',
          }}
        />
      ))}
    </div>
  );
}

// ── Artwork SVG por servicio ───────────────────────────────────
function ServiceArtwork({ id, color }: { id: ServiceKey; color: string }) {
  const a = (o: number) => color.replace('1)', `${o})`);
  if (id === 'mostrador') return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      {[0,1,2,3].map(i => <rect key={i} x="8" y={8+i*18} width={55+i*14} height="11" rx="5.5" style={{ fill: i===0 ? color : a(0.5+i*0.1) }} />)}
      <circle cx="100" cy="40" r="16" style={{ fill: a(0.12), stroke: color, strokeWidth: 1.5 }} />
      <text x="100" y="45" textAnchor="middle" style={{ fill: color, fontSize: 16 }}>✓</text>
    </svg>
  );
  if (id === 'bots') return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect x="8" y="8" width="72" height="20" rx="10" style={{ fill: a(0.7) }} />
      <rect x="40" y="36" width="72" height="20" rx="10" style={{ fill: a(0.18), stroke: color, strokeWidth: 1 }} />
      <rect x="8" y="58" width="56" height="16" rx="8" style={{ fill: a(0.55) }} />
      <circle cx="96" cy="18" r="6" style={{ fill: color }} />
    </svg>
  );
  if (id === 'llamadas') return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      {[8,20,32,22,14,28,18].map((h,i) => <rect key={i} x={8+i*16} y={40-h} width="10" height={h*2} rx="5" style={{ fill: color, opacity: 0.3+(i%3)*0.25 }} />)}
      <line x1="6" y1="40" x2="114" y2="40" style={{ stroke: color, strokeWidth: 0.5, opacity: 0.3 }} />
    </svg>
  );
  if (id === 'recepcion') return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <circle cx="60" cy="40" r="28" style={{ fill: a(0.1), stroke: color, strokeWidth: 1.5 }} />
      <circle cx="60" cy="40" r="16" style={{ fill: 'oklch(10% 0.01 260)', stroke: color, strokeWidth: 1 }} />
      <circle cx="60" cy="40" r="5" style={{ fill: color }} />
      {[0,60,120,180,240,300].map(deg => (
        <line key={deg}
          x1={60+20*Math.cos(deg*Math.PI/180)} y1={40+20*Math.sin(deg*Math.PI/180)}
          x2={60+28*Math.cos(deg*Math.PI/180)} y2={40+28*Math.sin(deg*Math.PI/180)}
          style={{ stroke: color, strokeWidth: 1.5, opacity: 0.6 }} />
      ))}
    </svg>
  );
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      {[0,1,2,3].map(row => [0,1,2,3,4].map(col => (
        <rect key={`${row}-${col}`} x={6+col*24} y={6+row*18} width="18" height="12" rx="3"
          style={{ fill: (row+col)%3===0 ? color : a(0.25), opacity: (row+col)%3===0 ? 0.9 : 0.4 }} />
      )))}
    </svg>
  );
}

// ── Service card face (dentro del carrusel) ────────────────────
function ServiceFaceCard({
  id, color, name, number, tagline,
}: { id: ServiceKey; color: string; name: string; number: string; tagline: string }) {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Área de artwork */}
      <div className="flex-1 flex items-center justify-center p-5 pt-6">
        <div style={{ width: '100%', height: 90 }}>
          <ServiceArtwork id={id} color={color} />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px" style={{ background: color.replace('1)', '0.15)') }} />

      {/* Info */}
      <div className="p-4 pb-5">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-mono text-[10px]" style={{ color: color.replace('1)', '0.65)') }}>{number}</span>
          <h3 className="text-sm font-bold text-[var(--text-primary)] leading-tight">{name}</h3>
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)] leading-tight mt-1">{tagline}</p>
        <div className="mt-3 flex items-center gap-1">
          <span className="text-[9px] font-mono tracking-widest" style={{ color: color.replace('1)', '0.5)') }}>
            VER MÁS →
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Carousel cilíndrico (de cult-ui three-d-carousel) ─────────
const TRANSITION = { duration: 0.15, ease: [0.32, 0.72, 0, 1] as const };
const TRANSITION_OVERLAY = { duration: 0.5, ease: [0.32, 0.72, 0, 1] as const };

const Carousel = memo(({
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
}) => {
  const isSmall = useMediaQuery('(max-width: 640px)');
  const cylinderWidth = isSmall ? 1000 : 1700;
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
        onDrag={(_, info) => isCarouselActive && rotation.set(rotation.get() + info.offset.x * 0.05)}
        onDragEnd={(_, info) =>
          isCarouselActive && controls.start({
            rotateY: rotation.get() + info.velocity.x * 0.05,
            transition: { type: 'spring', stiffness: 100, damping: 30, mass: 0.1 },
          })
        }
        animate={controls}
      >
        {services.map((id, i) => {
          const color = SERVICE_COLORS[id];
          const name = t(`services.items.${id}.name`);
          const number = t(`services.items.${id}.number`);
          const tagline = t(`services.items.${id}.tagline`);

          return (
            <motion.div
              key={id}
              className="absolute flex h-full origin-center items-center justify-center p-2"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${i * (360 / faceCount)}deg) translateZ(${radius}px)`,
              }}
              onClick={() => handleClick(id)}
            >
              {/* TextureFrame envolviendo la card de servicio */}
              <motion.div
                layoutId={`service-card-${id}`}
                className="w-full cursor-pointer"
                style={{ height: isSmall ? 260 : 320 }}
                initial={{ filter: 'blur(4px)' }}
                animate={{ filter: 'blur(0px)' }}
                transition={TRANSITION}
                whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
              >
                <TextureFrame color={color} isActive={false}>
                  <ServiceFaceCard id={id} color={color} name={name} number={number} tagline={tagline} />
                </TextureFrame>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
});
Carousel.displayName = 'Carousel';

// ── Overlay expandido (service detail) ────────────────────────
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

  return (
    <motion.div
      layoutId={`service-card-${id}`}
      className="fixed z-50 overflow-hidden flex flex-col"
      style={{
        top: '50%', left: '50%',
        x: '-50%', y: '-50%',
        width: 'min(640px, 90vw)',
        maxHeight: '85vh',
        height: 'auto',
      }}
      transition={TRANSITION_OVERLAY}
    >
      <TextureFrame color={color} isActive={true}>
        <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 'calc(85vh - 36px)' }}>
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 border-b"
            style={{ borderColor: color.replace('1)', '0.12)') }}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs" style={{ color: color.replace('1)', '0.7)') }}>{number}</span>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">{name}</h2>
              </div>
              <p className="text-sm" style={{ color: color.replace('1)', '0.85)') }}>{tagline}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
              style={{ background: 'oklch(14% 0.01 260)' }}>
              ×
            </button>
          </div>

          {/* Artwork */}
          <div className="p-6 pb-0">
            <div className="rounded-lg flex items-center justify-center mb-6"
              style={{ height: 110, background: color.replace('1)', '0.06)'), border: `1px solid ${color.replace('1)', '0.15)')}` }}>
              <div style={{ width: 220, height: 85 }}>
                <ServiceArtwork id={id} color={color} />
              </div>
            </div>
          </div>

          {/* Contenido */}
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
      {/* Pared de galería */}
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
        {/* Línea del suelo */}
        <div className="absolute bottom-32 left-0 right-0 h-px bg-[oklch(20%_0.01_260)]" />
      </div>

      <div className="relative pt-20 pb-16">
        {/* Encabezado */}
        <div className="container-orquesta mb-12">
          <FadeIn direction="up">
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[var(--text-tertiary)] mb-4">
              {t('gallery.eyebrow')}
            </p>
            <h2 className="text-display-xl font-bold text-[var(--text-primary)] whitespace-pre-line leading-[1.0] tracking-tight">
              {t('gallery.heading')}
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] mt-4 font-mono tracking-wide">
              {t('gallery.subheading')}
            </p>
          </FadeIn>
        </div>

        {/* Carrusel 3D cilíndrico — altura fija para el cilindro */}
        <motion.div layout className="relative h-[380px] sm:h-[420px] w-full overflow-hidden">
          <Carousel
            handleClick={handleClick}
            controls={controls}
            services={SERVICE_KEYS}
            isCarouselActive={isCarouselActive}
            t={t}
          />
        </motion.div>

        {/* Hint de drag */}
        <FadeIn direction="up" delay={0.4} className="flex justify-center mt-8">
          <p className="text-xs text-[var(--text-tertiary)] font-mono tracking-wider flex items-center gap-2">
            <span>←</span>
            <span>arrastrá para girar</span>
            <span>→</span>
          </p>
        </FadeIn>
      </div>

      {/* Overlay de servicio expandido */}
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
