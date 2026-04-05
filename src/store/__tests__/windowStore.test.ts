import { act, renderHook } from '@testing-library/react'
import { useWindowStore } from '../windowStore'

// Reset store between tests
beforeEach(() => {
  useWindowStore.setState({ windows: {}, zCounter: 10 })
})

describe('windowStore', () => {
  it('opens a window and mounts it', () => {
    const { result } = renderHook(() => useWindowStore())
    act(() => result.current.openWindow('terminal'))
    const windows = Object.values(result.current.windows)
    expect(windows).toHaveLength(1)
    expect(windows[0].appId).toBe('terminal')
    expect(windows[0].isMounted).toBe(true)
    expect(windows[0].isMinimized).toBe(false)
  })

  it('focuses existing window instead of opening duplicate', () => {
    const { result } = renderHook(() => useWindowStore())
    act(() => result.current.openWindow('terminal'))
    const firstId = Object.keys(result.current.windows)[0]
    const firstZIndex = result.current.windows[firstId].zIndex
    act(() => result.current.openWindow('terminal'))
    expect(Object.keys(result.current.windows)).toHaveLength(1)
    expect(result.current.windows[firstId].zIndex).toBeGreaterThan(firstZIndex)
  })

  it('minimizes and restores a window', () => {
    const { result } = renderHook(() => useWindowStore())
    act(() => result.current.openWindow('terminal'))
    const id = Object.keys(result.current.windows)[0]
    act(() => result.current.minimizeWindow(id))
    expect(result.current.windows[id].isMinimized).toBe(true)
    act(() => result.current.restoreWindow(id))
    expect(result.current.windows[id].isMinimized).toBe(false)
  })

  it('closes a window and removes it from state', () => {
    const { result } = renderHook(() => useWindowStore())
    act(() => result.current.openWindow('terminal'))
    const id = Object.keys(result.current.windows)[0]
    act(() => result.current.closeWindow(id))
    expect(result.current.windows[id]).toBeUndefined()
  })

  it('assigns higher z-index to focused window', () => {
    const { result } = renderHook(() => useWindowStore())
    act(() => result.current.openWindow('terminal'))
    act(() => result.current.openWindow('about-me'))
    const ids = Object.keys(result.current.windows)
    const z0 = result.current.windows[ids[0]].zIndex
    act(() => result.current.focusWindow(ids[0]))
    expect(result.current.windows[ids[0]].zIndex).toBeGreaterThan(z0)
  })

  it('restores a minimized window when openWindow is called again', () => {
    const { result } = renderHook(() => useWindowStore())
    act(() => result.current.openWindow('terminal'))
    const id = Object.keys(result.current.windows)[0]
    act(() => result.current.minimizeWindow(id))
    expect(result.current.windows[id].isMinimized).toBe(true)
    // Calling openWindow again should restore, not create a duplicate
    act(() => result.current.openWindow('terminal'))
    expect(Object.keys(result.current.windows)).toHaveLength(1)
    expect(result.current.windows[id].isMinimized).toBe(false)
  })
})
