'use client';

import { CanvasFractalGrid } from '@/components/ui/CanvasFractalGrid';

// Fondo global fijo — persiste durante todo el scroll de la landing
// Vive en z-0, todas las secciones van en z-10 o superior
const ORQUESTA_CYAN = 'rgba(30, 210, 255, 1)';

export default function GlobalBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden
    >
      <CanvasFractalGrid
        dotColor={ORQUESTA_CYAN}
        glowColor={ORQUESTA_CYAN}
        dotSize={3}
        dotSpacing={28}
        dotOpacity={0.28}
        waveIntensity={22}
        waveRadius={200}
        enableGradient={false}
        enableNoise={false}
        enableMouseGlow={true}
        initialPerformance="high"
      />
    </div>
  );
}
