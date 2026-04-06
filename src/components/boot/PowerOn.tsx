'use client'

import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
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

// Camera waypoints — closer, more front-facing so everything is legible
const CAM_START_POS  = new THREE.Vector3(1.1, 2.1, 4.6)
const CAM_START_LOOK = new THREE.Vector3(0.1, 0.9, 0)
const CAM_END_POS    = new THREE.Vector3(0,   1.35, 1.65)
const CAM_END_LOOK   = new THREE.Vector3(0,   1.35, 0.92)

// ─── Desk ─────────────────────────────────────────────────────────────────────
function Desk() {
  return (
    <>
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[20, 0.1, 12]} />
        <meshStandardMaterial color="#1e1408" roughness={0.76} metalness={0.04} />
      </mesh>
      {/* Back wall */}
      <mesh receiveShadow position={[0, 4, -5]}>
        <planeGeometry args={[22, 10]} />
        <meshStandardMaterial color="#0e0b09" roughness={1} />
      </mesh>
    </>
  )
}

// ─── Computer ─────────────────────────────────────────────────────────────────
function Computer({
  powered,
  onPowerClick,
}: {
  powered: boolean
  onPowerClick: () => void
}) {
  const screenMat  = useRef<THREE.MeshStandardMaterial>(null!)
  const screenGlow = useRef<THREE.PointLight>(null!)
  const btnMat     = useRef<THREE.MeshStandardMaterial>(null!)
  const btnLight   = useRef<THREE.PointLight>(null!)

  useFrame(({ clock }, dt) => {
    const k = dt * 1.8
    // Screen warms up when powered
    if (screenMat.current) {
      screenMat.current.emissiveIntensity = THREE.MathUtils.lerp(
        screenMat.current.emissiveIntensity, powered ? 0.65 : 0, k
      )
    }
    if (screenGlow.current) {
      screenGlow.current.intensity = THREE.MathUtils.lerp(
        screenGlow.current.intensity, powered ? 5.5 : 0, k
      )
    }
    // Power button pulses amber when idle, goes green when powered
    if (btnMat.current && btnLight.current) {
      if (!powered) {
        const pulse = Math.sin(clock.elapsedTime * 2.4) * 0.5 + 0.5
        btnMat.current.emissiveIntensity  = 0.5 + pulse * 0.8
        btnLight.current.intensity        = 0.4 + pulse * 0.5
      } else {
        btnMat.current.emissiveIntensity  = THREE.MathUtils.lerp(btnMat.current.emissiveIntensity, 0.2, k)
        btnLight.current.intensity        = THREE.MathUtils.lerp(btnLight.current.intensity, 0, k)
      }
    }
  })

  const cream   = '#dedad0'
  const bezel   = '#ccc8bc'
  const dark    = '#b4b0a4'

  return (
    <group position={[0, 1.1, 0]}>
      {/* ── Main chassis ── */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.6, 2.6, 1.8]} />
        <meshStandardMaterial color={cream} roughness={0.52} metalness={0.06} />
      </mesh>
      {/* Top chamfer */}
      <mesh position={[0, 1.31, -0.08]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[2.62, 0.06, 1.72]} />
        <meshStandardMaterial color="#eae6da" roughness={0.4} />
      </mesh>

      {/* ── Screen bezel ── */}
      <mesh castShadow position={[0, 0.38, 0.91]}>
        <boxGeometry args={[2.34, 1.88, 0.05]} />
        <meshStandardMaterial color={bezel} roughness={0.5} />
      </mesh>

      {/* ── CRT glass ── */}
      <mesh position={[0, 0.42, 0.935]}>
        <boxGeometry args={[1.96, 1.48, 0.01]} />
        <meshStandardMaterial
          ref={screenMat}
          color="#030a05"
          emissive={new THREE.Color(0.12, 0.72, 0.30)}
          emissiveIntensity={0}
          roughness={0.04}
          metalness={0.1}
        />
      </mesh>
      {/* Scanline darkening strip (horizontal bands) */}
      <mesh position={[0, 0.42, 0.942]}>
        <planeGeometry args={[1.96, 1.48]} />
        <meshBasicMaterial color="#000" transparent opacity={0.06} depthWrite={false} />
      </mesh>
      <pointLight ref={screenGlow} position={[0, 0.42, 1.6]} color="#22ee66" intensity={0} distance={5} decay={2} />

      {/* ── Lower control panel ── */}
      <mesh position={[0, -0.86, 0.905]}>
        <boxGeometry args={[2.34, 0.72, 0.04]} />
        <meshStandardMaterial color={bezel} roughness={0.55} />
      </mesh>

      {/* Disk drive slot */}
      <mesh position={[0.6, -0.86, 0.929]}>
        <boxGeometry args={[0.72, 0.046, 0.03]} />
        <meshStandardMaterial color="#7a7870" roughness={0.9} />
      </mesh>
      <mesh position={[0.6, -0.86, 0.932]}>
        <boxGeometry args={[0.7, 0.022, 0.01]} />
        <meshStandardMaterial color="#1e1c18" roughness={1} />
      </mesh>

      {/* ── POWER BUTTON — large, center-left, glowing amber ── */}
      <group
        position={[-0.55, -0.86, 0.925]}
        onClick={onPowerClick}
        onPointerEnter={e => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerLeave={e => { e.stopPropagation(); document.body.style.cursor = 'default' }}
      >
        {/* Outer glow ring */}
        <mesh>
          <torusGeometry args={[0.15, 0.018, 10, 40]} />
          <meshStandardMaterial
            ref={btnMat}
            color="#ff6600"
            emissive={new THREE.Color(1, 0.4, 0)}
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
        {/* Button disk */}
        <mesh>
          <cylinderGeometry args={[0.1, 0.1, 0.04, 32]} />
          <meshStandardMaterial color="#442200" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Power symbol — vertical line */}
        <mesh position={[0, 0.024, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.088, 8]} />
          <meshStandardMaterial color="#ffaa44" roughness={0.3} emissive={new THREE.Color(1, 0.55, 0.1)} emissiveIntensity={0.6} />
        </mesh>
        {/* Power symbol — arc (3 segments) */}
        {[-0.55, 0, 0.55].map((angle, i) => (
          <mesh
            key={i}
            position={[Math.sin((angle + 1.5) * 1.1) * 0.048, 0.024, Math.cos((angle + 1.5) * 1.1) * 0.048]}
            rotation={[Math.PI / 2, 0, angle + 1.5]}
          >
            <cylinderGeometry args={[0.006, 0.006, 0.028, 6]} />
            <meshStandardMaterial color="#ffaa44" roughness={0.3} emissive={new THREE.Color(1, 0.55, 0.1)} emissiveIntensity={0.6} />
          </mesh>
        ))}
        {/* Glow light */}
        <pointLight ref={btnLight} color="#ff7700" intensity={0.5} distance={1.8} decay={2} />
      </group>

      {/* Speaker dots */}
      {[-1.0, -0.88, -0.76].map((x, ri) =>
        [-0.74, -0.86, -0.98].map((y, ci) => (
          <mesh key={`${ri}-${ci}`} position={[x, y, 0.91]}>
            <cylinderGeometry args={[0.013, 0.013, 0.015, 8]} />
            <meshStandardMaterial color="#7a7870" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Vent slits right */}
      {[0.35, 0.22, 0.08, -0.06].map((z, i) => (
        <mesh key={i} position={[1.31, 0.2, z]}>
          <boxGeometry args={[0.022, 0.52, 0.02]} />
          <meshStandardMaterial color={dark} roughness={0.8} />
        </mesh>
      ))}

      {/* Base foot */}
      <mesh castShadow position={[0, -1.34, 0.1]}>
        <boxGeometry args={[2.1, 0.07, 1.3]} />
        <meshStandardMaterial color={dark} roughness={0.6} />
      </mesh>

      {/* Side shadow panels */}
      <mesh position={[-1.31, 0, 0]}>
        <boxGeometry args={[0.015, 2.6, 1.8]} />
        <meshStandardMaterial color="#aaa69a" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ─── Keyboard ─────────────────────────────────────────────────────────────────
function Keyboard() {
  const COLS  = 14
  const ROWS  = 5
  const COUNT = COLS * ROWS
  const KW    = 0.124
  const KH    = 0.04
  const KD    = 0.128
  const XGAP  = 0.009
  const ZGAP  = 0.009

  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    let i = 0
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        dummy.position.set(
          (c - (COLS - 1) / 2) * (KW + XGAP),
          0,
          (r - (ROWS - 1) / 2) * (KD + ZGAP)
        )
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        const age = Math.abs(Math.sin(r * 17.3 + c * 5.9))
        mesh.setColorAt(i, new THREE.Color().setHSL(0.1, 0.06 * age, 0.75 + age * 0.09))
        i++
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [dummy])

  return (
    <group position={[0, 0.005, 1.92]} rotation={[-0.05, 0, 0]}>
      {/* Base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.22, 0.048, 0.9]} />
        <meshStandardMaterial color="#cac6ba" roughness={0.62} metalness={0.03} />
      </mesh>
      {/* Keys */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} castShadow position={[0, 0.044, 0]}>
        <boxGeometry args={[KW, KH, KD]} />
        <meshStandardMaterial roughness={0.62} metalness={0.02} />
      </instancedMesh>
    </group>
  )
}

// ─── Mouse ────────────────────────────────────────────────────────────────────
function Mouse() {
  return (
    <group position={[1.56, 0.02, 1.88]} rotation={[0, 0.16, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.052, 0.48]} />
        <meshStandardMaterial color="#d6d2c6" roughness={0.5} metalness={0.05} />
      </mesh>
      {/* Divider */}
      <mesh position={[0, 0.03, -0.04]}>
        <boxGeometry args={[0.003, 0.008, 0.38]} />
        <meshStandardMaterial color="#aaa89c" roughness={0.8} />
      </mesh>
      {/* Scroll wheel */}
      <mesh position={[0, 0.038, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.07, 16]} />
        <meshStandardMaterial color="#bab6aa" roughness={0.5} />
      </mesh>
    </group>
  )
}

// ─── Coffee cup ───────────────────────────────────────────────────────────────
function CoffeeCup() {
  return (
    <group position={[1.8, 0, 0.38]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.21, 0.018, 36]} />
        <meshStandardMaterial color="#e4dbd0" roughness={0.48} />
      </mesh>
      <mesh castShadow position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.1, 0.086, 0.19, 32]} />
        <meshStandardMaterial color="#dcd2c4" roughness={0.44} />
      </mesh>
      <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.088, 32]} />
        <meshStandardMaterial color="#1a0c03" roughness={0.1} />
      </mesh>
      <mesh castShadow position={[0.13, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.058, 0.015, 10, 22, Math.PI]} />
        <meshStandardMaterial color="#dcd2c4" roughness={0.44} />
      </mesh>
    </group>
  )
}

// ─── Notepad ──────────────────────────────────────────────────────────────────
function Notepad() {
  return (
    <group position={[-1.7, 0.002, 0.8]} rotation={[0, 0.2, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.86, 0.013, 1.12]} />
        <meshStandardMaterial color="#f2eee4" roughness={0.85} />
      </mesh>
      {[0.28, 0.14, 0, -0.14, -0.28].map((z, i) => (
        <mesh key={i} position={[0.04, 0.009, z]}>
          <boxGeometry args={[0.7, 0.002, 0.005]} />
          <meshStandardMaterial color="#c0cce0" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Dust ─────────────────────────────────────────────────────────────────────
function Dust() {
  const count = 200
  const pos   = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i * 3]     = (Math.random() - 0.5) * 12
      a[i * 3 + 1] = Math.random() * 6
      a[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return a
  }, [])
  const ref = useRef<THREE.Points>(null!)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.006
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#c8b880" transparent opacity={0.22} sizeAttenuation depthWrite={false} />
    </points>
  )
}

// ─── Camera rig ───────────────────────────────────────────────────────────────
function CameraRig({ animState, onDone }: { animState: AnimState; onDone: () => void }) {
  const { camera } = useThree()
  const t          = useRef(0)
  const fired      = useRef(false)

  useFrame((_, dt) => {
    if (animState !== 'zooming') return
    t.current = Math.min(t.current + dt * 0.44, 1)
    const e   = easeInOutCubic(t.current)
    camera.position.lerpVectors(CAM_START_POS, CAM_END_POS, e)
    camera.lookAt(new THREE.Vector3().lerpVectors(CAM_START_LOOK, CAM_END_LOOK, e))
    if (t.current >= 1 && !fired.current) { fired.current = true; onDone() }
  })
  return null
}

// ─── Post FX ──────────────────────────────────────────────────────────────────
const CA_OFFSET = new THREE.Vector2(0.0038, 0.002)

function PostFX({ powered }: { powered: boolean }) {
  return (
    <EffectComposer>
      <Bloom intensity={powered ? 0.65 : 0.22} luminanceThreshold={0.45} luminanceSmoothing={0.3} />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={CA_OFFSET}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise blendFunction={BlendFunction.ADD} opacity={0.055} />
      <Vignette eskil={false} offset={0.28} darkness={0.78} />
    </EffectComposer>
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

  const handlePower = useCallback(() => {
    if (animState !== 'idle') return
    setAnimState('powering')
    setTimeout(() => setAnimState('zooming'), 1900)
  }, [animState, setAnimState])

  const handleZoomDone = useCallback(() => {
    setAnimState('flash')
    onFlash()
  }, [setAnimState, onFlash])

  return (
    <>
      <color attach="background" args={['#080609']} />
      <fog attach="fog" args={['#0a0709', 16, 38]} />

      {/* ── Lighting — all directional so nothing goes dark from distance ── */}

      {/* Warm overhead key light — main illumination, casts shadows */}
      <directionalLight
        castShadow
        position={[4, 7, 4]}
        intensity={3.8}
        color="#fff8e4"
        shadow-mapSize={[2048, 2048] as unknown as number}
        shadow-bias={-0.001}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={8}
        shadow-camera-bottom={-4}
        shadow-camera-near={0.5}
        shadow-camera-far={24}
      />

      {/* Cool window fill from upper left */}
      <directionalLight position={[-4, 3, 2]} intensity={1.1} color="#7888c8" />

      {/* Top bounce — fills top surfaces */}
      <directionalLight position={[0, 8, 1]} intensity={0.7} color="#c8cce0" />

      {/* Rim from behind — separates objects from bg */}
      <directionalLight position={[0.5, 4, -5]} intensity={0.55} color="#3a4882" />

      {/* Ambient — low but not zero, ensures no pitch-black shadows */}
      <ambientLight color="#1e1c2e" intensity={1.6} />

      {/* ── Objects ── */}
      <Desk />
      <Computer powered={powered} onPowerClick={handlePower} />
      <Keyboard />
      <Mouse />
      <CoffeeCup />
      <Notepad />
      <Dust />

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
  const { setPhase }                      = useBootStore()
  const [animState, setAnimState]         = useState<AnimState>('idle')
  const [flash, setFlash]                 = useState(false)

  const handleFlash = useCallback(() => {
    initSounds()
    setFlash(true)
    setTimeout(() => { setFlash(false); setTimeout(() => setPhase('bios'), 200) }, 420)
  }, [setPhase])

  return (
    <div className="fixed inset-0 bg-black" style={{ zIndex: 9999 }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: CAM_START_POS.toArray(), fov: 42, near: 0.1, far: 55 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.65,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Scene animState={animState} setAnimState={setAnimState} onFlash={handleFlash} />
      </Canvas>

      <FlashOverlay on={flash} />

      {/* Hint */}
      {animState === 'idle' && (
        <div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 pointer-events-none select-none"
          style={{ animation: 'hintPulse 2.8s ease-in-out infinite' }}
        >
          <span className="font-ui text-[12px] tracking-[0.26em] uppercase" style={{ color: '#888' }}>
            Click the power button
          </span>
          <style>{`
            @keyframes hintPulse { 0%,100%{opacity:.35} 50%{opacity:1} }
          `}</style>
        </div>
      )}
    </div>
  )
}
