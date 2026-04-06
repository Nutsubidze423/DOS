'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

const ROWS = 9, COLS = 9, MINES = 10

interface Cell { isMine: boolean; isRevealed: boolean; isFlagged: boolean; adj: number }
type Grid = Cell[][]
type Phase = 'idle' | 'playing' | 'won' | 'lost'

const COLORS: Record<number, string> = {
  1: '#0000ff', 2: '#008000', 3: '#ff0000',
  4: '#000080', 5: '#800000', 6: '#008080',
  7: '#000000', 8: '#808080',
}

function blankGrid(): Grid {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ isMine: false, isRevealed: false, isFlagged: false, adj: 0 }))
  )
}

function withMines(grid: Grid, safeR: number, safeC: number): Grid {
  const g: Grid = grid.map(row => row.map(c => ({ ...c })))
  let placed = 0
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    if (!g[r][c].isMine && !(r === safeR && c === safeC)) { g[r][c].isMine = true; placed++ }
  }
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!g[r][c].isMine) {
        let n = 0
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && g[nr][nc].isMine) n++
          }
        g[r][c].adj = n
      }
  return g
}

function reveal(grid: Grid, r: number, c: number): Grid {
  const g: Grid = grid.map(row => row.map(cell => ({ ...cell })))
  const q: [number, number][] = [[r, c]]
  while (q.length) {
    const [cr, cc] = q.shift()!
    if (cr < 0 || cr >= ROWS || cc < 0 || cc >= COLS) continue
    if (g[cr][cc].isRevealed || g[cr][cc].isFlagged) continue
    g[cr][cc].isRevealed = true
    if (!g[cr][cc].isMine && g[cr][cc].adj === 0)
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr || dc) q.push([cr + dr, cc + dc])
  }
  return g
}

function revealAll(grid: Grid): Grid {
  return grid.map(row => row.map(c => ({ ...c, isRevealed: true })))
}

function checkWin(grid: Grid): boolean {
  return grid.every(row => row.every(c => c.isMine ? !c.isRevealed : c.isRevealed))
}

const FACE: Record<Phase, string> = { idle: '🙂', playing: '🙂', won: '😎', lost: '😵' }

export function Minesweeper() {
  const [grid, setGrid]     = useState<Grid>(blankGrid)
  const [phase, setPhase]   = useState<Phase>('idle')
  const [flags, setFlags]   = useState(0)
  const [time, setTime]     = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTime(0)
    timerRef.current = setInterval(() => setTime(t => t + 1), 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const reset = useCallback(() => {
    stopTimer()
    setGrid(blankGrid())
    setPhase('idle')
    setFlags(0)
    setTime(0)
  }, [stopTimer])

  const handleClick = useCallback((r: number, c: number) => {
    setGrid(prev => {
      const cell = prev[r][c]
      if (cell.isRevealed || cell.isFlagged) return prev
      if (phase === 'lost' || phase === 'won') return prev

      let g = prev
      let nextPhase: Phase = 'playing'

      if (phase === 'idle') {
        g = withMines(blankGrid(), r, c)
        startTimer()
      }

      if (g[r][c].isMine) {
        const revealed = revealAll(g)
        stopTimer()
        setPhase('lost')
        return revealed
      }

      g = reveal(g, r, c)
      if (checkWin(g)) { stopTimer(); nextPhase = 'won' }
      setPhase(nextPhase)
      return g
    })
  }, [phase, startTimer, stopTimer])

  const handleRightClick = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault()
    if (phase === 'lost' || phase === 'won') return
    setGrid(prev => {
      const cell = prev[r][c]
      if (cell.isRevealed) return prev
      const g = prev.map(row => row.map(cl => ({ ...cl })))
      g[r][c].isFlagged = !g[r][c].isFlagged
      setFlags(f => g[r][c].isFlagged ? f + 1 : f - 1)
      return g
    })
  }, [phase])

  const minesLeft = MINES - flags
  const displayTime = Math.min(time, 999)

  return (
    <div style={{ background: 'var(--color-chrome)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 12, userSelect: 'none' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 8px', marginBottom: 10, border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)', background: 'var(--color-chrome)' }}>
        <SevenSeg value={minesLeft} />
        <button onClick={reset} style={{ width: 34, height: 30, fontSize: 18, cursor: 'pointer', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}>
          {FACE[phase]}
        </button>
        <SevenSeg value={displayTime} />
      </div>

      {/* Grid */}
      <div style={{ border: '3px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)' }}>
        {grid.map((row, r) => (
          <div key={r} style={{ display: 'flex' }}>
            {row.map((cell, c) => (
              <Cell key={c} cell={cell} phase={phase}
                onClick={() => handleClick(r, c)}
                onRightClick={e => handleRightClick(e, r, c)}
              />
            ))}
          </div>
        ))}
      </div>

      {(phase === 'won' || phase === 'lost') && (
        <div style={{ marginTop: 12, fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', color: phase === 'won' ? '#008000' : '#cc0000' }}>
          {phase === 'won' ? `You win! ${time}s` : 'Game over!'}
        </div>
      )}
    </div>
  )
}

function SevenSeg({ value }: { value: number }) {
  return (
    <div style={{ background: '#000', color: '#ff0000', fontFamily: 'monospace', fontSize: 22, fontWeight: 'bold', padding: '2px 6px', minWidth: 44, textAlign: 'center', border: '1px solid #333' }}>
      {String(Math.max(0, value)).padStart(3, '0')}
    </div>
  )
}

function Cell({ cell, phase, onClick, onRightClick }: { cell: Cell; phase: Phase; onClick: () => void; onRightClick: (e: React.MouseEvent) => void }) {
  const revealed = cell.isRevealed
  const base: React.CSSProperties = { width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }

  if (!revealed) {
    return (
      <div onClick={onClick} onContextMenu={onRightClick}
        style={{ ...base, background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}>
        {cell.isFlagged ? '🚩' : ''}
      </div>
    )
  }

  if (cell.isMine) {
    return (
      <div style={{ ...base, background: phase === 'lost' ? '#ff0000' : 'var(--color-chrome)', border: '1px solid #808080', fontSize: 16 }}>💣</div>
    )
  }

  return (
    <div style={{ ...base, background: '#c0c0c0', border: '1px solid #808080', color: COLORS[cell.adj] || 'transparent' }}>
      {cell.adj > 0 ? cell.adj : ''}
    </div>
  )
}
