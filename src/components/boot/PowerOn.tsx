'use client'

import { useRef, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, ChromaticAberration, Noise, Vignette, Bloom } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { useBootStore } from '@/store/bootStore'
import { initSounds } from '@/lib/sounds'

// ─── Types ────────────────────────────────────────────────────────────────────
type AnimState = 'idle' | 'powering' | 'zooming' | 'flash'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ─── Desk surface ─────────────────────────────────────────────────────────────
function Desk() {
  return (
    <mesh receiveShadow position={[0, -1.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[18, 12]} />
      <meshStandardMaterial color="#1a1208" roughness={0.85} metalness={0.05} />
    </mesh>
  )
}

// ─── Monitor + computer body ──────────────────────────────────────────────────
function Computer({ powered, onPowerClick }: { powered: boolean; onPowerClick: () => void }) {
  const screenGlow = useRef<THREE.PointLight>(null!)
  const screenMat = useRef<THREE.MeshStandardMaterial>(null!)
  const ledMat = useRef<THREE.MeshStandardMaterial>(null!)

  useFrame((_, delta) => {
    if (!screenMat.current || !ledMat.current || !screenGlow.current) return
    const target = powered ? 1 : 0
    const speed = delta * 1.4
    screenMat.current.emissiveIntensity = THREE.MathUtils.lerp(
      screenMat.current.emissiveIntensity,
      target * 0.55,
      speed
    )
    screenGlow.current.intensity = THREE.MathUtils.lerp(
      screenGlow.current.intensity,
      target * 3.5,
      speed
    )
    ledMat.current.emissiveIntensity = THREE.MathUtils.lerp(
      ledMat.current.emissiveIntensity,
      target * 2.2,
      speed
    )
  })

  return (
    <group position={[0, -0.3, 0]}>
      {/* ── Main body (all-in-one) ── */}
      <mesh castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[2.6, 2.2, 1.6]} />
        <meshStandardMaterial color="#d4cfc4" roughness={0.55} metalness={0.08} />
      </mesh>

      {/* Subtle bevel top edge */}
      <mesh castShadow position={[0, 2.01, 0]}>
        <boxGeometry args={[2.62, 0.07, 1.62]} />
        <meshStandardMaterial color="#e8e4da" roughness={0.4} />
      </mesh>

      {/* ── CRT bezel ── */}
      <mesh castShadow position={[0, 1.05, 0.815]}>
        <boxGeometry args={[2.3, 1.75, 0.06]} />
        <meshStandardMaterial color="#c8c3b8" roughness={0.5} />
      </mesh>

      {/* ── Screen glass ── */}
      <mesh position={[0, 1.05, 0.845]}>
        <boxGeometry args={[1.92, 1.38, 0.01]} />
        <meshStandardMaterial
          ref={screenMat}
          color="#050a06"
          emissive={new THREE.Color(0.18, 0.55, 0.22)}
          emissiveIntensity={0}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>

      {/* Screen glow point light */}
      <pointLight
        ref={screenGlow}
        position={[0, 1.05, 1.2]}
        color="#22cc55"
        intensity={0}
        distance={4}
      />

      {/* ── Scanline overlay plane (subtle) ── */}
      <mesh position={[0, 1.05, 0.852]}>
        <planeGeometry args={[1.92, 1.38]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Disk drive slot ── */}
      <mesh position={[0.55, 0.18, 0.81]}>
        <boxGeometry args={[0.72, 0.055, 0.04]} />
        <meshStandardMaterial color="#aaa598" roughness={0.7} />
      </mesh>

      {/* ── Power button ── */}
      <mesh
        position={[-0.72, 0.18, 0.81]}
        onClick={onPowerClick}
        onPointerOver={e => { e.stopPropagation(); (e.object as THREE.Mesh).scale.setScalar(1.12) }}
        onPointerOut={e => { e.stopPropagation(); (e.object as THREE.Mesh).scale.setScalar(1) }}
      >
        <cylinderGeometry args={[0.072, 0.072, 0.045, 24]} />
        <meshStandardMaterial color="#b8b3a8" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Power LED */}
      <mesh position={[-0.55, 0.18, 0.815]}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshStandardMaterial
          ref={ledMat}
          color="#00ff44"
          emissive={new THREE.Color(0, 1, 0.3)}
          emissiveIntensity={0}
        />
      </mesh>

      {/* ── Vent slits (right side) ── */}
      {[-0.12, 0, 0.12].map((z, i) => (
        <mesh key={i} position={[1.31, 0.7, z]}>
          <boxGeometry args={[0.02, 0.55, 0.025]} />
          <meshStandardMaterial color="#b0ab9f" roughness={0.8} />
        </mesh>
      ))}

      {/* ── Logo plate ── */}
      <mesh position={[0, 0.18, 0.815]}>
        <planeGeometry args={[0.28, 0.09]} />
        <meshStandardMaterial color="#c8c3b8" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* ── Base/foot ── */}
      <mesh castShadow position={[0, -0.22, 0.1]}>
        <boxGeometry args={[1.9, 0.08, 1.3]} />
        <meshStandardMaterial color="#c2bdb2" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ─── Keyboard ─────────────────────────────────────────────────────────────────
function Keyboard() {
  const keyCols = 14
  const keyRows = 5
  const keyCount = keyCols * keyRows

  const dummy = useMemo(() => new THREE.Object3D(), [])

  const meshRef = useRef<THREE.InstancedMesh>(null!)

  useMemo(() => {
    if (!meshRef.current) return
    let i = 0
    for (let r = 0; r < keyRows; r++) {
      for (let c = 0; c < keyCols; c++) {
        const x = (c - keyCols / 2 + 0.5) * 0.155
        const z = (r - keyRows / 2 + 0.5) * 0.16
        dummy.position.set(x, 0, z)
        dummy.scale.setScalar(0.88 + Math.random() * 0.04)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
        // slight yellowing on some keys
        const age = Math.random()
        const col = new THREE.Color().setHSL(0.1, 0.08 * age, 0.78 + age * 0.06)
        meshRef.current.setColorAt(i, col)
        i++
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [dummy])

  return (
    <group position={[0, -1.585, 1.55]} rotation={[-0.07, 0, 0]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[2.4, 0.07, 0.95]} />
        <meshStandardMaterial color="#cdc8be" roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Keys */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, keyCount]} castShadow position={[0, 0.055, 0]}>
        <boxGeometry args={[0.128, 0.055, 0.132]} />
        <meshStandardMaterial roughness={0.65} metalness={0.02} />
      </instancedMesh>
    </group>
  )
}

// ─── Coffee cup ───────────────────────────────────────────────────────────────
function CoffeeCup() {
  return (
    <group position={[1.55, -1.56, 0.6]}>
      {/* Saucer */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.19, 0.018, 32]} />
        <meshStandardMaterial color="#e8ddd0" roughness={0.5} />
      </mesh>
      {/* Cup body */}
      <mesh castShadow position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.1, 0.085, 0.17, 32]} />
        <meshStandardMaterial color="#ddd5c8" roughness={0.45} />
      </mesh>
      {/* Coffee liquid */}
      <mesh position={[0, 0.175, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.088, 32]} />
        <meshStandardMaterial color="#2a1505" roughness={0.2} />
      </mesh>
      {/* Handle */}
      <mesh castShadow position={[0.125, 0.09, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.055, 0.014, 10, 20, Math.PI]} />
        <meshStandardMaterial color="#ddd5c8" roughness={0.45} />
      </mesh>
    </group>
  )
}

// ─── Floating dust particles ──────────────────────────────────────────────────
function DustParticles() {
  const count = 120
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5
    }
    return arr
  }, [])

  const ref = useRef<THREE.Points>(null!)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.012
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.008) * 0.04
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#b8a888" transparent opacity={0.35} sizeAttenuation />
    </points>
  )
}

// ─── Notebook / paper ─────────────────────────────────────────────────────────
function Notebook() {
  return (
    <group position={[-1.6, -1.585, 0.9]} rotation={[0, 0.25, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.85, 0.018, 1.1]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.8} />
      </mesh>
      {/* Lines */}
      {[0.22, 0.1, -0.02, -0.14, -0.26].map((z, i) => (
        <mesh key={i} position={[0, 0.011, z]}>
          <boxGeometry args={[0.7, 0.002, 0.006]} />
          <meshStandardMaterial color="#c8d4e8" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Camera rig + animation ────────────────────────────────────────────────────
const CAM_START = new THREE.Vector3(0, 1.6, 6.2)
const CAM_LOOK_START = new THREE.Vector3(0, 0.3, 0)
const CAM_END = new THREE.Vector3(0, 0.72, 1.35)
const CAM_LOOK_END = new THREE.Vector3(0, 0.72, 0.85)

function CameraRig({
  animState,
  onZoomComplete,
}: {
  animState: AnimState
  onZoomComplete: () => void
}) {
  const { camera } = useThree()
  const progress = useRef(0)
  const notified = useRef(false)

  // Set initial camera position once
  useMemo(() => {
    camera.position.copy(CAM_START)
    camera.lookAt(CAM_LOOK_START)
  }, [camera])

  useFrame((_, delta) => {
    if (animState !== 'zooming') return
    progress.current = Math.min(progress.current + delta * 0.45, 1)
    const t = easeInOutCubic(progress.current)

    camera.position.lerpVectors(CAM_START, CAM_END, t)
    const look = new THREE.Vector3().lerpVectors(CAM_LOOK_START, CAM_LOOK_END, t)
    camera.lookAt(look)

    if (progress.current >= 1 && !notified.current) {
      notified.current = true
      onZoomComplete()
    }
  })

  return null
}

// ─── Post-processing ──────────────────────────────────────────────────────────
function PostFX({ powered }: { powered: boolean }) {
  return (
    <EffectComposer>
      <Bloom
        intensity={powered ? 0.45 : 0.12}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.4}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0028, 0.0018)}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.055}
      />
      <Vignette eskil={false} offset={0.38} darkness={0.88} />
    </EffectComposer>
  )
}

// ─── Scene root ───────────────────────────────────────────────────────────────
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

  const handlePowerClick = useCallback(() => {
    if (animState !== 'idle') return
    setAnimState('powering')
    setTimeout(() => setAnimState('zooming'), 1800)
  }, [animState, setAnimState])

  const handleZoomComplete = useCallback(() => {
    setAnimState('flash')
    onFlash()
  }, [setAnimState, onFlash])

  return (
    <>
      {/* ── Lighting ── */}
      {/* Ambient fill — very dim, cold */}
      <ambientLight color="#1a1f2e" intensity={0.6} />

      {/* Key light — warm desk lamp from top-right */}
      <directionalLight
        castShadow
        position={[3.5, 5, 2.5]}
        intensity={1.6}
        color="#fff5e0"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* Cool fill from left */}
      <directionalLight position={[-4, 2, 1]} intensity={0.35} color="#8898cc" />

      {/* Rim light from behind */}
      <pointLight position={[0, 3, -3.5]} intensity={0.8} color="#4466aa" />

      {/* ── Scene objects ── */}
      <Desk />
      <Computer powered={powered} onPowerClick={handlePowerClick} />
      <Keyboard />
      <CoffeeCup />
      <Notebook />
      <DustParticles />

      {/* ── Camera ── */}
      <CameraRig animState={animState} onZoomComplete={handleZoomComplete} />

      {/* ── Post FX ── */}
      <PostFX powered={powered} />
    </>
  )
}

// ─── Flash overlay ────────────────────────────────────────────────────────────
function FlashOverlay({ visible }: { visible: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: '#ffffff',
        opacity: visible ? 1 : 0,
        transition: visible ? 'none' : 'opacity 0.4s ease-out',
        zIndex: 10,
      }}
    />
  )
}

// ─── Idle hint ────────────────────────────────────────────────────────────────
function IdleHint({ visible }: { visible: boolean }) {
  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 font-ui text-[11px] tracking-[0.25em] uppercase pointer-events-none select-none"
      style={{
        color: '#444',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
        animation: visible ? 'hintPulse 2.8s ease-in-out infinite' : 'none',
      }}
    >
      Click the power button
      <style>{`
        @keyframes hintPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}

// ─── PowerOn (exported) ───────────────────────────────────────────────────────
export function PowerOn() {
  const { setPhase } = useBootStore()
  const [animState, setAnimState] = useState<AnimState>('idle')
  const [flash, setFlash] = useState(false)

  const handleFlash = useCallback(() => {
    initSounds()
    setFlash(true)
    // Hold white flash briefly then hand off to boot sequence
    setTimeout(() => {
      setFlash(false)
      setTimeout(() => setPhase('bios'), 200)
    }, 380)
  }, [setPhase])

  return (
    <div className="fixed inset-0 bg-black" style={{ zIndex: 9999 }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ fov: 42, near: 0.1, far: 40 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <Scene
          animState={animState}
          setAnimState={setAnimState}
          onFlash={handleFlash}
        />
      </Canvas>

      <FlashOverlay visible={flash} />
      <IdleHint visible={animState === 'idle'} />
    </div>
  )
}
