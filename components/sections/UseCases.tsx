'use client';

import { useTranslations } from 'next-intl';
import FadeIn from '@/components/animations/FadeIn';
import StaggerChildren, { StaggerItem } from '@/components/animations/StaggerChildren';

export default function UseCases() {
  const t = useTranslations('cases');
  const items = t.raw('items') as Array<{ industry: string; case: string; result: string }>;

  return (
    <section className="py-section" id="cases">
      <div className="container-orquesta">

        <FadeIn direction="up" className="mb-14">
          <h2 className="text-display-xl font-bold text-[var(--text-primary)]">
            {t('heading')}
          </h2>
        </FadeIn>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <StaggerItem key={i}>
              <div className="flex flex-col gap-5 p-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-default)] transition-colors duration-300 h-full">
                <span className="text-xs font-semibold tracking-widest uppercase text-[var(--accent-cyan)]">
                  {item.industry}
                </span>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed flex-1">
                  &ldquo;{item.case}&rdquo;
                </p>
                <div className="flex items-center gap-2 pt-4 border-t border-[var(--border-subtle)]">
                  <span className="text-lg font-bold text-[var(--text-primary)]">{item.result}</span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
