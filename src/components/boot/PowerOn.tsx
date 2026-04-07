'use client'

import { useRef, useState, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Center, Stage } from '@react-three/drei'
import * as THREE from 'three'
import { useBootStore } from '@/store/bootStore'
import { initSounds } from '@/lib/sounds'

function DeskModel() {
  const { scene } = useGLTF('/computer_desk__retro_workspace_setup.glb')
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  )
}

useGLTF.preload('/computer_desk__retro_workspace_setup.glb')

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 25 }}>
      <div className="font-ui text-[13px] tracking-widest uppercase" style={{ color: '#555', animation: 'ldPulse 1.4s ease-in-out infinite' }}>
        Loading...
        <style>{`@keyframes ldPulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
      </div>
    </div>
  )
}

export function PowerOn() {
  const { setPhase }        = useBootStore()
  const [pressed, setPressed] = useState(false)
  const [flash, setFlash]   = useState(false)
  const t                   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePower = useCallback(() => {
    if (pressed) return
    initSounds()
    setPressed(true)
    t.current = setTimeout(() => {
      setFlash(true)
      setTimeout(() => {
        setFlash(false)
        setPhase('bios')
      }, 400)
    }, 600)
  }, [pressed, setPhase])

  return (
    <div className="fixed inset-0 bg-[#0a0a0f]" style={{ zIndex: 9999 }}>
      {/* 3D scene */}
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4], fov: 45, near: 0.1, far: 100 }}
        gl={{ antialias: true, outputColorSpace: THREE.SRGBColorSpace }}
      >
        <Suspense fallback={null}>
          <Stage
            intensity={0.6}
            environment="studio"
            adjustCamera={true}
          >
            <DeskModel />
          </Stage>
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={1}
          maxDistance={12}
          autoRotate={!pressed}
          autoRotateSpeed={0.6}
        />
      </Canvas>

      {/* Loading fallback shown until Canvas paints */}
      <LoadingFallback />

      {/* Flash */}
      {flash && (
        <div className="absolute inset-0 bg-white pointer-events-none" style={{ zIndex: 20 }} />
      )}

      {/* Power button */}
      <button
        onClick={handlePower}
        disabled={pressed}
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: 40,
          zIndex: 30,
          width: 68,
          height: 68,
          borderRadius: '50%',
          background: pressed
            ? 'radial-gradient(circle, #003300 0%, #001100 100%)'
            : 'radial-gradient(circle, #1a0800 0%, #0d0400 100%)',
          border: pressed ? '3px solid #00aa00' : '3px solid #ff6600',
          boxShadow: pressed
            ? '0 0 20px rgba(0,200,0,0.5)'
            : '0 0 18px rgba(255,100,0,0.6)',
          cursor: pressed ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          animation: pressed ? 'none' : 'btnPulse 2s ease-in-out infinite',
        }}
        aria-label="Power on"
      >
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M15 3 L15 15" stroke={pressed ? '#00ff44' : '#ff7700'} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M9 7 A9 9 0 1 0 21 7" stroke={pressed ? '#00ff44' : '#ff7700'} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      </button>

      {/* Hint */}
      {!pressed && (
        <div
          className="absolute bottom-[118px] left-1/2 -translate-x-1/2 font-ui text-[11px] tracking-[0.25em] uppercase pointer-events-none select-none"
          style={{ color: '#555', animation: 'btnPulse 2.8s ease-in-out infinite' }}
        >
          Drag to rotate · Click to boot
        </div>
      )}

      <style>{`
        @keyframes btnPulse { 0%,100%{opacity:.45} 50%{opacity:1} }
      `}</style>
    </div>
  )
}
