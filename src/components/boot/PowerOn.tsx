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

// ─── State machine ────────────────────────────────────────────────────────────
type AnimState = 'idle' | 'powering' | 'zooming' | 'flash'

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// ─── Camera waypoints ─────────────────────────────────────────────────────────
const CAM_START_POS  = new THREE.Vector3( 2.4,  2.9,  5.8)
const CAM_START_LOOK = new THREE.Vector3( 0,    0.85, 0  )
const CAM_END_POS    = new THREE.Vector3( 0.04, 1.35, 1.7)
const CAM_END_LOOK   = new THREE.Vector3( 0,    1.35, 0.9)

// ─── Desk ─────────────────────────────────────────────────────────────────────
function Desk() {
  return (
    <group>
      {/* Surface */}
      <mesh receiveShadow position={[0, -0.04, 0]}>
        <boxGeometry args={[18, 0.08, 10]} />
        <meshStandardMaterial color="#1a1108" roughness={0.78} metalness={0.06} />
      </mesh>
      {/* Front edge highlight */}
      <mesh receiveShadow position={[0, 0.01, 5.02]}>
        <boxGeometry args={[18, 0.1, 0.04]} />
        <meshStandardMaterial color="#2e2010" roughness={0.6} />
      </mesh>
      {/* Back wall */}
      <mesh receiveShadow position={[0, 3.5, -4.5]}>
        <planeGeometry args={[20, 9]} />
        <meshStandardMaterial color="#0d0b09" roughness={1} />
      </mesh>
    </group>
  )
}

// ─── Computer body (Mac Classic / Apple IIc all-in-one style) ─────────────────
function Computer({
  powered,
  onPowerClick,
}: {
  powered: boolean
  onPowerClick: () => void
}) {
  const screenMat   = useRef<THREE.MeshStandardMaterial>(null!)
  const screenGlow  = useRef<THREE.PointLight>(null!)
  const ledMat      = useRef<THREE.MeshStandardMaterial>(null!)
  const bodyRef     = useRef<THREE.Mesh>(null!)

  useFrame((_, dt) => {
    const target = powered ? 1 : 0
    const k = dt * 1.6
    const sm = screenMat.current
    const sl = screenGlow.current
    const lm = ledMat.current
    if (sm) sm.emissiveIntensity  = THREE.MathUtils.lerp(sm.emissiveIntensity,  target * 0.6, k)
    if (sl) sl.intensity          = THREE.MathUtils.lerp(sl.intensity,           target * 4.5, k)
    if (lm) lm.emissiveIntensity  = THREE.MathUtils.lerp(lm.emissiveIntensity,  target * 3,   k)
  })

  // Body color — aged cream
  const bodyColor   = '#ddd9ce'
  const bezelColor  = '#cac6bb'
  const shadowColor = '#b8b4a8'

  return (
    <group position={[0, 1.08, 0]}>
      {/* ── Main chassis ── */}
      <mesh ref={bodyRef} castShadow receiveShadow>
        <boxGeometry args={[2.55, 2.55, 1.75]} />
        <meshStandardMaterial color={bodyColor} roughness={0.55} metalness={0.07} />
      </mesh>

      {/* Top slope (chamfer illusion) */}
      <mesh castShadow position={[0, 1.29, -0.1]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[2.57, 0.06, 1.62]} />
        <meshStandardMaterial color="#e8e4d8" roughness={0.4} />
      </mesh>

      {/* Left side shadow panel */}
      <mesh position={[-1.29, 0, 0]}>
        <boxGeometry args={[0.02, 2.55, 1.75]} />
        <meshStandardMaterial color={shadowColor} roughness={0.6} />
      </mesh>

      {/* ── CRT bezel ── */}
      <mesh castShadow position={[0, 0.32, 0.89]}>
        <boxGeometry args={[2.3, 1.82, 0.06]} />
        <meshStandardMaterial color={bezelColor} roughness={0.5} metalness={0.04} />
      </mesh>

      {/* ── Screen glass ── */}
      <mesh position={[0, 0.35, 0.928]}>
        <boxGeometry args={[1.92, 1.44, 0.012]} />
        <meshStandardMaterial
          ref={screenMat}
          color="#030808"
          emissive={new THREE.Color(0.15, 0.62, 0.28)}
          emissiveIntensity={0}
          roughness={0.04}
          metalness={0.12}
        />
      </mesh>

      {/* Scanline texture overlay on screen */}
      <mesh position={[0, 0.35, 0.936]}>
        <planeGeometry args={[1.92, 1.44]} />
        <meshBasicMaterial color="#000" transparent opacity={0.07} depthWrite={false} />
      </mesh>

      {/* Screen glow */}
      <pointLight
        ref={screenGlow}
        position={[0, 0.35, 1.5]}
        color="#22ee66"
        intensity={0}
        distance={5}
        decay={2}
      />

      {/* ── Bottom control panel ── */}
      {/* Panel face */}
      <mesh position={[0, -0.82, 0.888]}>
        <boxGeometry args={[2.3, 0.78, 0.04]} />
        <meshStandardMaterial color={bezelColor} roughness={0.55} />
      </mesh>

      {/* Disk drive slot */}
      <mesh position={[0.3, -0.82, 0.912]}>
        <boxGeometry args={[0.85, 0.05, 0.03]} />
        <meshStandardMaterial color="#8a8680" roughness={0.8} />
      </mesh>
      {/* Slot inset */}
      <mesh position={[0.3, -0.82, 0.915]}>
        <boxGeometry args={[0.82, 0.028, 0.02]} />
        <meshStandardMaterial color="#2a2825" roughness={1} />
      </mesh>

      {/* Power button (clickable) */}
      <mesh
        castShadow
        position={[-0.72, -0.82, 0.914]}
        onClick={onPowerClick}
        onPointerEnter={e => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerLeave={e => { e.stopPropagation(); document.body.style.cursor = 'default' }}
      >
        <cylinderGeometry args={[0.068, 0.068, 0.038, 28]} />
        <meshStandardMaterial color="#c8c4b8" roughness={0.4} metalness={0.35} />
      </mesh>

      {/* Power LED */}
      <mesh position={[-0.52, -0.82, 0.918]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshStandardMaterial
          ref={ledMat}
          color="#00ff55"
          emissive={new THREE.Color(0, 1, 0.3)}
          emissiveIntensity={0}
          roughness={0.1}
        />
      </mesh>

      {/* Speaker grille dots (left) */}
      {[-0.9, -0.78, -0.66].map((x, ri) =>
        [-0.72, -0.82, -0.92].map((y, ci) => (
          <mesh key={`${ri}-${ci}`} position={[x, y, 0.912]}>
            <cylinderGeometry args={[0.014, 0.014, 0.02, 8]} />
            <meshStandardMaterial color="#8a8680" roughness={0.9} />
          </mesh>
        ))
      )}

      {/* Vent slits right side */}
      {[0.3, 0.18, 0.06, -0.06].map((z, i) => (
        <mesh key={i} position={[1.29, 0.2, z]}>
          <boxGeometry args={[0.025, 0.5, 0.022]} />
          <meshStandardMaterial color="#c0bbb0" roughness={0.8} />
        </mesh>
      ))}

      {/* Logo plate */}
      <mesh position={[0, -0.82, 0.91]}>
        <planeGeometry args={[0.26, 0.08]} />
        <meshStandardMaterial color="#d4d0c4" roughness={0.3} metalness={0.22} />
      </mesh>

      {/* Base/foot */}
      <mesh castShadow position={[0, -1.3, 0.12]}>
        <boxGeometry args={[2.0, 0.08, 1.2]} />
        <meshStandardMaterial color={shadowColor} roughness={0.6} metalness={0.05} />
      </mesh>
    </group>
  )
}

// ─── Keyboard ─────────────────────────────────────────────────────────────────
function Keyboard() {
  const COLS = 14
  const ROWS  = 5
  const COUNT = COLS * ROWS
  const KEY_W = 0.122
  const KEY_H = 0.042
  const KEY_D = 0.126
  const XGAP  = 0.01
  const ZGAP  = 0.01

  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  // useEffect — runs after mount, so meshRef.current is available
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    let idx = 0
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = (c - (COLS - 1) / 2) * (KEY_W + XGAP)
        const z = (r - (ROWS - 1) / 2) * (KEY_D + ZGAP)
        dummy.position.set(x, 0, z)
        dummy.rotation.set(0, 0, 0)
        dummy.scale.setScalar(1)
        dummy.updateMatrix()
        mesh.setMatrixAt(idx, dummy.matrix)
        // Aged key color variation
        const age = Math.abs(Math.sin(r * 17.3 + c * 5.9))
        mesh.setColorAt(idx, new THREE.Color().setHSL(0.1, 0.06 * age, 0.76 + age * 0.08))
        idx++
      }
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [dummy])

  return (
    <group position={[0, 0.006, 1.88]} rotation={[-0.06, 0, 0]}>
      {/* Keyboard base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.18, 0.05, 0.88]} />
        <meshStandardMaterial color="#ccc8bc" roughness={0.62} metalness={0.04} />
      </mesh>
      {/* Bevel front edge */}
      <mesh position={[0, 0.015, 0.46]}>
        <boxGeometry args={[2.18, 0.02, 0.04]} />
        <meshStandardMaterial color="#dbd7cb" roughness={0.5} />
      </mesh>
      {/* Keys (InstancedMesh) */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, COUNT]}
        castShadow
        position={[0, 0.044, 0]}
      >
        <boxGeometry args={[KEY_W, KEY_H, KEY_D]} />
        <meshStandardMaterial roughness={0.62} metalness={0.02} />
      </instancedMesh>
    </group>
  )
}

// ─── Retro mouse ──────────────────────────────────────────────────────────────
function Mouse() {
  return (
    <group position={[1.55, 0.022, 1.82]} rotation={[0, 0.18, 0]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.055, 0.46]} />
        <meshStandardMaterial color="#d8d4c8" roughness={0.5} metalness={0.06} />
      </mesh>
      {/* Button divider line */}
      <mesh position={[0, 0.03, -0.04]}>
        <boxGeometry args={[0.003, 0.01, 0.36]} />
        <meshStandardMaterial color="#b0ac9f" roughness={0.7} />
      </mesh>
      {/* Scroll bump */}
      <mesh position={[0, 0.04, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.065, 16]} />
        <meshStandardMaterial color="#c0bcb0" roughness={0.55} />
      </mesh>
      {/* Mouse cord — simple curve using points */}
      <mesh position={[0, 0.01, 0.25]}>
        <boxGeometry args={[0.012, 0.008, 0.05]} />
        <meshStandardMaterial color="#888" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── Coffee cup ───────────────────────────────────────────────────────────────
function CoffeeCup() {
  return (
    <group position={[1.72, 0, 0.42]}>
      {/* Saucer */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.21, 0.02, 36]} />
        <meshStandardMaterial color="#e6ddd0" roughness={0.5} metalness={0.04} />
      </mesh>
      {/* Cup */}
      <mesh castShadow position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.1, 0.086, 0.19, 32]} />
        <meshStandardMaterial color="#ddd4c6" roughness={0.44} metalness={0.05} />
      </mesh>
      {/* Coffee surface */}
      <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.088, 32]} />
        <meshStandardMaterial color="#1e0d04" roughness={0.12} metalness={0.05} />
      </mesh>
      {/* Handle */}
      <mesh castShadow position={[0.13, 0.11, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.058, 0.015, 10, 22, Math.PI]} />
        <meshStandardMaterial color="#ddd4c6" roughness={0.44} metalness={0.05} />
      </mesh>
    </group>
  )
}

// ─── Notepad ──────────────────────────────────────────────────────────────────
function Notepad() {
  return (
    <group position={[-1.65, 0.002, 0.85]} rotation={[0, 0.22, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.88, 0.014, 1.14]} />
        <meshStandardMaterial color="#f4f0e6" roughness={0.85} />
      </mesh>
      {/* Ruled lines */}
      {[0.3, 0.16, 0.02, -0.12, -0.26, -0.4].map((z, i) => (
        <mesh key={i} position={[0.04, 0.009, z]}>
          <boxGeometry args={[0.72, 0.002, 0.005]} />
          <meshStandardMaterial color="#c4cfe4" roughness={1} />
        </mesh>
      ))}
      {/* Top spiral binding */}
      {[-0.36, -0.22, -0.08, 0.06, 0.2, 0.34].map((x, i) => (
        <mesh key={i} position={[x, 0.012, -0.54]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.028, 0.007, 8, 14]} />
          <meshStandardMaterial color="#aaa" roughness={0.6} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Pen ──────────────────────────────────────────────────────────────────────
function Pen() {
  return (
    <group position={[-1.12, 0.015, 1.3]} rotation={[0, -0.35, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.012, 0.01, 0.72, 12]} />
        <meshStandardMaterial color="#1a1a6e" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh castShadow position={[0, -0.37, 0]}>
        <cylinderGeometry args={[0.01, 0.003, 0.04, 10]} />
        <meshStandardMaterial color="#888" roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.013, 0.013, 0.04, 10]} />
        <meshStandardMaterial color="#c8c8c8" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

// ─── Floating dust ────────────────────────────────────────────────────────────
function Dust() {
  const count = 180
  const geo   = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = Math.random() * 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7
    }
    return pos
  }, [])

  const pts = useRef<THREE.Points>(null!)
  useFrame(({ clock }) => {
    if (!pts.current) return
    pts.current.rotation.y = clock.elapsedTime * 0.008
  })

  return (
    <points ref={pts}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[geo, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.016}
        color="#c8b888"
        transparent
        opacity={0.28}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

// ─── Camera rig ───────────────────────────────────────────────────────────────
function CameraRig({
  animState,
  onZoomDone,
}: {
  animState: AnimState
  onZoomDone: () => void
}) {
  const { camera } = useThree()
  const t        = useRef(0)
  const notified = useRef(false)

  useFrame((_, dt) => {
    if (animState !== 'zooming') return
    t.current = Math.min(t.current + dt * 0.42, 1)
    const e = easeInOutCubic(t.current)
    camera.position.lerpVectors(CAM_START_POS, CAM_END_POS, e)
    const look = new THREE.Vector3().lerpVectors(CAM_START_LOOK, CAM_END_LOOK, e)
    camera.lookAt(look)
    if (t.current >= 1 && !notified.current) {
      notified.current = true
      onZoomDone()
    }
  })

  return null
}

// ─── Post FX ──────────────────────────────────────────────────────────────────
const CA_OFFSET = new THREE.Vector2(0.0042, 0.0024)

function PostFX({ powered }: { powered: boolean }) {
  return (
    <EffectComposer>
      <Bloom
        intensity={powered ? 0.55 : 0.18}
        luminanceThreshold={0.52}
        luminanceSmoothing={0.38}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={CA_OFFSET}
        radialModulation={false}
        modulationOffset={0}
      />
      <Noise
        blendFunction={BlendFunction.ADD}
        opacity={0.065}
      />
      <Vignette eskil={false} offset={0.32} darkness={0.92} />
    </EffectComposer>
  )
}

// ─── Full scene ───────────────────────────────────────────────────────────────
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
      {/* Scene bg color */}
      <color attach="background" args={['#090709']} />

      {/* Atmospheric fog */}
      <fog attach="fog" args={['#0e0b0d', 12, 30]} />

      {/* ── Lighting ── */}
      {/* Ambient — near-zero, very cold */}
      <ambientLight color="#12111a" intensity={0.55} />

      {/* Key light — warm desk lamp, upper-right, casts shadows */}
      <spotLight
        castShadow
        position={[4.5, 7.5, 3.5]}
        intensity={5.5}
        angle={0.26}
        penumbra={0.52}
        color="#fff4d8"
        distance={22}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
      />

      {/* Cool window fill from left */}
      <directionalLight
        position={[-5, 3, 1]}
        intensity={0.38}
        color="#7a90cc"
      />

      {/* Rim from behind — separates computer from wall */}
      <pointLight
        position={[0, 4, -3.8]}
        intensity={1.1}
        color="#3a4a7a"
        distance={10}
      />

      {/* Under-desk subtle bounce */}
      <pointLight
        position={[0, -1.5, 2]}
        intensity={0.18}
        color="#3a2a18"
        distance={5}
      />

      {/* ── Scene objects ── */}
      <Desk />
      <Computer powered={powered} onPowerClick={handlePower} />
      <Keyboard />
      <Mouse />
      <CoffeeCup />
      <Notepad />
      <Pen />
      <Dust />

      {/* ── Camera ── */}
      <CameraRig animState={animState} onZoomDone={handleZoomDone} />

      {/* ── Post processing ── */}
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
        transition: on ? 'none' : 'opacity 0.45s ease-out',
        zIndex: 20,
      }}
    />
  )
}

// ─── Idle hint ────────────────────────────────────────────────────────────────
function IdleHint({ show }: { show: boolean }) {
  return (
    <div
      className="absolute bottom-7 left-1/2 -translate-x-1/2 pointer-events-none select-none"
      style={{
        opacity: show ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      <span
        className="font-ui text-[11px] tracking-[0.28em] uppercase"
        style={{
          color: '#555',
          animation: show ? 'idlePulse 3s ease-in-out infinite' : 'none',
        }}
      >
        Click the power button
      </span>
      <style>{`
        @keyframes idlePulse {
          0%,100% { opacity:.35 }
          50%      { opacity:.85 }
        }
      `}</style>
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function PowerOn() {
  const { setPhase } = useBootStore()
  const [animState, setAnimState] = useState<AnimState>('idle')
  const [flash, setFlash]         = useState(false)

  const handleFlash = useCallback(() => {
    initSounds()
    setFlash(true)
    setTimeout(() => {
      setFlash(false)
      setTimeout(() => setPhase('bios'), 220)
    }, 400)
  }, [setPhase])

  return (
    <div className="fixed inset-0 bg-black" style={{ zIndex: 9999 }}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: CAM_START_POS.toArray(),
          fov: 40,
          near: 0.1,
          far: 50,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Scene
          animState={animState}
          setAnimState={setAnimState}
          onFlash={handleFlash}
        />
      </Canvas>

      <FlashOverlay on={flash} />
      <IdleHint show={animState === 'idle'} />
    </div>
  )
}
