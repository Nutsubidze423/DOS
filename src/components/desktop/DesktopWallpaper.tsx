'use client'

import { useEffect, useRef } from 'react'

export function DesktopWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Classic Win98 teal desktop background
      const w = canvas.width
      const h = canvas.height

      // Base teal fill
      ctx.fillStyle = '#008080'
      ctx.fillRect(0, 0, w, h)

      // Very subtle radial highlight in center — gives depth like a CRT monitor
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, w * 0.75)
      grad.addColorStop(0, 'rgba(0,160,160,0.35)')
      grad.addColorStop(0.5, 'rgba(0,128,128,0.10)')
      grad.addColorStop(1, 'rgba(0,50,60,0.40)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // Subtle scan-line texture — every 2px a faint dark stripe
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle = 'rgba(0,0,0,0.04)'
        ctx.fillRect(0, y, w, 1)
      }
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
