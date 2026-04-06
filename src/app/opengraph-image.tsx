import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Demetre Nutsubidze — PortfolioOS'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630,
          background: '#0a0a0f',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Teal desktop background */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, #006060 0%, #008080 30%, #004040 100%)', display: 'flex' }} />

        {/* Scanlines overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
          display: 'flex',
        }} />

        {/* Fake window */}
        <div style={{
          position: 'relative',
          width: 860, background: '#c0bdb5',
          border: '3px solid',
          borderColor: '#ffffff',
          boxShadow: '6px 6px 0 rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Title bar */}
          <div style={{
            height: 36, background: 'linear-gradient(90deg, #000080, #1084d0)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 18 }}>🖥️</div>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>PortfolioOS — Demetre Nutsubidze</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['_', '□', '✕'].map(s => (
                <div key={s} style={{ width: 22, height: 20, background: '#c0bdb5', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#000', fontWeight: 700 }}>{s}</div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '28px 40px', display: 'flex', gap: 40, alignItems: 'center' }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <div style={{ fontSize: 13, color: '#000080', fontWeight: 700, letterSpacing: 2 }}>FRONT END DEVELOPER</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#000', lineHeight: 1.1 }}>Demetre{'\n'}Nutsubidze</div>
              <div style={{ fontSize: 14, color: '#444', marginTop: 4 }}>demetrenutsubidze423@gmail.com</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {['Next.js', 'React', 'TypeScript', 'Framer Motion', 'Three.js'].map(t => (
                  <div key={t} style={{ padding: '3px 10px', background: '#000080', color: '#fff', fontSize: 12, fontWeight: 700 }}>{t}</div>
                ))}
              </div>
            </div>

            {/* Right — desktop icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[['🖥️','PortfolioOS'],['🎨','MS Paint'],['💣','Minesweeper'],['🤖','Ask Me']].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ fontSize: 28 }}>{icon}</div>
                  <div style={{ fontSize: 10, color: '#000', background: 'rgba(0,0,128,0.15)', padding: '1px 4px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Taskbar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 50, background: '#c0bdb5',
          borderTop: '3px solid #ffffff',
          display: 'flex', alignItems: 'center',
          padding: '0 8px', gap: 8,
        }}>
          <div style={{ padding: '4px 14px', background: 'linear-gradient(135deg, #1a8a1a, #00aa00)', color: '#fff', fontWeight: 900, fontSize: 16, border: '2px solid #fff' }}>
            🪟 Start
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 13, color: '#000', fontFamily: 'monospace', padding: '4px 8px', background: '#c0bdb5', border: '1px solid #808080' }}>
            dos-snowy.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
