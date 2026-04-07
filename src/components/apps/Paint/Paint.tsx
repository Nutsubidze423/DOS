'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

type Tool = 'pencil' | 'eraser' | 'fill' | 'line'

const PALETTE = [
  '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080',
  '#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff',
  '#ff8040','#804000','#80ff00','#004040','#0080ff','#8000ff','#ff0080','#ff80c0',
  '#ffcc00','#ff6600','#663300','#336600','#003366','#6600cc','#cc0066','#669999',
]

const SIZES = [1, 3, 6, 10]
const MAX_UNDO = 20

export function Paint() {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const areaRef    = useRef<HTMLDivElement>(null)
  const bgRef      = useRef('#ffffff')
  const [tool, setTool]   = useState<Tool>('pencil')
  const [color, setColor] = useState('#000000')
  const [size, setSize]   = useState(3)
  const [bg, setBg]       = useState('#ffffff')
  const drawing      = useRef(false)
  const lastPos      = useRef({ x: 0, y: 0 })
  const lineStart    = useRef({ x: 0, y: 0 })
  const snapshotRef  = useRef<ImageData | null>(null)
  const undoStack    = useRef<ImageData[]>([])
  const redoStack    = useRef<ImageData[]>([])
  bgRef.current = bg

  // Init canvas to fill container, then observe resizes preserving content
  useEffect(() => {
    const area   = areaRef.current
    const canvas = canvasRef.current
    if (!area || !canvas) return

    const initCanvas = (w: number, h: number) => {
      canvas.width  = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = bgRef.current
      ctx.fillRect(0, 0, w, h)
    }

    initCanvas(Math.max(400, area.clientWidth - 16), Math.max(300, area.clientHeight - 16))

    const ro = new ResizeObserver(() => {
      const newW = Math.max(400, area.clientWidth - 16)
      const newH = Math.max(300, area.clientHeight - 16)
      if (newW === canvas.width && newH === canvas.height) return
      const saved = canvas.toDataURL()
      canvas.width  = newW
      canvas.height = newH
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = bgRef.current
      ctx.fillRect(0, 0, newW, newH)
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = saved
    })
    ro.observe(area)
    return () => ro.disconnect()
  }, [])

  const getPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    return { x: Math.round(e.clientX - rect.left), y: Math.round(e.clientY - rect.top) }
  }, [])

  const pushUndo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)
    undoStack.current = [...undoStack.current.slice(-MAX_UNDO), snap]
    redoStack.current = []
  }, [])

  const floodFill = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    const canvas = ctx.canvas
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = data.data
    const idx = (y * canvas.width + x) * 4
    const targetR = d[idx], targetG = d[idx + 1], targetB = d[idx + 2], targetA = d[idx + 3]

    const hex = fillColor.match(/[\da-f]{2}/gi)
    if (!hex || hex.length < 3) return
    const [fr, fg, fb] = hex.map(h => parseInt(h, 16))
    if (fr === targetR && fg === targetG && fb === targetB && targetA === 255) return

    const stack = [[x, y]]
    while (stack.length) {
      const [cx, cy] = stack.pop()!
      if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue
      const i = (cy * canvas.width + cx) * 4
      if (d[i] !== targetR || d[i+1] !== targetG || d[i+2] !== targetB || d[i+3] !== targetA) continue
      d[i] = fr; d[i+1] = fg; d[i+2] = fb; d[i+3] = 255
      stack.push([cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1])
    }
    ctx.putImageData(data, 0, 0)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    pushUndo()
    if (tool === 'fill') { floodFill(ctx, pos.x, pos.y, color); return }
    drawing.current = true
    lastPos.current = pos
    lineStart.current = pos
    if (tool === 'line') {
      snapshotRef.current = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    }
  }, [tool, color, getPos, floodFill, pushUndo])

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)

    if (tool === 'line') {
      if (snapshotRef.current) ctx.putImageData(snapshotRef.current, 0, 0)
      ctx.beginPath()
      ctx.moveTo(lineStart.current.x, lineStart.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.strokeStyle = color
      ctx.lineWidth = size
      ctx.lineCap = 'round'
      ctx.stroke()
      return
    }

    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = tool === 'eraser' ? bg : color
    ctx.lineWidth = tool === 'eraser' ? size * 4 : size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
  }, [tool, color, size, bg, getPos])

  const onMouseUp = useCallback(() => {
    drawing.current = false
    snapshotRef.current = null
  }, [])

  const undo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || undoStack.current.length === 0) return
    const ctx = canvas.getContext('2d')!
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    redoStack.current = [...redoStack.current, current]
    const prev = undoStack.current[undoStack.current.length - 1]
    undoStack.current = undoStack.current.slice(0, -1)
    ctx.putImageData(prev, 0, 0)
  }, [])

  const redo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || redoStack.current.length === 0) return
    const ctx = canvas.getContext('2d')!
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    undoStack.current = [...undoStack.current, current]
    const next = redoStack.current[redoStack.current.length - 1]
    redoStack.current = redoStack.current.slice(0, -1)
    ctx.putImageData(next, 0, 0)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo() }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo() }
  }, [undo, redo])

  const clear = useCallback(() => {
    pushUndo()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }, [bg, pushUndo])

  const save = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'painting.png'
    a.href = canvas.toDataURL()
    a.click()
  }, [])

  const TOOLS: { id: Tool; icon: string; label: string }[] = [
    { id: 'pencil', icon: '✏️', label: 'Pencil' },
    { id: 'eraser', icon: '◻', label: 'Eraser' },
    { id: 'fill',   icon: '🪣', label: 'Fill' },
    { id: 'line',   icon: '╱', label: 'Line' },
  ]

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-chrome)', overflow: 'hidden' }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px', borderBottom: '1px solid var(--color-bevel-dark)', flexWrap: 'wrap' }}>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
            style={{ width: 30, height: 26, fontSize: 14, cursor: 'pointer', background: tool === t.id ? '#fff' : 'var(--color-chrome)', border: '2px solid', borderColor: tool === t.id ? 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)' : 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}>
            {t.icon}
          </button>
        ))}
        <div style={{ width: 1, height: 22, background: 'var(--color-bevel-dark)' }} />
        {SIZES.map(s => (
          <button key={s} onClick={() => setSize(s)} title={`Size ${s}`}
            style={{ width: 30, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: size === s ? '#fff' : 'var(--color-chrome)', border: '2px solid', borderColor: size === s ? 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)' : 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}>
            <div style={{ width: s + 2, height: s + 2, borderRadius: '50%', background: '#000' }} />
          </button>
        ))}
        <div style={{ width: 1, height: 22, background: 'var(--color-bevel-dark)' }} />
        <button onClick={undo} title="Undo (Ctrl+Z)" style={{ padding: '2px 8px', fontSize: 11, cursor: 'pointer', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}>↩ Undo</button>
        <button onClick={redo} title="Redo (Ctrl+Y)" style={{ padding: '2px 8px', fontSize: 11, cursor: 'pointer', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}>↪ Redo</button>
        <div style={{ width: 1, height: 22, background: 'var(--color-bevel-dark)' }} />
        <button onClick={clear} style={{ padding: '2px 8px', fontSize: 11, cursor: 'pointer', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}>Clear</button>
        <button onClick={save}  style={{ padding: '2px 8px', fontSize: 11, cursor: 'pointer', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}>Save PNG</button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Canvas area */}
        <div ref={areaRef} style={{ flex: 1, overflow: 'auto', background: '#808080', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', padding: 8 }}>
          <canvas
            ref={canvasRef}
            style={{ cursor: tool === 'fill' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'crosshair', display: 'block', boxShadow: '2px 2px 6px rgba(0,0,0,0.5)' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />
        </div>

        {/* Color palette sidebar */}
        <div style={{ width: 52, background: 'var(--color-chrome)', borderLeft: '1px solid var(--color-bevel-dark)', padding: 6, display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          {/* Active colors */}
          <div style={{ position: 'relative', width: 38, height: 32, flexShrink: 0 }}>
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, background: bg, border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: 22, height: 22, background: color, border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }} />
          </div>
          {/* Palette grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            {PALETTE.map(c => (
              <div key={c}
                onClick={() => setColor(c)}
                onContextMenu={e => { e.preventDefault(); setBg(c) }}
                title={c}
                style={{ width: 18, height: 18, background: c, border: color === c ? '2px solid #fff' : '1px solid #808080', cursor: 'pointer', boxSizing: 'border-box' }}
              />
            ))}
          </div>
          <div style={{ fontSize: 9, color: '#444', textAlign: 'center', lineHeight: 1.2 }}>L:fg R:bg</div>
        </div>
      </div>
    </div>
  )
}
