export type AppId =
  | 'about-me'
  | 'projects'
  | 'skills'
  | 'terminal'
  | 'resume'
  | 'contact'
  | 'recycle-bin'
  | 'browser'
  | 'solitaire'
  | 'control-panel'
  | 'my-computer'
  | 'music-player'
  | 'ask-me'
  | 'minesweeper'
  | 'paint'
  | 'defrag'
  | 'calculator'
  | 'notepad'
  | 'guestbook'

export interface WindowState {
  id: string
  appId: AppId
  title: string
  isMinimized: boolean
  isMaximized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  isMounted: boolean
}

export interface DesktopIconConfig {
  appId: AppId
  label: string
  icon: string
}

export type BootPhase =
  | 'off'
  | 'idle'
  | 'bios'
  | 'progress'
  | 'logo'
  | 'done'
