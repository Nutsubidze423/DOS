'use client'

import { useEffect, useRef } from 'react'
import { useDesktopStore } from '@/store/desktopStore'

export function DesktopWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { wallpaper } = useDesktopStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const w = canvas.width
      const h = canvas.height

      if (wallpaper === 'teal') {
        ctx.fillStyle = '#008080'
        ctx.fillRect(0, 0, w, h)
        const grad = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, w * 0.75)
        grad.addColorStop(0, 'rgba(0,160,160,0.35)')
        grad.addColorStop(0.5, 'rgba(0,128,128,0.10)')
        grad.addColorStop(1, 'rgba(0,50,60,0.40)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
        for (let y = 0; y < h; y += 2) {
          ctx.fillStyle = 'rgba(0,0,0,0.04)'
          ctx.fillRect(0, y, w, 1)
        }

      } else if (wallpaper === 'space') {
        ctx.fillStyle = '#050520'
        ctx.fillRect(0, 0, w, h)
        // Stars
        const rng = (() => { let s = 42; return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff } })()
        for (let i = 0; i < 400; i++) {
          const sx = rng() * w
          const sy = rng() * h
          const sr = rng() * 1.5 + 0.3
          const bright = rng() * 0.8 + 0.2
          ctx.fillStyle = `rgba(255,255,255,${bright})`
          ctx.beginPath()
          ctx.arc(sx, sy, sr, 0, Math.PI * 2)
          ctx.fill()
        }
        // Nebula glow
        const ng = ctx.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.3, h * 0.4, w * 0.4)
        ng.addColorStop(0, 'rgba(80,0,160,0.25)')
        ng.addColorStop(1, 'transparent')
        ctx.fillStyle = ng
        ctx.fillRect(0, 0, w, h)

      } else if (wallpaper === 'ocean') {
        const og = ctx.createLinearGradient(0, 0, 0, h)
        og.addColorStop(0, '#001933')
        og.addColorStop(0.5, '#003366')
        og.addColorStop(1, '#004488')
        ctx.fillStyle = og
        ctx.fillRect(0, 0, w, h)
        // Wave lines
        for (let i = 0; i < 8; i++) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(0,180,220,${0.06 + i * 0.01})`
          ctx.lineWidth = 1
          const yBase = h * 0.4 + i * 30
          ctx.moveTo(0, yBase)
          for (let x = 0; x <= w; x += 10) {
            ctx.lineTo(x, yBase + Math.sin(x * 0.02 + i) * 8)
          }
          ctx.stroke()
        }

      } else if (wallpaper === 'matrix') {
        ctx.fillStyle = '#001400'
        ctx.fillRect(0, 0, w, h)
        const cols = Math.floor(w / 14)
        for (let c = 0; c < cols; c++) {
          const chars = Math.floor(Math.random() * 20) + 5
          for (let r = 0; r < chars; r++) {
            const alpha = 0.05 + (r / chars) * 0.25
            ctx.fillStyle = `rgba(0,255,0,${alpha})`
            ctx.font = '12px monospace'
            const char = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
            ctx.fillText(char, c * 14, r * 16 + 16)
          }
        }

      } else if (wallpaper === 'dark') {
        const dg = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.7)
        dg.addColorStop(0, '#1a1a2e')
        dg.addColorStop(1, '#0a0a12')
        ctx.fillStyle = dg
        ctx.fillRect(0, 0, w, h)
        // Subtle grid
        ctx.strokeStyle = 'rgba(255,255,255,0.03)'
        ctx.lineWidth = 1
        for (let x = 0; x < w; x += 40) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
        }
        for (let y = 0; y < h; y += 40) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
        }
      }
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [wallpaper])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
