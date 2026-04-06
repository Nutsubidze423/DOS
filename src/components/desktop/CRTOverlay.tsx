'use client'

import { useDesktopStore } from '@/store/desktopStore'

export function CRTOverlay() {
  const { crtEnabled } = useDesktopStore()
  if (!crtEnabled) return null
  return (
    <>
      <div className="crt-scanlines" aria-hidden="true" />
      <div className="crt-vignette" aria-hidden="true" />
    </>
  )
}
