'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type SendState = 'idle' | 'sending' | 'sent' | 'error'

const FIELD = 'flex-1 font-ui text-[13px] text-black px-2 py-[3px] bg-white outline-none'
const FIELD_BORDER: React.CSSProperties = {
  border: '2px solid',
  borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)',
}
const LABEL = 'font-ui text-[13px] text-black w-[50px] text-right flex-shrink-0'

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sendState, setSendState] = useState<SendState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!name || !email || !message) return
    setSendState('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `HTTP ${res.status}`)
      }

      setSendState('sent')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setSendState('error')
    }
  }

  const canSend = sendState !== 'sending' && sendState !== 'sent' && !!name && !!email && !!message

  return (
    <div className="flex flex-col h-full bg-os-chrome">
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-2 py-[4px]"
        style={{ borderBottom: '2px solid var(--color-chrome-dark)' }}
      >
        <motion.button
          className="px-3 py-[3px] bg-os-chrome bevel-raised font-ui text-[13px] text-black disabled:opacity-40"
          onClick={() => handleSubmit()}
          disabled={!canSend}
          whileTap={{ filter: 'brightness(0.9)' }}
        >
          📤 Send
        </motion.button>
        <button className="px-2 py-[3px] bg-os-chrome bevel-raised font-ui text-[13px] text-black">
          📎 Attach
        </button>
        <button className="px-2 py-[3px] bg-os-chrome bevel-raised font-ui text-[13px] text-black">
          🗑 Delete
        </button>
      </div>

      {/* Form */}
      <form
        className="flex-1 flex flex-col p-2 gap-[5px] bg-white overflow-hidden relative"
        onSubmit={handleSubmit}
      >
        {/* To */}
        <div className="flex items-center gap-2">
          <span className={LABEL}>To:</span>
          <input
            className={FIELD}
            style={FIELD_BORDER}
            value="demetrenutsubidze423@gmail.com"
            readOnly
          />
        </div>

        {/* From name */}
        <div className="flex items-center gap-2">
          <span className={LABEL}>From:</span>
          <input
            className={FIELD}
            style={FIELD_BORDER}
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        {/* Reply-to email */}
        <div className="flex items-center gap-2">
          <span className={LABEL}>Email:</span>
          <input
            type="email"
            className={FIELD}
            style={FIELD_BORDER}
            placeholder="your@email.com  (so Demetre can reply)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Subject */}
        <div className="flex items-center gap-2">
          <span className={LABEL}>Subject:</span>
          <input
            className={FIELD}
            style={FIELD_BORDER}
            placeholder="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
        </div>

        {/* Message */}
        <div
          className="flex-1 flex flex-col mt-1"
          style={{ borderTop: '2px solid var(--color-chrome-dark)' }}
        >
          <textarea
            className="flex-1 font-ui text-[13px] text-black p-2 resize-none outline-none w-full"
            placeholder="Write your message here..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {sendState === 'sending' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-[48px]"
                animate={{ y: -120, rotate: 20, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeIn' }}
              >
                ✉️
              </motion.div>
              <span className="font-ui text-[13px] text-black">Sending...</span>
            </motion.div>
          )}

          {sendState === 'sent' && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 gap-3"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <span className="text-[48px]">✅</span>
              <span className="font-ui text-[14px] font-bold text-black">Message Sent!</span>
              <span className="font-ui text-[12px] text-gray-500">Demetre will get back to you soon.</span>
            </motion.div>
          )}

          {sendState === 'error' && (
            <motion.div
              className="absolute bottom-2 left-2 right-2 bg-red-100 border border-red-400 px-3 py-2 font-ui text-[12px] text-red-700 z-10 flex justify-between items-start gap-2"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            >
              <span>Failed to send: {errorMsg}</span>
              <button onClick={() => setSendState('idle')} className="font-bold flex-shrink-0">✕</button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}
