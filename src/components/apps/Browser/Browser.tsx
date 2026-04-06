'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const HOME = 'https://en.m.wikipedia.org/wiki/Windows_98'

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
    setBlocked(false)
    setLoading(true)
    setSrc(url)
    setInput(url)
  }, [])

  const goForward = useCallback(() => {
    if (historyIndex.current >= historyStack.current.length - 1) return
    historyIndex.current += 1
    const url = historyStack.current[historyIndex.current]
    setBlocked(false)
    setLoading(true)
    setSrc(url)
    setInput(url)
  }, [])

  const reload = useCallback(() => {
    setBlocked(false)
    setLoading(true)
    setSrc(s => s + '')
    if (iframeRef.current) iframeRef.current.src = src
  }, [src])

  // Detect X-Frame-Options block via load timeout — if iframe fails to load
  // content due to CORS/frame-ancestors, it still fires onLoad with no content.
  // We detect this by checking if contentDocument is accessible.
  const handleLoad = useCallback(() => {
    setLoading(false)
    try {
      // If we can access contentDocument the page loaded fine (throws if blocked by CORS)
      const doc = iframeRef.current?.contentDocument
      setBlocked(doc === undefined)
    } catch {
      setBlocked(true)
    }
  }, [])

  const handleError = useCallback(() => {
    setLoading(false)
    setBlocked(true)
  }, [])

  useEffect(() => {
    setInput(src)
  }, [src])

  const canBack = historyIndex.current > 0
  const canForward = historyIndex.current < historyStack.current.length - 1

  const BTN = 'w-[22px] h-[22px] flex items-center justify-center font-bold text-[12px] text-black hover:bg-os-chrome-light disabled:opacity-30 disabled:cursor-not-allowed'

  return (
    <div className="flex flex-col h-full bg-os-chrome">
      {/* Toolbar */}
      <div
        className="flex items-center gap-[3px] px-[4px] py-[3px]"
        style={{ borderBottom: '2px solid var(--color-bevel-dark)', background: 'var(--color-chrome)' }}
      >
        <button
          onClick={goBack}
          disabled={!canBack}
          className={BTN}
          style={{ border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
          title="Back"
        >
          ‹
        </button>
        <button
          onClick={goForward}
          disabled={!canForward}
          className={BTN}
          style={{ border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
          title="Forward"
        >
          ›
        </button>
        <button
          onClick={reload}
          className={BTN}
          style={{ border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
          title="Reload"
        >
          ↻
        </button>
        <button
          onClick={() => navigate(HOME)}
          className={BTN}
          style={{ border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
          title="Home"
        >
          ⌂
        </button>

        {/* Address bar */}
        <div className="flex items-center flex-1 mx-[4px] gap-[3px]">
          <span className="font-ui text-[11px] text-black whitespace-nowrap">Address</span>
          <input
            className="flex-1 font-ui text-[11px] px-[4px] py-[1px] text-black bg-white"
            style={{ border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)' }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(input)}
            spellCheck={false}
          />
          <button
            onClick={() => navigate(input)}
            className="font-ui text-[11px] px-[8px] py-[1px] text-black hover:bg-os-chrome-light"
            style={{ border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
          >
            Go
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div
        className="flex items-center px-[6px] py-[1px]"
        style={{ borderBottom: '1px solid var(--color-bevel-dark)', background: 'var(--color-chrome)' }}
      >
        <span className="font-ui text-[10px] text-gray-600">
          {loading ? 'Loading...' : blocked ? 'Cannot display in frame' : 'Done'}
        </span>
        {loading && (
          <span className="ml-2 inline-block w-[8px] h-[8px] rounded-full bg-[#000080] animate-pulse" />
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 relative overflow-hidden">
        {blocked ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <div className="text-[32px]">🚫</div>
            <div className="font-ui text-[13px] font-bold text-black text-center">
              This page cannot be displayed
            </div>
            <div className="font-ui text-[11px] text-gray-600 text-center max-w-[300px]">
              The website at <span className="font-bold">{src}</span> has refused to connect.
              Most major sites block being embedded in frames.
              Try a different URL.
            </div>
            <div className="font-ui text-[11px] text-gray-500 text-center">
              Sites that usually work: Wikipedia, Archive.org, simple blogs
            </div>
            <button
              onClick={() => navigate(HOME)}
              className="font-ui text-[11px] px-4 py-1 text-black"
              style={{ border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
            >
              Go to Home
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
