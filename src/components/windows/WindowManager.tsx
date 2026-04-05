'use client'

import { useWindowStore } from '@/store/windowStore'
import { Window } from './Window'

export function WindowManager() {
  const { windows } = useWindowStore()

  return (
    <>
      {Object.keys(windows).map((id) => (
        <Window key={id} id={id} />
      ))}
    </>
  )
}
