import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Orquestado — Automatización con IA para tu negocio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0d0d12',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(ellipse 60% 50% at 70% 40%, rgba(30,210,255,0.12) 0%, transparent 70%)',
          display: 'flex',
        }} />
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'oklch(74% 0.17 200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0d0d12', fontSize: 28, fontWeight: 800,
          }}>O</div>
          <span style={{ color: '#f0efea', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>Orquestado</span>
        </div>
        {/* Headline */}
        <div style={{ color: '#f0efea', fontSize: 72, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', marginBottom: '24px' }}>
          Tu negocio,<br />siempre activo.
        </div>
        {/* Subheadline */}
        <div style={{ color: 'rgba(240,239,234,0.6)', fontSize: 28, fontWeight: 400, lineHeight: 1.4 }}>
          Pedidos · Bots · Llamadas · Turnos — con IA
        </div>
      </div>
    ),
    { ...size }
  );
}