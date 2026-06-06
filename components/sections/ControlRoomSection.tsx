'use client';

import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion';
import Button from '@/components/ui/Button';

const STEPS = ['step1', 'step2', 'step3', 'step4', 'step5'] as const;

const STEP_COLORS = {
  step1: 'var(--service-mostrador)',
  step2: 'var(--service-bots)',
  step3: 'var(--service-llamadas)',
  step4: 'var(--service-turnos)',
  step5: 'var(--accent-cyan)',
};

const MODULE_POSITIONS = [
  { x: '12%', y: '18%', w: '28%', h: '32%', icon: '📦', id: 'step1' },
  { x: '58%', y: '10%', w: '30%', h: '28%', icon: '🤖', id: 'step2' },
  { x: '12%', y: '58%', w: '22%', h: '30%', icon: '📞', id: 'step3' },
  { x: '60%', y: '48%', w: '28%', h: '32%', icon: '📅', id: 'step4' },
  { x: '36%', y: '30%', w: '26%', h: '38%', icon: '⚡', id: 'step5' },
] as const;

export default function ControlRoomSection() {
  const t = useTranslations('controlRoom');
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Hook en top-level, no inline en JSX
  const introOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-[600vh]" id="howItWorks">
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden">

        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
          <motion.p
            style={{ opacity: introOpacity }}
            className="text-xs font-semibold tracking-[0.18em] uppercase text-[var(--text-tertiary)]"
          >
            {t('intro')}
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row h-full">

          <div className="relative flex-1 flex items-center justify-center p-8">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(oklch(74% 0.17 200 / 0.06) 1px, transparent 1px),' +
                  'linear-gradient(90deg, oklch(74% 0.17 200 / 0.06) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative w-full max-w-2xl aspect-[4/3] border border-[var(--border-subtle)] rounded-2xl overflow-hidden bg-[var(--bg-surface)]">
              <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }} />

              <ConnectionLines scrollYProgress={scrollYProgress} />

              {MODULE_POSITIONS.map((pos, i) => (
                <RoomModule
                  key={pos.id}
                  position={pos}
                  stepIndex={i + 1}
                  scrollYProgress={scrollYProgress}
                  color={STEP_COLORS[pos.id as keyof typeof STEP_COLORS]}
                />
              ))}

              <CenterBadge scrollYProgress={scrollYProgress} />
            </div>
          </div>

          <div className="lg:w-96 flex items-center justify-center p-8 lg:p-12 relative">
            <div className="w-full max-w-sm">
              <StepIndicators scrollYProgress={scrollYProgress} />

              <div className="relative mt-8" style={{ height: 180 }}>
                {STEPS.map((step, i) => (
                  <StepCard
                    key={step}
                    step={step}
                    index={i}
                    scrollYProgress={scrollYProgress}
                    color={STEP_COLORS[step]}
                    t={t}
                  />
                ))}
              </div>

              <FinalCTACard scrollYProgress={scrollYProgress} cta={t('cta')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────

interface RoomModuleProps {
  position: typeof MODULE_POSITIONS[number];
  stepIndex: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  color: string;
}

function RoomModule({ position, stepIndex, scrollYProgress, color }: RoomModuleProps) {
  const threshold = (stepIndex - 1) / 5;
  const opacity = useTransform(
    scrollYProgress,
    [threshold, threshold + 0.08, threshold + 0.12],
    [0, 1, 1]
  );
  const scale = useTransform(
    scrollYProgress,
    [threshold, threshold + 0.1],
    [0.85, 1]
  );
  const glowSize = useTransform(scrollYProgress, [0.8, 1], [0, 20]);
  const boxShadow = useMotionTemplate`0 0 ${glowSize}px ${color}20`;

  return (
    <motion.div
      className="absolute rounded-xl border flex flex-col gap-1.5 p-3 cursor-default"
      style={{
        left: position.x,
        top: position.y,
        width: position.w,
        height: position.h,
        opacity,
        scale,
        borderColor: `${color}40`,
        backgroundColor: `${color}08`,
        boxShadow,
      }}
    >
      <span className="text-2xl leading-none">{position.icon}</span>
      <div className="flex gap-1 flex-wrap mt-auto">
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className="h-1 rounded-full flex-1"
            style={{ backgroundColor: `${color}60` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ConnectionLines({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const opacity = useTransform(scrollYProgress, [0.78, 0.9], [0, 1]);

  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
    >
      {[
        ['26%', '34%', '36%', '49%'],
        ['36%', '49%', '58%', '30%'],
        ['62%', '49%', '72%', '64%'],
        ['26%', '73%', '36%', '49%'],
        ['62%', '24%', '62%', '30%'],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="oklch(74% 0.17 200 / 0.4)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      ))}
    </motion.svg>
  );
}

function CenterBadge({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const opacity = useTransform(scrollYProgress, [0.82, 0.95], [0, 1]);
  const scale = useTransform(scrollYProgress, [0.82, 0.95], [0.7, 1]);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ opacity, scale }}
    >
      <div className="w-12 h-12 rounded-xl bg-[var(--accent-cyan)] flex items-center justify-center shadow-[0_0_40px_var(--accent-cyan-dim)]">
        <span className="text-[var(--text-inverse)] font-bold text-lg">O</span>
      </div>
    </motion.div>
  );
}

function StepIndicators({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => (
        <StepIndicatorBar
          key={step}
          index={i}
          scrollYProgress={scrollYProgress}
          color={i < 4 ? STEP_COLORS[STEPS[i]] : STEP_COLORS['step5']}
        />
      ))}
    </div>
  );
}

function StepIndicatorBar({
  index,
  scrollYProgress,
  color,
}: {
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  color: string;
}) {
  const threshold = index / 5;
  // Clamp a [0,1] para evitar offsets fuera de rango en WAAPI
  const lo = Math.max(0, threshold);
  const hi = Math.min(1, threshold + 0.05);
  const opacity = useTransform(scrollYProgress, [lo, hi], [0.3, 1]);
  return (
    <motion.div
      className="h-0.5 flex-1 rounded-full"
      style={{ opacity, backgroundColor: color }}
    />
  );
}

interface StepCardProps {
  step: typeof STEPS[number];
  index: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  color: string;
  t: ReturnType<typeof useTranslations<'controlRoom'>>;
}

function StepCard({ step, index, scrollYProgress, color, t }: StepCardProps) {
  const start = index / 5;
  const end = (index + 1) / 5;

  // Clamp a [0,1] — sin esto, index=0 genera -0.02 e index=4 genera 1.02,
  // ambos fuera del rango válido de WAAPI y causa el error de offsets.
  const opacityRange = [
    Math.max(0, start - 0.02),
    start + 0.04,
    Math.max(start + 0.05, end - 0.04),
    Math.min(1, end + 0.02),
  ];
  const yRange = [
    Math.max(0, start - 0.02),
    Math.min(1, start + 0.04),
  ];

  const opacity = useTransform(scrollYProgress, opacityRange, [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, yRange, [16, 0]);

  return (
    <motion.div className="absolute inset-0" style={{ opacity, y }}>
      <div className="flex items-start gap-3">
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {index + 1}
        </span>
        <div>
          <h3 className="text-[var(--text-primary)] font-semibold text-lg mb-2 leading-tight">
            {t(`${step}.label` as `step1.label`)}
          </h3>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            {t(`${step}.description` as `step1.description`)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function FinalCTACard({ scrollYProgress, cta }: { scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress']; cta: string }) {
  const opacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);
  const y = useTransform(scrollYProgress, [0.85, 0.95], [16, 0]);

  return (
    <motion.div style={{ opacity, y }} className="mt-10">
      <Button variant="amber" size="md" className="w-full justify-center">
        {cta}
      </Button>
    </motion.div>
  );
}
