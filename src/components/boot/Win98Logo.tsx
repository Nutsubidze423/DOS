'use client'

import { motion } from 'framer-motion'

export function Win98Logo({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      className="w-full h-full bg-black flex flex-col items-center justify-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
    >
      <div className="grid grid-cols-2 gap-[3px] w-[72px] h-[72px]">
        <div className="bg-red-600 rounded-tl-[3px]" />
        <div className="bg-green-600 rounded-tr-[3px]" />
        <div className="bg-blue-700 rounded-bl-[3px]" />
        <div className="bg-yellow-400 rounded-br-[3px]" />
      </div>
      <div className="font-terminal text-white text-5xl tracking-[0.3em]">
        Windows<span className="text-[#00ff88]">98</span>
      </div>
      <motion.div
        className="font-ui text-[#808080] text-sm tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        portfolio edition
      </motion.div>
    </motion.div>
  )
}
