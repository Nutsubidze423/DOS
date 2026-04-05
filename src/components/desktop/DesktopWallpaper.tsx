'use client'

import { useEffect, useRef } from 'react'

export function DesktopWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let hue = 220
    let animFrame: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      hue = (hue + 0.02) % 360

      const grad = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.4, 0,
        canvas.width * 0.5, canvas.height * 0.5, canvas.width * 0.8
      )
      grad.addColorStop(0, `hsla(${hue}, 60%, 4%, 1)`)
      grad.addColorStop(0.5, `hsla(${(hue + 20) % 360}, 50%, 3%, 1)`)
      grad.addColorStop(1, `hsla(220, 70%, 2%, 1)`)

      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 16) {
        const noise = (Math.random() - 0.5) * 6
        data[i] = Math.max(0, Math.min(255, data[i] + noise))
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
      }
      ctx.putImageData(imageData, 0, 0)

      animFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', resize)
    }
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
