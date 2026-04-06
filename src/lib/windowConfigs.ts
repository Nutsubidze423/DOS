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
  'solitaire': {
    title: 'Solitaire',
    size: { width: 575, height: 525 },
    position: { x: 200, y: 80 },
  },
  'control-panel': {
    title: 'Control Panel',
    size: { width: 475, height: 475 },
    position: { x: 225, y: 100 },
  },
  'my-computer': {
    title: 'My Computer',
    size: { width: 575, height: 525 },
    position: { x: 175, y: 75 },
  },
  'music-player': {
    title: 'Spotify — Desktop Player',
    size: { width: 325, height: 475 },
    position: { x: 300, y: 100 },
  },
  'ask-me': {
    title: 'Ask About Demetre — AI Chat',
    size: { width: 475, height: 575 },
    position: { x: 150, y: 60 },
  },
  'minesweeper': {
    title: 'Minesweeper',
    size: { width: 320, height: 380 },
    position: { x: 250, y: 120 },
  },
  'paint': {
    title: 'Paint',
    size: { width: 750, height: 520 },
    position: { x: 80, y: 50 },
  },
  'defrag': {
    title: 'Disk Defragmenter',
    size: { width: 560, height: 440 },
    position: { x: 160, y: 80 },
  },
}
