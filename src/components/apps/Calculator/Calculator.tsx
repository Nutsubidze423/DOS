'use client'

import { useState, useEffect, useCallback } from 'react'

type Op = '+' | '-' | '×' | '÷' | null

function calculate(a: number, b: number, op: Op): number {
  if (op === '+') return a + b
  if (op === '-') return a - b
  if (op === '×') return a * b
  if (op === '÷') return b === 0 ? 0 : a / b
  return b
}

function fmtDisplay(s: string): string {
  const n = parseFloat(s)
  if (s.length > 13) return n.toExponential(6)
  return s
}

export function Calculator() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev]       = useState<number | null>(null)
  const [op, setOp]           = useState<Op>(null)
  const [waitNext, setWaitNext] = useState(false)

  const inputDigit = useCallback((d: string) => {
    setDisplay(cur => {
      if (waitNext) { setWaitNext(false); return d === '.' ? '0.' : d }
      if (cur === '0' && d !== '.') return d
      if (d === '.' && cur.includes('.')) return cur
      if (cur.length >= 13) return cur
      return cur + d
    })
  }, [waitNext])

  const inputOp = useCallback((newOp: Op) => {
    const current = parseFloat(display)
    if (prev !== null && !waitNext) {
      const result = calculate(prev, current, op)
      const str = String(result)
      setDisplay(str)
      setPrev(result)
    } else {
      setPrev(current)
    }
    setOp(newOp)
    setWaitNext(true)
  }, [display, prev, op, waitNext])

  const equals = useCallback(() => {
    if (prev === null || op === null) return
    const current = parseFloat(display)
    const result = calculate(prev, current, op)
    setDisplay(String(result))
    setPrev(null)
    setOp(null)
    setWaitNext(true)
  }, [display, prev, op])

  const clear = useCallback(() => {
    setDisplay('0')
    setPrev(null)
    setOp(null)
    setWaitNext(false)
  }, [])

  const backspace = useCallback(() => {
    setDisplay(d => (d.length > 1 && d !== '-0') ? d.slice(0, -1) : '0')
  }, [])

  const toggleSign = useCallback(() => {
    setDisplay(d => String(-parseFloat(d)))
  }, [])

  const percent = useCallback(() => {
    setDisplay(d => String(parseFloat(d) / 100))
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') { inputDigit(e.key) }
      else if (e.key === '.') { inputDigit('.') }
      else if (e.key === '+') { inputOp('+') }
      else if (e.key === '-') { inputOp('-') }
      else if (e.key === '*') { inputOp('×') }
      else if (e.key === '/') { e.preventDefault(); inputOp('÷') }
      else if (e.key === 'Enter' || e.key === '=') { equals() }
      else if (e.key === 'Escape') { clear() }
      else if (e.key === 'Backspace') { backspace() }
      else if (e.key === '%') { percent() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [inputDigit, inputOp, equals, clear, backspace, percent])

  const btn = (label: string, onClick: () => void, variant: 'num' | 'op' | 'eq' | 'fn' = 'num') => {
    const colors = {
      num: { bg: 'var(--color-chrome)', color: '#000' },
      fn:  { bg: '#b0adb5', color: '#000' },
      op:  { bg: '#a8a5b0', color: '#000' },
      eq:  { bg: '#000080', color: '#fff' },
    }
    const { bg, color } = colors[variant]
    return (
      <button
        key={label}
        onClick={onClick}
        style={{
          width: '100%', height: '100%', fontSize: 15, fontFamily: 'monospace',
          background: bg, color,
          border: '2px solid',
          borderColor: variant === 'eq'
            ? 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)'
            : 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
          cursor: 'pointer',
          fontWeight: variant === 'eq' ? 'bold' : 'normal',
        }}
      >
        {label}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-chrome)', padding: 8, gap: 4 }}>
      {/* Display */}
      <div style={{
        background: '#c8e8c8',
        border: '2px solid',
        borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)',
        padding: '6px 10px',
        textAlign: 'right',
        fontFamily: 'monospace',
        fontSize: 26,
        fontWeight: 'bold',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        minHeight: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
      }}>
        {op && <span style={{ fontSize: 14, color: '#555', alignSelf: 'flex-end', paddingBottom: 4 }}>{op}</span>}
        {fmtDisplay(display)}
      </div>

      {/* Button grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', gap: 3, flex: 1 }}>
        {btn('C', clear, 'fn')}
        {btn('±', toggleSign, 'fn')}
        {btn('%', percent, 'fn')}
        {btn('÷', () => inputOp('÷'), 'op')}

        {btn('7', () => inputDigit('7'))}
        {btn('8', () => inputDigit('8'))}
        {btn('9', () => inputDigit('9'))}
        {btn('×', () => inputOp('×'), 'op')}

        {btn('4', () => inputDigit('4'))}
        {btn('5', () => inputDigit('5'))}
        {btn('6', () => inputDigit('6'))}
        {btn('−', () => inputOp('-'), 'op')}

        {btn('1', () => inputDigit('1'))}
        {btn('2', () => inputDigit('2'))}
        {btn('3', () => inputDigit('3'))}
        {btn('+', () => inputOp('+'), 'op')}

        {btn('0', () => inputDigit('0'))}
        {btn('.', () => inputDigit('.'))}
        {btn('⌫', backspace, 'fn')}
        {btn('=', equals, 'eq')}
      </div>
    </div>
  )
}
