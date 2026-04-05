'use client'

import { useBootStore } from '@/store/bootStore'
import { BootSequence } from '@/components/boot/BootSequence'

export default function Home() {
  const { phase } = useBootStore()

  return (
    <main className="w-screen h-screen overflow-hidden">
      {phase !== 'done' && <BootSequence />}
      {phase === 'done' && (
        <div className="w-full h-full flex items-center justify-center font-terminal text-os-phosphor text-2xl">
          Desktop loading...
        </div>
      )}
    </main>
  )
}
