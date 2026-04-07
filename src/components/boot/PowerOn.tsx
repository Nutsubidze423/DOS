'use client'

import { useRef, useState, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import {
  EffectComposer,
  ChromaticAberration,
  Noise,
  Vignette,
  Bloom,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { useBootStore } from '@/store/bootStore'
import { initSounds } from '@/lib/sounds'

type AnimState = 'idle' | 'powering' | 'zooming' | 'flash'

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Camera positions — start pulled back to see full desk, zoom into screen
const CAM_START_POS  = new THREE.Vector3(2.2, 1.8, 4.5)
const CAM_START_LOOK = new THREE.Vector3(0, 0.8, 0)
const CAM_END_POS    = new THREE.Vector3(0, 1.1, 1.4)
const CAM_END_LOOK   = new THREE.Vector3(0, 1.1, 0)

// ─── GLB Model ───────────────────────────────────────────────────────────────
function DeskModel({ powered }: { powered: boolean }) {
  const { scene } = useGLTF('/computer_desk__retro_workspace_setup.glb')
  const screenRef  = useRef<THREE.Object3D | null>(null)
  const screenGlow = useRef<THREE.PointLight>(null!)

  // Clone so we can mutate materials safely
  const cloned = useRef<THREE.Group | null>(null)

  // One-time setup: find the screen mesh, boost all material roughness/metalness
  useRef(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scene.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow    = true
        obj.receiveShadow = true
        // Find monitor screen mesh by name patterns common in Sketchfab exports
        const n = obj.name.toLowerCase()
        if (
          n.includes('screen') ||
          n.includes('monitor') ||
          n.includes('display') ||
          n.includes('glass')
        ) {
          screenRef.current = obj
        }
      }
    })
  })

  // Same search with useEffect equivalent via lazy ref
  if (!cloned.current) {
    cloned.current = scene as unknown as THREE.Group
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.castShadow    = true
        mesh.receiveShadow = true
        const n = mesh.name.toLowerCase()
        if (
          n.includes('screen') ||
          n.includes('monitor') ||
          n.includes('display') ||
          n.includes('glass') ||
          n.includes('crt')
        ) {
          screenRef.current = mesh
        }
      }
    })
  }

  useFrame((_, dt) => {
    const k = dt * 1.6
    const target = powered ? 1 : 0
    // Animate screen emissive if we found it
    if (screenRef.current) {
      const mesh = screenRef.current as THREE.Mesh
      const mat  = mesh.material as THREE.MeshStandardMaterial
      if (mat && 'emissiveIntensity' in mat) {
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity ?? 0, target * 0.7, k)
        if (!mat.emissive || mat.emissive.equals(new THREE.Color(0, 0, 0))) {
          mat.emissive = new THREE.Color(0.15, 0.7, 0.3)
        }
      }
    }
    // Screen glow light
    if (screenGlow.current) {
      screenGlow.current.intensity = THREE.MathUtils.lerp(
        screenGlow.current.intensity, target * 5, k
      )
    }
  })

  return (
    <group>
      <primitive object={scene} />
      {/* Green CRT glow — positioned roughly where most desk monitors sit */}
      <pointLight
        ref={screenGlow}
        position={[0, 1.2, 0.6]}
        color="#22ee66"
        intensity={0}
        distance={4}
        decay={2}
      />
    </group>
  )
}

// Preload
useGLTF.preload('/computer_desk__retro_workspace_setup.glb')

// ─── Power button (HTML overlay — always findable regardless of model layout) ─
function PowerButtonOverlay({
  powered,
  onPowerClick,
}: {
  powered: boolean
  onPowerClick: () => void
}) {
  const [pulse, setPulse] = useState(0)
  const raf = useRef<number>(0)
  const start = useRef(performance.now())

  // Animate the pulse ring outside canvas
  useRef(() => {
    const tick = () => {
      const t = (performance.now() - start.current) / 1000
      setPulse(Math.sin(t * 2.4) * 0.5 + 0.5)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  })

  if (powered) return null

  return (
    <button
      onClick={onPowerClick}
      title="Power on"
      className="absolute"
      style={{
        bottom: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #1a0800 0%, #0d0400 100%)',
        border: `3px solid rgba(255,${100 + Math.round(pulse * 80)},0,${0.7 + pulse * 0.3})`,
        boxShadow: `0 0 ${12 + Math.round(pulse * 18)}px rgba(255,80,0,${0.4 + pulse * 0.4}), 0 0 ${30 + Math.round(pulse * 20)}px rgba(255,60,0,${0.15 + pulse * 0.1})`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 30,
        transition: 'none',
      }}
    >
      {/* Power symbol SVG */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path
          d="M16 4 L16 16"
          stroke={`rgba(255,${160 + Math.round(pulse * 60)},0,1)`}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M10 8 A9 9 0 1 0 22 8"
          stroke={`rgba(255,${160 + Math.round(pulse * 60)},0,1)`}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </button>
  )
}

// ─── Camera rig ───────────────────────────────────────────────────────────────
function CameraRig({ animState, onDone }: { animState: AnimState; onDone: () => void }) {
  const { camera } = useThree()
  const t     = useRef(0)
  const fired = useRef(false)

  useFrame((_, dt) => {
    if (animState !== 'zooming') return
    t.current = Math.min(t.current + dt * 0.4, 1)
    const e   = easeInOutCubic(t.current)
    camera.position.lerpVectors(CAM_START_POS, CAM_END_POS, e)
    camera.lookAt(new THREE.Vector3().lerpVectors(CAM_START_LOOK, CAM_END_LOOK, e))
    if (t.current >= 1 && !fired.current) {
      fired.current = true
      onDone()
    }
  })

  return null
}

// ─── Post FX ──────────────────────────────────────────────────────────────────
const CA_OFFSET = new THREE.Vector2(0.0034, 0.0018)

function PostFX({ powered }: { powered: boolean }) {
  return (
    <EffectComposer>
      <Bloom
        intensity={powered ? 0.65 : 0.2}
        luminanceThreshold={0.45}
        luminanceSmoothing={0.3}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={CA_OFFSET}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise blendFunction={BlendFunction.ADD} opacity={0.052} />
      <Vignette eskil={false} offset={0.3} darkness={0.75} />
    </EffectComposer>
  )
}

// ─── Loading fallback ─────────────────────────────────────────────────────────
function Loader() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 25 }}>
      <div className="font-ui text-[12px] tracking-widest uppercase mb-3" style={{ color: '#444' }}>
        Loading workspace...
      </div>
      <div className="h-[2px] w-[120px]" style={{ background: '#1a1a1a' }}>
        <div
          className="h-full"
          style={{
            width: '60%',
            background: '#333',
            animation: 'loaderPulse 1.2s ease-in-out infinite alternate',
          }}
        />
      </div>
      <style>{`@keyframes loaderPulse { from{width:20%} to{width:90%} }`}</style>
    </div>
  )
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({
  animState,
  setAnimState,
  onFlash,
}: {
  animState: AnimState
  setAnimState: (s: AnimState) => void
  onFlash: () => void
}) {
  const powered = animState !== 'idle'

  const handleZoomDone = useCallback(() => {
    setAnimState('flash')
    onFlash()
  }, [setAnimState, onFlash])

  return (
    <>
      <color attach="background" args={['#090709']} />
      <fog attach="fog" args={['#0b0809', 14, 38]} />

      {/* Studio HDRI for realistic reflections */}
      <Environment preset="studio" />

      {/* Key light */}
      <directionalLight
        castShadow
        position={[4, 7, 4]}
        intensity={2.5}
        color="#fff8e8"
        shadow-mapSize={[2048, 2048] as unknown as number}
        shadow-bias={-0.001}
      />
      {/* Cool fill */}
      <directionalLight position={[-4, 3, 1]} intensity={0.6} color="#8898cc" />
      {/* Rim */}
      <directionalLight position={[0, 4, -5]} intensity={0.4} color="#3a4888" />
      {/* Ambient */}
      <ambientLight intensity={0.8} color="#1e1c2e" />

      <Suspense fallback={null}>
        <DeskModel powered={powered} />
      </Suspense>

      <CameraRig animState={animState} onDone={handleZoomDone} />
      <PostFX powered={powered} />
    </>
  )
}

// ─── Flash overlay ────────────────────────────────────────────────────────────
function FlashOverlay({ on }: { on: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: '#fff',
        opacity: on ? 1 : 0,
        transition: on ? 'none' : 'opacity 0.5s ease-out',
        zIndex: 20,
      }}
    />
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function PowerOn() {
  const { setPhase }              = useBootStore()
  const [animState, setAnimState] = useState<AnimState>('idle')
  const [flash, setFlash]         = useState(false)
  const [loaded, setLoaded]       = useState(false)

  const handlePower = useCallback(() => {
    if (animState !== 'idle') return
    setAnimState('powering')
    setTimeout(() => setAnimState('zooming'), 1900)
  }, [animState])

  const handleFlash = useCallback(() => {
    initSounds()
    setFlash(true)
    setTimeout(() => {
      setFlash(false)
      setTimeout(() => setPhase('bios'), 220)
    }, 420)
  }, [setPhase])

  return (
    <div className="fixed inset-0 bg-black" style={{ zIndex: 9999 }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: CAM_START_POS.toArray(),
          fov: 42,
          near: 0.1,
          far: 55,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={() => setLoaded(true)}
      >
        <Scene
          animState={animState}
          setAnimState={setAnimState}
          onFlash={handleFlash}
        />
      </Canvas>

      {!loaded && <Loader />}
      <FlashOverlay on={flash} />

      {/* Power button overlay — HTML so it's always visible */}
      <PowerButtonOverlay powered={animState !== 'idle'} onPowerClick={handlePower} />

      {/* Hint text */}
      {animState === 'idle' && loaded && (
        <div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 pointer-events-none select-none"
          style={{ animation: 'hintPulse 2.8s ease-in-out infinite' }}
        >
          <span className="font-ui text-[12px] tracking-[0.26em] uppercase" style={{ color: '#666' }}>
            Click the power button
          </span>
          <style>{`@keyframes hintPulse { 0%,100%{opacity:.3} 50%{opacity:1} }`}</style>
        </div>
      )}
    </div>
  )
}
