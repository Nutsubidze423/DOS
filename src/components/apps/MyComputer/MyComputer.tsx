'use client'

const DRIVES = [
  { icon: '💾', label: '(C:) Skills Drive', used: 82, total: 100, unit: 'years XP' },
  { icon: '📀', label: '(D:) Projects Disc', used: 12, total: 20, unit: 'shipped' },
  { icon: '🌐', label: '(E:) Network Drive', used: 3, total: 5, unit: 'GB ideas' },
]

const SPECS = [
  { label: 'Processor', value: 'React 18 @ 60 FPS, TypeScript Edition' },
  { label: 'Memory', value: '∞ MB Creative RAM (Never Enough)' },
  { label: 'OS', value: 'PortfolioOS 98 SE (Next.js 14 Kernel)' },
  { label: 'Display', value: '1920×1080 — Retina-ready components' },
  { label: 'Network', value: 'GitHub Fiber — 10 Gbps push speed' },
  { label: 'Sound', value: 'Windows XP Audio — 6-channel frustration' },
]

const SKILLS = [
  { name: 'React / Next.js', level: 92 },
  { name: 'TypeScript', level: 88 },
  { name: 'Tailwind CSS', level: 90 },
  { name: 'Framer Motion', level: 85 },
  { name: 'Node.js', level: 75 },
  { name: 'Three.js', level: 68 },
]

export function MyComputer() {
  return (
    <div className="flex flex-col h-full bg-os-chrome overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-[3px]" style={{ borderBottom: '2px solid var(--color-bevel-dark)' }}>
        <span className="font-ui text-[12px] text-black">📁 File</span>
        <span className="font-ui text-[12px] text-black ml-3">🔧 Tools</span>
        <span className="font-ui text-[12px] text-black ml-3">❓ Help</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Drives */}
        <div>
          <div className="font-ui text-[13px] font-bold text-black mb-2 pb-1" style={{ borderBottom: '1px solid var(--color-bevel-dark)' }}>
            Storage Devices
          </div>
          <div className="space-y-2">
            {DRIVES.map(d => (
              <div key={d.label} className="flex items-center gap-3 p-2" style={{ border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)', background: 'white' }}>
                <span className="text-[28px]">{d.icon}</span>
                <div className="flex-1">
                  <div className="font-ui text-[12px] font-bold text-black">{d.label}</div>
                  <div className="h-[10px] mt-1 rounded-sm overflow-hidden" style={{ background: '#c0c0c0', border: '1px solid #808080' }}>
                    <div
                      className="h-full"
                      style={{ width: `${(d.used / d.total) * 100}%`, background: d.used / d.total > 0.8 ? '#cc0000' : '#000080' }}
                    />
                  </div>
                  <div className="font-ui text-[10px] text-gray-600 mt-[2px]">{d.used} / {d.total} {d.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Properties */}
        <div>
          <div className="font-ui text-[13px] font-bold text-black mb-2 pb-1" style={{ borderBottom: '1px solid var(--color-bevel-dark)' }}>
            System Properties
          </div>
          <div style={{ background: 'white', border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)' }}>
            {SPECS.map((s, i) => (
              <div
                key={s.label}
                className="flex gap-2 px-2 py-[4px] font-ui text-[11px]"
                style={{ background: i % 2 === 0 ? 'white' : '#f0f0f0', borderBottom: i < SPECS.length - 1 ? '1px solid #e0e0e0' : 'none' }}
              >
                <span className="text-gray-600 w-[100px] flex-shrink-0">{s.label}:</span>
                <span className="text-black">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill bars */}
        <div>
          <div className="font-ui text-[13px] font-bold text-black mb-2 pb-1" style={{ borderBottom: '1px solid var(--color-bevel-dark)' }}>
            Proficiency Benchmarks
          </div>
          <div className="space-y-[6px]" style={{ background: 'white', border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)', padding: 8 }}>
            {SKILLS.map(s => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="font-ui text-[11px] text-black w-[120px] flex-shrink-0">{s.name}</span>
                <div className="flex-1 h-[12px] rounded-sm overflow-hidden" style={{ background: '#c0c0c0', border: '1px solid #808080' }}>
                  <div className="h-full" style={{ width: `${s.level}%`, background: 'linear-gradient(90deg, #000080, #1084d0)' }} />
                </div>
                <span className="font-ui text-[11px] text-black w-[32px] text-right">{s.level}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
