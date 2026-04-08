'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from '@/store/toastStore'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div style={{ position: 'fixed', bottom: 60, right: 8, zIndex: 9950, display: 'flex', flexDirection: 'column-reverse', gap: 4, alignItems: 'flex-end', pointerEvents: 'none' }}>
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            style={{ pointerEvents: 'auto' }}
          >
            <div style={{
              background: 'var(--color-chrome)',
              border: '2px solid',
              borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
              padding: '6px 26px 6px 10px',
              maxWidth: 260,
              fontFamily: 'monospace',
              fontSize: 11,
              boxShadow: '3px 3px 8px rgba(0,0,0,0.45)',
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 6,
            }}>
              <span style={{ fontSize: 13, flexShrink: 0, lineHeight: 1.3 }}>
                {t.type === 'success' ? '✔' : t.type === 'warning' ? '⚠' : 'ℹ'}
              </span>
              <span style={{ lineHeight: 1.5 }}>{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{ position: 'absolute', top: 2, right: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#555', padding: 0, lineHeight: 1, fontWeight: 'bold' }}
              >×</button>
              <div style={{ position: 'absolute', bottom: -8, right: 16, width: 0, height: 0, borderLeft: '8px solid transparent', borderTop: '8px solid var(--color-bevel-dark)' }} />
              <div style={{ position: 'absolute', bottom: -5, right: 18, width: 0, height: 0, borderLeft: '6px solid transparent', borderTop: '6px solid var(--color-chrome)' }} />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
