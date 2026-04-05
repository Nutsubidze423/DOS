'use client'

import { motion } from 'framer-motion'

interface Project {
  id: string
  name: string
  description: string
  stack: string[]
  liveUrl?: string
  githubUrl?: string
  icon: string
}

interface ProjectDetailProps {
  project: Project
  onClose: () => void
}

export function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  return (
    <motion.div
      className="absolute inset-4 bg-white z-50 flex flex-col"
      style={{
        border: '2px solid',
        borderColor: 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
        boxShadow: '4px 4px 12px rgba(0,0,0,0.5)',
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between h-[26px] px-2"
        style={{ background: 'linear-gradient(90deg, #000080, #1084d0)' }}
      >
        <span className="font-ui text-white text-[11px] font-bold">{project.name} — Properties</span>
        <button
          className="w-[18px] h-[16px] bg-os-chrome bevel-raised text-[10px] font-bold text-black flex items-center justify-center"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto font-ui text-[12px] text-black space-y-3">
        <div className="text-[32px] text-center">{project.icon}</div>
        <div>
          <div className="font-bold text-[13px]">{project.name}</div>
          <div className="text-os-chrome-dark mt-1">{project.description}</div>
        </div>
        <div>
          <div className="font-bold mb-1">Tech Stack:</div>
          <div className="flex flex-wrap gap-1">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-[1px] font-ui text-[10px] bg-os-chrome"
                style={{ border: '1px solid var(--color-chrome-dark)' }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-os-chrome bevel-raised font-ui text-[11px] text-black hover:bg-os-chrome-light no-underline"
            >
              🌐 Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-os-chrome bevel-raised font-ui text-[11px] text-black hover:bg-os-chrome-light no-underline"
            >
              📂 GitHub
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
