'use client'

import { useBootStore } from '@/store/bootStore'
import { PowerOn } from '@/components/boot/PowerOn'
import { BootSequence } from '@/components/boot/BootSequence'
import { Desktop } from '@/components/desktop/Desktop'
import { MobileGate } from '@/components/MobileGate'

export default function Home() {
  const { phase } = useBootStore()

  return (
    <MobileGate>
      <main className="fixed inset-0 overflow-hidden">
        {phase === 'off' && <PowerOn />}
        {phase !== 'off' && phase !== 'done' && <BootSequence />}
        {phase === 'done' && <Desktop />}
      </main>
    </MobileGate>
  )
}
