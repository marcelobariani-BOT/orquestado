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

const MODULES = {
  mostrador: { x: 60,  y: 60,  w: 200, h: 140, color: C.mostrador, label: 'Mi Mostrador', icon: 'mostrador' },
  bots:      { x: 600, y: 60,  w: 200, h: 140, color: C.bots,      label: 'Bots web',     icon: 'bots' },
  llamadas:  { x: 60,  y: 330, w: 200, h: 140, color: C.llamadas,  label: 'Llamadas',     icon: 'llamadas' },
  recepcion: { x: 600, y: 330, w: 200, h: 140, color: C.recepcion, label: 'Recepción',    icon: 'recepcion' },
  turnos:    { x: 330, y: 420, w: 200, h: 90,  color: C.turnos,    label: 'Turnos',       icon: 'turnos' },
} as const;

const HUB = { cx: 430, cy: 270 };

const CABLES = {
  mostrador: `M160,130 C160,210 ${HUB.cx},200 ${HUB.cx},${HUB.cy}`,
  bots:      `M700,130 C700,210 ${HUB.cx},200 ${HUB.cx},${HUB.cy}`,
  llamadas:  `M160,400 C160,330 ${HUB.cx},340 ${HUB.cx},${HUB.cy}`,
  recepcion: `M700,400 C700,330 ${HUB.cx},340 ${HUB.cx},${HUB.cy}`,
  turnos:    `M430,420 C430,380 ${HUB.cx},360 ${HUB.cx},${HUB.cy}`,
} as const;

type StageMeta = { label: string; heading: string; body: string; cta?: string };

// ── Plasma ball — datos pre-computados (IIFE, mismos en server y client) ───
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

  const roomOp    = useTransform(scrollYProgress, [S,        S+0.06          ], [0, 1]);
  const modOp1    = useTransform(scrollYProgress, [S+0.04,   S+0.10          ], [0, 1]);
  const modOp2    = useTransform(scrollYProgress, [2*S,      2*S+0.07        ], [0, 1]);
  const modOp3    = useTransform(scrollYProgress, [3*S,      3*S+0.06        ], [0, 1]);
  const modOp4    = useTransform(scrollYProgress, [3*S+0.05, 3*S+0.11        ], [0, 1]);
  const modOp5    = useTransform(scrollYProgress, [4*S,      4*S+0.07        ], [0, 1]);
  const hubOp     = useTransform(scrollYProgress, [5*S,      5*S+0.06        ], [0, 1]);
  const cableLen  = useTransform(scrollYProgress, [5*S+0.04, Math.min(1, 5*S+0.18)], [0, 1]);
  const glowOp    = useTransform(scrollYProgress, [5*S+0.08, Math.min(1, 5*S+0.20)], [0, 1]);

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

        <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[50vh] lg:min-h-0">
          <div className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${C.cyanFaint} 1px, transparent 1px), linear-gradient(90deg, ${C.cyanFaint} 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />

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
              {/* Filtro glow original */}
              <filter id="hub-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              {/* Filtro blur suave para halo exterior */}
              <filter id="plasma-blur" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="10"/>
              </filter>
              {/* Gradiente esfera exterior — efecto vidrio cian */}
              <radialGradient id="plasma-sphere-grad" gradientUnits="userSpaceOnUse"
                cx="430" cy="270" r="70" fx="412" fy="248">
                <stop offset="0%"   stopColor="oklch(74% 0.17 200)" stopOpacity="0.42"/>
                <stop offset="55%"  stopColor="oklch(74% 0.17 200)" stopOpacity="0.22"/>
                <stop offset="100%" stopColor="oklch(74% 0.17 200)" stopOpacity="0.10"/>
              </radialGradient>
              {/* Gradiente reflejo specular (highlight vidrio) */}
              <linearGradient id="plasma-glass" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="white" stopOpacity="0.22"/>
                <stop offset="100%" stopColor="white" stopOpacity="0"/>
              </linearGradient>
              {/* Gradiente interior oscuro (profundidad) */}
              <radialGradient id="plasma-inner-grad" gradientUnits="userSpaceOnUse"
                cx="430" cy="270" r="65">
                <stop offset="0%"   stopColor="oklch(10% 0.01 260)" stopOpacity="0.95"/>
                <stop offset="70%"  stopColor="oklch(8% 0.008 260)" stopOpacity="0.88"/>
                <stop offset="100%" stopColor="oklch(6% 0.006 260)" stopOpacity="0.20"/>
              </radialGradient>
              {/* Gradiente núcleo central */}
              <radialGradient id="plasma-core-grad" gradientUnits="userSpaceOnUse"
                cx="430" cy="270" r="10">
                <stop offset="0%"   stopColor="white"                stopOpacity="1"/>
                <stop offset="40%"  stopColor="oklch(74% 0.17 200)"  stopOpacity="1"/>
                <stop offset="100%" stopColor="oklch(74% 0.17 200)"  stopOpacity="0.2"/>
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
                .plasma-outer-glow {
                  animation: plasma-outer 2.2s ease-in-out infinite;
                  transform-box: fill-box;
                  transform-origin: center;
                }
                .plasma-core-pulse {
                  animation: plasma-core-k 1.5s ease-in-out infinite;
                  transform-box: fill-box;
                  transform-origin: center;
                }
              `}</style>
            </defs>

            <motion.g style={{ opacity: roomOp }}>
              <rect x="40" y="30" width="780" height="480" rx="4"
                style={{ fill: C.bgSurface, stroke: C.wall, strokeWidth: 2 }} />
              {Array.from({ length: 18 }, (_, i) => (
                <line key={`v${i}`} x1={80 + i * 40} y1="30" x2={80 + i * 40} y2="510"
                  style={{ stroke: C.grid, strokeWidth: 0.5 }} />
              ))}
              {Array.from({ length: 11 }, (_, i) => (
                <line key={`h${i}`} x1="40" y1={70 + i * 40} x2="820" y2={70 + i * 40}
                  style={{ stroke: C.grid, strokeWidth: 0.5 }} />
              ))}
              {[160,280,400,520,640].map(x => (
                <line key={`vb${x}`} x1={x} y1="30" x2={x} y2="510"
                  style={{ stroke: C.gridBright, strokeWidth: 0.8 }} />
              ))}
              {[150,270,390].map(y => (
                <line key={`hb${y}`} x1="40" y1={y} x2="820" y2={y}
                  style={{ stroke: C.gridBright, strokeWidth: 0.8 }} />
              ))}
              {[[36,26],[812,26],[36,506],[812,506]].map(([x,y],i) => (
                <g key={i}>
                  <rect x={x} y={y} width="10" height="10" style={{ fill: C.cyan, opacity: 0.8 }} />
                  <line x1={x+(i%2===0?12:-14)} y1={y+5} x2={x+(i%2===0?22:-24)} y2={y+5}
                    style={{ stroke: C.cyan, strokeWidth: 1, opacity: 0.4 }} />
                  <line x1={x+5} y1={y+(i<2?12:-14)} x2={x+5} y2={y+(i<2?22:-24)}
                    style={{ stroke: C.cyan, strokeWidth: 1, opacity: 0.4 }} />
                </g>
              ))}
              <text x="54" y="525" style={{ fill: C.textDim, fontSize: 9.5, fontFamily: 'monospace', letterSpacing: 2 }}>
                ORQUESTADO CONTROL ROOM — PLANTA BAJA
              </text>
            </motion.g>

            <motion.g style={{ opacity: modOp1, scale: modScale1, transformOrigin: '160px 130px' }}>
              <RoomModule m={MODULES.mostrador} />
            </motion.g>
            <motion.g style={{ opacity: modOp2, scale: modScale2, transformOrigin: '700px 130px' }}>
              <RoomModule m={MODULES.bots} />
            </motion.g>
            <motion.g style={{ opacity: modOp3, scale: modScale3, transformOrigin: '160px 400px' }}>
              <RoomModule m={MODULES.llamadas} />
            </motion.g>
            <motion.g style={{ opacity: modOp4, scale: modScale4, transformOrigin: '700px 400px' }}>
              <RoomModule m={MODULES.recepcion} />
            </motion.g>
            <motion.g style={{ opacity: modOp5, scale: modScale5, transformOrigin: '430px 465px' }}>
              <RoomModule m={MODULES.turnos} />
            </motion.g>

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

            {/* ── PLASMA BALL HUB ─────────────────────────────────── */}
            <motion.g
              style={{ opacity: hubOp, scale: hubScale, transformOrigin: `${HUB.cx}px ${HUB.cy}px` }}
            >
              {/* Halo exterior pulsante (CSS, sin bloquear JS) */}
              <circle cx={HUB.cx} cy={HUB.cy} r="85"
                className="plasma-outer-glow"
                style={{ fill: 'oklch(74% 0.17 200 / 0.18)', filter: 'url(#plasma-blur)' }}
              />

              {/* Cáscara exterior — efecto vidrio cian */}
              <circle cx={HUB.cx} cy={HUB.cy} r="70"
                style={{ fill: 'url(#plasma-sphere-grad)', stroke: 'oklch(74% 0.17 200 / 0.6)', strokeWidth: 1.5 }}
              />

              {/* Interior oscuro — da profundidad a la esfera */}
              <circle cx={HUB.cx} cy={HUB.cy} r="65"
                style={{ fill: 'url(#plasma-inner-grad)' }}
              />

              {/* Rayos de plasma: bezier curves desde el núcleo */}
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
                  {/* Rama secundaria del rayo */}
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

              {/* Partículas en superficie interior */}
              {PLASMA_PARTICLES.map((p, i) => (
                <motion.circle
                  key={i}
                  cx={p.x} cy={p.y} r={p.r}
                  style={{ fill: i % 3 === 0 ? 'white' : 'oklch(74% 0.17 200)' }}
                  animate={{ opacity: [0.15, 0.9, 0.25, 0.8, 0.1] }}
                  transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                />
              ))}

              {/* Reflejo specular (highlight de vidrio, esquina superior izquierda) */}
              <ellipse cx={HUB.cx - 20} cy={HUB.cy - 24} rx="18" ry="11"
                style={{ fill: 'url(#plasma-glass)', opacity: 0.55 }}
              />

              {/* Núcleo central pulsante */}
              <circle cx={HUB.cx} cy={HUB.cy} r="10"
                className="plasma-core-pulse"
                style={{ fill: 'url(#plasma-core-grad)', filter: 'url(#hub-glow)' }}
              />

              {/* Label ORQUESTA ENGINE — mantenido */}
              <text x={HUB.cx} y={HUB.cy + 88} textAnchor="middle"
                style={{ fill: C.textSub, fontSize: 9, fontFamily: 'monospace', letterSpacing: 2 }}>
                ORQUESTA ENGINE
              </text>
            </motion.g>

            <motion.g style={{ opacity: hubOp }}>
              {[
                { cx: 160, cy: 130, c: C.mostrador },
                { cx: 700, cy: 130, c: C.bots },
                { cx: 160, cy: 400, c: C.llamadas },
                { cx: 700, cy: 400, c: C.recepcion },
                { cx: 430, cy: 420, c: C.turnos },
              ].map((n, i) => (
                <g key={i}>
                  <circle cx={n.cx} cy={n.cy} r="9"
                    style={{ fill: n.c.replace(')', ' / 0.15)'), stroke: n.c, strokeWidth: 1, opacity: 0.7 }} />
                  <circle cx={n.cx} cy={n.cy} r="4"
                    style={{ fill: n.c, opacity: 0.95 }} />
                </g>
              ))}
            </motion.g>
          </svg>

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

interface ModuleDef {
  x: number; y: number; w: number; h: number;
  color: string; icon: string; label: string;
}

function RoomModule({ m }: { m: ModuleDef }) {
  const isWide = m.w >= 200;
  const barCount = isWide ? 4 : 2;
  const barWidths = [62, 88, 44, 74];
  const iconX = m.x + m.w - 32;
  const iconY = m.y + (isWide ? 50 : 38);
  const contentY = m.y + 18;
  const screenH = isWide ? 72 : 48;

  return (
    <>
      <rect x={m.x + 4} y={m.y + 4} width={m.w} height={m.h} rx="7"
        style={{ fill: m.color.replace(')', ' / 0.08)'), filter: 'blur(8px)' }} />
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx="6"
        style={{ fill: 'oklch(12% 0.013 260)', stroke: m.color.replace(')', ' / 0.5)'), strokeWidth: 1.5 }} />
      <rect x={m.x + 1} y={m.y + 1} width={m.w - 2} height="1" rx="1"
        style={{ fill: m.color.replace(')', ' / 0.3)') }} />
      <rect x={m.x+10} y={contentY} width={m.w-20} height={screenH} rx="4"
        style={{ fill: m.color.replace(')', ' / 0.08)'), stroke: m.color.replace(')', ' / 0.15)'), strokeWidth: 1 }} />
      {Array.from({ length: barCount }, (_, i) => (
        <rect key={i} x={m.x + 16} y={contentY + 10 + i * 15}
          width={(m.w - 36) * barWidths[i] / 100} height={8} rx="4"
          style={{ fill: m.color.replace(')', ` / ${0.55 - i * 0.1})`) }} />
      ))}
      <ModuleIcon type={m.icon} color={m.color} x={iconX} y={iconY} />
      <line x1={m.x + 10} y1={m.y + screenH + contentY - m.y + 4}
        x2={m.x + m.w - 10} y2={m.y + screenH + contentY - m.y + 4}
        style={{ stroke: m.color.replace(')', ' / 0.15)'), strokeWidth: 1 }} />
      <circle cx={m.x + 18} cy={m.y + m.h - 18} r="4.5" style={{ fill: m.color, opacity: 0.9 }} />
      <circle cx={m.x + 18} cy={m.y + m.h - 18} r="8"
        style={{ fill: 'none', stroke: m.color, strokeWidth: 1, opacity: 0.25 }} />
      <text x={m.x + 32} y={m.y + m.h - 14}
        style={{ fill: 'oklch(70% 0.01 260)', fontSize: 11, fontFamily: 'monospace', fontWeight: 500 }}>
        {m.label}
      </text>
    </>
  );
}

function getStageColor(s: number): string {
  const colors = [C.cyan, C.mostrador, C.bots, C.llamadas, C.turnos, C.cyan];
  return colors[s] ?? C.cyan;
}
