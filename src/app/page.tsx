'use client'

import { useBootStore } from '@/store/bootStore'
import { PowerOn } from '@/components/boot/PowerOn'
import { BootSequence } from '@/components/boot/BootSequence'
import { Desktop } from '@/components/desktop/Desktop'

// Scale the entire UI to 125% without clipping content.
// We shrink the container to 1/1.25 of the viewport so that after the
// scale transform it exactly fills the screen (80% × 1.25 = 100%).
const SCALE = 1.25
const INV = (100 / SCALE).toFixed(4) // ≈ 80vw / 80vh

export default function Home() {
  const { phase } = useBootStore()

  return (
    <div
      style={{
        transform: `scale(${SCALE})`,
        transformOrigin: 'top left',
        width: `${INV}vw`,
        height: `${INV}vh`,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      {phase === 'off' && <PowerOn />}
      {phase !== 'off' && phase !== 'done' && <BootSequence />}
      {phase === 'done' && <Desktop />}
    </div>
  )
}
