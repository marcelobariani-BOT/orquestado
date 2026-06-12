'use client';

import { useTranslations } from 'next-intl';
import FadeIn from '@/components/animations/FadeIn';

export default function FinalCTA() {
  const t = useTranslations('cta');

  return (
    <section className="relative py-section overflow-hidden" id="contact">
      {/* Glow central */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, oklch(74% 0.17 200 / 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Grid de fondo */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(oklch(74% 0.17 200 / 0.05) 1px, transparent 1px),' +
            'linear-gradient(90deg, oklch(74% 0.17 200 / 0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container-orquesta relative">
        <div className="max-w-2xl mx-auto text-center">

          <FadeIn direction="up">
            <h2 className="text-display-xl font-bold text-[var(--text-primary)] whitespace-pre-line text-balance mb-6">
              {t('heading')}
            </h2>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-12 max-w-md mx-auto">
              {t('subheading')}
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              {/* Botón WhatsApp con efecto pulse */}
              <a
                href="https://wa.me/541178241554?text=Hola%21%20Vi%20Orquestado%20y%20me%20interesa%20automatizar%20mi%20negocio.%20%C2%BFPodemos%20hablar%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white text-base"
                style={{ background: '#25D366' }}
              >
                <span className="absolute inset-0 rounded-2xl animate-ping" style={{ background: '#25D366', opacity: 0.3, animationIterationCount: 3 }} />
                <span className="absolute inset-0 rounded-2xl animate-ping" style={{ background: '#25D366', opacity: 0.2, animationDelay: '0.3s', animationIterationCount: 3 }} />
                <span className="absolute inset-0 rounded-2xl animate-ping" style={{ background: '#25D366', opacity: 0.1, animationDelay: '0.6s', animationIterationCount: 3 }} />
                <WhatsAppIcon />
                <span className="relative">Escribir por WhatsApp</span>
              </a>

            </div>
          </FadeIn>
        </div>

        {/* Footer mínimo */}
        <div className="mt-24 pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[var(--accent-cyan)] flex items-center justify-center text-[var(--text-inverse)] text-xs font-bold">
              O
            </span>
            <span className="text-sm text-[var(--text-primary)] font-medium">Orquestado</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            © {new Date().getFullYear()} Orquestado. Automatización con IA.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="relative flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
