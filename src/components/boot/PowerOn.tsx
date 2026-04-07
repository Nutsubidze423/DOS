'use client'

import { useRef, useState, useCallback, Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Center, Stage } from '@react-three/drei'
import * as THREE from 'three'
import { useBootStore } from '@/store/bootStore'
import { initSounds } from '@/lib/sounds'

type AnimState = 'idle' | 'zooming' | 'flash'

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ─── Model ────────────────────────────────────────────────────────────────────
function DeskModel({ onLoaded }: { onLoaded: () => void }) {
  const { scene } = useGLTF('/computer_desk__retro_workspace_setup.glb')

  useEffect(() => {
    onLoaded()
  }, [onLoaded])

  return (
    <Center>
      <primitive object={scene} />
    </Center>
  )
}

useGLTF.preload('/computer_desk__retro_workspace_setup.glb')

// ─── Camera zoom ──────────────────────────────────────────────────────────────
// End position: very close to the monitor screen
const CAM_END_POS  = new THREE.Vector3(0, 0.18, 0.25)
const CAM_END_LOOK = new THREE.Vector3(0, 0.18, 0)

function CameraZoom({ animState, onDone }: { animState: AnimState; onDone: () => void }) {
  const { camera } = useThree()
  const startPos   = useRef<THREE.Vector3 | null>(null)
  const startLook  = useRef<THREE.Vector3>(new THREE.Vector3())
  const t          = useRef(0)
  const fired      = useRef(false)

  useFrame((_, dt) => {
    if (animState !== 'zooming') return

    // Capture start position on first frame of zoom
    if (!startPos.current) {
      startPos.current = camera.position.clone()
      // Compute where camera is currently looking
      const dir = new THREE.Vector3()
      camera.getWorldDirection(dir)
      startLook.current = camera.position.clone().add(dir)
    }

    t.current = Math.min(t.current + dt * 0.5, 1)
    const e   = easeInOutCubic(t.current)

    camera.position.lerpVectors(startPos.current!, CAM_END_POS, e)
    camera.lookAt(new THREE.Vector3().lerpVectors(startLook.current, CAM_END_LOOK, e))

    if (t.current >= 1 && !fired.current) {
      fired.current = true
      onDone()
    }
  })

  return null
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({
  animState,
  onLoaded,
  onZoomDone,
}: {
  animState: AnimState
  onLoaded: () => void
  onZoomDone: () => void
}) {
  return (
    <>
      <Suspense fallback={null}>
        <Stage intensity={0.5} environment="studio" adjustCamera>
          <DeskModel onLoaded={onLoaded} />
        </Stage>
      </Suspense>

      {/* Disable controls while zooming */}
      <OrbitControls
        enabled={animState === 'idle'}
        enablePan={false}
        enableZoom
        minDistance={1}
        maxDistance={14}
        autoRotate={animState === 'idle'}
        autoRotateSpeed={0.5}
        makeDefault
      />

      <CameraZoom animState={animState} onDone={onZoomDone} />
    </>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function PowerOn() {
  const { setPhase }                  = useBootStore()
  const [animState, setAnimState]     = useState<AnimState>('idle')
  const [flash, setFlash]             = useState(false)
  const [loaded, setLoaded]           = useState(false)

  const handleLoaded = useCallback(() => setLoaded(true), [])

  const handlePower = useCallback(() => {
    if (animState !== 'idle' || !loaded) return
    initSounds()
    setAnimState('zooming')
  }, [animState, loaded])

  const handleZoomDone = useCallback(() => {
    setFlash(true)
    setTimeout(() => {
      setFlash(false)
      setPhase('bios')
    }, 400)
  }, [setPhase])

  return (
    <div className="fixed inset-0 bg-[#0d0d0d]" style={{ zIndex: 9999 }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.5, 3.5], fov: 45, near: 0.01, far: 100 }}
        gl={{ antialias: true, outputColorSpace: THREE.SRGBColorSpace, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <Scene animState={animState} onLoaded={handleLoaded} onZoomDone={handleZoomDone} />
      </Canvas>

      {/* Loading indicator — pointer-events:none so drag still works */}
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 25, pointerEvents: 'none' }}
        >
          <div
            className="font-ui text-[12px] tracking-widest uppercase"
            style={{ color: '#444', animation: 'ldp 1.4s ease-in-out infinite' }}
          >
            Loading...
          </div>
          <style>{`@keyframes ldp{0%,100%{opacity:.25}50%{opacity:.9}}`}</style>
        </div>
      )}

      {/* White flash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: '#fff', opacity: flash ? 1 : 0, transition: flash ? 'none' : 'opacity 0.45s ease-out', zIndex: 20 }}
      />

      {/* Power button */}
      {animState === 'idle' && (
        <button
          onClick={handlePower}
          disabled={!loaded}
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: 36,
            zIndex: 30,
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #1a0800 0%, #0a0400 100%)',
            border: '2.5px solid #ff6600',
            boxShadow: '0 0 18px rgba(255,100,0,0.55)',
            cursor: loaded ? 'pointer' : 'default',
            opacity: loaded ? 1 : 0.4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: loaded ? 'btnP 2.2s ease-in-out infinite' : 'none',
          }}
          aria-label="Power on"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2 L14 14" stroke="#ff7700" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M8 6 A8 8 0 1 0 20 6" stroke="#ff7700" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      )}

      {/* Hint */}
      {animState === 'idle' && loaded && (
        <div
          className="absolute left-1/2 -translate-x-1/2 font-ui text-[11px] tracking-[0.22em] uppercase pointer-events-none select-none"
          style={{ bottom: 110, color: '#555', animation: 'btnP 2.8s ease-in-out infinite' }}
        >
          Drag to look · Scroll to zoom
        </div>
      )}

      <style>{`@keyframes btnP{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
    </div>
  )
}
