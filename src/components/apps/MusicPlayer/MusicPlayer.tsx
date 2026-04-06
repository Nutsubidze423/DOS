'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Track { title: string; artist: string; src: string; hue: number }

const TRACKS: Track[] = [
  { title: 'Brasilian Skies',      artist: 'Unknown',            src: '/music/brasilian-skies.mp3',      hue: 145 },
  { title: 'Parisienne Walkways',  artist: 'Gary Moore',         src: '/music/parisienne-walkways.mp3',  hue: 210 },
  { title: 'Kiss the Sky',         artist: 'Unknown',            src: '/music/kiss-the-sky.mp3',         hue: 270 },
  { title: 'Oh! Tengo Suerte',     artist: 'Unknown',            src: '/music/oh-tengo-suerte.mp3',      hue: 40  },
  { title: 'Far From Any Road',    artist: 'The Handsome Family',src: '/music/far-from-any-road.mp3',    hue: 0   },
  { title: 'Tokyo Reggie',         artist: 'Unknown',            src: '/music/tokyo-reggie.mp3',         hue: 175 },
]

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export function MusicPlayer() {
  const [idx, setIdx]         = useState(0)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume]   = useState(0.7)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat]   = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const track = TRACKS[idx]

  // Boot audio element
  useEffect(() => {
    const audio = new Audio()
    audio.volume = volume
    audio.src = TRACKS[0].src
    audioRef.current = audio

    const onTime  = () => setCurrent(audio.currentTime)
    const onMeta  = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      if (repeat) { audio.currentTime = 0; audio.play(); return }
      const next = shuffle
        ? Math.floor(Math.random() * TRACKS.length)
        : (idx + 1) % TRACKS.length
      setIdx(next)
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnded)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track change
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = TRACKS[idx].src
    setCurrent(0)
    setDuration(0)
    if (playing) audio.play()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // Sync repeat/shuffle refs (used inside the ended handler — re-register it when they change)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => {
      if (repeat) { audio.currentTime = 0; audio.play(); return }
      const next = shuffle
        ? Math.floor(Math.random() * TRACKS.length)
        : (idx + 1) % TRACKS.length
      setIdx(next)
    }
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [idx, repeat, shuffle])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else         { audio.play().then(() => setPlaying(true)).catch(() => {}) }
  }, [playing])

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Number(e.target.value)
    setCurrent(audio.currentTime)
  }, [])

  const changeVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  const prev = useCallback(() => setIdx(i => (i - 1 + TRACKS.length) % TRACKS.length), [])
  const next = useCallback(() => setIdx(i => (i + 1) % TRACKS.length), [])

  const hue = track.hue

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#121212', color: '#fff', fontFamily: 'sans-serif', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px 8px', borderBottom: '1px solid #282828' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#1DB954">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 01-.277-1.215c3.809-.87 7.077-.496 9.712 1.115a.624.624 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.519.781.781 0 01.52-.972c3.632-1.102 8.147-.568 11.233 1.328a.78.78 0 01.257 1.072zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-.954 1.608z"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', color: '#fff' }}>Spotify</span>
        <span style={{ fontSize: 10, color: '#b3b3b3', marginLeft: 2 }}>Desktop · 2009</span>
      </div>

      {/* Album art */}
      <div style={{ position: 'relative', margin: '16px 14px 0', borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{
          height: 160,
          background: `linear-gradient(135deg, hsl(${hue},60%,22%) 0%, hsl(${hue},40%,12%) 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Vinyl record */}
          <div style={{ position: 'relative', width: 90, height: 90 }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: `conic-gradient(from 0deg, #111 0deg, #222 20deg, #111 40deg, #222 60deg, #111 80deg, #222 100deg, #111 120deg, #222 140deg, #111 160deg, #222 180deg, #111 200deg, #222 220deg, #111 240deg, #222 260deg, #111 280deg, #222 300deg, #111 320deg, #222 340deg, #111 360deg)`,
              boxShadow: '0 0 20px rgba(0,0,0,0.6)',
              animation: playing ? 'spin 4s linear infinite' : 'none',
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              width: 24, height: 24, borderRadius: '50%',
              background: `hsl(${hue},55%,35%)`,
              boxShadow: `0 0 0 3px #111`,
            }} />
          </div>
        </div>
      </div>

      {/* Track info */}
      <div style={{ padding: '10px 14px 4px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
        <div style={{ fontSize: 12, color: '#b3b3b3', marginTop: 2 }}>{track.artist}</div>
      </div>

      {/* Progress */}
      <div style={{ padding: '6px 14px' }}>
        <input
          type="range" min={0} max={duration || 1} step={0.5} value={current}
          onChange={seek}
          style={{ width: '100%', accentColor: '#1DB954', cursor: 'pointer', height: 3 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#b3b3b3', marginTop: 2 }}>
          <span>{fmt(current)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '4px 14px 8px' }}>
        <button onClick={() => setShuffle(s => !s)} title="Shuffle"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: shuffle ? '#1DB954' : '#b3b3b3', fontSize: 14, padding: 0 }}>⇄</button>
        <button onClick={prev} title="Previous"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 18, padding: 0 }}>⏮</button>
        <button onClick={togglePlay} title={playing ? 'Pause' : 'Play'}
          style={{
            width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: '#1DB954', color: '#000', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          {playing ? '⏸' : '▶'}
        </button>
        <button onClick={next} title="Next"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 18, padding: 0 }}>⏭</button>
        <button onClick={() => setRepeat(r => !r)} title="Repeat"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: repeat ? '#1DB954' : '#b3b3b3', fontSize: 14, padding: 0 }}>↻</button>
      </div>

      {/* Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px 8px' }}>
        <span style={{ color: '#b3b3b3', fontSize: 12 }}>🔈</span>
        <input
          type="range" min={0} max={1} step={0.01} value={volume}
          onChange={changeVolume}
          style={{ flex: 1, accentColor: '#1DB954', cursor: 'pointer', height: 3 }}
        />
        <span style={{ color: '#b3b3b3', fontSize: 12 }}>🔊</span>
      </div>

      {/* Queue */}
      <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #282828' }}>
        <div style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 700, color: '#b3b3b3', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Queue</div>
        {TRACKS.map((t, i) => (
          <div
            key={i}
            onClick={() => { setIdx(i); setPlaying(false); setTimeout(() => { audioRef.current?.play().then(() => setPlaying(true)).catch(() => {}) }, 50) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 14px', cursor: 'pointer',
              background: i === idx ? 'rgba(255,255,255,0.07)' : 'transparent',
            }}
            onMouseEnter={e => { if (i !== idx) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)' }}
            onMouseLeave={e => { if (i !== idx) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 3, flexShrink: 0,
              background: `linear-gradient(135deg, hsl(${t.hue},55%,28%), hsl(${t.hue},40%,16%))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: i === idx ? '#1DB954' : '#b3b3b3',
            }}>
              {i === idx && playing ? '▶' : String(i + 1)}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: i === idx ? 700 : 400, color: i === idx ? '#1DB954' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
              <div style={{ fontSize: 10, color: '#b3b3b3' }}>{t.artist}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
