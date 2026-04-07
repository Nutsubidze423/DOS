'use client'

import { useState, useRef, useCallback } from 'react'

const HOME = 'https://en.m.wikipedia.org/wiki/Windows_98'

const BOOKMARKS = [
  { label: 'Wikipedia', url: 'https://en.m.wikipedia.org/wiki/Main_Page' },
  { label: 'Archive.org', url: 'https://archive.org' },
  { label: 'GitHub', url: 'https://github.com/Nutsubidze423' },
  { label: 'MDN', url: 'https://developer.mozilla.org/en-US/' },
]

export function Browser() {
  const [src, setSrc] = useState(HOME)
  const [input, setInput] = useState(HOME)
  const [loading, setLoading] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const historyStack = useRef<string[]>([HOME])
  const historyIndex = useRef(0)

  const navigate = useCallback((raw: string) => {
    let url = raw.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    setBlocked(false)
    setLoading(true)
    setSrc(url)
    setInput(url)
    historyStack.current = historyStack.current.slice(0, historyIndex.current + 1)
    historyStack.current.push(url)
    historyIndex.current = historyStack.current.length - 1
  }, [])

  const goBack = useCallback(() => {
    if (historyIndex.current <= 0) return
    historyIndex.current -= 1
    const url = historyStack.current[historyIndex.current]
    setBlocked(false); setLoading(true); setSrc(url); setInput(url)
  }, [])

  const goForward = useCallback(() => {
    if (historyIndex.current >= historyStack.current.length - 1) return
    historyIndex.current += 1
    const url = historyStack.current[historyIndex.current]
    setBlocked(false); setLoading(true); setSrc(url); setInput(url)
  }, [])

  const reload = useCallback(() => {
    setBlocked(false)
    setLoading(true)
    if (iframeRef.current) iframeRef.current.src = src
  }, [src])

  const handleLoad = useCallback(() => {
    setLoading(false)
    try {
      const doc = iframeRef.current?.contentDocument
      setBlocked(doc == null)
    } catch {
      setBlocked(true)
    }
  }, [])

  const handleError = useCallback(() => { setLoading(false); setBlocked(true) }, [])

  const openExternal = useCallback(() => { window.open(src, '_blank', 'noopener,noreferrer') }, [src])

  const canBack = historyIndex.current > 0
  const canForward = historyIndex.current < historyStack.current.length - 1

  const BTN = 'w-[26px] h-[26px] flex items-center justify-center font-bold text-[14px] text-black hover:bg-os-chrome-light disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0'
  const BTN_BORDER: React.CSSProperties = { border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }

  return (
    <div className="flex flex-col h-full bg-os-chrome">
      {/* Toolbar */}
      <div className="flex items-center gap-[3px] px-[4px] py-[4px]" style={{ borderBottom: '2px solid var(--color-bevel-dark)', background: 'var(--color-chrome)' }}>
        <button onClick={goBack} disabled={!canBack} className={BTN} style={BTN_BORDER} title="Back">‹</button>
        <button onClick={goForward} disabled={!canForward} className={BTN} style={BTN_BORDER} title="Forward">›</button>
        <button onClick={reload} className={BTN} style={BTN_BORDER} title="Reload">↻</button>
        <button onClick={() => navigate(HOME)} className={BTN} style={BTN_BORDER} title="Home">⌂</button>

        <div className="flex items-center flex-1 mx-[4px] gap-[3px]">
          <span className="font-ui text-[12px] text-black whitespace-nowrap">Address</span>
          <input
            className="flex-1 font-ui text-[12px] px-[4px] py-[2px] text-black bg-white"
            style={{ border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)' }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(input)}
            spellCheck={false}
          />
          <button onClick={() => navigate(input)} className="font-ui text-[12px] px-[10px] py-[2px] text-black hover:bg-os-chrome-light" style={BTN_BORDER}>Go</button>
        </div>

        {/* Always-visible open-in-tab button */}
        <button
          onClick={openExternal}
          className="font-ui text-[11px] px-[8px] py-[2px] text-black hover:bg-[#000080] hover:text-white whitespace-nowrap"
          style={BTN_BORDER}
          title="Open in your real browser"
        >
          ↗ New Tab
        </button>
      </div>

      {/* Bookmarks bar */}
      <div className="flex items-center gap-[2px] px-[4px] py-[2px] overflow-x-auto" style={{ borderBottom: '1px solid var(--color-bevel-dark)', background: 'var(--color-chrome)', flexShrink: 0 }}>
        <span className="font-ui text-[11px] text-gray-600 mr-1 whitespace-nowrap">Bookmarks:</span>
        {BOOKMARKS.map(b => (
          <button
            key={b.url}
            onClick={() => navigate(b.url)}
            className="font-ui text-[11px] px-[6px] py-[1px] text-black hover:bg-[#000080] hover:text-white whitespace-nowrap"
            style={{ border: '1px solid var(--color-bevel-dark)' }}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center px-[6px] py-[1px]" style={{ borderBottom: '1px solid var(--color-bevel-dark)', background: 'var(--color-chrome)', flexShrink: 0 }}>
        <span className="font-ui text-[10px] text-gray-600">
          {loading ? 'Loading...' : blocked ? 'Page blocked embedding — use ↗ New Tab' : 'Done'}
        </span>
        {loading && <span className="ml-2 inline-block w-[8px] h-[8px] rounded-full bg-[#000080] animate-pulse" />}
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {blocked ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
            <div className="text-[40px]">🚫</div>
            <div className="font-ui text-[14px] font-bold text-black">
              This page cannot be displayed here
            </div>
            <div className="font-ui text-[12px] text-gray-600 max-w-[340px]">
              <strong>{src}</strong> blocks embedding in other sites for security reasons.
              This is a browser restriction — it cannot be bypassed.
            </div>
            <button
              onClick={openExternal}
              className="font-ui text-[13px] px-6 py-2 text-white bg-[#000080] hover:bg-[#0000aa]"
              style={{ border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
            >
              ↗ Open in your real browser
            </button>
            <button
              onClick={() => navigate(HOME)}
              className="font-ui text-[12px] px-4 py-1 text-black hover:bg-os-chrome-light"
              style={{ border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
            >
              ← Back to Home
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={src}
            className="w-full h-full border-0"
            onLoad={handleLoad}
            onError={handleError}
            title="Browser"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        )}
      </div>
    </div>
  )
}
