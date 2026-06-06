'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import FadeIn from '@/components/animations/FadeIn';
import StaggerChildren, { StaggerItem } from '@/components/animations/StaggerChildren';
import Button from '@/components/ui/Button';

export default function MiMostradorSpotlight() {
  const t = useTranslations('spotlight');

  return (
    <section className="relative py-section overflow-hidden">
      {/* Glow lateral */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--service-mostrador) 0%, transparent 70%)', opacity: 0.08 }} />

      <div className="container-orquesta">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Texto */}
          <div>
            <FadeIn direction="up">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-[var(--service-mostrador)] text-[var(--service-mostrador)] mb-6"
                style={{ backgroundColor: 'oklch(72% 0.16 200 / 0.1)' }}>
                ✦ {t('eyebrow')}
              </span>
            </FadeIn>

            <FadeIn direction="up" delay={0.08}>
              <h2 className="text-display-xl font-bold text-[var(--text-primary)] mb-6">
                {t('heading')}
              </h2>
            </FadeIn>

            <FadeIn direction="up" delay={0.14}>
              <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-10 max-w-md">
                {t('description')}
              </p>
            </FadeIn>

            {/* Stats */}
            <StaggerChildren className="grid grid-cols-3 gap-4 mb-10">
              {(['stat1', 'stat2', 'stat3'] as const).map((stat) => (
                <StaggerItem key={stat}>
                  <div className="text-center p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                    <p className="text-display-md font-bold text-[var(--service-mostrador)] mb-1">
                      {t(`${stat}.value`)}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] leading-tight">
                      {t(`${stat}.label`)}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>

            <FadeIn direction="up" delay={0.3}>
              <Button variant="primary" size="lg"
                style={{ '--accent-cyan': 'var(--service-mostrador)' } as React.CSSProperties}>
                {t('cta')}
              </Button>
            </FadeIn>
          </div>

          {/* Mockup de la interfaz de Mi Mostrador */}
          <FadeIn direction="left" delay={0.1}>
            <MostradorMockup />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function MostradorMockup() {
  const orders = [
    { id: '#1042', item: 'Milanesa completa + papas', status: 'Listo', color: 'var(--service-llamadas)' },
    { id: '#1041', item: 'Hamburguesa doble', status: 'En prep.', color: 'var(--accent-amber)' },
    { id: '#1040', item: 'Empanadas x6', status: 'Entregado', color: 'var(--service-turnos)' },
  ];

  return (
    <div className="relative">
      {/* Glow detrás del mockup */}
      <div className="absolute -inset-8 rounded-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, var(--service-mostrador) 0%, transparent 65%)', opacity: 0.06 }} />

      <div className="relative rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl">
        {/* Barra de título */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)]">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[oklch(65%_0.18_25)]" />
            <span className="w-3 h-3 rounded-full bg-[oklch(75%_0.18_55)]" />
            <span className="w-3 h-3 rounded-full bg-[oklch(70%_0.15_145)]" />
          </div>
          <span className="text-xs text-[var(--text-tertiary)] ml-2 font-mono">Mi Mostrador — Panel</span>
        </div>

        {/* Contenido del panel */}
        <div className="p-5">
          {/* Header del panel */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs text-[var(--text-tertiary)]">Hoy, martes</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">42 pedidos</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: 'var(--service-llamadas)', color: 'var(--bg-base)', opacity: 0.9 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              En vivo
            </div>
          </div>

          {/* Lista de pedidos */}
          <div className="flex flex-col gap-2.5">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-raised)]"
              >
                <span className="text-xs font-mono text-[var(--text-tertiary)] w-12">{order.id}</span>
                <span className="flex-1 text-xs text-[var(--text-secondary)] truncate">{order.item}</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${order.color}20`, color: order.color }}
                >
                  {order.status}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Input de nuevo pedido */}
          <div className="mt-4 flex gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-tertiary)]">
              Nuevo pedido...
            </div>
            <button className="px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-inverse)]"
              style={{ backgroundColor: 'var(--service-mostrador)' }}>
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
