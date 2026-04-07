'use client'

import { useState, useCallback, useEffect, useRef, type CSSProperties } from 'react'

type Suit = '♠' | '♥' | '♦' | '♣'
interface Card { suit: Suit; value: number; faceUp: boolean; id: string }
type Sel = { from: 'tableau' | 'waste'; pileIdx: number; cardIdx: number } | null

interface DragState {
  from: 'tableau' | 'waste'
  pileIdx: number
  cardIdx: number
  cards: Card[]
  startX: number
  startY: number
  originX: number
  originY: number
  currentX: number
  currentY: number
  moved: boolean
}

const RED: Suit[] = ['♥', '♦']
const isRed = (s: Suit) => RED.includes(s)
const valStr = (v: number) => v === 1 ? 'A' : v === 11 ? 'J' : v === 12 ? 'Q' : v === 13 ? 'K' : String(v)

function createDeck(): Card[] {
  const suits: Suit[] = ['♠', '♥', '♦', '♣']
  return suits.flatMap(suit =>
    Array.from({ length: 13 }, (_, i) => ({ suit, value: i + 1, faceUp: false, id: `${suit}${i + 1}` }))
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function deal() {
  const deck = shuffle(createDeck())
  const tableau: Card[][] = []
  let i = 0
  for (let col = 0; col < 7; col++) {
    const pile: Card[] = []
    for (let row = 0; row <= col; row++) {
      pile.push({ ...deck[i++], faceUp: row === col })
    }
    tableau.push(pile)
  }
  return { stock: deck.slice(i).map(c => ({ ...c, faceUp: false })), waste: [] as Card[], foundations: [[], [], [], []] as Card[][], tableau }
}

function canFoundation(card: Card, pile: Card[]) {
  if (pile.length === 0) return card.value === 1
  const top = pile[pile.length - 1]
  return top.suit === card.suit && card.value === top.value + 1
}

function canTableau(card: Card, pile: Card[]) {
  if (pile.length === 0) return card.value === 13
  const top = pile[pile.length - 1]
  return top.faceUp && isRed(card.suit) !== isRed(top.suit) && card.value === top.value - 1
}

type State = ReturnType<typeof deal>

const CARD_W = 54, CARD_H = 76, STACK_OFFSET_DOWN = 18, STACK_OFFSET_UP = 28

const CardBack = ({ style }: { style?: CSSProperties }) => (
  <div style={{ width: CARD_W, height: CARD_H, background: 'linear-gradient(135deg,#000080 0%,#0000aa 100%)', border: '2px solid #555', borderRadius: 3, flexShrink: 0, ...style }} />
)

const CardFace = ({ card, selected, onClick, onDoubleClick, onMouseDown, style, ghost }: {
  card: Card; selected?: boolean; onClick?: () => void; onDoubleClick?: () => void
  onMouseDown?: (e: React.MouseEvent) => void; style?: CSSProperties; ghost?: boolean
}) => {
  const red = isRed(card.suit)
  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
      style={{
        width: CARD_W, height: CARD_H,
        background: selected ? '#ddf' : 'white',
        border: selected ? '2px solid #0000cc' : '2px solid #888',
        borderRadius: 3, cursor: onClick || onMouseDown ? 'grab' : 'default',
        position: 'relative', flexShrink: 0,
        boxShadow: ghost
          ? '4px 4px 12px rgba(0,0,0,0.5)'
          : selected ? '0 0 6px rgba(0,0,200,0.5)' : '1px 1px 3px rgba(0,0,0,0.3)',
        userSelect: 'none',
        opacity: ghost ? 0.85 : 1,
        ...style,
      }}
    >
      <div style={{ position: 'absolute', top: 2, left: 3, fontSize: 11, fontWeight: 'bold', color: red ? '#cc0000' : '#000', lineHeight: 1.1 }}>
        {valStr(card.value)}<br />{card.suit}
      </div>
      <div style={{ position: 'absolute', bottom: 2, right: 3, fontSize: 11, fontWeight: 'bold', color: red ? '#cc0000' : '#000', transform: 'rotate(180deg)', lineHeight: 1.1 }}>
        {valStr(card.value)}<br />{card.suit}
      </div>
    </div>
  )
}

const EmptyPile = ({ onClick, label, dataAttr }: { onClick?: () => void; label?: string; dataAttr?: Record<string, string> }) => (
  <div onClick={onClick} {...dataAttr} style={{ width: CARD_W, height: CARD_H, border: '2px dashed #888', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onClick ? 'pointer' : 'default', color: '#888', fontSize: 11 }}>
    {label || ''}
  </div>
)

// ─── Win cascade ─────────────────────────────────────────────────────────────
interface CascadeCard {
  suit: Suit; value: number
  x: number; y: number; dx: number; dy: number
}

function WinCascade() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.width = window.innerWidth
    const H = canvas.height = window.innerHeight
    const CW = 42, CH = 58

    const suits: Suit[] = ['♠', '♥', '♦', '♣']
    const cards: CascadeCard[] = Array.from({ length: 52 }, (_, i) => ({
      suit: suits[Math.floor(i / 13)],
      value: (i % 13) + 1,
      x: W * 0.5 + (Math.random() - 0.5) * W * 0.5,
      y: H * 0.1 + Math.random() * H * 0.3,
      dx: (Math.random() - 0.5) * 10,
      dy: -(Math.random() * 8 + 2),
    }))

    let raf: number
    const tick = () => {
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, W, H)

      for (const c of cards) {
        c.dy += 0.28
        c.x  += c.dx
        c.y  += c.dy

        if (c.x < 0)        { c.x = 0;       c.dx =  Math.abs(c.dx) }
        if (c.x + CW > W)   { c.x = W - CW;  c.dx = -Math.abs(c.dx) }
        if (c.y + CH > H)   { c.y = H - CH;  c.dy = -Math.abs(c.dy) * 0.82 }

        // card body
        ctx.fillStyle = '#fff'
        ctx.strokeStyle = '#aaa'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(c.x, c.y, CW, CH, 3)
        ctx.fill()
        ctx.stroke()

        // pip
        const red = c.suit === '♥' || c.suit === '♦'
        ctx.fillStyle = red ? '#cc0000' : '#000'
        ctx.font = 'bold 10px monospace'
        ctx.fillText(valStr(c.value), c.x + 3, c.y + 12)
        ctx.font = '10px monospace'
        ctx.fillText(c.suit, c.x + 3, c.y + 23)
      }

      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 90, pointerEvents: 'none' }}
    />
  )
}

// Natural width of the game layout (7 piles * card + gaps)
const GAME_W = 7 * CARD_W + 6 * 6 + 16

export function Solitaire() {
  const [state, setState] = useState<State>(deal)
  const [sel, setSel]     = useState<Sel>(null)
  const [won, setWon]     = useState(false)
  const [scale, setScale] = useState(1)
  const outerRef  = useRef<HTMLDivElement>(null)
  const gameRef   = useRef<HTMLDivElement>(null)
  const [drag, setDrag]   = useState<DragState | null>(null)

  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const available = el.clientWidth - 8
      setScale(Math.min(1, available / GAME_W))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const checkWin = useCallback((s: State) => s.foundations.every(f => f.length === 13), [])

  const autoMoveToFoundation = useCallback((card: Card, s: State): { s: State; moved: boolean } => {
    for (let fi = 0; fi < 4; fi++) {
      if (canFoundation(card, s.foundations[fi])) {
        const f = s.foundations.map((p, i) => i === fi ? [...p, { ...card, faceUp: true }] : p)
        return { s: { ...s, foundations: f }, moved: true }
      }
    }
    return { s, moved: false }
  }, [])

  const clickStock = useCallback(() => {
    setState(s => {
      if (s.stock.length === 0) {
        if (s.waste.length === 0) return s
        return { ...s, stock: [...s.waste].reverse().map(c => ({ ...c, faceUp: false } as Card)), waste: [] as Card[] }
      }
      const reversed = [...s.stock].reverse()
      const top = reversed[0]
      const rest = reversed.slice(1)
      return { ...s, stock: rest.reverse(), waste: [...s.waste, { ...top, faceUp: true } as Card] }
    })
    setSel(null)
  }, [])

  const handleWasteClick = useCallback(() => {
    setState(s => {
      if (s.waste.length === 0) return s
      if (sel === null) {
        setSel({ from: 'waste', pileIdx: 0, cardIdx: s.waste.length - 1 })
        return s
      }
      setSel(null)
      return s
    })
  }, [sel])

  const handleWasteDoubleClick = useCallback(() => {
    setSel(null)
    setState(s => {
      if (s.waste.length === 0) return s
      const card = s.waste[s.waste.length - 1]
      const { s: ns, moved } = autoMoveToFoundation(card, s)
      if (!moved) return s
      const next = { ...ns, waste: s.waste.slice(0, -1) }
      if (checkWin(next)) setWon(true)
      return next
    })
  }, [autoMoveToFoundation, checkWin])

  const handleFoundationClick = useCallback((fi: number) => {
    if (sel === null) return
    setState(s => {
      const card = sel.from === 'waste'
        ? s.waste[s.waste.length - 1]
        : s.tableau[sel.pileIdx][sel.cardIdx]
      if (!card || !canFoundation(card, s.foundations[fi])) { setSel(null); return s }

      const foundations = s.foundations.map((p, i) => i === fi ? [...p, { ...card, faceUp: true }] : p)
      let ns: State
      if (sel.from === 'waste') {
        ns = { ...s, foundations, waste: s.waste.slice(0, -1) }
      } else {
        const tab = s.tableau.map((p, pi) => {
          if (pi !== sel.pileIdx) return p
          const np = p.slice(0, sel.cardIdx)
          if (np.length > 0) np[np.length - 1] = { ...np[np.length - 1], faceUp: true }
          return np
        })
        ns = { ...s, foundations, tableau: tab }
      }
      setSel(null)
      if (checkWin(ns)) setWon(true)
      return ns
    })
  }, [sel, checkWin])

  const handleTableauClick = useCallback((pi: number, ci: number) => {
    setState(s => {
      const pile = s.tableau[pi]
      const card = pile[ci]
      if (card && !card.faceUp) {
        if (ci === pile.length - 1) {
          const tab = s.tableau.map((p, i) => i === pi ? p.map((c, j) => j === ci ? { ...c, faceUp: true } : c) : p)
          setSel(null)
          return { ...s, tableau: tab }
        }
        return s
      }
      if (sel === null) { setSel({ from: 'tableau', pileIdx: pi, cardIdx: ci }); return s }
      if (sel.from === 'tableau' && sel.pileIdx === pi && sel.cardIdx === ci) { setSel(null); return s }

      const srcCard = sel.from === 'waste'
        ? s.waste[s.waste.length - 1]
        : s.tableau[sel.pileIdx][sel.cardIdx]
      if (!srcCard) { setSel(null); return s }

      if (!canTableau(srcCard, pile)) {
        setSel({ from: 'tableau', pileIdx: pi, cardIdx: ci })
        return s
      }

      let moving: Card[]
      let ns: State
      if (sel.from === 'waste') {
        moving = [{ ...srcCard, faceUp: true }]
        ns = { ...s, waste: s.waste.slice(0, -1) }
      } else {
        moving = s.tableau[sel.pileIdx].slice(sel.cardIdx).map(c => ({ ...c, faceUp: true }))
        const srcTab = s.tableau.map((p, i) => {
          if (i !== sel.pileIdx) return p
          const np = p.slice(0, sel.cardIdx)
          if (np.length > 0) np[np.length - 1] = { ...np[np.length - 1], faceUp: true }
          return np
        })
        ns = { ...s, tableau: srcTab }
      }
      const dstTab = ns.tableau.map((p, i) => i === pi ? [...p, ...moving] : p)
      setSel(null)
      return { ...ns, tableau: dstTab }
    })
  }, [sel])

  const handleTableauDoubleClick = useCallback((pi: number, ci: number) => {
    setSel(null)
    setState(s => {
      const pile = s.tableau[pi]
      if (ci !== pile.length - 1 || !pile[ci].faceUp) return s
      const card = pile[ci]
      const { s: ns, moved } = autoMoveToFoundation(card, s)
      if (!moved) return s
      const tab = ns.tableau.map((p, i) => {
        if (i !== pi) return p
        const np = p.slice(0, -1)
        if (np.length > 0) np[np.length - 1] = { ...np[np.length - 1], faceUp: true }
        return np
      })
      const next = { ...ns, tableau: tab }
      if (checkWin(next)) setWon(true)
      return next
    })
  }, [autoMoveToFoundation, checkWin])

  // ─── Drag ────────────────────────────────────────────────────────────────────
  const startDrag = useCallback((
    e: React.MouseEvent,
    from: 'tableau' | 'waste',
    pileIdx: number,
    cardIdx: number,
    cards: Card[],
  ) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDrag({
      from, pileIdx, cardIdx, cards,
      startX: e.clientX, startY: e.clientY,
      originX: rect.left, originY: rect.top,
      currentX: e.clientX, currentY: e.clientY,
      moved: false,
    })
  }, [])

  const onContainerMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag) return
    setDrag(d => d ? {
      ...d,
      currentX: e.clientX,
      currentY: e.clientY,
      moved: d.moved || Math.abs(e.clientX - d.startX) > 4 || Math.abs(e.clientY - d.startY) > 4,
    } : null)
  }, [drag])

  const executeDrop = useCallback((targetEl: Element | null) => {
    if (!drag || !drag.moved) { setDrag(null); return }
    const pileEl = targetEl?.closest('[data-pile]') as HTMLElement | null
    if (!pileEl) { setDrag(null); return }

    const pileType = pileEl.dataset.pile
    const pileIdx  = parseInt(pileEl.dataset.pileIdx ?? '0')

    setState(s => {
      const srcCard = drag.from === 'waste' ? s.waste[s.waste.length - 1] : s.tableau[drag.pileIdx][drag.cardIdx]
      if (!srcCard) return s

      if (pileType === 'foundation') {
        if (drag.cards.length !== 1 || !canFoundation(srcCard, s.foundations[pileIdx])) return s
        const foundations = s.foundations.map((p, i) => i === pileIdx ? [...p, { ...srcCard, faceUp: true }] : p)
        let ns: State
        if (drag.from === 'waste') {
          ns = { ...s, foundations, waste: s.waste.slice(0, -1) }
        } else {
          const tab = s.tableau.map((p, pi) => {
            if (pi !== drag.pileIdx) return p
            const np = p.slice(0, drag.cardIdx)
            if (np.length > 0) np[np.length - 1] = { ...np[np.length - 1], faceUp: true }
            return np
          })
          ns = { ...s, foundations, tableau: tab }
        }
        if (checkWin(ns)) setWon(true)
        return ns
      }

      if (pileType === 'tableau') {
        if (!canTableau(srcCard, s.tableau[pileIdx])) return s
        let moving: Card[]
        let ns: State
        if (drag.from === 'waste') {
          moving = [{ ...srcCard, faceUp: true }]
          ns = { ...s, waste: s.waste.slice(0, -1) }
        } else {
          moving = s.tableau[drag.pileIdx].slice(drag.cardIdx).map(c => ({ ...c, faceUp: true }))
          const srcTab = s.tableau.map((p, i) => {
            if (i !== drag.pileIdx) return p
            const np = p.slice(0, drag.cardIdx)
            if (np.length > 0) np[np.length - 1] = { ...np[np.length - 1], faceUp: true }
            return np
          })
          ns = { ...s, tableau: srcTab }
        }
        const dstTab = ns.tableau.map((p, i) => i === pileIdx ? [...p, ...moving] : p)
        return { ...ns, tableau: dstTab }
      }

      return s
    })
    setSel(null)
    setDrag(null)
  }, [drag, checkWin])

  const onContainerMouseUp = useCallback((e: React.MouseEvent) => {
    if (!drag) return
    if (!drag.moved) { setDrag(null); return }
    const el = document.elementFromPoint(e.clientX, e.clientY)
    executeDrop(el)
  }, [drag, executeDrop])

  // Global mouseup catches releases outside container
  useEffect(() => {
    if (!drag) return
    const up = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      executeDrop(el)
    }
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [drag, executeDrop])

  const { stock, waste, foundations, tableau } = state

  // Determine which source cards to hide during drag
  const isDragSource = useCallback((from: 'tableau' | 'waste', pi: number, ci: number) => {
    if (!drag || !drag.moved) return false
    if (drag.from !== from) return false
    if (drag.from === 'waste') return true
    return pi === drag.pileIdx && ci >= drag.cardIdx
  }, [drag])

  const ghostLeft = drag ? drag.originX + (drag.currentX - drag.startX) : 0
  const ghostTop  = drag ? drag.originY + (drag.currentY - drag.startY) : 0

  return (
    <div
      ref={outerRef}
      style={{ background: '#1a6b1a', height: '100%', overflow: 'auto', userSelect: 'none', position: 'relative', cursor: drag?.moved ? 'grabbing' : undefined }}
      onMouseMove={onContainerMouseMove}
      onMouseUp={onContainerMouseUp}
    >
    <div ref={gameRef} style={{ transformOrigin: 'top left', transform: `scale(${scale})`, width: GAME_W, padding: 8 }}>
      {won && (
        <>
          <WinCascade />
          <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100, pointerEvents: 'none' }}>
            <div style={{ background: 'var(--color-chrome)', border: '3px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)', padding: 24, textAlign: 'center', pointerEvents: 'auto' }}>
              <div style={{ fontSize: 48 }}>🎉</div>
              <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold', color: '#000080', marginTop: 8 }}>You Win!</div>
              <button onClick={() => { setState(deal()); setWon(false); setSel(null) }} style={{ marginTop: 12, fontFamily: 'monospace', fontSize: 13, padding: '4px 16px', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)', cursor: 'pointer' }}>
                New Game
              </button>
            </div>
          </div>
        </>
      )}

      {/* Top row */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'flex-start' }}>
        {/* Stock */}
        <div onClick={clickStock} style={{ cursor: 'pointer' }}>
          {stock.length > 0 ? <CardBack /> : <EmptyPile onClick={clickStock} label="↺" />}
        </div>
        {/* Waste */}
        <div style={{ position: 'relative', width: CARD_W, height: CARD_H }}>
          {waste.length === 0
            ? <EmptyPile />
            : <CardFace
                card={waste[waste.length - 1]}
                selected={sel?.from === 'waste' && !isDragSource('waste', 0, waste.length - 1)}
                onClick={handleWasteClick}
                onDoubleClick={handleWasteDoubleClick}
                onMouseDown={e => startDrag(e, 'waste', 0, waste.length - 1, [waste[waste.length - 1]])}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  opacity: isDragSource('waste', 0, waste.length - 1) ? 0.25 : 1,
                }}
              />
          }
        </div>
        <div style={{ flex: 1 }} />
        {/* Foundations */}
        {foundations.map((f, fi) => (
          <div key={fi} data-pile="foundation" data-pile-idx={fi} onClick={() => handleFoundationClick(fi)} style={{ cursor: 'pointer' }}>
            {f.length === 0
              ? <EmptyPile label={['A♠', 'A♥', 'A♦', 'A♣'][fi]} />
              : <CardFace card={f[f.length - 1]} />
            }
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        {tableau.map((pile, pi) => (
          <div
            key={pi}
            data-pile="tableau"
            data-pile-idx={pi}
            style={{ position: 'relative', width: CARD_W, minHeight: CARD_H }}
          >
            {pile.length === 0
              ? <EmptyPile onClick={() => handleTableauClick(pi, 0)} />
              : pile.map((card, ci) => {
                  const top = ci * (card.faceUp ? STACK_OFFSET_UP : STACK_OFFSET_DOWN)
                  const isSource = isDragSource('tableau', pi, ci)
                  return card.faceUp
                    ? <CardFace
                        key={card.id}
                        card={card}
                        selected={sel?.from === 'tableau' && sel.pileIdx === pi && sel.cardIdx === ci && !isSource}
                        onClick={() => handleTableauClick(pi, ci)}
                        onDoubleClick={() => handleTableauDoubleClick(pi, ci)}
                        onMouseDown={e => startDrag(e, 'tableau', pi, ci, tableau[pi].slice(ci))}
                        style={{ position: 'absolute', top, left: 0, zIndex: ci, opacity: isSource ? 0.25 : 1 }}
                      />
                    : <CardBack key={card.id} style={{ position: 'absolute', top, left: 0, zIndex: ci }} />
                })
            }
            {/* invisible hit area to size container */}
            <div style={{ height: pile.length === 0 ? CARD_H : pile.length * STACK_OFFSET_DOWN + CARD_H }} />
          </div>
        ))}
      </div>

      {/* New game button */}
      <button
        onClick={() => { setState(deal()); setWon(false); setSel(null) }}
        style={{ position: 'fixed', bottom: 60, right: 8, fontFamily: 'monospace', fontSize: 11, padding: '3px 10px', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)', cursor: 'pointer', zIndex: 10 }}
      >
        New Game
      </button>
    </div>

    {/* Drag ghost */}
    {drag?.moved && (
      <div style={{ position: 'fixed', left: ghostLeft, top: ghostTop, pointerEvents: 'none', zIndex: 1000 }}>
        {drag.cards.map((card, i) => (
          <CardFace
            key={card.id}
            card={card}
            ghost
            style={{ position: 'absolute', top: i * STACK_OFFSET_UP, left: 0, zIndex: i }}
          />
        ))}
      </div>
    )}
    </div>
  )
}
