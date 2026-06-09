'use client';

/**
 * PlasmaBall — esfera de plasma SVG reutilizable.
 * Centrada en (100,100) en un viewBox de 200×200.
 * Se puede embeber dentro de otro SVG pasando x/y,
 * o usar como componente HTML normal con size.
 */

import { useId } from 'react';
import { motion } from 'framer-motion';

/* ── Datos pre-computados — mismos en SSR y cliente (IIFE) ─────── */
const RAYS = (() => {
  const cx = 100, cy = 100, r = 68;
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
      d:     `M${cx},${cy} Q${cpX},${cpY} ${ex},${ey}`,
      bx1: bmX, by1: bmY, bx2: beX, by2: beY,
      sw:    +(0.7 + (i % 4) * 0.28).toFixed(2),
      delay: +(i * 0.31).toFixed(2),
      dur:   +(2.1 + (i % 5) * 0.38).toFixed(2),
      color: i % 3 === 0 ? 'oklch(85% 0.15 280)' : 'oklch(74% 0.17 200)',
    };
  });
})();

const PARTICLES = (() => {
  const cx = 100, cy = 100;
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

/* ── Props ─────────────────────────────────────────────────────── */
interface PlasmaBallProps {
  size?: number;
  /** Posicionamiento cuando se embebe dentro de otro <svg> */
  x?: number;
  y?: number;
}

/* ── Componente ─────────────────────────────────────────────────── */
export default function PlasmaBall({ size = 200, x, y }: PlasmaBallProps) {
  /* useId garantiza IDs únicos por instancia — evita conflictos en el DOM */
  const uid = useId().replace(/:/g, '');
  const cx = 100, cy = 100;

  const svgProps = {
    viewBox: '0 0 200 200',
    width: size,
    height: size,
    style: { overflow: 'visible' as const },
    ...(x !== undefined && { x }),
    ...(y !== undefined && { y }),
  };

  return (
    <svg {...svgProps}>
      <defs>
        {/* Filtros */}
        <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`${uid}-blur`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10"/>
        </filter>

        {/* Gradientes */}
        <radialGradient id={`${uid}-sphere`} gradientUnits="userSpaceOnUse"
          cx={cx} cy={cy} r="70" fx={cx - 18} fy={cy - 22}>
          <stop offset="0%"   stopColor="oklch(74% 0.17 200)" stopOpacity="0.42"/>
          <stop offset="55%"  stopColor="oklch(74% 0.17 200)" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="oklch(74% 0.17 200)" stopOpacity="0.10"/>
        </radialGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
        <radialGradient id={`${uid}-inner`} gradientUnits="userSpaceOnUse"
          cx={cx} cy={cy} r="65">
          <stop offset="0%"   stopColor="oklch(10% 0.01 260)" stopOpacity="0.95"/>
          <stop offset="70%"  stopColor="oklch(8% 0.008 260)" stopOpacity="0.88"/>
          <stop offset="100%" stopColor="oklch(6% 0.006 260)" stopOpacity="0.20"/>
        </radialGradient>
        <radialGradient id={`${uid}-core`} gradientUnits="userSpaceOnUse"
          cx={cx} cy={cy} r="10">
          <stop offset="0%"   stopColor="white"               stopOpacity="1"/>
          <stop offset="40%"  stopColor="oklch(74% 0.17 200)" stopOpacity="1"/>
          <stop offset="100%" stopColor="oklch(74% 0.17 200)" stopOpacity="0.2"/>
        </radialGradient>

        {/* Animaciones CSS — off JS thread */}
        <style>{`
          .${uid}-outer {
            animation: ${uid}-outer-pulse 2.2s ease-in-out infinite;
            transform-box: fill-box; transform-origin: center;
          }
          .${uid}-core {
            animation: ${uid}-core-pulse 1.5s ease-in-out infinite;
            transform-box: fill-box; transform-origin: center;
          }
          @keyframes ${uid}-outer-pulse {
            0%,100% { transform: scale(0.93); opacity: 0.25; }
            50%     { transform: scale(1.07); opacity: 0.55; }
          }
          @keyframes ${uid}-core-pulse {
            0%,100% { transform: scale(0.75); }
            50%     { transform: scale(1.30); }
          }
        `}</style>
      </defs>

      {/* Glow exterior — sutil, no opaca el fondo */}
      <circle cx={cx} cy={cy} r="80"
        className={`${uid}-outer`}
        style={{ fill: 'oklch(74% 0.17 200 / 0.10)', filter: `url(#${uid}-blur)` }}
      />

      {/* Rayos de plasma */}
      {RAYS.map((ray, i) => (
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

      {/* Partículas */}
      {PARTICLES.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r={p.r}
          style={{ fill: i % 3 === 0 ? 'white' : 'oklch(74% 0.17 200)' }}
          animate={{ opacity: [0.15, 0.9, 0.25, 0.8, 0.1] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Reflejo de vidrio */}
      <ellipse cx={cx - 20} cy={cy - 24} rx="18" ry="11"
        style={{ fill: `url(#${uid}-glass)`, opacity: 0.55 }}
      />
      {/* Núcleo */}
      <circle cx={cx} cy={cy} r="10"
        className={`${uid}-core`}
        style={{ fill: `url(#${uid}-core)`, filter: `url(#${uid}-glow)` }}
      />
    </svg>
  );
}
