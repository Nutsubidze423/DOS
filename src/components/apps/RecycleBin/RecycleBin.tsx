'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TrashItem {
  id: string
  name: string
  date: string
  size: string
  joke: string
}

const TRASH: TrashItem[] = [
  {
    id: '1',
    name: 'my_first_css_ever.html',
    date: '2019-03-14',
    size: '2 KB',
    joke: 'Contained 47 nested <center> tags and inline styles on every element.',
  },
  {
    id: '2',
    name: 'job_application_rejected_x47.zip',
    date: '2023-01-01',
    size: '124 KB',
    joke: '"We are looking for someone with 15 years of React experience." React was 11 years old.',
  },
  {
    id: '3',
    name: 'var_i_is_fine.js',
    date: '2020-07-22',
    size: '8 KB',
    joke: '500 lines of JavaScript. Every variable named i, j, k, x, or temp.',
  },
  {
    id: '4',
    name: 'TODO_fix_later.txt',
    date: '2021-11-30',
    size: '1 KB',
    joke: '"Later" was 3 years ago. The bug is still there. It shipped.',
  },
  {
    id: '5',
    name: 'self_doubt_june_2024.docx',
    date: '2024-06-15',
    size: '34 KB',
    joke: 'Deleted after shipping a feature that made 10,000 users happy.',
  },
]

export function RecycleBin() {
  const [selected, setSelected] = useState<string | null>(null)
  const [restored, setRestored] = useState<string[]>([])

  const items = TRASH.filter((t) => !restored.includes(t.id))

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-2 py-1 bg-os-chrome"
        style={{ borderBottom: '2px solid var(--color-chrome-dark)' }}
      >
        <button
          className="px-2 py-[2px] bg-os-chrome bevel-raised font-ui text-[11px] text-black disabled:opacity-40"
          disabled={!selected}
          onClick={() => selected && setRestored((r) => [...r, selected])}
          title="Some things are better left deleted"
        >
          ↩ Restore
        </button>
        <button
          className="px-2 py-[2px] bg-os-chrome bevel-raised font-ui text-[11px] text-black"
          onClick={() => setRestored(TRASH.map((t) => t.id))}
        >
          🗑 Empty Recycle Bin
        </button>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
          className="grid font-ui text-[11px] font-bold text-black px-2 py-1 bg-os-chrome sticky top-0"
          style={{
            gridTemplateColumns: '200px 100px 80px',
            borderBottom: '1px solid var(--color-chrome-dark)',
          }}
        >
          <span>Name</span>
          <span>Date Deleted</span>
          <span>Size</span>
        </div>

        <AnimatePresence>
          {items.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center h-32 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-[36px]">✨</span>
              <span className="font-ui text-[12px] text-os-chrome-dark">
                Recycle Bin is empty. New chapter.
              </span>
            </motion.div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div
                  className="grid px-2 py-[3px] cursor-pointer font-ui text-[11px]"
                  style={{
                    gridTemplateColumns: '200px 100px 80px',
                    background: selected === item.id ? '#000080' : 'transparent',
                    color: selected === item.id ? 'white' : 'black',
                  }}
                  onClick={() => setSelected(selected === item.id ? null : item.id)}
                >
                  <span className="truncate">🗑 {item.name}</span>
                  <span>{item.date}</span>
                  <span>{item.size}</span>
                </div>
                {selected === item.id && (
                  <motion.div
                    className="px-4 py-2 bg-yellow-50 font-ui text-[11px] text-black italic"
                    style={{ borderBottom: '1px solid #e0e0a0' }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    💬 {item.joke}
                    <div className="mt-1 not-italic text-os-chrome-dark text-[10px]">
                      [Restore] tooltip: &quot;Some things are better left deleted&quot;
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div
        className="px-2 py-[2px] font-ui text-[10px] text-black bg-os-chrome"
        style={{ borderTop: '1px solid var(--color-chrome-dark)' }}
      >
        {items.length} item(s) — {items.length > 0 ? 'Demetre keeps it real' : 'Fresh start 🌱'}
      </div>
    </div>
  )
}
