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

/* ── 7 etapas de scroll ───────────────────────────────────────── */
const S = 1 / 7;

/* ── Paleta ───────────────────────────────────────────────────── */
const C = {
  bgRaised:  'oklch(16% 0.014 260)',
  cyanFaint: 'oklch(74% 0.17 200 / 0.06)',
  cyan:      'oklch(74% 0.17 200)',
  mostrador: 'oklch(72% 0.16 200)',
  bots:      'oklch(70% 0.15 280)',
  llamadas:  'oklch(75% 0.17 145)',
  recepcion: 'oklch(73% 0.16 25)',
  turnos:    'oklch(74% 0.15 320)',
  sitios:    'oklch(78% 0.16 55)',
  textSub:   'oklch(62% 0.01 260)',
  textMed:   'oklch(72% 0.01 260)',
};

/* ── Módulos — constelación asimétrica ────────────────────────── */
/* SVG viewBox: 0 0 860 540 */
const MODULES = {
  mostrador: { x: 45,  y: 38,  w: 185, h: 130, color: C.mostrador, label: 'Mi Mostrador', icon: 'mostrador' },
  bots:      { x: 618, y: 52,  w: 185, h: 130, color: C.bots,      label: 'Bots web',     icon: 'bots'      },
  llamadas:  { x: 28,  y: 318, w: 182, h: 125, color: C.llamadas,  label: 'Llamadas',     icon: 'llamadas'  },
  recepcion: { x: 628, y: 308, w: 182, h: 125, color: C.recepcion, label: 'Recepción',    icon: 'recepcion' },
  turnos:    { x: 305, y: 418, w: 175, h: 88,  color: C.turnos,    label: 'Turnos',       icon: 'turnos'    },
  sitios:    { x: 580, y: 390, w: 190, h: 120, color: C.sitios,    label: 'Sitios web',   icon: 'sitios'    },
} as const;

const HUB = { cx: 430, cy: 270 };

/* ── Cables: bezier desde centro del módulo al hub ────────────── */
const CABLES = {
  mostrador: `M137,103 C137,188 ${HUB.cx},185 ${HUB.cx},${HUB.cy}`,
  bots:      `M711,117 C711,192 ${HUB.cx},190 ${HUB.cx},${HUB.cy}`,
  llamadas:  `M119,381 C119,316 ${HUB.cx},316 ${HUB.cx},${HUB.cy}`,
  recepcion: `M719,371 C719,314 ${HUB.cx},314 ${HUB.cx},${HUB.cy}`,
  turnos:    `M393,462 C393,382 ${HUB.cx},370 ${HUB.cx},${HUB.cy}`,
  sitios:    `M675,450 C675,384 ${HUB.cx},378 ${HUB.cx},${HUB.cy}`,
} as const;

type CableKey = keyof typeof CABLES;

/* Puntos de conexión al inicio de cada cable */
const NODES: Record<CableKey, { cx: number; cy: number }> = {
  mostrador: { cx: 137, cy: 103 },
  bots:      { cx: 711, cy: 117 },
  llamadas:  { cx: 119, cy: 381 },
  recepcion: { cx: 719, cy: 371 },
  turnos:    { cx: 393, cy: 462 },
  sitios:    { cx: 675, cy: 450 },
};

/* Duración de animación de partícula por cable */
const CABLE_DUR: Record<CableKey, number> = {
  mostrador: 2.8,
  bots:      3.1,
  llamadas:  2.6,
  recepcion: 3.3,
  turnos:    2.9,
  sitios:    3.0,
};

type StageMeta = { label: string; heading: string; body: string; cta?: string };

/* ── Plasma ball — datos pre-computados (IIFE) ─────────────────── */
const PLASMA_RAYS = (() => {
  const cx = 430, cy = 270, r = 68;
  return Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const ex    = +(cx + r * Math.cos(angle)).toFixed(1);
    const ey    = +(cy + r * Math.sin(angle)).toFixed(1);
    const cpA   = angle + (i % 2 === 0 ? 0.5 : -0.45);
    const cpR   = 28 + (i % 3) * 9;
    const cpX   = +(cx + cpR * Math.cos(cpA)).toFixed(1);
    const cpY   = +(cy + cpR * Math.sin(cpA)).toFixed(1);
    const t     = 0.55;
    const bmX   = +((1-t)*(1-t)*cx + 2*(1-t)*t*cpX + t*t*ex).toFixed(1);
    const bmY   = +((1-t)*(1-t)*cy + 2*(1-t)*t*cpY + t*t*ey).toFixed(1);
    const baA   = angle + 1.2 + (i % 2 === 0 ? 0.3 : -0.3);
    const beX   = +(bmX + 14 * Math.cos(baA)).toFixed(1);
    const beY   = +(bmY + 14 * Math.sin(baA)).toFixed(1);
    return {
      d:     `M${cx},${cy} Q${cpX},${cpY} ${ex},${ey}`,
      bx1: bmX, by1: bmY, bx2: beX, by2: beY,
      sw:    +(0.7 + (i % 4) * 0.28).toFixed(2),
      delay: +(i * 0.31).toFixed(2),
      dur:   +(2.1 + (i % 5) * 0.38).toFixed(2),
      color: i % 3 === 0 ? 'oklch(85% 0.15 280)' : 'oklch(74% 0.17 200)',
    };
  });
})();

const PLASMA_PARTICLES = (() => {
  const cx = 430, cy = 270;
  return Array.from({ length: 15 }, (_, i) => {
    const angle = (i / 15) * Math.PI * 2 + i * 0.4;
    const rad   = 42 + (i % 5) * 4;
    return {
      x:     +(cx + rad * Math.cos(angle)).toFixed(2),
      y:     +(cy + rad * Math.sin(angle)).toFixed(2),
      r:     1.5 + (i % 2),
      delay: +(i * 0.18).toFixed(2),
      dur:   +(1.8 + (i % 3) * 0.5).toFixed(2),
    };
  });
})();

/* ── Iconos SVG por tipo de módulo ────────────────────────────── */
function ModuleIcon({ type, color, x, y }: { type: string; color: string; x: number; y: number }) {
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
      <line x1="8"  y1="28" x2="12" y2="28" stroke={color} strokeWidth="1.2" opacity="0.3"/>
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
      <circle cx="20" cy="20" r="7"  fill="none" stroke={color} strokeWidth="1.2" opacity="0.5"/>
      <circle cx="20" cy="20" r="2.5" fill={color} opacity="0.8"/>
      {[0,72,144,216,288].map(deg => (
        <line key={deg}
          x1={20+8.5*Math.cos(deg*Math.PI/180)} y1={20+8.5*Math.sin(deg*Math.PI/180)}
          x2={20+13*Math.cos(deg*Math.PI/180)}  y2={20+13*Math.sin(deg*Math.PI/180)}
          stroke={color} strokeWidth="1" opacity="0.4"/>
      ))}
    </g>
  );
  if (type === 'sitios') return (
    <g transform={`translate(${cx},${cy})`}>
      {/* Ventana de browser */}
      <rect x="2" y="4" width="36" height="28" rx="3" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7"/>
      <rect x="2" y="4" width="36" height="9"  rx="3" fill={color} opacity="0.15"/>
      <rect x="2" y="11" width="36" height="2" fill={color} opacity="0.08"/>
      <circle cx="8"  cy="9" r="2" fill="rgba(255,95,87,0.85)"/>
      <circle cx="15" cy="9" r="2" fill="rgba(255,189,46,0.85)"/>
      <circle cx="22" cy="9" r="2" fill="rgba(40,200,64,0.85)"/>
      <rect x="6" y="17" width="24" height="3"   rx="1.5" fill={color} opacity="0.7"/>
      <rect x="6" y="23" width="18" height="2.5" rx="1.5" fill={color} opacity="0.4"/>
      <rect x="6" y="28" width="13" height="2.5" rx="1.5" fill={color} opacity="0.25"/>
    </g>
  );
  /* default — turnos */
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

/* ══════════════════════════════════════════════════════════════════
   ControlRoomScene — HUD espacial
══════════════════════════════════════════════════════════════════ */
export default function ControlRoomScene() {
  const t = useTranslations('room');
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  /* Mapeo scroll → índice de etapa */
  const stageMV = useTransform(
    scrollYProgress,
    [0, S, 2*S, 3*S, 4*S, 5*S, 6*S, 1],
    [0, 1,  2,   3,   4,   5,   6,  6],
  );
  useMotionValueEvent(stageMV, 'change', (v) =>
    setStage(Math.min(6, Math.max(0, Math.round(v))))
  );

  /* Opacidades de aparición */
  const modOp1   = useTransform(scrollYProgress, [S+0.04,   S+0.10         ], [0, 1]);
  const modOp2   = useTransform(scrollYProgress, [2*S,      2*S+0.07       ], [0, 1]);
  const modOp3   = useTransform(scrollYProgress, [3*S,      3*S+0.06       ], [0, 1]);
  const modOp4   = useTransform(scrollYProgress, [3*S+0.05, 3*S+0.11       ], [0, 1]);
  const modOp5   = useTransform(scrollYProgress, [4*S,      4*S+0.07       ], [0, 1]);
  const modOp6   = useTransform(scrollYProgress, [5*S,      5*S+0.07       ], [0, 1]);
  const hubOp    = useTransform(scrollYProgress, [6*S,      6*S+0.06       ], [0, 1]);
  const cableLen = useTransform(scrollYProgress, [6*S+0.04, Math.min(1, 6*S+0.18)], [0, 1]);
  const glowOp   = useTransform(scrollYProgress, [6*S+0.08, Math.min(1, 6*S+0.20)], [0, 1]);

  /* Escalas de entrada */
  const modScale1 = useTransform(scrollYProgress, [S+0.04,   S+0.12        ], [0.85, 1]);
  const modScale2 = useTransform(scrollYProgress, [2*S,      2*S+0.09      ], [0.85, 1]);
  const modScale3 = useTransform(scrollYProgress, [3*S,      3*S+0.09      ], [0.85, 1]);
  const modScale4 = useTransform(scrollYProgress, [3*S+0.05, 3*S+0.13      ], [0.85, 1]);
  const modScale5 = useTransform(scrollYProgress, [4*S,      4*S+0.09      ], [0.85, 1]);
  const modScale6 = useTransform(scrollYProgress, [5*S,      5*S+0.09      ], [0.85, 1]);
  const hubScale  = useTransform(scrollYProgress, [6*S,      6*S+0.08      ], [0.7,  1]);

  /* Glow del hub */
  const glowR     = useTransform(scrollYProgress, [6*S+0.06, Math.min(1, 6*S+0.22)], [30, 70]);
  const glowColor = useMotionTemplate`radial-gradient(circle ${glowR}px at ${HUB.cx}px ${HUB.cy}px, oklch(74% 0.17 200 / 0.20) 0%, transparent 100%)`;

  const stages = t.raw('stages') as StageMeta[];

  return (
    <section ref={containerRef} className="relative h-[600vh]" id="como-funciona">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col lg:flex-row">

        {/* ── Panel SVG — fondo transparente, GlobalBackground visible ── */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[50vh] lg:min-h-0">

          {/* Glow central del hub */}
          <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: glowOp }}>
            <motion.div className="w-full h-full" style={{ background: glowColor }} />
          </motion.div>

          <svg
            viewBox="0 0 860 540"
            className="w-full h-full max-w-3xl"
            preserveAspectRatio="xMidYMid meet"
            style={{ maxHeight: '85vh', padding: '8px' }}
          >
            <defs>
              {/* Paths de referencia para offsetPath de partículas */}
              {(Object.keys(CABLES) as CableKey[]).map((key) => (
                <path key={key} id={`cp-${key}`} d={CABLES[key]} fill="none" />
              ))}

              {/* Filtros */}
              <filter id="hub-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="plasma-blur" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="10"/>
              </filter>
              <filter id="mod-shadow" x="-15%" y="-15%" width="130%" height="130%">
                <feGaussianBlur stdDeviation="5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>

              {/* Gradientes plasma */}
              <radialGradient id="plasma-sphere-grad" gradientUnits="userSpaceOnUse"
                cx="430" cy="270" r="70" fx="412" fy="248">
                <stop offset="0%"   stopColor="oklch(74% 0.17 200)" stopOpacity="0.42"/>
                <stop offset="55%"  stopColor="oklch(74% 0.17 200)" stopOpacity="0.22"/>
                <stop offset="100%" stopColor="oklch(74% 0.17 200)" stopOpacity="0.10"/>
              </radialGradient>
              <linearGradient id="plasma-glass" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="white" stopOpacity="0.22"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
              </linearGradient>
              <radialGradient id="plasma-inner-grad" gradientUnits="userSpaceOnUse"
                cx="430" cy="270" r="65">
                <stop offset="0%"   stopColor="oklch(10% 0.01 260)" stopOpacity="0.95"/>
                <stop offset="70%"  stopColor="oklch(8% 0.008 260)" stopOpacity="0.88"/>
                <stop offset="100%" stopColor="oklch(6% 0.006 260)" stopOpacity="0.20"/>
              </radialGradient>
              <radialGradient id="plasma-core-grad" gradientUnits="userSpaceOnUse"
                cx="430" cy="270" r="10">
                <stop offset="0%"   stopColor="white"               stopOpacity="1"/>
                <stop offset="40%"  stopColor="oklch(74% 0.17 200)" stopOpacity="1"/>
                <stop offset="100%" stopColor="oklch(74% 0.17 200)" stopOpacity="0.2"/>
              </radialGradient>

              {/* Animaciones CSS — off JS thread */}
              <style>{`
                @keyframes plasma-outer {
                  0%,100% { transform: scale(0.93); opacity: 0.25; }
                  50%     { transform: scale(1.07); opacity: 0.55; }
                }
                @keyframes plasma-core-k {
                  0%,100% { transform: scale(0.75); }
                  50%     { transform: scale(1.30); }
                }
                @keyframes particle-flow {
                  from { offset-distance: 0%; }
                  to   { offset-distance: 100%; }
                }
                @keyframes dot-pulse {
                  0%, 100% { transform: scale(1);   opacity: 0.3; }
                  50%      { transform: scale(2.4);  opacity: 0;   }
                }
                .plasma-outer-glow {
                  animation: plasma-outer 2.2s ease-in-out infinite;
                  transform-box: fill-box; transform-origin: center;
                }
                .plasma-core-pulse {
                  animation: plasma-core-k 1.5s ease-in-out infinite;
                  transform-box: fill-box; transform-origin: center;
                }
                .dot-ring {
                  animation: dot-pulse 2s ease-out infinite;
                  transform-box: fill-box; transform-origin: center;
                }
              `}</style>
            </defs>

            {/* ── Módulo 1: Mi Mostrador ── */}
            <motion.g style={{ opacity: modOp1, scale: modScale1, transformOrigin: '137px 103px' }}>
              <HudModule m={MODULES.mostrador} />
            </motion.g>

            {/* ── Módulo 2: Bots ── */}
            <motion.g style={{ opacity: modOp2, scale: modScale2, transformOrigin: '711px 117px' }}>
              <HudModule m={MODULES.bots} />
            </motion.g>

            {/* ── Módulo 3: Llamadas ── */}
            <motion.g style={{ opacity: modOp3, scale: modScale3, transformOrigin: '119px 381px' }}>
              <HudModule m={MODULES.llamadas} />
            </motion.g>

            {/* ── Módulo 4: Recepción ── */}
            <motion.g style={{ opacity: modOp4, scale: modScale4, transformOrigin: '719px 371px' }}>
              <HudModule m={MODULES.recepcion} />
            </motion.g>

            {/* ── Módulo 5: Turnos ── */}
            <motion.g style={{ opacity: modOp5, scale: modScale5, transformOrigin: '393px 462px' }}>
              <HudModule m={MODULES.turnos} />
            </motion.g>

            {/* ── Módulo 6: Sitios web ── */}
            <motion.g style={{ opacity: modOp6, scale: modScale6, transformOrigin: '675px 450px' }}>
              <HudModule m={MODULES.sitios} />
            </motion.g>

            {/* ── Cables + partículas de energía ── */}
            <motion.g style={{ opacity: hubOp }}>
              {(Object.keys(CABLES) as CableKey[]).map((key) => (
                <g key={key}>
                  {/* Línea base semitransparente */}
                  <motion.path
                    d={CABLES[key]}
                    fill="none"
                    style={{
                      stroke: MODULES[key].color,
                      strokeWidth: 1,
                      opacity: 0.18,
                      pathLength: cableLen,
                    }}
                  />
                  {/* 3 partículas fluyendo por CSS offset-path (off JS thread) */}
                  {[0, 1, 2].map((pi) => (
                    <circle
                      key={pi}
                      r="2.5"
                      fill={MODULES[key].color}
                      style={{
                        offsetPath: `url(#cp-${key})`,
                        offsetDistance: '0%',
                        animationName: 'particle-flow',
                        animationDuration: `${CABLE_DUR[key]}s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        animationDelay: `${(pi * CABLE_DUR[key] / 3).toFixed(2)}s`,
                        opacity: 0.9,
                        willChange: 'offset-distance',
                      } as React.CSSProperties}
                    />
                  ))}
                  {/* Nodo en el extremo del módulo (halo pulsante) */}
                  <circle
                    cx={NODES[key].cx} cy={NODES[key].cy} r="9"
                    fill="transparent"
                    stroke={MODULES[key].color} strokeWidth="1"
                    className="dot-ring"
                  />
                  <circle
                    cx={NODES[key].cx} cy={NODES[key].cy} r="3.5"
                    fill={MODULES[key].color} opacity="0.9"
                  />
                </g>
              ))}
            </motion.g>

            {/* ── PLASMA BALL HUB — sin cambios ── */}
            <motion.g
              style={{ opacity: hubOp, scale: hubScale, transformOrigin: `${HUB.cx}px ${HUB.cy}px` }}
            >
              <circle cx={HUB.cx} cy={HUB.cy} r="85"
                className="plasma-outer-glow"
                style={{ fill: 'oklch(74% 0.17 200 / 0.18)', filter: 'url(#plasma-blur)' }}
              />
              <circle cx={HUB.cx} cy={HUB.cy} r="70"
                style={{ fill: 'url(#plasma-sphere-grad)', stroke: 'oklch(74% 0.17 200 / 0.6)', strokeWidth: 1.5 }}
              />
              <circle cx={HUB.cx} cy={HUB.cy} r="65"
                style={{ fill: 'url(#plasma-inner-grad)' }}
              />
              {PLASMA_RAYS.map((ray, i) => (
                <g key={i}>
                  <motion.path
                    d={ray.d}
                    fill="none"
                    stroke={ray.color}
                    strokeWidth={ray.sw}
                    strokeLinecap="round"
                    animate={{ opacity: [0, 0.9, 0.3, 1, 0.05, 0] }}
                    transition={{ duration: ray.dur, repeat: Infinity, delay: ray.delay, ease: 'easeInOut' }}
                  />
                  <motion.path
                    d={`M${ray.bx1},${ray.by1} L${ray.bx2},${ray.by2}`}
                    fill="none"
                    stroke={ray.color}
                    strokeWidth={+(ray.sw * 0.6).toFixed(2)}
                    strokeLinecap="round"
                    animate={{ opacity: [0, 0.7, 0.15, 0.8, 0] }}
                    transition={{ duration: ray.dur * 0.8, repeat: Infinity, delay: ray.delay + 0.12, ease: 'easeInOut' }}
                  />
                </g>
              ))}
              {PLASMA_PARTICLES.map((p, i) => (
                <motion.circle
                  key={i}
                  cx={p.x} cy={p.y} r={p.r}
                  style={{ fill: i % 3 === 0 ? 'white' : 'oklch(74% 0.17 200)' }}
                  animate={{ opacity: [0.15, 0.9, 0.25, 0.8, 0.1] }}
                  transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                />
              ))}
              <ellipse cx={HUB.cx - 20} cy={HUB.cy - 24} rx="18" ry="11"
                style={{ fill: 'url(#plasma-glass)', opacity: 0.55 }}
              />
              <circle cx={HUB.cx} cy={HUB.cy} r="10"
                className="plasma-core-pulse"
                style={{ fill: 'url(#plasma-core-grad)', filter: 'url(#hub-glow)' }}
              />
              <text x={HUB.cx} y={HUB.cy + 88} textAnchor="middle"
                style={{ fill: C.textSub, fontSize: 9, fontFamily: 'monospace', letterSpacing: 2 }}>
                ORQUESTA ENGINE
              </text>
            </motion.g>
          </svg>

          {/* Scroll hint */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
            style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]) }}
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

        {/* ── Panel derecho: texto del stage ────────────────────── */}
        <div className="lg:w-[400px] flex flex-col justify-center px-6 py-8 lg:px-12 border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] bg-[oklch(9%_0.009_260/0.85)] relative overflow-hidden">
          <div className="flex gap-1.5 mb-8">
            {stages.map((_, i) => (
              <div
                key={i}
                className="h-0.5 flex-1 rounded-full transition-all duration-500"
                style={{ backgroundColor: i <= stage ? getStageColor(i) : 'oklch(20% 0.01 260)' }}
              />
            ))}
          </div>

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

          <div className="absolute bottom-6 right-8 font-mono text-[11px] text-[var(--text-tertiary)]">
            {String(stage + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}
          </div>
          <div
            className="absolute left-0 top-1/4 bottom-1/4 w-px transition-colors duration-700"
            style={{ backgroundColor: getStageColor(stage), opacity: 0.4 }}
          />
        </div>
      </div>
    </section>
  );
}

/* ── HudModule — card glassmorphism ───────────────────────────── */
interface ModuleDef {
  x: number; y: number; w: number; h: number;
  color: string; icon: string; label: string;
}

function HudModule({ m }: { m: ModuleDef }) {
  const isWide   = m.w >= 175;
  const barCount = isWide ? 4 : 2;
  const barWidths = [62, 88, 44, 74];
  const iconX    = m.x + m.w - 32;
  const iconY    = m.y + (isWide ? 50 : 38);
  const contentY = m.y + 20;
  const screenH  = isWide ? 68 : 44;

  return (
    <>
      {/* Sombra de glow detrás */}
      <rect x={m.x + 3} y={m.y + 3} width={m.w} height={m.h} rx="8"
        style={{ fill: m.color.replace(')', ' / 0.12)'), filter: 'url(#mod-shadow)' }}
      />
      {/* Fondo glassmorphism: oklch(10% 0.012 260 / 0.7) */}
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx="7"
        style={{ fill: 'oklch(10% 0.012 260 / 0.7)', stroke: m.color.replace(')', ' / 0.4)'), strokeWidth: 1 }}
      />
      {/* Línea superior de acento */}
      <rect x={m.x} y={m.y} width={m.w} height="2" rx="1"
        style={{ fill: m.color, opacity: 0.75 }}
      />
      {/* Highlight interior tenue */}
      <rect x={m.x + 1} y={m.y + 1} width={m.w - 2} height="1" rx="0.5"
        style={{ fill: 'white', opacity: 0.07 }}
      />
      {/* Área de datos */}
      <rect x={m.x + 10} y={contentY} width={m.w - 20} height={screenH} rx="4"
        style={{ fill: m.color.replace(')', ' / 0.06)'), stroke: m.color.replace(')', ' / 0.12)'), strokeWidth: 0.8 }}
      />
      {/* Barras de actividad */}
      {Array.from({ length: barCount }, (_, i) => (
        <rect key={i}
          x={m.x + 16} y={contentY + 10 + i * 14}
          width={(m.w - 36) * barWidths[i] / 100} height={7} rx="3.5"
          style={{ fill: m.color.replace(')', ` / ${0.55 - i * 0.1})`) }}
        />
      ))}
      {/* Icono */}
      <ModuleIcon type={m.icon} color={m.color} x={iconX} y={iconY} />
      {/* Separador */}
      <line
        x1={m.x + 10} y1={m.y + screenH + contentY - m.y + 4}
        x2={m.x + m.w - 10} y2={m.y + screenH + contentY - m.y + 4}
        style={{ stroke: m.color.replace(')', ' / 0.12)'), strokeWidth: 0.8 }}
      />
      {/* Dot de estado */}
      <circle cx={m.x + 18} cy={m.y + m.h - 18} r="4.5"
        style={{ fill: m.color, opacity: 0.9 }}
      />
      <circle cx={m.x + 18} cy={m.y + m.h - 18} r="9"
        fill="transparent"
        style={{ stroke: m.color, strokeWidth: 1 }}
        className="dot-ring"
      />
      {/* Label */}
      <text x={m.x + 32} y={m.y + m.h - 14}
        style={{ fill: C.textMed, fontSize: 11, fontFamily: 'monospace', fontWeight: 500 }}>
        {m.label}
      </text>
    </>
  );
}

/* ── Color por etapa ──────────────────────────────────────────── */
function getStageColor(s: number): string {
  const colors = [C.cyan, C.mostrador, C.bots, C.llamadas, C.turnos, C.sitios, C.cyan];
  return colors[s] ?? C.cyan;
}
