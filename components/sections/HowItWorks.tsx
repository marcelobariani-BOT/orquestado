'use client';

import { useTranslations } from 'next-intl';
import FadeIn from '@/components/animations/FadeIn';
import StaggerChildren, { StaggerItem } from '@/components/animations/StaggerChildren';

export default function HowItWorks() {
  const t = useTranslations('howItWorks');
  const steps = t.raw('steps') as Array<{ number: string; title: string; description: string }>;

  return (
    <section className="py-section" id="howItWorks">
      <div className="container-orquesta">

        <FadeIn direction="up" className="mb-16">
          <h2 className="text-display-xl font-bold text-[var(--text-primary)] whitespace-pre-line text-balance max-w-xl">
            {t('heading')}
          </h2>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <StaggerItem key={step.number}>
              <div className="relative flex flex-col gap-4 p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-default)] transition-colors duration-300 group h-full">
                {/* Número grande de fondo */}
                <span className="absolute top-4 right-5 text-5xl font-bold text-[var(--border-subtle)] select-none pointer-events-none transition-colors duration-300 group-hover:text-[var(--border-default)]">
                  {step.number}
                </span>

                {/* Indicador de línea entre pasos */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-[var(--border-subtle)]" />
                )}

                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
