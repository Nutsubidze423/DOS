'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const IDLE_MS = 45_000 // 45 seconds

export function Screensaver() {
  const [active, setActive] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animRef = useRef<number>(0)

  const dismiss = useCallback(() => setActive(false), [])

  // Idle detection
  useEffect(() => {
    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setActive(false)
      timerRef.current = setTimeout(() => setActive(true), IDLE_MS)
    }
    reset()
    window.addEventListener('mousemove', reset)
    window.addEventListener('keydown', reset)
    window.addEventListener('mousedown', reset)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      window.removeEventListener('mousemove', reset)
      window.removeEventListener('keydown', reset)
      window.removeEventListener('mousedown', reset)
    }
  }, [])

  // Starfield animation
  useEffect(() => {
    if (!active) { cancelAnimationFrame(animRef.current); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const NUM = 200
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    const stars = Array.from({ length: NUM }, () => ({
      x: (Math.random() - 0.5) * canvas.width,
      y: (Math.random() - 0.5) * canvas.height,
      z: Math.random() * canvas.width,
      pz: 0,
    }))

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (const s of stars) {
        s.pz = s.z
        s.z -= 4
        if (s.z <= 0) {
          s.x = (Math.random() - 0.5) * canvas.width
          s.y = (Math.random() - 0.5) * canvas.height
          s.z = canvas.width
          s.pz = s.z
        }
        const sx = (s.x / s.z) * canvas.width + cx
        const sy = (s.y / s.z) * canvas.height + cy
        const px = (s.x / s.pz) * canvas.width + cx
        const py = (s.y / s.pz) * canvas.height + cy
        const size = Math.max(0.5, (1 - s.z / canvas.width) * 3)
        const bright = Math.floor((1 - s.z / canvas.width) * 255)
        ctx.strokeStyle = `rgb(${bright},${bright},${bright})`
        ctx.lineWidth = size
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(sx, sy)
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [active])

  if (!active) return null

  return (
    <div
      className="fixed inset-0 z-[99999] cursor-none"
      onClick={dismiss}
      onMouseMove={dismiss}
      onKeyDown={dismiss}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-ui text-[13px] text-white/30 select-none"
      >
        Move mouse or press any key to wake
      </div>
    </div>
  )
}
