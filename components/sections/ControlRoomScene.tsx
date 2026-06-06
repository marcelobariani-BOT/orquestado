'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion';
import Button from '@/components/ui/Button';

// ── Constantes de la sala ──────────────────────────────────────
// SVG viewBox: 0 0 800 500
// Room: x=40 y=40 w=720 h=420 (bottom at y=460)

const S = 1 / 6; // ancho de cada stage (6 stages)

// Colores hardcodeados (OKLCH) porque CSS vars no aplican en atributos SVG
const C = {
  bg:         'oklch(7% 0.008 260)',
  bgSurface:  'oklch(10% 0.01 260)',
  bgRaised:   'oklch(14% 0.012 260)',
  wall:       'oklch(25% 0.016 260)',
  grid:       'oklch(18% 0.012 260)',
  cyan:       'oklch(74% 0.17 200)',
  cyanDim:    'oklch(74% 0.17 200 / 0.12)',
  cyanFaint:  'oklch(74% 0.17 200 / 0.05)',
  mostrador:  'oklch(72% 0.16 200)',
  bots:       'oklch(70% 0.15 280)',
  llamadas:   'oklch(75% 0.17 145)',
  recepcion:  'oklch(73% 0.16 25)',
  turnos:     'oklch(74% 0.15 320)',
  textDim:    'oklch(45% 0.01 260)',
  textSub:    'oklch(65% 0.01 260)',
};

// Módulos de la sala (posiciones en el SVG 800×500)
const MODULES = {
  mostrador: { x: 75,  y: 75,  w: 180, h: 115, color: C.mostrador, icon: '📦', label: 'Mi Mostrador' },
  bots:      { x: 545, y: 75,  w: 180, h: 115, color: C.bots,      icon: '🤖', label: 'Bots' },
  llamadas:  { x: 75,  y: 300, w: 180, h: 115, color: C.llamadas,  icon: '📞', label: 'Llamadas' },
  recepcion: { x: 545, y: 300, w: 180, h: 115, color: C.recepcion, icon: '🔀', label: 'Recepción' },
  turnos:    { x: 313, y: 393, w: 174, h: 63,  color: C.turnos,    icon: '📅', label: 'Turnos' },
} as const;

// Cables: path SVG desde el centro de cada módulo al hub central (400, 245)
const CABLES = {
  mostrador: 'M165,132 C165,200 400,185 400,245',
  bots:      'M635,132 C635,200 400,185 400,245',
  llamadas:  'M165,357 C165,290 400,295 400,245',
  recepcion: 'M635,357 C635,290 400,295 400,245',
  turnos:    'M400,424 C400,380 400,310 400,245',
} as const;

type StageMeta = {
  label: string;
  heading: string;
  body: string;
  cta?: string;
};

// ── Componente principal ───────────────────────────────────────
export default function ControlRoomScene() {
  const t = useTranslations('room');
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Stage actual basado en scroll — sin offsets fuera de [0,1]
  const stageMV = useTransform(
    scrollYProgress,
    [0, S, 2*S, 3*S, 4*S, 5*S, 1],
    [0, 1,  2,   3,   4,   5,  5],
  );
  useMotionValueEvent(stageMV, 'change', (v) => setStage(Math.min(5, Math.max(0, Math.round(v)))));

  // Opacidades de cada capa del SVG — todas clampeadas a [0,1]
  const roomOp    = useTransform(scrollYProgress, [S,        S+0.06,        1], [0, 1, 1]);
  const modOp1    = useTransform(scrollYProgress, [S+0.04,   S+0.10,        1], [0, 1, 1]);
  const modOp2    = useTransform(scrollYProgress, [2*S,      2*S+0.07,      1], [0, 1, 1]);
  const modOp3    = useTransform(scrollYProgress, [3*S,      3*S+0.06,      1], [0, 1, 1]);
  const modOp4    = useTransform(scrollYProgress, [3*S+0.05, 3*S+0.11,      1], [0, 1, 1]);
  const modOp5    = useTransform(scrollYProgress, [4*S,      4*S+0.07,      1], [0, 1, 1]);
  const hubOp     = useTransform(scrollYProgress, [5*S,      5*S+0.06,      1], [0, 1, 1]);
  const cableLen  = useTransform(scrollYProgress, [5*S+0.04, Math.min(1, 5*S+0.18)], [0, 1]);
  const glowOp    = useTransform(scrollYProgress, [5*S+0.08, Math.min(1, 5*S+0.20)], [0, 1]);

  // Scale de entrada para módulos
  const modScale1 = useTransform(scrollYProgress, [S+0.04,   S+0.12],   [0.88, 1]);
  const modScale2 = useTransform(scrollYProgress, [2*S,      2*S+0.09], [0.88, 1]);
  const modScale3 = useTransform(scrollYProgress, [3*S,      3*S+0.09], [0.88, 1]);
  const modScale4 = useTransform(scrollYProgress, [3*S+0.05, 3*S+0.13], [0.88, 1]);
  const modScale5 = useTransform(scrollYProgress, [4*S,      4*S+0.09], [0.88, 1]);
  const hubScale  = useTransform(scrollYProgress, [5*S,      5*S+0.08], [0.7,  1]);

  const glowR     = useTransform(scrollYProgress, [5*S+0.06, Math.min(1, 5*S+0.22)], [30, 60]);
  const glowColor = useMotionTemplate`radial-gradient(circle ${glowR}px at 400px 245px, oklch(74% 0.17 200 / 0.18) 0%, transparent 100%)`;

  const stages = t.raw('stages') as StageMeta[];

  return (
    <section ref={containerRef} className="relative h-[500vh]" id="como-funciona">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col lg:flex-row bg-[var(--bg-base)]">

        {/* ── SVG: la sala ───────────────────── */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          {/* Grid de fondo — siempre visible */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${C.cyanFaint} 1px, transparent 1px), linear-gradient(90deg, ${C.cyanFaint} 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Glow dinámico del hub — aparece en stage 5 */}
          <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: glowOp }}>
            <motion.div className="w-full h-full" style={{ background: glowColor }} />
          </motion.div>

          {/* SVG room */}
          <svg
            viewBox="0 0 800 500"
            className="w-full h-full max-w-3xl"
            preserveAspectRatio="xMidYMid meet"
            style={{ maxHeight: '85vh' }}
          >
            {/* ── Paredes de la sala ── */}
            <motion.g style={{ opacity: roomOp }}>
              {/* Piso */}
              <rect x="40" y="40" width="720" height="420" rx="3"
                style={{ fill: C.bgSurface, stroke: C.wall, strokeWidth: 1.5 }} />
              {/* Grid interior */}
              {Array.from({ length: 17 }, (_, i) => (
                <line key={`v${i}`}
                  x1={80 + i * 40} y1="40" x2={80 + i * 40} y2="460"
                  style={{ stroke: C.grid, strokeWidth: 0.5 }} />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`h${i}`}
                  x1="40" y1={80 + i * 40} x2="760" y2={80 + i * 40}
                  style={{ stroke: C.grid, strokeWidth: 0.5 }} />
              ))}
              {/* Marcas de esquina — estilo blueprint */}
              {[[36,36],[752,36],[36,452],[752,452]].map(([x,y],i) => (
                <rect key={i} x={x} y={y} width="8" height="8"
                  style={{ fill: C.cyan, opacity: 0.7 }} />
              ))}
              {/* Label de sala */}
              <text x="52" y="475" style={{ fill: C.textDim, fontSize: 9, fontFamily: 'monospace' }}>
                ORQUESTA CONTROL ROOM — PLANTA BAJA
              </text>
            </motion.g>

            {/* ── Módulo: Mi Mostrador ── */}
            <motion.g style={{ opacity: modOp1, scale: modScale1, transformOrigin: '165px 132px' }}>
              <RoomModule m={MODULES.mostrador} />
            </motion.g>

            {/* ── Módulo: Bots ── */}
            <motion.g style={{ opacity: modOp2, scale: modScale2, transformOrigin: '635px 132px' }}>
              <RoomModule m={MODULES.bots} />
            </motion.g>

            {/* ── Módulo: Llamadas ── */}
            <motion.g style={{ opacity: modOp3, scale: modScale3, transformOrigin: '165px 357px' }}>
              <RoomModule m={MODULES.llamadas} />
            </motion.g>

            {/* ── Módulo: Recepción ── */}
            <motion.g style={{ opacity: modOp4, scale: modScale4, transformOrigin: '635px 357px' }}>
              <RoomModule m={MODULES.recepcion} />
            </motion.g>

            {/* ── Módulo: Turnos ── */}
            <motion.g style={{ opacity: modOp5, scale: modScale5, transformOrigin: '400px 424px' }}>
              <RoomModule m={MODULES.turnos} />
            </motion.g>

            {/* ── Cables de conexión ── */}
            <motion.g style={{ opacity: hubOp }}>
              {(Object.keys(CABLES) as Array<keyof typeof CABLES>).map((key) => (
                <motion.path
                  key={key}
                  d={CABLES[key]}
                  fill="none"
                  style={{
                    stroke: C.cyan,
                    strokeWidth: 1.5,
                    strokeDasharray: '5 3',
                    pathLength: cableLen,
                    opacity: 0.7,
                  }}
                />
              ))}
            </motion.g>

            {/* ── Hub central: Orquesta ── */}
            <motion.g style={{ opacity: hubOp, scale: hubScale, transformOrigin: '400px 245px' }}>
              <circle cx="400" cy="245" r="52"
                style={{ fill: 'oklch(74% 0.17 200 / 0.08)', stroke: C.cyan, strokeWidth: 1.5 }} />
              <circle cx="400" cy="245" r="38"
                style={{ fill: C.bgRaised, stroke: C.cyan, strokeWidth: 2 }} />
              <text x="400" y="252" textAnchor="middle"
                style={{ fill: C.cyan, fontSize: 22, fontWeight: 'bold', fontFamily: 'system-ui' }}>
                O
              </text>
              <text x="400" y="308" textAnchor="middle"
                style={{ fill: C.textSub, fontSize: 9, fontFamily: 'monospace' }}>
                ORQUESTA ENGINE
              </text>
            </motion.g>

            {/* ── Nodos de conexión en cada módulo (aparecen con el hub) ── */}
            <motion.g style={{ opacity: hubOp }}>
              {[
                { cx: 165, cy: 132, c: C.mostrador },
                { cx: 635, cy: 132, c: C.bots },
                { cx: 165, cy: 357, c: C.llamadas },
                { cx: 635, cy: 357, c: C.recepcion },
                { cx: 400, cy: 424, c: C.turnos },
              ].map((n, i) => (
                <circle key={i} cx={n.cx} cy={n.cy} r="5"
                  style={{ fill: n.c, opacity: 0.9 }} />
              ))}
            </motion.g>
          </svg>

          {/* Label "construyendo" — se desvanece después del stage 0 */}
          <motion.p
            className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] uppercase font-mono whitespace-nowrap"
            style={{
              color: C.textDim,
              opacity: useTransform(scrollYProgress, [0, 0.06], [1, 0]),
            }}
          >
            {t('buildingLabel')}
          </motion.p>
        </div>

        {/* ── Panel de texto: stage actual ─── */}
        <div className="lg:w-[380px] flex flex-col justify-center px-8 py-10 lg:px-12 border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] bg-[oklch(9%_0.009_260/0.7)] relative overflow-hidden">

          {/* Progreso visual */}
          <div className="flex gap-1.5 mb-10">
            {stages.map((_, i) => (
              <div
                key={i}
                className="h-0.5 flex-1 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: i <= stage
                    ? getStageColor(i)
                    : 'oklch(20% 0.01 260)',
                }}
              />
            ))}
          </div>

          {/* Texto del stage — AnimatePresence para crossfade */}
          <div className="relative min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-4"
                  style={{ color: getStageColor(stage) }}>
                  {stages[stage]?.label}
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] leading-[1.05] mb-5 whitespace-pre-line tracking-tight">
                  {stages[stage]?.heading}
                </h2>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xs">
                  {stages[stage]?.body}
                </p>
                {stages[stage]?.cta && (
                  <div className="mt-8">
                    <Button variant="amber" size="md">
                      {stages[stage].cta}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Número del stage */}
          <div className="absolute bottom-8 right-10 font-mono text-[11px] text-[var(--text-tertiary)]">
            {String(stage + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}
          </div>

          {/* Decoración: línea lateral */}
          <div
            className="absolute left-0 top-1/4 bottom-1/4 w-px transition-colors duration-700"
            style={{ backgroundColor: getStageColor(stage), opacity: 0.4 }}
          />
        </div>
      </div>
    </section>
  );
}

// ── Sub-componente: módulo de la sala ──────────────────────────
interface ModuleDef {
  x: number; y: number; w: number; h: number;
  color: string; icon: string; label: string;
}

function RoomModule({ m }: { m: ModuleDef }) {
  const barWidths = [55, 85, 40, 70];
  const isWide = m.w > 170;

  return (
    <>
      {/* Caja exterior */}
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx="6"
        style={{
          fill: `${m.color.replace(')', ' / 0.08)')}`,
          stroke: `${m.color.replace(')', ' / 0.45)')}`,
          strokeWidth: 1.5,
        }}
      />
      {/* Pantalla interior */}
      <rect x={m.x+10} y={m.y+10} width={m.w-20} height={isWide ? 62 : 40} rx="4"
        style={{ fill: `${m.color.replace(')', ' / 0.12)')}` }}
      />
      {/* Barras de contenido */}
      {barWidths.slice(0, isWide ? 4 : 2).map((pct, i) => (
        <rect
          key={i}
          x={m.x + 16}
          y={m.y + 18 + i * 14}
          width={(m.w - 32) * pct / 100}
          height={7}
          rx="3.5"
          style={{ fill: `${m.color.replace(')', ` / ${0.4 + i * 0.1})`)}` }}
        />
      ))}
      {/* Indicador de estado (dot) */}
      <circle cx={m.x + 18} cy={m.y + m.h - 16} r="4"
        style={{ fill: m.color, opacity: 0.9 }} />
      {/* Label del módulo */}
      <text x={m.x + 28} y={m.y + m.h - 12}
        style={{ fill: 'oklch(65% 0.01 260)', fontSize: 10, fontFamily: 'monospace' }}>
        {m.label}
      </text>
    </>
  );
}

// ── Helper: color por stage ────────────────────────────────────
function getStageColor(s: number): string {
  const colors = [
    C.cyan,
    C.mostrador,
    C.bots,
    C.llamadas,
    C.turnos,
    C.cyan,
  ];
  return colors[s] ?? C.cyan;
}
