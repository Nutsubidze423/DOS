'use client'

import { useState, useCallback } from 'react'
import { useBootStore } from '@/store/bootStore'
import { initSounds } from '@/lib/sounds'

export function PowerOn() {
  const { setPhase } = useBootStore()
  const [pressing, setPressing] = useState(false)

  const handlePower = useCallback(() => {
    initSounds()
    setPressing(true)
    setTimeout(() => {
      setPhase('bios')
    }, 600)
  }, [setPhase])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center select-none"
      style={{ background: '#000' }}
    >
      {/* Monitor glow */}
      <div
        className="absolute inset-0"
        style={{
          background: pressing
            ? 'radial-gradient(ellipse at 50% 50%, rgba(0,128,0,0.08) 0%, transparent 70%)'
            : 'transparent',
          transition: 'all 0.6s ease',
        }}
      />

      {/* Title */}
      <div
        className="font-ui text-[13px] tracking-[0.3em] uppercase mb-12"
        style={{ color: '#444' }}
      >
        PortfolioOS 98
      </div>

      {/* Power button */}
      <button
        onClick={handlePower}
        className="relative flex items-center justify-center rounded-full focus:outline-none"
        style={{
          width: 90,
          height: 90,
          background: pressing
            ? 'radial-gradient(circle, #00cc00 0%, #006600 60%, #003300 100%)'
            : 'radial-gradient(circle, #1a1a1a 0%, #111 60%, #0a0a0a 100%)',
          border: pressing ? '3px solid #00aa00' : '3px solid #2a2a2a',
          boxShadow: pressing
            ? '0 0 30px rgba(0,200,0,0.6), 0 0 60px rgba(0,200,0,0.2), inset 0 0 20px rgba(0,0,0,0.5)'
            : '0 0 8px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.05)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        }}
        aria-label="Power on"
      >
        {/* Power symbol SVG */}
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
          <path
            d="M19 5 L19 19"
            stroke={pressing ? '#00ff00' : '#555'}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transition: 'stroke 0.3s ease' }}
          />
          <path
            d="M11 9.5 A12 12 0 1 0 27 9.5"
            stroke={pressing ? '#00ff00' : '#555'}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            style={{ transition: 'stroke 0.3s ease' }}
          />
        </svg>

        {/* Pulse ring when idle */}
        {!pressing && (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              border: '1px solid #333',
              animation: 'powerPulse 2.5s ease-in-out infinite',
            }}
          />
        )}
      </button>

      <div
        className="font-ui text-[11px] mt-8 tracking-widest uppercase"
        style={{ color: pressing ? '#006600' : '#333', transition: 'color 0.4s' }}
      >
        {pressing ? 'Starting up...' : 'Press to power on'}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes powerPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.18); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
