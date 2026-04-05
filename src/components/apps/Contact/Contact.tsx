'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type SendState = 'idle' | 'sending' | 'sent' | 'error'

export function Contact() {
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sendState, setSendState] = useState<SendState>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSendState('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, message }),
      })

      if (!res.ok) throw new Error('Send failed')

      setSendState('sent')
    } catch {
      setSendState('error')
    }
  }

  return (
    <div className="flex flex-col h-full bg-os-chrome">
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-2 py-1"
        style={{ borderBottom: '2px solid var(--color-chrome-dark)' }}
      >
        <motion.button
          className="px-3 py-[2px] bg-os-chrome bevel-raised font-ui text-[11px] text-black disabled:opacity-50"
          onClick={handleSubmit}
          disabled={sendState === 'sending' || sendState === 'sent' || !name || !message}
          whileTap={{ filter: 'brightness(0.9)' }}
        >
          📤 Send
        </motion.button>
        <button className="px-2 py-[2px] bg-os-chrome bevel-raised font-ui text-[11px] text-black">
          📎 Attach
        </button>
        <button className="px-2 py-[2px] bg-os-chrome bevel-raised font-ui text-[11px] text-black">
          🗑 Delete
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col p-2 gap-1 bg-white overflow-hidden relative">
        {/* To field */}
        <div className="flex items-center gap-2">
          <span className="font-ui text-[11px] text-black w-[40px] text-right flex-shrink-0">To:</span>
          <input
            className="flex-1 font-ui text-[11px] text-black px-1 py-[2px] bg-white"
            style={{
              border: '2px solid',
              borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)',
            }}
            value="demetrenutsubidze423@gmail.com"
            readOnly
            onChange={() => {}}
          />
        </div>

        {/* From field */}
        <div className="flex items-center gap-2">
          <span className="font-ui text-[11px] text-black w-[40px] text-right flex-shrink-0">From:</span>
          <input
            className="flex-1 font-ui text-[11px] text-black px-1 py-[2px]"
            style={{
              border: '2px solid',
              borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)',
            }}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Subject field */}
        <div className="flex items-center gap-2">
          <span className="font-ui text-[11px] text-black w-[40px] text-right flex-shrink-0">Subject:</span>
          <input
            className="flex-1 font-ui text-[11px] text-black px-1 py-[2px]"
            style={{
              border: '2px solid',
              borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)',
            }}
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Message area */}
        <div
          className="flex-1 flex flex-col mt-1"
          style={{ borderTop: '2px solid var(--color-chrome-dark)' }}
        >
          <textarea
            className="flex-1 font-ui text-[11px] text-black p-2 resize-none outline-none w-full"
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        {/* Send animation overlay */}
        <AnimatePresence>
          {sendState === 'sending' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-[48px]"
                animate={{ y: -120, rotate: 20, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeIn' }}
              >
                ✉️
              </motion.div>
              <span className="font-ui text-[12px] text-black">Sending...</span>
            </motion.div>
          )}
          {sendState === 'sent' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <span className="text-[48px]">✅</span>
              <span className="font-ui text-[13px] font-bold text-black">Message Sent!</span>
              <span className="font-ui text-[11px] text-os-chrome-dark">
                Demetre will get back to you soon.
              </span>
            </motion.div>
          )}
          {sendState === 'error' && (
            <motion.div
              className="absolute bottom-2 left-2 right-2 bg-red-100 border border-red-400 px-3 py-2 font-ui text-[11px] text-red-700 z-10 flex justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span>Failed to send. Try again or email directly.</span>
              <button onClick={() => setSendState('idle')} className="font-bold">✕</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
