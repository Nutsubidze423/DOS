'use client'

import { useRef, useState, useCallback, Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'
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
  const groupRef  = useRef<THREE.Group>(null!)

  useEffect(() => {
    if (!groupRef.current) return

    const box    = new THREE.Box3().setFromObject(groupRef.current)
    const size   = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    groupRef.current.position.sub(center)
    const maxDim = Math.max(size.x, size.y, size.z)
    groupRef.current.scale.setScalar(3 / maxDim)

    // Just enable shadows — do NOT touch materials, let the GLB textures render
    groupRef.current.traverse(obj => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow    = true
      mesh.receiveShadow = true
    })

    onLoaded()
  }, [onLoaded])

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload('/computer_desk__retro_workspace_setup.glb')

// ─── Camera zoom into screen ──────────────────────────────────────────────────
function CameraZoom({ animState, onDone }: { animState: AnimState; onDone: () => void }) {
  const { camera } = useThree()
  const startPos   = useRef<THREE.Vector3 | null>(null)
  const startLook  = useRef<THREE.Vector3>(new THREE.Vector3())
  const progress   = useRef(0)
  const fired      = useRef(false)

  // Monitor face — slightly lower so camera lands on screen centre not top
  const endPos  = new THREE.Vector3(0, -0.08, 0.5)
  const endLook = new THREE.Vector3(0, -0.08, 0)

  useFrame((_, dt) => {
    if (animState !== 'zooming') return

    if (!startPos.current) {
      startPos.current = camera.position.clone()
      const dir = new THREE.Vector3()
      camera.getWorldDirection(dir)
      startLook.current.copy(camera.position).add(dir)
    }

    progress.current = Math.min(progress.current + dt * 0.48, 1)
    const e = easeInOutCubic(progress.current)
    camera.position.lerpVectors(startPos.current, endPos, e)
    camera.lookAt(new THREE.Vector3().lerpVectors(startLook.current, endLook, e))

    if (progress.current >= 1 && !fired.current) {
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
      {/* Dark bg */}
      <color attach="background" args={['#0d0d10']} />

      {/* HDRI — provides base reflections without blowing out colours */}
      <Environment preset="warehouse" />

      {/* Warm key light */}
      <directionalLight position={[4, 6, 4]} intensity={1.0} color="#fff5e0" castShadow />
      {/* Cool fill */}
      <directionalLight position={[-3, 2, 1]} intensity={0.3} color="#8898cc" />
      {/* Ambient — keep it low so textures show */}
      <ambientLight intensity={0.25} />

      <Suspense fallback={null}>
        <DeskModel onLoaded={onLoaded} />
      </Suspense>

      <OrbitControls
        enabled={animState === 'idle'}
        enablePan={false}
        enableZoom
        minDistance={1.5}
        maxDistance={10}
        autoRotate={animState === 'idle'}
        autoRotateSpeed={0.55}
        makeDefault
      />

      <CameraZoom animState={animState} onDone={onZoomDone} />
    </>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function PowerOn() {
  const { setPhase }              = useBootStore()
  const [animState, setAnimState] = useState<AnimState>('idle')
  const [flash, setFlash]         = useState(false)
  const [loaded, setLoaded]       = useState(false)

  const handleLoaded = useCallback(() => setLoaded(true), [])

  const handlePower = useCallback(() => {
    if (animState !== 'idle' || !loaded) return
    initSounds()
    setAnimState('zooming')
  }, [animState, loaded])

  const handleZoomDone = useCallback(() => {
    setFlash(true)
    setTimeout(() => { setFlash(false); setPhase('bios') }, 420)
  }, [setPhase])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0d0d10', zIndex: 9999 }}>
      <Canvas
        dpr={[1, 2]}
        shadows
        camera={{ position: [2, 1.2, 4], fov: 42, near: 0.01, far: 100 }}
        gl={{
          antialias: true,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.7,
        }}
      >
        <Scene animState={animState} onLoaded={handleLoaded} onZoomDone={handleZoomDone} />
      </Canvas>

      {/* Loading text — pointer-events:none so OrbitControls still works */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 25,
        }}>
          <span style={{ color: '#444', fontFamily: 'monospace', fontSize: 13, letterSpacing: '0.25em', textTransform: 'uppercase', animation: 'ldp 1.4s ease-in-out infinite' }}>
            Loading...
          </span>
        </div>
      )}

      {/* White flash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#fff',
        opacity: flash ? 1 : 0,
        transition: flash ? 'none' : 'opacity 0.45s ease-out',
        pointerEvents: 'none', zIndex: 20,
      }} />

      {/* Power button — centered at bottom */}
      {animState === 'idle' && (
        <button
          onClick={handlePower}
          disabled={!loaded}
          aria-label="Power on"
          style={{
            position: 'absolute',
            bottom: 36,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            width: 66,
            height: 66,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #1a0800 0%, #0a0400 100%)',
            border: '2.5px solid #ff6600',
            boxShadow: '0 0 20px rgba(255,100,0,0.6)',
            cursor: loaded ? 'pointer' : 'default',
            opacity: loaded ? 1 : 0.35,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: loaded ? 'btnP 2s ease-in-out infinite' : 'none',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 2 L14 13" stroke="#ff7700" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M8 6 A8 8 0 1 0 20 6" stroke="#ff7700" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      )}

      {/* Hint text */}
      {animState === 'idle' && loaded && (
        <div style={{
          position: 'absolute',
          bottom: 112,
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          color: '#555',
          fontFamily: 'monospace',
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          animation: 'btnP 2.8s ease-in-out infinite',
        }}>
          Drag to rotate · Scroll to zoom
        </div>
      )}

      <style>{`
        @keyframes ldp  { 0%,100%{opacity:.2} 50%{opacity:.85} }
        @keyframes btnP { 0%,100%{opacity:.4} 50%{opacity:1}   }
      `}</style>
    </div>
  )
}
