'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBootStore } from '@/store/bootStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSoundEffect } from '@/hooks/useSoundEffect'
import { BiosScreen } from './BiosScreen'
import { Win98ProgressBar } from './Win98ProgressBar'
import { Win98Logo } from './Win98Logo'

export function BootSequence() {
  const { phase, setPhase, skip } = useBootStore()
  const reducedMotion = useReducedMotion()
  const { play } = useSoundEffect()

  useEffect(() => {
    if (reducedMotion) skip()
  }, [reducedMotion, skip])

  useEffect(() => {
    setPhase('bios')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBiosComplete = useCallback(() => setPhase('progress'), [setPhase])
  const handleProgressComplete = useCallback(() => setPhase('logo'), [setPhase])
  const handleLogoComplete = useCallback(() => {
    play('startup')
    setPhase('done')
  }, [setPhase, play])

  if (phase === 'done') return null

  return (
    <motion.div
      className="fixed inset-0 bg-black z-[10000] cursor-pointer"
      onClick={skip}
      title="Click to skip"
    >
      <AnimatePresence mode="wait">
        {phase === 'bios' && (
          <motion.div key="bios" className="w-full h-full" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <BiosScreen onComplete={handleBiosComplete} />
          </motion.div>
        )}
        {phase === 'progress' && (
          <motion.div key="progress" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Win98ProgressBar onComplete={handleProgressComplete} />
          </motion.div>
        )}
        {phase === 'logo' && (
          <motion.div key="logo" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Win98Logo onComplete={handleLogoComplete} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-4 right-4 font-ui text-[#333] text-xs select-none">
        Click anywhere to skip
      </div>
    </motion.div>
  )
}
