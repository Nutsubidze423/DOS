import { AppId, WindowState } from '@/types'

type WindowDefaults = Pick<WindowState, 'title' | 'size' | 'position'>

export const WINDOW_CONFIGS: Record<AppId, WindowDefaults> = {
  'about-me': {
    title: 'About Me — Notepad',
    size: { width: 600, height: 475 },
    position: { x: 100, y: 75 },
  },
  'projects': {
    title: 'My Projects — Explorer',
    size: { width: 800, height: 600 },
    position: { x: 125, y: 63 },
  },
  'skills': {
    title: 'Skills.exe — Task Manager',
    size: { width: 625, height: 550 },
    position: { x: 150, y: 88 },
  },
  'terminal': {
    title: 'Terminal — demetre@portfolioos',
    size: { width: 725, height: 525 },
    position: { x: 113, y: 69 },
  },
  'resume': {
    title: 'Resume.pdf — PDF Viewer',
    size: { width: 775, height: 650 },
    position: { x: 138, y: 56 },
  },
  'contact': {
    title: 'New Message — Outlook Express',
    size: { width: 625, height: 525 },
    position: { x: 163, y: 81 },
  },
  'recycle-bin': {
    title: 'Recycle Bin',
    size: { width: 575, height: 475 },
    position: { x: 188, y: 100 },
  },
  'browser': {
    title: 'Internet Explorer',
    size: { width: 975, height: 675 },
    position: { x: 75, y: 50 },
  },
}
