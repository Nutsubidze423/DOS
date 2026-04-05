'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProjectDetail } from './ProjectDetail'

interface Project {
  id: string
  name: string
  description: string
  stack: string[]
  liveUrl?: string
  githubUrl?: string
  icon: string
}

const PROJECTS: Project[] = [
  {
    id: 'project-1',
    name: 'project_one',
    description: 'Placeholder project — replace with your real project description.',
    stack: ['React', 'TypeScript', 'Tailwind'],
    liveUrl: '#',
    githubUrl: '#',
    icon: '📦',
  },
  {
    id: 'project-2',
    name: 'project_two',
    description: 'Placeholder project — replace with your real project description.',
    stack: ['Next.js', 'Framer Motion', 'Three.js'],
    liveUrl: '#',
    githubUrl: '#',
    icon: '🚀',
  },
  {
    id: 'project-3',
    name: 'project_three',
    description: 'Placeholder project — replace with your real project description.',
    stack: ['Angular', 'TypeScript', 'CSS'],
    liveUrl: '#',
    githubUrl: '#',
    icon: '⚡',
  },
]

export function Projects() {
  const [selected, setSelected] = useState<Project | null>(null)
  const [openProject, setOpenProject] = useState<Project | null>(null)

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar */}
      <div
        className="w-[140px] flex-shrink-0 bg-os-chrome p-2 font-ui text-[11px] text-black overflow-y-auto"
        style={{ borderRight: '2px solid var(--color-chrome-dark)' }}
      >
        <div className="font-bold mb-2 text-[10px] uppercase text-os-chrome-dark">Folders</div>
        {['Desktop', 'My Projects', 'Resume', 'Contact'].map((folder) => (
          <div
            key={folder}
            className={`flex items-center gap-1 px-1 py-[2px] cursor-pointer ${
              folder === 'My Projects' ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white'
            }`}
          >
            <span>📁</span> {folder}
          </div>
        ))}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Address bar */}
        <div
          className="flex items-center gap-2 px-2 py-1 bg-os-chrome font-ui text-[11px]"
          style={{ borderBottom: '1px solid var(--color-chrome-dark)' }}
        >
          <span className="text-black">Address:</span>
          <div
            className="flex-1 bg-white px-2 py-[1px] font-ui text-[11px] text-black"
            style={{ border: '1px solid var(--color-chrome-dark)' }}
          >
            C:\My Projects
          </div>
        </div>

        {/* Files grid */}
        <div className="flex-1 p-4 flex flex-wrap gap-4 content-start overflow-y-auto">
          {PROJECTS.map((project) => (
            <motion.button
              key={project.id}
              className="flex flex-col items-center gap-1 w-[80px] p-2 rounded text-center"
              style={{
                background: selected?.id === project.id ? 'rgba(0,0,128,0.3)' : 'transparent',
                border: selected?.id === project.id ? '1px dotted #000080' : '1px solid transparent',
              }}
              onClick={() => setSelected(project)}
              onDoubleClick={() => setOpenProject(project)}
              whileHover={{ filter: 'brightness(1.1)' }}
            >
              <span className="text-[36px]">{project.icon}</span>
              <span className="font-ui text-[10px] text-black leading-tight">{project.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Status bar */}
        <div
          className="px-2 py-[2px] font-ui text-[10px] text-black bg-os-chrome"
          style={{ borderTop: '1px solid var(--color-chrome-dark)' }}
        >
          {selected ? `1 object(s) selected — ${selected.name}` : `${PROJECTS.length} object(s)`}
        </div>
      </div>

      {/* Project detail modal */}
      <AnimatePresence>
        {openProject && (
          <ProjectDetail
            project={openProject}
            onClose={() => setOpenProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
