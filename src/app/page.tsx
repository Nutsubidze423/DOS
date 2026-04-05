'use client'

import { useBootStore } from '@/store/bootStore'
import { BootSequence } from '@/components/boot/BootSequence'
import { Desktop } from '@/components/desktop/Desktop'

export default function Home() {
  const { phase } = useBootStore()

  return (
    <main className="w-screen h-screen overflow-hidden">
      {phase !== 'done' && <BootSequence />}
      {phase === 'done' && <Desktop />}
    </main>
  )
}
