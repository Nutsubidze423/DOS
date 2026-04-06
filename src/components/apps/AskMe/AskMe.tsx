'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message { role: 'user' | 'model'; text: string }

export function AskMe() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm an AI that knows everything about Demetre. Ask me anything — his skills, experience, projects, or whether he'd be a good hire. 😄" }
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const next: Message[] = [...messages, { role: 'user', text }]
    setMessages(next)
    setLoading(true)

    try {
      const res = await fetch('/api/ask-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'model', text: data.text || 'Sorry, I had trouble answering that.' }])
    } catch {
      setMessages(m => [...m, { role: 'model', text: 'Connection error. Try again.' }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [input, loading, messages])

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }, [send])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f0f23', color: '#e0e0e0', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1e1e3a', background: '#0a0a1a', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Ask About Demetre</div>
            <div style={{ fontSize: 11, color: '#667eea' }}>AI · Powered by Gemini</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#00cc66', boxShadow: '0 0 6px #00cc66' }} />
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'model' && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end' }}>🤖</div>
            )}
            <div style={{
              maxWidth: '75%', padding: '8px 12px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? '#667eea' : '#1e1e3a',
              color: '#fff', fontSize: 13, lineHeight: 1.5,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
            <div style={{ background: '#1e1e3a', borderRadius: '18px 18px 18px 4px', padding: '10px 16px', display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#667eea', animation: 'bounce 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #1e1e3a', background: '#0a0a1a', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask anything about Demetre..."
            disabled={loading}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 20, background: '#1e1e3a', border: '1px solid #2e2e5a', color: '#fff', fontSize: 13, outline: 'none' }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{ width: 36, height: 36, borderRadius: '50%', background: input.trim() && !loading ? '#667eea' : '#2e2e5a', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            ↑
          </button>
        </div>
        <div style={{ fontSize: 10, color: '#444', textAlign: 'center', marginTop: 6 }}>
          Tip: Ask about skills, projects, availability, or say hi!
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
