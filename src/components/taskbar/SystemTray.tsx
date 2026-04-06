'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSoundStore } from '@/store/soundStore'
import { Howler } from 'howler'

type TrayPanel = 'wifi' | 'battery' | 'bluetooth' | 'volume' | 'clock' | null

interface BatteryState {
  level: number
  charging: boolean
}

const BTN = 'flex items-center justify-center px-[5px] h-full hover:bg-black/10 active:bg-black/20 cursor-pointer border border-transparent hover:border-black/10 select-none'

export function SystemTray() {
  const { muted, toggleMute } = useSoundStore()
  const [activePanel, setActivePanel] = useState<TrayPanel>(null)
  const [time, setTime] = useState('')
  const [fullDate, setFullDate] = useState('')
  const [timeOffset, setTimeOffset] = useState(0)
  const [battery, setBattery] = useState<BatteryState | null>(null)
  const [online, setOnline] = useState(true)
  const [volume, setVolume] = useState(75)
  const [customHour, setCustomHour] = useState('')
  const [customMin, setCustomMin] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const trayRef = useRef<HTMLDivElement>(null)

  // Load saved time offset
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('portfolioOS_timeOffset')
    if (saved) setTimeOffset(parseInt(saved, 10))
    setOnline(navigator.onLine)
  }, [])

  // Clock update
  useEffect(() => {
    const update = () => {
      const now = new Date(Date.now() + timeOffset)
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      setFullDate(now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }
    update()
    const interval = setInterval(update, 5000)
    return () => clearInterval(interval)
  }, [timeOffset])

  // Battery API
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('getBattery' in navigator)) return
    ;(navigator as any).getBattery().then((bat: any) => {
      const sync = () => setBattery({ level: bat.level, charging: bat.charging })
      sync()
      bat.addEventListener('levelchange', sync)
      bat.addEventListener('chargingchange', sync)
    }).catch(() => {})
  }, [])

  // Online status
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // Close panel on outside click
  useEffect(() => {
    if (!activePanel) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (!panelRef.current?.contains(t) && !trayRef.current?.contains(t)) {
        setActivePanel(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [activePanel])

  const togglePanel = useCallback((panel: TrayPanel) => {
    setActivePanel(prev => prev === panel ? null : panel)
  }, [])

  const handleVolumeChange = useCallback((val: number) => {
    setVolume(val)
    Howler.volume(val / 100)
  }, [])

  const applyCustomTime = useCallback(() => {
    const h = parseInt(customHour, 10)
    const m = parseInt(customMin, 10)
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return
    const now = new Date()
    const desired = new Date()
    desired.setHours(h, m, 0, 0)
    const offset = desired.getTime() - now.getTime()
    setTimeOffset(offset)
    localStorage.setItem('portfolioOS_timeOffset', offset.toString())
  }, [customHour, customMin])

  const resetTime = useCallback(() => {
    setTimeOffset(0)
    localStorage.removeItem('portfolioOS_timeOffset')
    setCustomHour('')
    setCustomMin('')
  }, [])

  const batteryPct = battery ? Math.round(battery.level * 100) : null

  const PANEL_STYLE: React.CSSProperties = {
    position: 'absolute',
    bottom: 30,
    right: 0,
    minWidth: 200,
    background: 'var(--color-chrome)',
    border: '2px solid',
    borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
    boxShadow: '3px 3px 8px rgba(0,0,0,0.5)',
    zIndex: 9999,
  }

  return (
    <div className="relative h-full" ref={trayRef}>
      {/* Popup panel */}
      {activePanel && (
        <div ref={panelRef} style={PANEL_STYLE}>
          {/* WiFi panel */}
          {activePanel === 'wifi' && (
            <div className="p-3">
              <div className="font-ui text-[11px] font-bold border-b border-[#808080] pb-1 mb-2">
                Network Connections
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[20px] mt-0.5">{online ? '📶' : '🚫'}</span>
                <div>
                  <div className="font-ui text-[11px] font-bold">{online ? 'Connected' : 'Not connected'}</div>
                  {online && (
                    <>
                      <div className="font-ui text-[10px] text-gray-600">PortfolioOS_Network</div>
                      <div className="font-ui text-[10px] text-gray-600">Internet access · Excellent</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Battery panel */}
          {activePanel === 'battery' && (
            <div className="p-3">
              <div className="font-ui text-[11px] font-bold border-b border-[#808080] pb-1 mb-2">
                Power Options
              </div>
              {batteryPct !== null ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[20px]">{battery!.charging ? '🔌' : '🔋'}</span>
                    <div>
                      <div className="font-ui text-[11px] font-bold">
                        {batteryPct}%{battery!.charging ? ' · Charging' : ''}
                      </div>
                      <div className="font-ui text-[10px] text-gray-600">
                        {battery!.charging ? 'Plugged in' : 'On battery'}
                      </div>
                    </div>
                  </div>
                  {/* Battery bar */}
                  <div
                    className="h-[10px] w-full rounded-sm overflow-hidden"
                    style={{ border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)' }}
                  >
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${batteryPct}%`,
                        background: batteryPct > 20 ? '#008000' : '#cc0000',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="font-ui text-[11px] text-gray-600">Battery info unavailable</div>
              )}
            </div>
          )}

          {/* Bluetooth panel */}
          {activePanel === 'bluetooth' && (
            <div className="p-3">
              <div className="font-ui text-[11px] font-bold border-b border-[#808080] pb-1 mb-2">
                Bluetooth Devices
              </div>
              <div className="flex items-center gap-2 py-1">
                <span className="text-[18px]">🔵</span>
                <div>
                  <div className="font-ui text-[11px] font-bold">Bluetooth On</div>
                  <div className="font-ui text-[10px] text-gray-600">No devices paired</div>
                </div>
              </div>
              <div className="font-ui text-[10px] text-gray-500 mt-1">
                Ensure devices are in pairing mode
              </div>
            </div>
          )}

          {/* Volume panel */}
          {activePanel === 'volume' && (
            <div className="p-3" style={{ minWidth: 200 }}>
              <div className="font-ui text-[11px] font-bold border-b border-[#808080] pb-1 mb-3">
                Volume Control
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[14px] select-none">🔈</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={muted ? 0 : volume}
                  onChange={(e) => { handleVolumeChange(Number(e.target.value)) }}
                  className="flex-1 cursor-pointer"
                  style={{ accentColor: '#000080' }}
                />
                <span className="text-[14px] select-none">🔊</span>
              </div>
              <div className="font-ui text-[11px] text-center mb-2">
                {muted ? 'Muted' : `${volume}%`}
              </div>
              <button
                onClick={toggleMute}
                className="w-full font-ui text-[11px] py-[3px] text-black hover:bg-[#000080] hover:text-white"
                style={{ border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
              >
                {muted ? '🔊 Unmute' : '🔇 Mute'}
              </button>
            </div>
          )}

          {/* Clock / Date+Time settings panel */}
          {activePanel === 'clock' && (
            <div className="p-3" style={{ minWidth: 220 }}>
              <div className="font-ui text-[11px] font-bold border-b border-[#808080] pb-1 mb-2">
                Date and Time Properties
              </div>
              {/* Big clock display */}
              <div className="text-center mb-3">
                <div className="font-ui text-[28px] font-bold" style={{ color: '#000080' }}>{time}</div>
                <div className="font-ui text-[10px] text-gray-600">{fullDate}</div>
              </div>
              {/* Set custom time */}
              <div
                className="pt-2"
                style={{ borderTop: '1px solid var(--color-chrome-dark)' }}
              >
                <div className="font-ui text-[10px] font-bold mb-1">Set displayed time:</div>
                <div className="flex items-center gap-1 mb-2">
                  <input
                    type="number"
                    min={0}
                    max={23}
                    placeholder="HH"
                    value={customHour}
                    onChange={e => setCustomHour(e.target.value)}
                    className="w-[38px] font-ui text-[11px] text-center bg-white px-1 py-0.5"
                    style={{ border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)' }}
                  />
                  <span className="font-ui text-[14px] font-bold">:</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    placeholder="MM"
                    value={customMin}
                    onChange={e => setCustomMin(e.target.value)}
                    className="w-[38px] font-ui text-[11px] text-center bg-white px-1 py-0.5"
                    style={{ border: '2px solid', borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)' }}
                  />
                  <button
                    onClick={applyCustomTime}
                    className="flex-1 font-ui text-[10px] py-[3px] text-black hover:bg-[#000080] hover:text-white"
                    style={{ border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
                  >
                    Apply
                  </button>
                </div>
                {timeOffset !== 0 && (
                  <button
                    onClick={resetTime}
                    className="w-full font-ui text-[10px] py-[3px] text-red-700 hover:bg-[#000080] hover:text-white"
                    style={{ border: '2px solid', borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)' }}
                  >
                    Use System Time
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tray icon strip */}
      <div
        className="h-[26px] flex items-center font-ui text-[11px] text-black select-none"
        style={{
          background: 'var(--color-chrome)',
          border: '2px solid',
          borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)',
        }}
      >
        <button
          onClick={() => togglePanel('wifi')}
          title={online ? 'Network: Connected' : 'Network: Disconnected'}
          className={BTN}
        >
          <span className="text-[14px]">{online ? '📶' : '🚫'}</span>
        </button>

        <button
          onClick={() => togglePanel('battery')}
          title={batteryPct !== null ? `Battery: ${batteryPct}%` : 'Power Options'}
          className={BTN}
        >
          <span className="text-[14px]">🔋</span>
          {batteryPct !== null && (
            <span className="text-[9px] leading-none ml-[1px]">{batteryPct}%</span>
          )}
        </button>

        <button
          onClick={() => togglePanel('bluetooth')}
          title="Bluetooth"
          className={BTN}
        >
          <span className="text-[14px]">🔵</span>
        </button>

        <button
          onClick={() => togglePanel('volume')}
          title={muted ? 'Volume: Muted' : `Volume: ${volume}%`}
          className={BTN}
        >
          <span className="text-[14px]">{muted ? '🔇' : '🔊'}</span>
        </button>

        <button
          onClick={() => togglePanel('clock')}
          title={`${fullDate}\nClick to change time`}
          className={BTN}
          style={{
            paddingLeft: 8,
            borderLeft: '1px solid var(--color-bevel-dark)',
            color: 'var(--color-title-from)',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {time}
        </button>
      </div>
    </div>
  )
}
