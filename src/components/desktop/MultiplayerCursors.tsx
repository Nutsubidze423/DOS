'use client'

import { useEffect, useRef, useState } from 'react'
import { usePresenceStore } from '@/store/presenceStore'

interface RemoteCursor { x: number; y: number; color: string; id: string }

const PUSHER_KEY     = process.env.NEXT_PUBLIC_PUSHER_KEY
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

export function MultiplayerCursors() {
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({})
  const channelRef    = useRef<unknown>(null)
  const subscribedRef = useRef(false)
  const myIdRef       = useRef<string>(Math.random().toString(36).slice(2, 9))
  const myColor       = useRef(CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)])
  const timeouts      = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const countRef      = useRef(0)
  const { setOnlineCount } = usePresenceStore()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!PUSHER_KEY || !PUSHER_CLUSTER) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pusher: any = null

    const init = async () => {
      const { default: PusherClient } = await import('pusher-js')

      pusher = new PusherClient(PUSHER_KEY!, {
        cluster: PUSHER_CLUSTER!,
        authEndpoint: '/api/pusher/auth',
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ch = pusher.subscribe('presence-cursors') as any
      channelRef.current = ch

      ch.bind('pusher:subscription_succeeded', (data: { count?: number }) => {
        subscribedRef.current = true
        countRef.current = data?.count ?? 1
        setOnlineCount(countRef.current)
      })

      ch.bind('pusher:member_added', () => {
        countRef.current++
        setOnlineCount(countRef.current)
      })

      ch.bind('pusher:member_removed', () => {
        countRef.current = Math.max(0, countRef.current - 1)
        setOnlineCount(countRef.current)
      })

      ch.bind('pusher:subscription_error', (err: unknown) => {
        console.warn('[Cursors] Subscription error:', err)
      })

      ch.bind('client-cursor', (data: RemoteCursor) => {
        if (data.id === myIdRef.current) return
        setCursors(prev => ({ ...prev, [data.id]: data }))
        if (timeouts.current[data.id]) clearTimeout(timeouts.current[data.id])
        timeouts.current[data.id] = setTimeout(() => {
          setCursors(prev => { const n = { ...prev }; delete n[data.id]; return n })
        }, 5000)
      })
    }

    init()

    const onMove = throttle((e: MouseEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ch = channelRef.current as any
      if (!ch?.trigger || !subscribedRef.current) return
      ch.trigger('client-cursor', {
        x: e.clientX,
        y: e.clientY,
        id: myIdRef.current,
        color: myColor.current,
      })
    }, 50)

    window.addEventListener('mousemove', onMove)

    const capturedTimeouts = timeouts.current
    return () => {
      window.removeEventListener('mousemove', onMove)
      subscribedRef.current = false
      pusher?.disconnect()
      Object.values(capturedTimeouts).forEach(clearTimeout)
    }
  }, [])

  if (!PUSHER_KEY) return null

  return (
    <>
      {Object.values(cursors).map(c => (
        <div
          key={c.id}
          style={{
            position: 'fixed',
            left: c.x,
            top: c.y,
            pointerEvents: 'none',
            zIndex: 99990,
            transform: 'translate(-2px, -2px)',
            transition: 'left 0.05s linear, top 0.05s linear',
          }}
        >
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path d="M0 0 L0 16 L4 12 L7 19 L9 18 L6 11 L11 11 Z" fill={c.color} stroke="#000" strokeWidth="1" />
          </svg>
          <div style={{
            position: 'absolute', top: 18, left: 4,
            background: c.color, color: '#000',
            fontSize: 10, fontWeight: 700,
            padding: '1px 5px', borderRadius: 3,
            whiteSpace: 'nowrap', fontFamily: 'monospace',
          }}>
            visitor
          </div>
        </div>
      ))}
    </>
  )
}

const CURSOR_COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6bdb','#ff9f43','#48dbfb','#ff9ff3']

function throttle<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let last = 0
  return (...args: T) => {
    const now = Date.now()
    if (now - last >= ms) { last = now; fn(...args) }
  }
}
