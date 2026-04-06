'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useWindowStore } from '@/store/windowStore'

const MESSAGES_GENERIC = [
  "It looks like you're browsing a portfolio. Need help getting hired?",
  "Hi! I'm Clippy. I noticed you're checking out Demetre's work. Good taste!",
  "Did you know Demetre knows React, Next.js, and TypeScript? I wrote that down.",
  "You've been exploring for a while. Ready to send a message? Try the Contact app!",
  "I see you're using Internet Explorer. You're a real one.",
  "Fun fact: This entire OS was built with Next.js and Framer Motion.",
  "It looks like you're looking for a developer. Demetre is available for hire!",
  "Have you tried the Terminal? Type anything — there's an AI in there.",
]

const MESSAGES_BY_APP: Record<string, string> = {
  'terminal': "I see you opened the Terminal. Did you know it has AI? Just type anything!",
  'contact': "It looks like you're writing a message. Need help? I suggest saying hi!",
  'resume': "Reviewing a resume, I see. Demetre has great skills. Just saying.",
  'projects': "Ooh, projects! These were built with blood, sweat, and TypeScript.",
  'skills': "Impressive skill set! I counted React, TypeScript, and more.",
  'about-me': "Learning about Demetre? Great choice. I've known him for years.",
  'browser': "Internet Explorer! Classic. Some sites may not display correctly.",
  'recycle-bin': "You opened the Recycle Bin. I won't judge.",
  'solitaire': "Solitaire? Really? You're supposed to be hiring someone here.",
  'music-player': "Ah, music! Setting the vibe. Good call.",
  'my-computer': "Impressive specs, right? Don't ask about the RAM.",
  'control-panel': "Customizing things? That's very you.",
}

export function Clippy() {
  const { windows } = useWindowStore()
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [message, setMessage] = useState('')
  const [showBubble, setShowBubble] = useState(false)
  const [blinking, setBlinking] = useState(false)
  const msgIndexRef = useRef(0)
  const prevAppsRef = useRef<Set<string>>(new Set())

  const showMessage = useCallback((msg: string) => {
    setMessage(msg)
    setShowBubble(true)
    setBlinking(true)
    setTimeout(() => setBlinking(false), 600)
    setTimeout(() => setShowBubble(false), 8000)
  }, [])

  // Appear after 6 seconds
  useEffect(() => {
    if (dismissed) return
    const t = setTimeout(() => {
      setVisible(true)
      setTimeout(() => showMessage(MESSAGES_GENERIC[0]), 800)
    }, 6000)
    return () => clearTimeout(t)
  }, [dismissed, showMessage])

  // React to newly opened apps
  useEffect(() => {
    const currentApps = new Set(Object.values(windows).map(w => w.appId))
    for (const appId of currentApps) {
      if (!prevAppsRef.current.has(appId) && MESSAGES_BY_APP[appId]) {
        setTimeout(() => showMessage(MESSAGES_BY_APP[appId]), 1000)
      }
    }
    prevAppsRef.current = currentApps
  }, [windows, showMessage])

  // Periodic messages
  useEffect(() => {
    if (!visible || dismissed) return
    const interval = setInterval(() => {
      if (!showBubble) {
        msgIndexRef.current = (msgIndexRef.current + 1) % MESSAGES_GENERIC.length
        showMessage(MESSAGES_GENERIC[msgIndexRef.current])
      }
    }, 35000)
    return () => clearInterval(interval)
  }, [visible, dismissed, showBubble, showMessage])

  if (!visible || dismissed) return null

  return (
    <div
      className="fixed select-none"
      style={{ bottom: 64, right: 24, zIndex: 9800 }}
    >
      {/* Speech bubble */}
      {showBubble && (
        <div
          className="absolute font-ui text-[12px] text-black p-3 mb-2"
          style={{
            bottom: '100%',
            right: 0,
            width: 220,
            background: 'var(--color-chrome)',
            border: '2px solid',
            borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
            boxShadow: '2px 2px 6px rgba(0,0,0,0.4)',
            marginBottom: 8,
          }}
        >
          {/* Close button */}
          <button
            className="absolute top-1 right-1 w-[16px] h-[14px] text-[10px] font-bold text-black bg-os-chrome hover:bg-red-500 hover:text-white flex items-center justify-center"
            style={{ border: '1px solid var(--color-bevel-dark)' }}
            onClick={() => setShowBubble(false)}
          >
            ✕
          </button>
          <p className="pr-4 leading-snug">{message}</p>
          <div className="flex gap-1 mt-2">
            <button
              className="font-ui text-[10px] px-2 py-[1px] text-black hover:bg-[#000080] hover:text-white"
              style={{ border: '1px solid var(--color-bevel-dark)' }}
              onClick={() => setShowBubble(false)}
            >
              OK
            </button>
            <button
              className="font-ui text-[10px] px-2 py-[1px] text-black hover:bg-[#000080] hover:text-white"
              style={{ border: '1px solid var(--color-bevel-dark)' }}
              onClick={() => { setShowBubble(false); setDismissed(true) }}
            >
              Go away
            </button>
          </div>
          {/* Bubble tail */}
          <div style={{ position: 'absolute', bottom: -8, right: 24, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid var(--color-bevel-dark)' }} />
        </div>
      )}

      {/* Clippy character */}
      <div
        className="cursor-pointer"
        style={{ animation: blinking ? 'none' : 'clippyBob 3s ease-in-out infinite' }}
        onClick={() => {
          msgIndexRef.current = (msgIndexRef.current + 1) % MESSAGES_GENERIC.length
          showMessage(MESSAGES_GENERIC[msgIndexRef.current])
        }}
        title="Click me!"
      >
        <svg width="52" height="64" viewBox="0 0 52 64" fill="none">
          {/* Body - paperclip shape */}
          <path d="M26 4 C16 4 10 12 10 20 L10 44 C10 52 16 58 26 58 C36 58 42 52 42 44 L42 20 C42 12 36 4 26 4Z" fill="#c8c000" stroke="#888" strokeWidth="2"/>
          <path d="M26 12 C20 12 16 16 16 22 L16 44 C16 49 20 52 26 52 C32 52 36 49 36 44 L36 22 C36 16 32 12 26 12Z" fill="#e8e000" stroke="#888" strokeWidth="1.5"/>
          {/* Eyes */}
          <ellipse cx="21" cy="28" rx="3" ry="4" fill="white" stroke="#333" strokeWidth="1"/>
          <ellipse cx="31" cy="28" rx="3" ry="4" fill="white" stroke="#333" strokeWidth="1"/>
          <circle cx={blinking ? 21 : 22} cy="29" r="1.5" fill="#1a1a8c"/>
          <circle cx={blinking ? 31 : 32} cy="29" r="1.5" fill="#1a1a8c"/>
          {/* Mouth */}
          <path d="M20 36 Q26 40 32 36" stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          {/* Arms */}
          <path d="M10 30 L2 26" stroke="#c8c000" strokeWidth="3" strokeLinecap="round"/>
          <path d="M42 30 L50 26" stroke="#c8c000" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>

      <style>{`
        @keyframes clippyBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
