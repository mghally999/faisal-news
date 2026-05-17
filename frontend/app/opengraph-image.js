import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Faisal News';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #020B18 0%, #0A1E30 100%)',
          color: '#F0EDE5',
          fontFamily: 'serif'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #C9A84C, #A8882E)',
              color: '#020B18',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 800
            }}
          >
            F
          </div>
          <div style={{ fontSize: 36, color: '#C9A84C', letterSpacing: '0.04em' }}>FAISAL NEWS</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 88, lineHeight: 1.05, fontWeight: 700 }}>
            A modern editorial brief on the day.
          </div>
          <div style={{ fontSize: 30, color: '#94A3B8' }}>
            Curated headlines · A personal news library · Built for the focused reader.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
