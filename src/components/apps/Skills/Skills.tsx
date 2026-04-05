'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type Category = 'Frontend' | 'Tools' | 'Languages'

interface Skill {
  name: string
  level: number
  pid: number
  memory: string
}

const SKILLS: Record<Category, Skill[]> = {
  Frontend: [
    { name: 'React', level: 90, pid: 1024, memory: '892 K' },
    { name: 'Angular', level: 80, pid: 1031, memory: '743 K' },
    { name: 'Next.js', level: 88, pid: 1042, memory: '921 K' },
    { name: 'Framer Motion', level: 85, pid: 1055, memory: '412 K' },
    { name: 'Three.js', level: 72, pid: 1063, memory: '1,204 K' },
    { name: 'Tailwind CSS', level: 92, pid: 1071, memory: '124 K' },
  ],
  Tools: [
    { name: 'Git', level: 85, pid: 2011, memory: '88 K' },
    { name: 'VS Code', level: 95, pid: 2024, memory: '2,048 K' },
    { name: 'npm', level: 88, pid: 2037, memory: '312 K' },
  ],
  Languages: [
    { name: 'TypeScript', level: 88, pid: 3001, memory: '612 K' },
    { name: 'JavaScript', level: 92, pid: 3012, memory: '548 K' },
    { name: 'HTML', level: 95, pid: 3023, memory: '64 K' },
    { name: 'CSS', level: 90, pid: 3034, memory: '128 K' },
  ],
}

export function Skills() {
  const [activeTab, setActiveTab] = useState<Category>('Frontend')
  const [animated, setAnimated] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  const skills = SKILLS[activeTab]

  return (
    <div className="flex flex-col h-full bg-os-chrome">
      {/* Tabs */}
      <div className="flex gap-0 px-2 pt-2">
        {(['Frontend', 'Tools', 'Languages'] as Category[]).map((tab) => (
          <button
            key={tab}
            className="px-4 py-[3px] font-ui text-[11px] text-black relative"
            style={{
              background: activeTab === tab ? 'var(--color-chrome-light)' : 'var(--color-chrome)',
              border: '2px solid',
              borderColor: activeTab === tab
                ? 'var(--color-bevel-light) var(--color-chrome) var(--color-chrome-light) var(--color-bevel-light)'
                : 'var(--color-bevel-light) var(--color-bevel-dark) var(--color-bevel-dark) var(--color-bevel-light)',
              marginBottom: activeTab === tab ? '-2px' : '0',
              zIndex: activeTab === tab ? 1 : 0,
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        className="flex-1 flex flex-col overflow-hidden bg-white m-2 mt-0 p-2"
        style={{
          border: '2px solid',
          borderColor: 'var(--color-bevel-dark) var(--color-bevel-light) var(--color-bevel-light) var(--color-bevel-dark)',
        }}
      >
        {/* Column headers */}
        <div
          className="grid font-ui text-[11px] text-black font-bold mb-1 pb-1"
          style={{
            gridTemplateColumns: '140px 1fr 60px 70px',
            borderBottom: '1px solid var(--color-chrome-dark)',
          }}
        >
          <span>Process Name</span>
          <span>CPU Usage</span>
          <span className="text-right">PID</span>
          <span className="text-right">Mem Usage</span>
        </div>

        {/* Skill rows */}
        <div className="flex-1 overflow-y-auto space-y-[3px]">
          {skills.map((skill, i) => (
            <motion.div
              key={skill.name}
              className="grid items-center font-ui text-[11px] text-black py-[2px] hover:bg-[#000080] hover:text-white group"
              style={{ gridTemplateColumns: '140px 1fr 60px 70px' }}
              initial={false}
            >
              <span className="truncate">{skill.name}.exe</span>
              <div className="flex items-center gap-2 pr-4">
                <div
                  className="flex-1 h-[10px] bg-os-chrome relative overflow-hidden"
                  style={{ border: '1px solid var(--color-chrome-dark)' }}
                >
                  <motion.div
                    className="h-full bg-[#000080] group-hover:bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: animated || reducedMotion ? `${skill.level}%` : 0 }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 80, damping: 20, delay: i * 0.06 }
                    }
                  />
                </div>
                <span className="w-[28px] text-right">{skill.level}%</span>
              </div>
              <span className="text-right">{skill.pid}</span>
              <span className="text-right">{skill.memory}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="px-3 pb-2 font-ui text-[10px] text-black">
        CPU Usage: 94% — because I actually know what I&apos;m doing
      </div>
    </div>
  )
}
