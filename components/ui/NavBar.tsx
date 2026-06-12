'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Button from './Button';

export default function NavBar() {
  const t = useTranslations('nav');
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 40);
  });

  return (
    <motion.header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[oklch(7%_0.008_260/0.92)] backdrop-blur-xl border-b border-[var(--border-subtle)]'
          : 'bg-transparent',
      ].join(' ')}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container-orquesta">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <span className="w-7 h-7 rounded-lg bg-[var(--accent-cyan)] flex items-center justify-center text-[var(--text-inverse)] text-xs font-bold">
              O
            </span>
            <span className="text-[var(--text-primary)] font-semibold text-sm tracking-tight">
              Orquestado
            </span>
          </a>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-1">
            {(['services', 'mostrador', 'contact'] as const).map((key) => (
              <a
                key={key}
                href={`#${key}`}
                className="px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-lg hover:bg-[var(--bg-surface)]"
              >
                {t(key)}
              </a>
            ))}
          </div>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <a href="#contact" className="hidden md:inline-flex">
              <Button variant="primary" size="sm">
                {t('cta')}
              </Button>
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              aria-label="Menú"
            >
              <span className="block w-5 h-px bg-current mb-1.5" />
              <span className="block w-3.5 h-px bg-current mb-1.5" />
              <span className="block w-5 h-px bg-current" />
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4 border-t border-[var(--border-subtle)] pt-4 flex flex-col gap-1"
          >
            {(['services', 'mostrador', 'contact'] as const).map((key) => (
              <a
                key={key}
                href={`#${key}`}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface)]"
              >
                {t(key)}
              </a>
            ))}
            <div className="pt-2">
              <a href="#contact" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="sm" className="w-full justify-center">
                  {t('cta')}
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
