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
// SVG viewBox: 0 0 860 540
const S = 1 / 6;

const C = {
  bg:         'oklch(7% 0.008 260)',
  bgSurface:  'oklch(11% 0.012 260)',
  bgRaised:   'oklch(16% 0.014 260)',
  bgModule:   'oklch(13% 0.013 260)',
  wall:       'oklch(28% 0.018 260)',
  grid:       'oklch(16% 0.011 260)',
  gridBright: 'oklch(22% 0.015 260)',
  cyan:       'oklch(74% 0.17 200)',
  cyanDim:    'oklch(74% 0.17 200 / 0.15)',
  cyanFaint:  'oklch(74% 0.17 200 / 0.06)',
  mostrador:  'oklch(72% 0.16 200)',
  bots:       'oklch(70% 0.15 280)',
  llamadas:   'oklch(75% 0.17 145)',
  recepcion:  'oklch(73% 0.16 25)',
  turnos:     'oklch(74% 0.15 320)',
  textDim:    'oklch(42% 0.01 260)',
  textSub:    'oklch(62% 0.01 260)',
  textMed:    'oklch(72% 0.01 260)',
};

// Módulos con posiciones para viewBox 860×540
const MODULES = {
  mostrador: { x: 60,  y: 60,  w: 200, h: 140, color: C.mostrador, label: 'Mi Mostrador', icon: 'mostrador' },
  bots:      { x: 600, y: 60,  w: 200, h: 140, color: C.bots,      label: 'Bots web',     icon: 'bots' },
  llamadas:  { x: 60,  y: 330, w: 200, h: 140, color: C.llamadas,  label: 'Llamadas',     icon: 'llamadas' },
  recepcion: { x: 600, y: 330, w: 200, h: 140, color: C.recepcion, label: 'Recepción',    icon: 'recepcion' },
  turnos:    { x: 330, y: 420, w: 200, h: 90,  color: C.turnos,    label: 'Turnos',       icon: 'turnos' },
} as const;

// Hub central
const HUB = { cx: 430, cy: 270 };

// Cables desde centro de cada módulo al hub
const CABLES = {
  mostrador: `M160,130 C160,210 ${HUB.cx},200 ${HUB.cx},${HUB.cy}`,
  bots:      `M700,130 C700,210 ${HUB.cx},200 ${HUB.cx},${HUB.cy}`,
  llamadas:  `M160,400 C160,330 ${HUB.cx},340 ${HUB.cx},${HUB.cy}`,
  recepcion: `M700,400 C700,330 ${HUB.cx},340 ${HUB.cx},${HUB.cy}`,
  turnos:    `M430,420 C430,380 ${HUB.cx},360 ${HUB.cx},${HUB.cy}`,
} as const;

type StageMeta = { label: string; heading: string; body: string; cta?: string };

// ── Iconos SVG por servicio ────────────────────────────────────
function ModuleIcon({ type, color, x, y }: { type: string; color: string; x: number; y: number }) {
  // Cada icono en un viewBox local de 40×40 centrado en (x,y)
  const cx = x - 20; const cy = y - 20;
  if (type === 'mostrador') return (
    <g transform={`translate(${cx},${cy})`}>
      <rect x="4" y="8" width="32" height="24" rx="3" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7"/>
      <line x1="4" y1="16" x2="36" y2="16" stroke={color} strokeWidth="1" opacity="0.5"/>
      <rect x="8" y="20" width="8" height="8" rx="1.5" fill={color} opacity="0.5"/>
      <rect x="18" y="20" width="14" height="3" rx="1.5" fill={color} opacity="0.3"/>
      <rect x="18" y="25" width="10" height="3" rx="1.5" fill={color} opacity="0.2"/>
    </g>
  );
  if (type === 'bots') return (
    <g transform={`translate(${cx},${cy})`}>
      <rect x="10" y="6" width="20" height="16" rx="4" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7"/>
      <circle cx="16" cy="14" r="2.5" fill={color} opacity="0.6"/>
      <circle cx="24" cy="14" r="2.5" fill={color} opacity="0.6"/>
      <line x1="20" y1="22" x2="20" y2="28" stroke={color} strokeWidth="1.5" opacity="0.5"/>
      <line x1="12" y1="28" x2="28" y2="28" stroke={color} strokeWidth="1.5" opacity="0.5"/>
      <line x1="8" y1="28" x2="12" y2="28" stroke={color} strokeWidth="1.2" opacity="0.3"/>
      <line x1="28" y1="28" x2="32" y2="28" stroke={color} strokeWidth="1.2" opacity="0.3"/>
    </g>
  );
  if (type === 'llamadas') return (
    <g transform={`translate(${cx},${cy})`}>
      <path d="M8 12 Q8 6 14 6 L16 6 Q18 6 18 8 L18 13 Q18 15 16 15 L15 15 Q13 17 13 19 L13 20 Q13 22 15 22 L16 22 Q18 22 18 24 L18 29 Q18 31 16 31 L14 31 Q8 31 8 26 Z" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7"/>
      <line x1="24" y1="10" x2="34" y2="10" stroke={color} strokeWidth="1" opacity="0.4"/>
      <line x1="24" y1="15" x2="32" y2="15" stroke={color} strokeWidth="1" opacity="0.3"/>
      <line x1="24" y1="20" x2="30" y2="20" stroke={color} strokeWidth="1" opacity="0.25"/>
    </g>
  );
  if (type === 'recepcion') return (
    <g transform={`translate(${cx},${cy})`}>
      <circle cx="20" cy="20" r="13" fill="none" stroke={color} strokeWidth="1.5" opacity="0.6"/>
      <circle cx="20" cy="20" r="7" fill="none" stroke={color} strokeWidth="1.2" opacity="0.5"/>
      <circle cx="20" cy="20" r="2.5" fill={color} opacity="0.8"/>
      {[0,72,144,216,288].map(deg => (
        <line key={deg}
          x1={20+8.5*Math.cos(deg*Math.PI/180)} y1={20+8.5*Math.sin(deg*Math.PI/180)}
          x2={20+13*Math.cos(deg*Math.PI/180)} y2={20+13*Math.sin(deg*Math.PI/180)}
          stroke={color} strokeWidth="1" opacity="0.4"/>
      ))}
    </g>
  );
  // turnos
  return (
    <g transform={`translate(${cx},${cy})`}>
      <rect x="6" y="8" width="28" height="26" rx="3" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7"/>
      <line x1="6" y1="15" x2="34" y2="15" stroke={color} strokeWidth="1" opacity="0.4"/>
      <rect x="11" y="6" width="4" height="5" rx="1" fill={color} opacity="0.5"/>
      <rect x="25" y="6" width="4" height="5" rx="1" fill={color} opacity="0.5"/>
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={10+(i%3)*8} y={18+Math.floor(i/3)*7} width="5" height="5" rx="1"
          fill={color} opacity={i<2?0.6:0.25}/>
      ))}
    </g>
  );
}

// ── Componente principal ───────────────────────────────────────
export default function ControlRoomScene() {
  const t = useTranslations('room');
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const stageMV = useTransform(
    scrollYProgress,
    [0, S, 2*S, 3*S, 4*S, 5*S, 1],
    [0, 1,  2,   3,   4,   5,  5],
  );
  useMotionValueEvent(stageMV, 'change', (v) =>
    setStage(Math.min(5, Math.max(0, Math.round(v))))
  );

  // Opacidades
  const roomOp    = useTransform(scrollYProgress, [S,        S+0.06          ], [0, 1]);
  const modOp1    = useTransform(scrollYProgress, [S+0.04,   S+0.10          ], [0, 1]);
  const modOp2    = useTransform(scrollYProgress, [2*S,      2*S+0.07        ], [0, 1]);
  const modOp3    = useTransform(scrollYProgress, [3*S,      3*S+0.06        ], [0, 1]);
  const modOp4    = useTransform(scrollYProgress, [3*S+0.05, 3*S+0.11        ], [0, 1]);
  const modOp5    = useTransform(scrollYProgress, [4*S,      4*S+0.07        ], [0, 1]);
  const hubOp     = useTransform(scrollYProgress, [5*S,      5*S+0.06        ], [0, 1]);
  const cableLen  = useTransform(scrollYProgress, [5*S+0.04, Math.min(1, 5*S+0.18)], [0, 1]);
  const glowOp    = useTransform(scrollYProgress, [5*S+0.08, Math.min(1, 5*S+0.20)], [0, 1]);

  // Scales de entrada
  const modScale1 = useTransform(scrollYProgress, [S+0.04,   S+0.12         ], [0.88, 1]);
  const modScale2 = useTransform(scrollYProgress, [2*S,      2*S+0.09       ], [0.88, 1]);
  const modScale3 = useTransform(scrollYProgress, [3*S,      3*S+0.09       ], [0.88, 1]);
  const modScale4 = useTransform(scrollYProgress, [3*S+0.05, 3*S+0.13       ], [0.88, 1]);
  const modScale5 = useTransform(scrollYProgress, [4*S,      4*S+0.09       ], [0.88, 1]);
  const hubScale  = useTransform(scrollYProgress, [5*S,      5*S+0.08       ], [0.7,  1]);

  const glowR     = useTransform(scrollYProgress, [5*S+0.06, Math.min(1, 5*S+0.22)], [30, 70]);
  const glowColor = useMotionTemplate`radial-gradient(circle ${glowR}px at ${HUB.cx}px ${HUB.cy}px, oklch(74% 0.17 200 / 0.20) 0%, transparent 100%)`;

  const stages = t.raw('stages') as StageMeta[];

  return (
    <section ref={containerRef} className="relative h-[500vh]" id="como-funciona">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col lg:flex-row bg-[var(--bg-base)]">

        {/* ── SVG: la sala ───────────────────── */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[50vh] lg:min-h-0">

          {/* Grid de fondo */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${C.cyanFaint} 1px, transparent 1px), linear-gradient(90deg, ${C.cyanFaint} 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Glow dinámico del hub */}
          <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: glowOp }}>
            <motion.div className="w-full h-full" style={{ background: glowColor }} />
          </motion.div>

          {/* SVG room */}
          <svg
            viewBox="0 0 860 540"
            className="w-full h-full max-w-3xl"
            preserveAspectRatio="xMidYMid meet"
            style={{ maxHeight: '85vh', padding: '8px' }}
          >
            <defs>
              {/* Filtro de glow para el hub */}
              <filter id="hub-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              {/* Glow sutil para módulos activos */}
              <filter id="mod-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* ── Paredes de la sala ── */}
            <motion.g style={{ opacity: roomOp }}>
              {/* Piso con borde más visible */}
              <rect x="40" y="30" width="780" height="480" rx="4"
                style={{ fill: C.bgSurface, stroke: C.wall, strokeWidth: 2 }} />
              {/* Sub-grid interior — 2 tonos para profundidad */}
              {Array.from({ length: 18 }, (_, i) => (
                <line key={`v${i}`}
                  x1={80 + i * 40} y1="30" x2={80 + i * 40} y2="510"
                  style={{ stroke: C.grid, strokeWidth: 0.5 }} />
              ))}
              {Array.from({ length: 11 }, (_, i) => (
                <line key={`h${i}`}
                  x1="40" y1={70 + i * 40} x2="820" y2={70 + i * 40}
                  style={{ stroke: C.grid, strokeWidth: 0.5 }} />
              ))}
              {/* Líneas de cuadrícula gruesas cada 120px — da profundidad */}
              {[160,280,400,520,640].map(x => (
                <line key={`vb${x}`} x1={x} y1="30" x2={x} y2="510"
                  style={{ stroke: C.gridBright, strokeWidth: 0.8 }} />
              ))}
              {[150,270,390].map(y => (
                <line key={`hb${y}`} x1="40" y1={y} x2="820" y2={y}
                  style={{ stroke: C.gridBright, strokeWidth: 0.8 }} />
              ))}
              {/* Esquinas — estilo blueprint */}
              {[[36,26],[812,26],[36,506],[812,506]].map(([x,y],i) => (
                <g key={i}>
                  <rect x={x} y={y} width="10" height="10"
                    style={{ fill: C.cyan, opacity: 0.8 }} />
                  {/* Tick lines */}
                  <line x1={x+(i%2===0?12:-14)} y1={y+5} x2={x+(i%2===0?22:-24)} y2={y+5}
                    style={{ stroke: C.cyan, strokeWidth: 1, opacity: 0.4 }} />
                  <line x1={x+5} y1={y+(i<2?12:-14)} x2={x+5} y2={y+(i<2?22:-24)}
                    style={{ stroke: C.cyan, strokeWidth: 1, opacity: 0.4 }} />
                </g>
              ))}
              {/* Label de sala — abajo izquierda */}
              <text x="54" y="525"
                style={{ fill: C.textDim, fontSize: 9.5, fontFamily: 'monospace', letterSpacing: 2 }}>
                ORQUESTA CONTROL ROOM — PLANTA BAJA
              </text>
              {/* Coordenadas de sala — abajo derecha */}
              <text x="810" y="525" textAnchor="end"
                style={{ fill: C.textDim, fontSize: 9, fontFamily: 'monospace' }}>
                REV 2.1 — 2024
              </text>
            </motion.g>

            {/* ── Módulo: Mi Mostrador ── */}
            <motion.g style={{ opacity: modOp1, scale: modScale1, transformOrigin: '160px 130px' }}>
              <RoomModule m={MODULES.mostrador} />
            </motion.g>

            {/* ── Módulo: Bots ── */}
            <motion.g style={{ opacity: modOp2, scale: modScale2, transformOrigin: '700px 130px' }}>
              <RoomModule m={MODULES.bots} />
            </motion.g>

            {/* ── Módulo: Llamadas ── */}
            <motion.g style={{ opacity: modOp3, scale: modScale3, transformOrigin: '160px 400px' }}>
              <RoomModule m={MODULES.llamadas} />
            </motion.g>

            {/* ── Módulo: Recepción ── */}
            <motion.g style={{ opacity: modOp4, scale: modScale4, transformOrigin: '700px 400px' }}>
              <RoomModule m={MODULES.recepcion} />
            </motion.g>

            {/* ── Módulo: Turnos ── */}
            <motion.g style={{ opacity: modOp5, scale: modScale5, transformOrigin: '430px 465px' }}>
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
                    stroke: MODULES[key].color,
                    strokeWidth: 1.5,
                    strokeDasharray: '6 4',
                    pathLength: cableLen,
                    opacity: 0.65,
                  }}
                />
              ))}
            </motion.g>

            {/* ── Hub central: Orquesta ── */}
            <motion.g
              style={{ opacity: hubOp, scale: hubScale, transformOrigin: `${HUB.cx}px ${HUB.cy}px` }}
              filter="url(#hub-glow)"
            >
              {/* Anillo exterior tenue */}
              <circle cx={HUB.cx} cy={HUB.cy} r="64"
                style={{ fill: 'oklch(74% 0.17 200 / 0.05)', stroke: C.cyan, strokeWidth: 1, strokeDasharray: '4 6' }} />
              {/* Anillo medio */}
              <circle cx={HUB.cx} cy={HUB.cy} r="46"
                style={{ fill: 'oklch(74% 0.17 200 / 0.08)', stroke: C.cyan, strokeWidth: 1.5 }} />
              {/* Núcleo */}
              <circle cx={HUB.cx} cy={HUB.cy} r="30"
                style={{ fill: C.bgRaised, stroke: C.cyan, strokeWidth: 2 }} />
              {/* Letra O */}
              <text x={HUB.cx} y={HUB.cy + 8} textAnchor="middle"
                style={{ fill: C.cyan, fontSize: 24, fontWeight: 'bold', fontFamily: 'system-ui' }}>
                O
              </text>
              {/* Label bajo el hub */}
              <text x={HUB.cx} y={HUB.cy + 78} textAnchor="middle"
                style={{ fill: C.textSub, fontSize: 9, fontFamily: 'monospace', letterSpacing: 2 }}>
                ORQUESTA ENGINE
              </text>
            </motion.g>

            {/* ── Nodos de conexión en módulos ── */}
            <motion.g style={{ opacity: hubOp }}>
              {[
                { cx: 160, cy: 130, c: C.mostrador },
                { cx: 700, cy: 130, c: C.bots },
                { cx: 160, cy: 400, c: C.llamadas },
                { cx: 700, cy: 400, c: C.recepcion },
                { cx: 430, cy: 420, c: C.turnos },
              ].map((n, i) => (
                <g key={i}>
                  {/* Halo */}
                  <circle cx={n.cx} cy={n.cy} r="9"
                    style={{ fill: n.c.replace(')', ' / 0.15)'), stroke: n.c, strokeWidth: 1, opacity: 0.7 }} />
                  {/* Dot */}
                  <circle cx={n.cx} cy={n.cy} r="4"
                    style={{ fill: n.c, opacity: 0.95 }} />
                </g>
              ))}
            </motion.g>

          </svg>

          {/* Label inicial — solo en stage 0, antes de que empiece el scroll */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]),
            }}
          >
            <p className="text-[10px] tracking-[0.22em] uppercase font-mono text-center"
              style={{ color: C.textSub }}>
              {t('buildingLabel')}
            </p>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-6"
              style={{ background: `linear-gradient(to bottom, ${C.cyan}, transparent)` }}
            />
          </motion.div>
        </div>

        {/* ── Panel de texto ───────────────── */}
        <div className="lg:w-[400px] flex flex-col justify-center px-6 py-8 lg:px-12 border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] bg-[oklch(9%_0.009_260/0.85)] relative overflow-hidden">

          {/* Progreso visual */}
          <div className="flex gap-1.5 mb-8">
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

          {/* Texto del stage */}
          <div className="relative min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-3"
                  style={{ color: getStageColor(stage) }}>
                  {stages[stage]?.label}
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] leading-[1.05] mb-4 whitespace-pre-line tracking-tight">
                  {stages[stage]?.heading}
                </h2>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xs">
                  {stages[stage]?.body}
                </p>
                {stages[stage]?.cta && (
                  <div className="mt-7">
                    <Button variant="amber" size="md">
                      {stages[stage].cta}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Número del stage */}
          <div className="absolute bottom-6 right-8 font-mono text-[11px] text-[var(--text-tertiary)]">
            {String(stage + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}
          </div>

          {/* Línea lateral decorativa */}
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
  const isWide = m.w >= 200;
  const barCount = isWide ? 4 : 2;
  const barWidths = [62, 88, 44, 74];
  // Centro del módulo para el icono
  const iconX = m.x + m.w - 32;
  const iconY = m.y + (isWide ? 50 : 38);
  // Área de contenido (barras)
  const contentY = m.y + 18;
  const screenH = isWide ? 72 : 48;

  return (
    <>
      {/* Sombra ambiental del módulo */}
      <rect
        x={m.x + 4} y={m.y + 4} width={m.w} height={m.h} rx="7"
        style={{ fill: m.color.replace(')', ' / 0.08)'), filter: 'blur(8px)' }}
      />

      {/* Caja exterior */}
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx="6"
        style={{
          fill: 'oklch(12% 0.013 260)',
          stroke: m.color.replace(')', ' / 0.5)'),
          strokeWidth: 1.5,
        }}
      />

      {/* Borde superior — highlight */}
      <rect x={m.x + 1} y={m.y + 1} width={m.w - 2} height="1" rx="1"
        style={{ fill: m.color.replace(')', ' / 0.3)') }}
      />

      {/* Pantalla interior */}
      <rect x={m.x+10} y={contentY} width={m.w-20} height={screenH} rx="4"
        style={{
          fill: m.color.replace(')', ' / 0.08)'),
          stroke: m.color.replace(')', ' / 0.15)'),
          strokeWidth: 1,
        }}
      />

      {/* Barras de contenido */}
      {Array.from({ length: barCount }, (_, i) => (
        <rect
          key={i}
          x={m.x + 16}
          y={contentY + 10 + i * 15}
          width={(m.w - 36) * barWidths[i] / 100}
          height={8}
          rx="4"
          style={{
            fill: m.color.replace(')', ` / ${0.55 - i * 0.1})`),
          }}
        />
      ))}

      {/* Icono SVG del servicio — esquina superior derecha de la pantalla */}
      <ModuleIcon type={m.icon} color={m.color} x={iconX} y={iconY} />

      {/* Separador horizontal */}
      <line
        x1={m.x + 10} y1={m.y + screenH + contentY - m.y + 4}
        x2={m.x + m.w - 10} y2={m.y + screenH + contentY - m.y + 4}
        style={{ stroke: m.color.replace(')', ' / 0.15)'), strokeWidth: 1 }}
      />

      {/* Dot de estado */}
      <circle cx={m.x + 18} cy={m.y + m.h - 18} r="4.5"
        style={{ fill: m.color, opacity: 0.9 }} />
      {/* Halo del dot */}
      <circle cx={m.x + 18} cy={m.y + m.h - 18} r="8"
        style={{ fill: 'none', stroke: m.color, strokeWidth: 1, opacity: 0.25 }} />

      {/* Label del módulo */}
      <text x={m.x + 32} y={m.y + m.h - 14}
        style={{ fill: 'oklch(70% 0.01 260)', fontSize: 11, fontFamily: 'monospace', fontWeight: 500 }}>
        {m.label}
      </text>
    </>
  );
}

// ── Helper: color por stage ────────────────────────────────────
function getStageColor(s: number): string {
  const colors = [C.cyan, C.mostrador, C.bots, C.llamadas, C.turnos, C.cyan];
  return colors[s] ?? C.cyan;
}
