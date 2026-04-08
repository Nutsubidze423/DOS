'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useAchievementStore } from '@/store/achievementStore'

export function AchievementPopup() {
  const { pending, dismissPending } = useAchievementStore()

  return (
    <div style={{ position: 'fixed', bottom: 60, right: 8, zIndex: 9960, pointerEvents: 'none' }}>
      <AnimatePresence>
        {pending && (
          <motion.div
            key={pending.id}
            initial={{ opacity: 0, y: 40, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{ pointerEvents: 'auto' }}
          >
            <div style={{
              background: '#1a1400',
              border: '2px solid #c8a800',
              padding: '10px 30px 10px 12px',
              maxWidth: 260,
              display: 'flex', gap: 10, alignItems: 'flex-start',
              boxShadow: '0 0 24px rgba(200,168,0,0.35), 3px 3px 10px rgba(0,0,0,0.7)',
              position: 'relative',
            }}>
              <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{pending.icon}</div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#c8a800', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 3 }}>
                  Achievement Unlocked!
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#fff', fontWeight: 'bold', lineHeight: 1.3 }}>{pending.title}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#999', marginTop: 3, lineHeight: 1.4 }}>{pending.desc}</div>
              </div>
              <button
                onClick={dismissPending}
                style={{ position: 'absolute', top: 4, right: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#666', padding: 0, fontWeight: 'bold', lineHeight: 1 }}
              >×</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
