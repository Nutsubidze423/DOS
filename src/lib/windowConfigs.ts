import { AppId, WindowState } from '@/types'

type WindowDefaults = Pick<WindowState, 'title' | 'size' | 'position'>

// NOTE: position values are cascade offsets for initial placement.
// The window manager should center windows on first open for small viewports.
// These are overridden once the user drags a window.
export const WINDOW_CONFIGS: Record<AppId, WindowDefaults> = {
  'about-me': {
    title: 'About Me — Notepad',
    size: { width: 480, height: 380 },
    position: { x: 80, y: 60 },
  },
  'projects': {
    title: 'My Projects — Explorer',
    size: { width: 640, height: 480 },
    position: { x: 100, y: 50 },
  },
  'skills': {
    title: 'Skills.exe — Task Manager',
    size: { width: 500, height: 440 },
    position: { x: 120, y: 70 },
  },
  'terminal': {
    title: 'Terminal — demetre@portfolioos',
    size: { width: 580, height: 420 },
    position: { x: 90, y: 55 },
  },
  'resume': {
    title: 'Resume.pdf — PDF Viewer',
    size: { width: 620, height: 520 },
    position: { x: 110, y: 45 },
  },
  'contact': {
    title: 'New Message — Outlook Express',
    size: { width: 500, height: 420 },
    position: { x: 130, y: 65 },
  },
  'recycle-bin': {
    title: 'Recycle Bin',
    size: { width: 460, height: 380 },
    position: { x: 150, y: 80 },
  },
}
