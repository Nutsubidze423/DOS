'use client'

import { useState } from 'react'

export function Resume() {
  const [zoom, setZoom] = useState(100)
  const [page, setPage] = useState(1)
  const totalPages = 1

  return (
    <div className="flex flex-col h-full bg-os-chrome">
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-2 py-1 flex-wrap"
        style={{ borderBottom: '2px solid var(--color-chrome-dark)' }}
      >
        {[
          { label: '🖨 Print', onClick: () => window.print() },
          { label: '🔍+', onClick: () => setZoom((z) => Math.min(z + 25, 200)) },
          { label: '🔍-', onClick: () => setZoom((z) => Math.max(z - 25, 50)) },
        ].map((btn) => (
          <button
            key={btn.label}
            className="px-2 py-[2px] bg-os-chrome bevel-raised font-ui text-[11px] text-black hover:bg-os-chrome-light"
            onClick={btn.onClick}
          >
            {btn.label}
          </button>
        ))}
        <div className="w-px h-4 bg-os-chrome-dark mx-1" />
        <button
          className="px-2 py-[2px] bg-os-chrome bevel-raised font-ui text-[11px] text-black hover:bg-os-chrome-light disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          ◀
        </button>
        <span className="font-ui text-[11px] text-black">
          Page {page} of {totalPages}
        </span>
        <button
          className="px-2 py-[2px] bg-os-chrome bevel-raised font-ui text-[11px] text-black hover:bg-os-chrome-light disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          ▶
        </button>
        <div className="w-px h-4 bg-os-chrome-dark mx-1" />
        <a
          href="/resume-placeholder.pdf"
          download="Demetre_Nutsubidze_Resume.pdf"
          className="px-2 py-[2px] bg-os-chrome bevel-raised font-ui text-[11px] text-black hover:bg-os-chrome-light no-underline"
        >
          💾 Download
        </a>
        <span className="font-ui text-[11px] text-os-chrome-dark ml-2">
          Zoom: {zoom}%
        </span>
      </div>

      {/* PDF content area */}
      <div className="flex-1 overflow-auto bg-[#808080] p-4 flex justify-center">
        <div
          className="bg-white shadow-xl p-8 font-ui text-[12px] text-black"
          style={{
            width: `${(612 * zoom) / 100}px`,
            minHeight: `${(792 * zoom) / 100}px`,
          }}
        >
          {/* Placeholder resume content */}
          <div className="text-center mb-6">
            <div className="text-[22px] font-bold">DEMETRE NUTSUBIDZE</div>
            <div className="text-[13px] text-gray-600">Front End Developer</div>
            <div className="text-[11px] text-gray-500 mt-1">
              demetrenutsubidze423@gmail.com
            </div>
          </div>

          <hr className="border-black mb-4" />

          <div className="mb-4">
            <div className="font-bold text-[13px] border-b border-black pb-1 mb-2">SKILLS</div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <div>• React / Next.js / Angular</div>
              <div>• TypeScript / JavaScript</div>
              <div>• Framer Motion / Three.js</div>
              <div>• HTML / CSS / Tailwind</div>
              <div>• Git</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="font-bold text-[13px] border-b border-black pb-1 mb-2">EXPERIENCE</div>
            <div className="text-[11px] text-gray-500 italic">
              Replace this placeholder with your real experience.
            </div>
          </div>

          <div className="mb-4">
            <div className="font-bold text-[13px] border-b border-black pb-1 mb-2">EDUCATION</div>
            <div className="text-[11px] text-gray-500 italic">
              Replace this placeholder with your real education.
            </div>
          </div>

          <div className="text-center text-[9px] text-gray-300 mt-8">
            [ Replace this entire section with your real resume content ]
          </div>
        </div>
      </div>
    </div>
  )
}
