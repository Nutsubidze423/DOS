'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const COLS = 40, ROWS = 20, TOTAL = COLS * ROWS

type BlockType = 'system' | 'used' | 'data' | 'fragmented' | 'free' | 'moving'

const COLORS: Record<BlockType, string> = {
  system:     '#000080',
  used:       '#1084d0',
  data:       '#6060cc',
  fragmented: '#cc0000',
  free:       '#ffffff',
  moving:     '#00cc00',
}

function initBlocks(): BlockType[] {
  const blocks: BlockType[] = []
  const dist: [BlockType, number][] = [
    ['system', 0.08], ['used', 0.38], ['data', 0.14],
    ['fragmented', 0.18], ['free', 0.22],
  ]
  for (const [type, pct] of dist)
    for (let i = 0; i < Math.floor(TOTAL * pct); i++)
      blocks.push(type)
  while (blocks.length < TOTAL) blocks.push('free')

  // Shuffle
  for (let i = blocks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]]
  }
  return blocks
}

type Phase = 'idle' | 'analyzing' | 'defragging' | 'done'

const STATUS: Record<Phase, string> = {
  idle:       'Press "Defragment" to begin.',
  analyzing:  'Analyzing drive C:...',
  defragging: 'Defragmenting drive C:...',
  done:       'Defragmentation complete.',
}

export function Defrag() {
  const [blocks, setBlocks]   = useState<BlockType[]>(initBlocks)
  const [phase, setPhase]     = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)
  const [scanPos, setScanPos] = useState(0)
  const stopRef = useRef(false)

  const stop = useCallback(() => { stopRef.current = true }, [])

  const reset = useCallback(() => {
    stop()
    setTimeout(() => {
      stopRef.current = false
      setBlocks(initBlocks())
      setPhase('idle')
      setProgress(0)
      setScanPos(0)
    }, 100)
  }, [stop])

  const run = useCallback(async () => {
    stopRef.current = false
    setPhase('analyzing')
    setProgress(0)

    // Phase 1: Scan animation
    for (let i = 0; i <= TOTAL; i += 4) {
      if (stopRef.current) return
      setScanPos(i)
      setProgress(Math.floor((i / TOTAL) * 20))
      await delay(18)
    }
    setScanPos(-1)

    // Phase 2: Defrag — swap fragmented blocks toward front, push free to back
    setPhase('defragging')
    const arr = [...blocks]

    // Find all fragmented indices and free indices
    const getFragIdx = () => arr.findIndex(b => b === 'fragmented')
    const getFreeIdx = (after: number) => {
      for (let i = 0; i < after; i++) if (arr[i] === 'free') return i
      return -1
    }

    const initialFrag = arr.filter(b => b === 'fragmented').length
    let moved = 0

    while (true) {
      if (stopRef.current) return
      const fi = getFragIdx()
      if (fi === -1) break
      const freeI = getFreeIdx(fi)
      if (freeI === -1) break

      // Flash moving
      arr[fi] = 'moving'
      setBlocks([...arr])
      await delay(30)

      arr[freeI] = 'used'
      arr[fi] = 'free'
      setBlocks([...arr])
      moved++
      setProgress(20 + Math.min(78, Math.floor((moved / initialFrag) * 78)))
      await delay(20)
    }

    setProgress(100)
    setPhase('done')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks])

  useEffect(() => () => { stopRef.current = true }, [])

  const isRunning = phase === 'analyzing' || phase === 'defragging'

  return (
    <div style={{ background: 'var(--color-chrome)', height: '100%', display: 'flex', flexDirection: 'column', padding: 12, gap: 10, fontFamily: 'var(--font-ui, sans-serif)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottom: '1px solid var(--color-bevel-dark)' }}>
        <span style={{ fontSize: 20 }}>💾</span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 13, color: '#000' }}>Disk Defragmenter</div>
          <div style={{ fontSize: 11, color: '#444' }}>Drive C: — PortfolioOS Skills Drive</div>
        </div>
      </div>

      {/* Block grid */}
      <div style={{ border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)', background: '#000', padding: 4, flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 1 }}>
          {blocks.map((type, i) => (
            <div key={i} style={{
              width: 10, height: 10,
              background: i < scanPos && phase === 'analyzing' ? '#ffff00' : COLORS[type],
              border: '1px solid rgba(0,0,0,0.3)',
            }} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {(Object.entries(COLORS) as [BlockType, string][]).filter(([k]) => k !== 'moving').map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#000' }}>
            <div style={{ width: 12, height: 12, background: color, border: '1px solid #808080', flexShrink: 0 }} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ fontSize: 11, color: '#000', marginBottom: 4 }}>{STATUS[phase]}</div>
        <div style={{ height: 18, background: '#fff', border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#000080', transition: 'width 0.15s' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold', color: progress > 50 ? '#fff' : '#000', mixBlendMode: 'difference' }}>
            {progress}%
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button
          onClick={isRunning ? stop : run}
          disabled={phase === 'done' && !isRunning}
          style={{ flex: 1, padding: '5px 10px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
        >
          {isRunning ? 'Stop' : 'Defragment'}
        </button>
        <button
          onClick={reset}
          style={{ flex: 1, padding: '5px 10px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }
