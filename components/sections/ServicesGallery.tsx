'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';

type ServiceKey = 'mostrador' | 'bots' | 'llamadas' | 'recepcion' | 'turnos';

const SERVICE_KEYS: ServiceKey[] = ['mostrador', 'bots', 'llamadas', 'recepcion', 'turnos'];

const SERVICE_COLORS: Record<ServiceKey, string> = {
  mostrador: 'var(--service-mostrador)',
  bots: 'var(--service-bots)',
  llamadas: 'var(--service-llamadas)',
  recepcion: 'var(--service-recepcion)',
  turnos: 'var(--service-turnos)',
};

const SERVICE_ICONS: Record<ServiceKey, string> = {
  mostrador: '📦',
  bots: '🤖',
  llamadas: '📞',
  recepcion: '🔀',
  turnos: '📅',
};

// Patrones visuales por servicio (decoración de la card)
const SERVICE_PATTERNS: Record<ServiceKey, React.FC<{ color: string }>> = {
  mostrador: ({ color }) => (
    <svg className="w-full h-full opacity-20" viewBox="0 0 200 200">
      {[0, 40, 80, 120, 160].map((y, i) => (
        <rect key={i} x="20" y={y + 10} width={60 + i * 12} height="24" rx="6" fill={color} />
      ))}
    </svg>
  ),
  bots: ({ color }) => (
    <svg className="w-full h-full opacity-20" viewBox="0 0 200 200">
      {[20, 70, 120, 160].map((y, i) => (
        <g key={i}>
          <rect x={i % 2 === 0 ? '20' : '80'} y={y} width="100" height="28" rx="14" fill={color} />
        </g>
      ))}
    </svg>
  ),
  llamadas: ({ color }) => (
    <svg className="w-full h-full opacity-20" viewBox="0 0 200 200">
      {[20, 50, 80, 110, 140, 170].map((x, i) => (
        <rect key={i} x={x} y={20 + Math.sin(i) * 20} width="16" height={60 + i * 12} rx="4" fill={color} />
      ))}
    </svg>
  ),
  recepcion: ({ color }) => (
    <svg className="w-full h-full opacity-20" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="70" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="100" cy="100" r="45" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="100" cy="100" r="20" fill={color} />
    </svg>
  ),
  turnos: ({ color }) => (
    <svg className="w-full h-full opacity-20" viewBox="0 0 200 200">
      {[30, 50, 70, 90].map((y, row) =>
        [30, 65, 100, 135, 170].map((x, col) => (
          <rect key={`${row}-${col}`} x={x} y={y} width="24" height="12" rx="3" fill={color}
            opacity={Math.random() > 0.4 ? 1 : 0.3} />
        ))
      )}
    </svg>
  ),
};

export default function ServicesGallery() {
  const t = useTranslations('services');
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback((index: number) => {
    setActiveIndex(Math.max(0, Math.min(SERVICE_KEYS.length - 1, index)));
  }, []);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -50) goTo(activeIndex + 1);
    if (info.offset.x > 50) goTo(activeIndex - 1);
  };

  const activeKey = SERVICE_KEYS[activeIndex];
  const activeColor = SERVICE_COLORS[activeKey];
  const Pattern = SERVICE_PATTERNS[activeKey];

  return (
    <section className="relative py-section overflow-hidden" id="services">
      {/* Glow de acento cambiante según servicio activo */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: 1 }}
        key={activeKey}
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 60%, ${activeColor}08 0%, transparent 70%)`,
        }}
      />

      <div className="container-orquesta">

        {/* Encabezado */}
        <FadeIn direction="up" className="mb-12 lg:mb-16">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[var(--text-tertiary)] mb-3">
            {t('subheading')}
          </p>
          <h2 className="text-display-xl font-bold text-[var(--text-primary)] text-balance whitespace-pre-line">
            {t('heading')}
          </h2>
        </FadeIn>

        {/* Layout principal: card expandida + lista lateral */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* ── Card activa (grande, al estilo Kelly) ── */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="relative rounded-2xl overflow-hidden border cursor-grab active:cursor-grabbing"
                style={{
                  borderColor: `${activeColor}30`,
                  backgroundColor: `${activeColor}06`,
                  minHeight: 480,
                }}
              >
                {/* Patrón decorativo de fondo */}
                <div className="absolute inset-0 overflow-hidden">
                  <Pattern color={activeColor} />
                </div>

                {/* Gradiente sobre el patrón */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${activeColor}10 0%, transparent 50%, ${activeColor}06 100%)`,
                  }}
                />

                {/* Contenido */}
                <div className="relative z-10 p-8 lg:p-10 flex flex-col justify-between h-full" style={{ minHeight: 480 }}>
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <span
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl border"
                        style={{ borderColor: `${activeColor}30`, backgroundColor: `${activeColor}15` }}
                      >
                        {SERVICE_ICONS[activeKey]}
                      </span>
                      <span
                        className="text-xs font-semibold tracking-widest uppercase"
                        style={{ color: activeColor }}
                      >
                        {t(`items.${activeKey}.tagline`)}
                      </span>
                    </div>

                    <h3 className="text-display-lg font-bold text-[var(--text-primary)] mb-4">
                      {t(`items.${activeKey}.name`)}
                    </h3>

                    <p className="text-[var(--text-secondary)] text-base leading-relaxed max-w-lg mb-8">
                      {t(`items.${activeKey}.description`)}
                    </p>

                    {/* Features */}
                    <ul className="flex flex-col gap-2.5">
                      {(t.raw(`items.${activeKey}.features`) as string[]).map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: activeColor }}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA + navegación */}
                  <div className="flex items-center justify-between pt-8 mt-8 border-t" style={{ borderColor: `${activeColor}20` }}>
                    <Button
                      variant="primary"
                      size="md"
                      style={{ '--accent-cyan': activeColor } as React.CSSProperties}
                    >
                      {t(`items.${activeKey}.cta`)}
                    </Button>

                    {/* Flechas de navegación */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goTo(activeIndex - 1)}
                        disabled={activeIndex === 0}
                        className="w-9 h-9 rounded-full border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all disabled:opacity-30"
                        aria-label="Servicio anterior"
                      >
                        ←
                      </button>
                      <span className="text-xs text-[var(--text-tertiary)] w-12 text-center">
                        {activeIndex + 1} / {SERVICE_KEYS.length}
                      </span>
                      <button
                        onClick={() => goTo(activeIndex + 1)}
                        disabled={activeIndex === SERVICE_KEYS.length - 1}
                        className="w-9 h-9 rounded-full border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all disabled:opacity-30"
                        aria-label="Servicio siguiente"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Lista de servicios (sidebar estilo Kelly cards) ── */}
          <div className="lg:w-72 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {SERVICE_KEYS.map((key, index) => {
              const color = SERVICE_COLORS[key];
              const isActive = index === activeIndex;

              return (
                <motion.button
                  key={key}
                  onClick={() => goTo(index)}
                  whileHover={{ x: isActive ? 0 : 4 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex-shrink-0 lg:flex-shrink text-left rounded-xl border p-4 transition-all duration-200 group"
                  style={{
                    borderColor: isActive ? `${color}50` : 'var(--border-subtle)',
                    backgroundColor: isActive ? `${color}10` : 'var(--bg-surface)',
                    minWidth: 160,
                  }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg">{SERVICE_ICONS[key]}</span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: isActive ? color : 'var(--text-tertiary)' }}
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <p
                    className="text-sm font-semibold transition-colors"
                    style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                  >
                    {t(`items.${key}.name`)}
                  </p>

                  {/* Indicador activo */}
                  {isActive && (
                    <motion.div
                      layoutId="active-service"
                      className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Puntos de paginación — mobile */}
        <div className="flex justify-center gap-1.5 mt-6 lg:hidden">
          {SERVICE_KEYS.map((key, i) => (
            <button
              key={key}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                backgroundColor: i === activeIndex ? SERVICE_COLORS[key] : 'var(--border-default)',
              }}
              aria-label={`Ir al servicio ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
