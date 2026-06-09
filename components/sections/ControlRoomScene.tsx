'use client';

import { useRef, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

/* ── Paleta ─────────────────────────────────────────────────────── */
const C = {
  bgSurface:  'oklch(11% 0.012 260)',
  bgModule:   'oklch(13% 0.013 260)',
  wall:       'oklch(28% 0.018 260)',
  grid:       'oklch(16% 0.011 260)',
  gridBright: 'oklch(22% 0.015 260)',
  cyan:       'oklch(74% 0.17 200)',
  cyanFaint:  'oklch(74% 0.17 200 / 0.06)',
  mostrador:  'oklch(72% 0.16 200)',
  bots:       'oklch(70% 0.15 280)',
  llamadas:   'oklch(75% 0.17 145)',
  recepcion:  'oklch(73% 0.16 25)',
  turnos:     'oklch(74% 0.15 320)',
  sitios:     'oklch(78% 0.16 55)',
  textDim:    'oklch(42% 0.01 260)',
  textSub:    'oklch(62% 0.01 260)',
  textMed:    'oklch(72% 0.01 260)',
};

/* ── Módulos — 6 servicios, SVG viewBox 0 0 860 540 ────────────── */
const MODULE_KEYS = ['mostrador', 'bots', 'llamadas', 'recepcion', 'turnos', 'sitios'] as const;
type ModuleKey = typeof MODULE_KEYS[number];

/* Índice en stages[] de messages para cada módulo (0-5) */
const MODULE_STAGE_IDX: Record<ModuleKey, number> = {
  mostrador: 0, bots: 1, llamadas: 2, recepcion: 3, turnos: 4, sitios: 5,
};

const MODULES: Record<ModuleKey, {
  x: number; y: number; w: number; h: number; color: string; label: string; icon: string; rx: number
}> = {
  /* Distancias variadas al hub (430,270): lejano / medio / cercano */
  mostrador: { x: 30,  y: 35,  w: 220, h: 155, color: C.mostrador, label: 'Mi Mostrador', icon: 'mostrador', rx: 12 }, // lejos — top-left
  bots:      { x: 320, y: 12,  w: 190, h: 120, color: C.bots,      label: 'Bots web',     icon: 'bots',      rx: 3  }, // cerca — arriba de la bola (violeta)
  llamadas:  { x: 18,  y: 335, w: 195, h: 140, color: C.llamadas,  label: 'Llamadas',     icon: 'llamadas',  rx: 8  }, // lejos — bottom-left
  recepcion: { x: 565, y: 315, w: 205, h: 140, color: C.recepcion, label: 'Recepción',    icon: 'recepcion', rx: 6  }, // medio — bottom-right
  turnos:    { x: 350, y: 405, w: 160, h: 100, color: C.turnos,    label: 'Turnos',       icon: 'turnos',    rx: 16 }, // muy cerca — justo abajo
  sitios:    { x: 590, y: 135, w: 175, h: 120, color: C.sitios,    label: 'Sitios web',   icon: 'sitios',    rx: 2  }, // medio — right side
};

const HUB = { cx: 430, cy: 270 };

/* Cables: bezier desde nodo del módulo al hub */
const CABLES: Record<ModuleKey, string> = {
  mostrador: `M250,112 C345,112 ${HUB.cx},205 ${HUB.cx},${HUB.cy}`,      // lejos: curva larga
  bots:      `M415,132 C415,190 ${HUB.cx},230 ${HUB.cx},${HUB.cy}`,      // cerca: casi vertical
  llamadas:  `M213,405 C315,405 ${HUB.cx},345 ${HUB.cx},${HUB.cy}`,      // lejos: curva larga
  recepcion: `M565,385 C492,385 ${HUB.cx},345 ${HUB.cx},${HUB.cy}`,      // medio
  turnos:    `M430,405 C430,370 ${HUB.cx},330 ${HUB.cx},${HUB.cy}`,      // muy cerca: corto
  sitios:    `M590,195 C522,195 ${HUB.cx},240 ${HUB.cx},${HUB.cy}`,      // medio
};

/* Punto de conexión visible (nodo iluminado) en el módulo */
const NODES: Record<ModuleKey, { cx: number; cy: number }> = {
  mostrador: { cx: 250, cy: 112 },   // borde derecho
  bots:      { cx: 415, cy: 132 },   // borde inferior (bots bottom = 132)
  llamadas:  { cx: 213, cy: 405 },   // borde derecho
  recepcion: { cx: 565, cy: 385 },   // borde izquierdo
  turnos:    { cx: 430, cy: 405 },   // borde superior
  sitios:    { cx: 590, cy: 195 },   // borde izquierdo
};

/* Duración del loop de la partícula por cable */
const CABLE_DUR: Record<ModuleKey, number> = {
  mostrador: 2.8, bots: 3.1, llamadas: 2.6,
  recepcion: 3.3, turnos: 2.9, sitios: 3.0,
};

type StageMeta = { label: string; heading: string; body: string; cta?: string };

/* ── Plasma ball — datos pre-computados (IIFE, mismos en SSR y cliente) ── */
const PLASMA_RAYS = (() => {
  const cx = 430, cy = 270, r = 68;
  return Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const ex  = +(cx + r * Math.cos(angle)).toFixed(1);
    const ey  = +(cy + r * Math.sin(angle)).toFixed(1);
    const cpA = angle + (i % 2 === 0 ? 0.5 : -0.45);
    const cpR = 28 + (i % 3) * 9;
    const cpX = +(cx + cpR * Math.cos(cpA)).toFixed(1);
    const cpY = +(cy + cpR * Math.sin(cpA)).toFixed(1);
    const t   = 0.55;
    const bmX = +((1-t)*(1-t)*cx + 2*(1-t)*t*cpX + t*t*ex).toFixed(1);
    const bmY = +((1-t)*(1-t)*cy + 2*(1-t)*t*cpY + t*t*ey).toFixed(1);
    const baA = angle + 1.2 + (i % 2 === 0 ? 0.3 : -0.3);
    const beX = +(bmX + 14 * Math.cos(baA)).toFixed(1);
    const beY = +(bmY + 14 * Math.sin(baA)).toFixed(1);
    return {
      d:   `M${cx},${cy} Q${cpX},${cpY} ${ex},${ey}`,
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

/* ── Iconos SVG por tipo de módulo ───────────────────────────────── */
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
      <path d="M8 12 Q8 6 14 6 L16 6 Q18 6 18 8 L18 13 Q18 15 16 15 L15 15 Q13 17 13 19 L13 20 Q13 22 15 22 L16 22 Q18 22 18 24 L18 29 Q18 31 16 31 L14 31 Q8 31 8 26 Z"
        fill="none" stroke={color} strokeWidth="1.5" opacity="0.7"/>
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
  /* CAMBIO 4 — icono sitios: ventana de browser */
  if (type === 'sitios') return (
    <g transform={`translate(${cx},${cy})`}>
      <rect x="2" y="4" width="36" height="28" rx="3" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7"/>
      <rect x="2" y="4" width="36" height="9"  rx="3" fill={color} opacity="0.15"/>
      <rect x="2" y="11" width="36" height="2" fill={color} opacity="0.08"/>
      <circle cx="8"  cy="9" r="2" fill="rgba(255,95,87,0.8)"/>
      <circle cx="15" cy="9" r="2" fill="rgba(255,189,46,0.8)"/>
      <circle cx="22" cy="9" r="2" fill="rgba(40,200,64,0.8)"/>
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
          fill={color} opacity={i<2 ? 0.6 : 0.25}/>
      ))}
    </g>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ControlRoomScene — HUD de servicios con entrada única y panel rotativo
══════════════════════════════════════════════════════════════════ */
export default function ControlRoomScene() {
  const t     = useTranslations('room');
  const tSvc  = useTranslations('services');
  const containerRef = useRef<HTMLDivElement>(null);

  /* CAMBIO 1 — entrada única con useInView */
  const inView = useInView(containerRef, { once: true, margin: '-80px' });

  /* CAMBIO 2 — estado de hover y auto-rotación */
  const [hoveredModule, setHoveredModule] = useState<ModuleKey | null>(null);
  const [currentStage, setCurrentStage]   = useState(0);

  /* Post-entrada: activar partículas y taglines después de 0.8s */
  const [postEntry, setPostEntry] = useState(false);
  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setPostEntry(true), 800);
    return () => clearTimeout(timer);
  }, [inView]);

  /* Auto-rotate pausa cuando hay hover */
  useEffect(() => {
    if (hoveredModule !== null) return;
    const interval = setInterval(() => {
      setCurrentStage(s => (s + 1) % MODULE_KEYS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [hoveredModule]);

  const stages = t.raw('stages') as StageMeta[];

  /* Índice activo del panel: hover tiene prioridad */
  const activeStageIdx = hoveredModule !== null
    ? MODULE_STAGE_IDX[hoveredModule]
    : currentStage;

  /* Key del AnimatePresence para disparar transición */
  const panelKey = hoveredModule ?? String(currentStage);

  /* Color activo del panel (módulo en foco) */
  const activeModuleKey = hoveredModule ?? MODULE_KEYS[currentStage];
  const activeColor = MODULES[activeModuleKey].color;

  return (
    /* CAMBIO 1 — min-h-screen sin sticky ni h-[500vh] */
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col lg:flex-row"
      id="como-funciona"
    >
      {/* ── Panel SVG izquierdo ────────────────────────────────── */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden min-h-[52vh] lg:min-h-0">

        {/* Grilla de fondo */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${C.cyanFaint} 1px, transparent 1px), linear-gradient(90deg, ${C.cyanFaint} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Glow radial del hub — aparece con los cables */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="w-full h-full" style={{
            background: `radial-gradient(circle 70px at 50% 50%, oklch(74% 0.17 200 / 0.18) 0%, transparent 70%)`
          }} />
        </motion.div>

        <svg
          viewBox="0 0 860 540"
          className="w-full h-full max-w-3xl"
          preserveAspectRatio="xMidYMid meet"
          style={{ maxHeight: '85vh', padding: '8px' }}
        >
          <defs>
            {/* Paths de referencia para CSS offset-path de partículas */}
            {MODULE_KEYS.map(key => (
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
            <filter id="mod-glow" x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
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

            {/* Animaciones CSS — todas off JS thread */}
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
                50%      { transform: scale(2.2);  opacity: 0;   }
              }
              /* CAMBIO 3 — tagline clip-path reveal */
              @keyframes text-reveal {
                from { clip-path: inset(0 100% 0 0); }
                to   { clip-path: inset(0 0%   0 0); }
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
              .tagline-hidden { clip-path: inset(0 100% 0 0); }
              .tagline-reveal { animation: text-reveal 1.2s ease-out forwards; }
            `}</style>
          </defs>

          {/* ── Módulos con stagger de entrada ── */}
          {MODULE_KEYS.map((key, idx) => {
            const m = MODULES[key];
            const cx = m.x + m.w / 2;
            const cy = m.y + m.h / 2;
            const isActive = hoveredModule === key;
            const borderOp = isActive ? 0.8 : 0.4;
            return (
              <motion.g
                key={key}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: `${cx}px ${cy}px`, cursor: 'pointer' }}
                onMouseEnter={() => setHoveredModule(key)}
                onMouseLeave={() => setHoveredModule(null)}
              >
                <RoomModule
                  m={m}
                  borderOpacity={borderOp}
                  tagline={tSvc(`items.${key}.tagline`)}
                  textVisible={postEntry}
                  taglineDelay={idx * 0.12}
                />
              </motion.g>
            );
          })}

          {/* ── Cables + partículas de energía ── */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ willChange: 'opacity' }}
          >
            {MODULE_KEYS.map(key => (
              <g key={key}>
                {/* Línea base del cable */}
                <line
                  x1={NODES[key].cx} y1={NODES[key].cy}
                  x2={HUB.cx} y2={HUB.cy}
                  style={{
                    stroke: MODULES[key].color,
                    strokeWidth: 1.5,
                    strokeDasharray: '6 4',
                    opacity: 0.45,
                  }}
                />
                {/* CAMBIO 1 — 3 partículas CSS offset-path, activan después de 0.8s */}
                {[0, 1, 2].map(pi => (
                  <circle
                    key={pi}
                    r="2.5"
                    fill={MODULES[key].color}
                    style={{
                      offsetPath: `url(#cp-${key})`,
                      offsetDistance: '0%',
                      animationName: postEntry ? 'particle-flow' : 'none',
                      animationDuration: `${CABLE_DUR[key]}s`,
                      animationTimingFunction: 'linear',
                      animationIterationCount: 'infinite',
                      animationDelay: `${(pi * CABLE_DUR[key] / 3).toFixed(2)}s`,
                      opacity: 0.85,
                      willChange: 'offset-distance',
                    } as React.CSSProperties}
                  />
                ))}
                {/* Nodo de conexión en módulo */}
                <circle
                  cx={NODES[key].cx} cy={NODES[key].cy} r="9"
                  fill="transparent"
                  stroke={MODULES[key].color} strokeWidth="1"
                  className="dot-ring"
                />
                <circle
                  cx={NODES[key].cx} cy={NODES[key].cy} r="4"
                  fill={MODULES[key].color} opacity="0.9"
                />
              </g>
            ))}
          </motion.g>

          {/* ── PLASMA BALL HUB ────────────────────────────────────── */}
          <motion.g
            initial={{ opacity: 0, scale: 0.7 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transformOrigin: `${HUB.cx}px ${HUB.cy}px`,
              willChange: 'transform',
            }}
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
                  d={ray.d} fill="none" stroke={ray.color}
                  strokeWidth={ray.sw} strokeLinecap="round"
                  animate={{ opacity: [0, 0.9, 0.3, 1, 0.05, 0] }}
                  transition={{ duration: ray.dur, repeat: Infinity, delay: ray.delay, ease: 'easeInOut' }}
                />
                <motion.path
                  d={`M${ray.bx1},${ray.by1} L${ray.bx2},${ray.by2}`}
                  fill="none" stroke={ray.color}
                  strokeWidth={+(ray.sw * 0.6).toFixed(2)} strokeLinecap="round"
                  animate={{ opacity: [0, 0.7, 0.15, 0.8, 0] }}
                  transition={{ duration: ray.dur * 0.8, repeat: Infinity, delay: ray.delay + 0.12, ease: 'easeInOut' }}
                />
              </g>
            ))}
            {PLASMA_PARTICLES.map((p, i) => (
              <motion.circle key={i} cx={p.x} cy={p.y} r={p.r}
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
      </div>

      {/* ── Panel derecho: texto auto-rotativo ──────────────────── */}
      <div className="lg:w-[400px] flex flex-col justify-center px-6 py-8 lg:px-12 border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)] bg-[oklch(9%_0.009_260/0.85)] relative overflow-hidden">

        {/* CAMBIO 2 — 6 dots, uno iluminado según currentStage */}
        <div className="flex gap-2 mb-8">
          {MODULE_KEYS.map((key, i) => (
            <div
              key={key}
              className="h-0.5 flex-1 rounded-full transition-all duration-500"
              style={{
                backgroundColor: i === currentStage
                  ? MODULES[key].color
                  : 'oklch(20% 0.01 260)',
              }}
            />
          ))}
        </div>

        <div className="relative min-h-[180px]">
          {/* CAMBIO 2 — key es hoveredModule ?? String(currentStage) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={panelKey}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-3"
                style={{ color: activeColor }}>
                {stages[activeStageIdx]?.label}
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] leading-[1.05] mb-4 whitespace-pre-line tracking-tight">
                {stages[activeStageIdx]?.heading}
              </h2>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xs">
                {stages[activeStageIdx]?.body}
              </p>
              {stages[activeStageIdx]?.cta && (
                <div className="mt-7">
                  <Button variant="amber" size="md">
                    {stages[activeStageIdx].cta}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-6 right-8 font-mono text-[11px] text-[var(--text-tertiary)]">
          {String(currentStage + 1).padStart(2, '0')} / {String(MODULE_KEYS.length).padStart(2, '0')}
        </div>
        <div
          className="absolute left-0 top-1/4 bottom-1/4 w-px transition-colors duration-700"
          style={{ backgroundColor: activeColor, opacity: 0.4 }}
        />
      </div>
    </section>
  );
}

/* ── RoomModule — card con tagline y borde activo ───────────────── */
interface ModuleDef {
  x: number; y: number; w: number; h: number;
  color: string; icon: string; label: string;
  /** CAMBIO 3 — radio de borde con personalidad por módulo */
  rx: number;
}

interface RoomModuleProps {
  m: ModuleDef;
  /** Opacidad del borde: 0.4 normal, 0.8 cuando está hovered */
  borderOpacity: number;
  tagline: string;
  textVisible: boolean;
  taglineDelay: number;
}

function RoomModule({ m, borderOpacity, tagline, textVisible, taglineDelay }: RoomModuleProps) {
  const isWide   = m.w >= 180;
  const barCount = isWide ? 4 : 2;
  const barWidths = [62, 88, 44, 74];
  const iconX    = m.x + m.w - 32;
  const iconY    = m.y + (isWide ? 50 : 38);
  const contentY = m.y + 18;
  const screenH  = isWide ? 72 : 48;

  return (
    <>
      {/* Sombra glow */}
      <rect x={m.x + 4} y={m.y + 4} width={m.w} height={m.h} rx={m.rx}
        style={{ fill: m.color.replace(')', ' / 0.1)'), filter: 'url(#mod-glow)' }}
      />
      {/* Fondo glassmorphism */}
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={m.rx}
        style={{
          fill: 'oklch(12% 0.013 260)',
          stroke: m.color.replace(')', ` / ${borderOpacity})`),
          strokeWidth: 1.5,
          transition: 'stroke 0.3s',
        }}
      />
      {/* Línea superior de acento */}
      <rect x={m.x + 1} y={m.y + 1} width={m.w - 2} height="1" rx={Math.min(m.rx, 4)}
        style={{ fill: m.color.replace(')', ' / 0.4)') }}
      />
      {/* Área de datos */}
      <rect x={m.x + 10} y={contentY} width={m.w - 20} height={screenH} rx="4"
        style={{ fill: m.color.replace(')', ' / 0.08)'), stroke: m.color.replace(')', ' / 0.15)'), strokeWidth: 1 }}
      />
      {/* Barras de actividad */}
      {Array.from({ length: barCount }, (_, i) => (
        <rect key={i}
          x={m.x + 16} y={contentY + 10 + i * 15}
          width={(m.w - 36) * barWidths[i] / 100} height={8} rx="4"
          style={{ fill: m.color.replace(')', ` / ${0.55 - i * 0.1})`) }}
        />
      ))}
      {/* Icono */}
      <ModuleIcon type={m.icon} color={m.color} x={iconX} y={iconY} />
      {/* Separador */}
      <line
        x1={m.x + 10} y1={m.y + screenH + contentY - m.y + 4}
        x2={m.x + m.w - 10} y2={m.y + screenH + contentY - m.y + 4}
        style={{ stroke: m.color.replace(')', ' / 0.15)'), strokeWidth: 1 }}
      />
      {/* Dot de estado */}
      <circle cx={m.x + 18} cy={m.y + m.h - 18} r="4.5" style={{ fill: m.color, opacity: 0.9 }} />
      <circle cx={m.x + 18} cy={m.y + m.h - 18} r="8"
        fill="transparent"
        style={{ stroke: m.color, strokeWidth: 1 }} className="dot-ring"
      />
      {/* Label */}
      <text x={m.x + 32} y={m.y + m.h - 14}
        style={{ fill: 'oklch(70% 0.01 260)', fontSize: 11, fontFamily: 'monospace', fontWeight: 500 }}>
        {m.label}
      </text>
      {/* CAMBIO 3 — tagline con efecto de revelación clip-path */}
      <text
        x={m.x + 32} y={m.y + m.h - 4}
        className={textVisible ? 'tagline-reveal' : 'tagline-hidden'}
        style={{
          fill: 'oklch(55% 0.01 260)',
          fontSize: 8,
          fontFamily: 'monospace',
          animationDelay: textVisible ? `${taglineDelay}s` : undefined,
        } as React.CSSProperties}
      >
        {tagline}
      </text>
    </>
  );
}
