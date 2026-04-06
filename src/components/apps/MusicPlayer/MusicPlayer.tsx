'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Track { title: string; artist: string; notes: number[][]; bpm: number; wave: OscillatorType }

const TRACKS: Track[] = [
  {
    title: 'Win98 Startup Theme',
    artist: 'PortfolioOS Audio',
    bpm: 120,
    wave: 'square',
    notes: [
      [261, 0.15], [329, 0.15], [392, 0.15], [523, 0.3],
      [0, 0.1],
      [392, 0.15], [440, 0.15], [523, 0.3],
      [0, 0.1],
      [523, 0.15], [587, 0.15], [659, 0.3], [784, 0.5],
    ],
  },
  {
    title: 'Lo-Fi Teal Vibes',
    artist: 'PortfolioOS Audio',
    bpm: 80,
    wave: 'sine',
    notes: [
      [220, 0.4], [246, 0.4], [261, 0.4], [293, 0.4],
      [329, 0.4], [293, 0.4], [261, 0.4], [246, 0.4],
      [220, 0.4], [196, 0.4], [220, 0.4], [246, 0.4],
      [261, 0.8],
    ],
  },
  {
    title: 'Boot Sequence',
    artist: 'PortfolioOS Audio',
    bpm: 160,
    wave: 'sawtooth',
    notes: [
      [130, 0.1], [164, 0.1], [196, 0.1], [261, 0.1],
      [329, 0.1], [392, 0.1], [523, 0.2],
      [0, 0.1],
      [392, 0.1], [523, 0.1], [659, 0.1], [784, 0.3],
      [0, 0.2],
    ],
  },
]

export function MusicPlayer() {
  const [trackIdx, setTrackIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const [elapsed, setElapsed] = useState(0)
  const ctxRef = useRef<AudioContext | null>(null)
  const stopRef = useRef<(() => void) | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const track = TRACKS[trackIdx]

  const stopPlayback = useCallback(() => {
    stopRef.current?.()
    stopRef.current = null
    if (intervalRef.current) clearInterval(intervalRef.current)
    setPlaying(false)
  }, [])

  const playTrack = useCallback((idx: number, vol: number) => {
    stopPlayback()
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    const ctx = ctxRef.current
    if (ctx.state === 'suspended') ctx.resume()

    const trk = TRACKS[idx]
    let cancelled = false
    let startTime = ctx.currentTime
    setElapsed(0)

    const playOnce = () => {
      if (cancelled) return
      let t = startTime
      const gains: GainNode[] = []

      for (const [freq, dur] of trk.notes) {
        if (freq === 0) { t += dur; continue }
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = trk.wave
        osc.frequency.value = freq
        gain.gain.setValueAtTime(vol * 0.3, t)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.9)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(t)
        osc.stop(t + dur)
        gains.push(gain)
        t += dur
      }

      startTime = t
      const loopTimeout = setTimeout(() => { if (!cancelled) playOnce() }, (t - ctx.currentTime) * 1000)
      stopRef.current = () => { cancelled = true; clearTimeout(loopTimeout) }
    }

    playOnce()
    setPlaying(true)
    if (intervalRef.current) clearInterval(intervalRef.current)
    const startReal = Date.now()
    intervalRef.current = setInterval(() => setElapsed(Date.now() - startReal), 500)
  }, [stopPlayback])

  const handlePlayPause = useCallback(() => {
    if (playing) { stopPlayback() } else { playTrack(trackIdx, volume) }
  }, [playing, trackIdx, volume, playTrack, stopPlayback])

  const handleTrack = useCallback((delta: number) => {
    const next = (trackIdx + delta + TRACKS.length) % TRACKS.length
    setTrackIdx(next)
    if (playing) playTrack(next, volume)
    else setElapsed(0)
  }, [trackIdx, playing, volume, playTrack])

  const handleVolume = useCallback((val: number) => {
    setVolume(val)
    if (playing) { stopPlayback(); setTimeout(() => playTrack(trackIdx, val), 50) }
  }, [playing, trackIdx, stopPlayback, playTrack])

  useEffect(() => () => stopPlayback(), [stopPlayback])

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000)
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full select-none" style={{ background: '#1a1a1a' }}>
      {/* Title bar area */}
      <div className="px-3 pt-3 pb-2" style={{ background: '#000', borderBottom: '1px solid #333' }}>
        <div className="font-terminal text-[10px] text-[#00ff88] mb-1">PORTFOLIOOS WINAMP 2.91</div>
        <div className="font-terminal text-[13px] text-[#ffff00] truncate">{track.title}</div>
        <div className="font-terminal text-[11px] text-[#00ff88] opacity-70">{track.artist}</div>
      </div>

      {/* Visualizer bars */}
      <div className="flex items-end gap-[2px] px-3 py-2 h-[48px]" style={{ background: '#000' }}>
        {Array.from({ length: 28 }, (_, i) => {
          const h = playing ? Math.random() * 36 + 4 : 4
          return (
            <div
              key={i}
              className="flex-1"
              style={{
                height: playing ? h : 4,
                background: i < 10 ? '#00ff88' : i < 20 ? '#ffcc00' : '#ff4400',
                transition: 'height 0.1s ease',
                minWidth: 2,
              }}
            />
          )
        })}
      </div>

      {/* Time */}
      <div className="flex justify-between px-3 py-[4px]" style={{ background: '#111' }}>
        <span className="font-terminal text-[20px] text-[#00ff88]">{fmt(elapsed)}</span>
        <span className="font-terminal text-[11px] text-[#00ff88] opacity-50 self-end pb-1">
          {trackIdx + 1}/{TRACKS.length}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 py-2 px-3" style={{ background: '#222', borderTop: '1px solid #333' }}>
        {[
          { label: '⏮', action: () => handleTrack(-1), title: 'Prev' },
          { label: playing ? '⏸' : '▶', action: handlePlayPause, title: playing ? 'Pause' : 'Play', active: true },
          { label: '⏹', action: stopPlayback, title: 'Stop' },
          { label: '⏭', action: () => handleTrack(1), title: 'Next' },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.action}
            title={btn.title}
            className="font-terminal text-[16px] px-3 py-1"
            style={{
              background: btn.active && playing ? '#005500' : '#333',
              border: '1px solid #555',
              color: '#00ff88',
              cursor: 'pointer',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#1a1a1a' }}>
        <span className="font-terminal text-[11px] text-[#00ff88]">VOL</span>
        <input
          type="range" min={0} max={1} step={0.01} value={volume}
          onChange={e => handleVolume(Number(e.target.value))}
          className="flex-1 cursor-pointer"
          style={{ accentColor: '#00ff88' }}
        />
        <span className="font-terminal text-[11px] text-[#00ff88] w-[30px] text-right">
          {Math.round(volume * 100)}
        </span>
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#111', borderTop: '1px solid #333' }}>
        {TRACKS.map((t, i) => (
          <div
            key={i}
            onClick={() => { setTrackIdx(i); if (playing) playTrack(i, volume) }}
            className="flex items-center gap-2 px-3 py-[5px] cursor-pointer"
            style={{ background: i === trackIdx ? '#003300' : 'transparent', borderBottom: '1px solid #1a1a1a' }}
          >
            <span className="font-terminal text-[11px]" style={{ color: i === trackIdx ? '#00ff88' : '#666' }}>
              {playing && i === trackIdx ? '▶' : String(i + 1).padStart(2, '0')}
            </span>
            <span className="font-terminal text-[11px] flex-1 truncate" style={{ color: i === trackIdx ? '#ffff00' : '#888' }}>
              {t.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
