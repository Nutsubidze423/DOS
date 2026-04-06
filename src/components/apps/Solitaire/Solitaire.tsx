'use client'

import { useState, useCallback } from 'react'

type Suit = '♠' | '♥' | '♦' | '♣'
interface Card { suit: Suit; value: number; faceUp: boolean; id: string }
type Sel = { from: 'tableau' | 'waste'; pileIdx: number; cardIdx: number } | null

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

const CardBack = ({ style }: { style?: React.CSSProperties }) => (
  <div style={{ width: CARD_W, height: CARD_H, background: 'linear-gradient(135deg,#000080 0%,#0000aa 100%)', border: '2px solid #555', borderRadius: 3, flexShrink: 0, ...style }} />
)

const CardFace = ({ card, selected, onClick, style }: { card: Card; selected?: boolean; onClick?: () => void; style?: React.CSSProperties }) => {
  const red = isRed(card.suit)
  return (
    <div
      onClick={onClick}
      style={{
        width: CARD_W, height: CARD_H,
        background: selected ? '#ddf' : 'white',
        border: selected ? '2px solid #0000cc' : '2px solid #888',
        borderRadius: 3, cursor: onClick ? 'pointer' : 'default',
        position: 'relative', flexShrink: 0,
        boxShadow: selected ? '0 0 6px rgba(0,0,200,0.5)' : '1px 1px 3px rgba(0,0,0,0.3)',
        userSelect: 'none',
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

const EmptyPile = ({ onClick, label }: { onClick?: () => void; label?: string }) => (
  <div onClick={onClick} style={{ width: CARD_W, height: CARD_H, border: '2px dashed #888', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: onClick ? 'pointer' : 'default', color: '#888', fontSize: 11 }}>
    {label || ''}
  </div>
)

export function Solitaire() {
  const [state, setState] = useState<State>(deal)
  const [sel, setSel] = useState<Sel>(null)
  const [won, setWon] = useState(false)

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
        return { ...s, stock: [...s.waste].reverse().map(c => ({ ...c, faceUp: false })), waste: [] }
      }
      const [top, ...rest] = [...s.stock].reverse()
      return { ...s, stock: rest.reverse(), waste: [...s.waste, { ...top, faceUp: true }] }
    })
    setSel(null)
  }, [])

  const clickWaste = useCallback(() => {
    setState(s => {
      if (s.waste.length === 0) return s
      return s
    })
    setState(s => {
      if (s.waste.length === 0) return s
      if (sel?.from === 'waste') { setSel(null); return s }
      setSel({ from: 'waste', pileIdx: 0, cardIdx: s.waste.length - 1 })
      return s
    })
    setSel(prev => {
      setState(s => {
        if (s.waste.length === 0) return s
        if (prev?.from === 'waste') return s
        return s
      })
      return prev?.from === 'waste' ? null : null
    })
  }, [sel])

  const handleWasteClick = useCallback(() => {
    setState(s => {
      if (s.waste.length === 0) return s
      const card = s.waste[s.waste.length - 1]
      if (sel === null) {
        setSel({ from: 'waste', pileIdx: 0, cardIdx: s.waste.length - 1 })
        return s
      }
      // Try move from sel to waste top? That doesn't make sense. Clear selection.
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
      if (!card.faceUp) {
        if (ci === pile.length - 1) {
          const tab = s.tableau.map((p, i) => i === pi ? p.map((c, j) => j === ci ? { ...c, faceUp: true } : c) : p)
          setSel(null)
          return { ...s, tableau: tab }
        }
        return s
      }
      // If nothing selected, select this card
      if (sel === null) { setSel({ from: 'tableau', pileIdx: pi, cardIdx: ci }); return s }
      // If same card, deselect
      if (sel.from === 'tableau' && sel.pileIdx === pi && sel.cardIdx === ci) { setSel(null); return s }

      // Try to place selected cards onto this pile
      const srcCard = sel.from === 'waste'
        ? s.waste[s.waste.length - 1]
        : s.tableau[sel.pileIdx][sel.cardIdx]
      if (!srcCard) { setSel(null); return s }

      if (!canTableau(srcCard, pile)) {
        // Re-select clicked card instead
        setSel({ from: 'tableau', pileIdx: pi, cardIdx: ci })
        return s
      }

      // Move cards
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

  const { stock, waste, foundations, tableau } = state

  return (
    <div style={{ background: '#1a6b1a', height: '100%', overflow: 'auto', padding: 8, userSelect: 'none', position: 'relative' }}>
      {won && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--color-chrome)', border: '3px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)', padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>🎉</div>
            <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold', color: '#000080', marginTop: 8 }}>You Win!</div>
            <button onClick={() => { setState(deal()); setWon(false); setSel(null) }} style={{ marginTop: 12, fontFamily: 'monospace', fontSize: 13, padding: '4px 16px', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)', cursor: 'pointer' }}>
              New Game
            </button>
          </div>
        </div>
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
                selected={sel?.from === 'waste'}
                onClick={handleWasteClick}
                onDoubleClick={handleWasteDoubleClick}
                style={{ position: 'absolute', top: 0, left: 0 }}
              />
          }
        </div>
        <div style={{ flex: 1 }} />
        {/* Foundations */}
        {foundations.map((f, fi) => (
          <div key={fi} onClick={() => handleFoundationClick(fi)} style={{ cursor: 'pointer' }}>
            {f.length === 0
              ? <EmptyPile label={['A♠', 'A♥', 'A♦', 'A♣'][fi]} onClick={() => handleFoundationClick(fi)} />
              : <CardFace card={f[f.length - 1]} onClick={() => handleFoundationClick(fi)} />
            }
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
        {tableau.map((pile, pi) => (
          <div key={pi} style={{ position: 'relative', width: CARD_W, minHeight: CARD_H }}>
            {pile.length === 0
              ? <EmptyPile onClick={() => handleTableauClick(pi, 0)} />
              : pile.map((card, ci) => {
                  const top = ci * (card.faceUp ? STACK_OFFSET_UP : STACK_OFFSET_DOWN)
                  return card.faceUp
                    ? <CardFace
                        key={card.id}
                        card={card}
                        selected={sel?.from === 'tableau' && sel.pileIdx === pi && sel.cardIdx === ci}
                        onClick={() => handleTableauClick(pi, ci)}
                        onDoubleClick={() => handleTableauDoubleClick(pi, ci)}
                        style={{ position: 'absolute', top, left: 0, zIndex: ci }}
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
        style={{ position: 'fixed', bottom: 60, right: 8, fontFamily: 'monospace', fontSize: 11, padding: '3px 10px', background: 'var(--color-chrome)', border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)', cursor: 'pointer' }}
      >
        New Game
      </button>
    </div>
  )
}
