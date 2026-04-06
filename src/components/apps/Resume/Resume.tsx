'use client'

import { useState } from 'react'

export function Resume() {
  const [zoom, setZoom] = useState(100)

  return (
    <div className="flex flex-col h-full bg-os-chrome">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-2 py-1 flex-wrap" style={{ borderBottom: '2px solid var(--color-chrome-dark)' }}>
        {[
          { label: '🖨 Print', onClick: () => window.print() },
          { label: '🔍+', onClick: () => setZoom(z => Math.min(z + 25, 200)) },
          { label: '🔍-', onClick: () => setZoom(z => Math.max(z - 25, 50)) },
        ].map(btn => (
          <button key={btn.label} className="px-2 py-[2px] bg-os-chrome bevel-raised font-ui text-[11px] text-black hover:bg-os-chrome-light" onClick={btn.onClick}>
            {btn.label}
          </button>
        ))}
        <span className="font-ui text-[11px] text-os-chrome-dark ml-2">Zoom: {zoom}%</span>
      </div>

      {/* PDF content area */}
      <div className="flex-1 overflow-auto bg-[#808080] p-4 flex justify-center">
        <div
          className="bg-white shadow-xl p-8 font-ui text-[12px] text-black"
          style={{ width: `${(612 * zoom) / 100}px`, minHeight: `${(792 * zoom) / 100}px` }}
        >
          {/* Header */}
          <div className="text-center mb-5">
            <div className="text-[24px] font-bold tracking-wide">DEMETRE NUTSUBIDZE</div>
            <div className="text-[13px] text-gray-600 mt-1">Front End Developer</div>
            <div className="text-[11px] text-gray-500 mt-1">
              demetrenutsubidze423@gmail.com &nbsp;·&nbsp; Tbilisi, Georgia &nbsp;·&nbsp;
              <a href="https://github.com/Nutsubidze423" target="_blank" rel="noopener noreferrer" className="text-blue-600">github.com/Nutsubidze423</a>
              &nbsp;·&nbsp;
              <a href="https://dos-snowy.vercel.app" target="_blank" rel="noopener noreferrer" className="text-blue-600">Portfolio</a>
            </div>
          </div>

          <hr className="border-black mb-4" />

          {/* Summary */}
          <div className="mb-4">
            <div className="font-bold text-[13px] border-b border-black pb-1 mb-2">SUMMARY</div>
            <div className="text-[11px] leading-relaxed">
              Front End Developer with a strong foundation in React, Next.js, Angular, and TypeScript. Passionate about building interfaces that are not just functional, but genuinely memorable. Creator of PortfolioOS — a full Windows 98-style OS simulation in the browser featuring AI chat, real-time multiplayer, and a suite of interactive apps.
            </div>
          </div>

          {/* Experience */}
          <div className="mb-4">
            <div className="font-bold text-[13px] border-b border-black pb-1 mb-2">EXPERIENCE</div>
            <div className="mb-3">
              <div className="flex justify-between items-baseline">
                <div className="font-bold text-[12px]">IT Support Specialist</div>
                <div className="text-[10px] text-gray-500">Feb 2026 – Present</div>
              </div>
              <div className="text-[11px] text-gray-700 mb-1">TeraBank · Tbilisi, Georgia</div>
              <ul className="text-[11px] list-disc list-inside space-y-[2px] text-gray-800">
                <li>Provide technical support and troubleshooting for banking systems and staff</li>
                <li>Diagnose and resolve hardware, software, and network issues across the organization</li>
                <li>Support day-to-day IT operations in a fast-paced financial environment</li>
              </ul>
            </div>
          </div>

          {/* Projects */}
          <div className="mb-4">
            <div className="font-bold text-[13px] border-b border-black pb-1 mb-2">PROJECTS</div>
            {[
              {
                name: 'PortfolioOS',
                url: 'dos-snowy.vercel.app',
                stack: 'Next.js 14 · TypeScript · Tailwind · Framer Motion · Zustand · Gemini AI · Pusher',
                desc: 'Windows 98-style OS simulation in the browser. Drag/resize windows, boot sequence, Minesweeper, Solitaire, MS Paint, Defrag, AI chat, real-time multiplayer cursors.',
              },
              {
                name: 'Dn.Com',
                url: 'nutsubidze423.github.io/Dn.Com',
                stack: 'React 19 · Vite · Framer Motion · Tailwind CSS',
                desc: 'Minimalist personal portfolio with magnetic animated cursor, scroll-reveal animations, and fully responsive layout.',
              },
              {
                name: 'Redseem Clothing',
                url: 'voluble-douhua-67fd8e.netlify.app',
                stack: 'HTML · CSS · JavaScript',
                desc: 'Multi-page e-commerce shop with product listings, shopping cart, and checkout — built in vanilla JS.',
              },
              {
                name: 'Space Tourism',
                url: 'spacetourism-gules.vercel.app',
                stack: 'Angular 21 · TypeScript · Vitest',
                desc: 'Concept space tourism site with destinations, crew, and technology sections. Rich visuals with Angular routing.',
              },
            ].map(p => (
              <div key={p.name} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[11px]">{p.name}</span>
                  <a href={`https://${p.url}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600">{p.url}</a>
                </div>
                <div className="text-[10px] text-gray-500 mb-[2px]">{p.stack}</div>
                <div className="text-[11px]">{p.desc}</div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="mb-4">
            <div className="font-bold text-[13px] border-b border-black pb-1 mb-2">SKILLS</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-[2px] text-[11px]">
              <div>• React / Next.js / Angular</div>
              <div>• TypeScript / JavaScript</div>
              <div>• Tailwind CSS / HTML / CSS</div>
              <div>• Framer Motion / Three.js</div>
              <div>• Zustand / State Management</div>
              <div>• REST APIs / Gemini AI</div>
              <div>• Git / VS Code / npm</div>
              <div>• Canvas API / Web Audio API</div>
            </div>
          </div>

          {/* Education */}
          <div className="mb-4">
            <div className="font-bold text-[13px] border-b border-black pb-1 mb-2">EDUCATION</div>
            {[
              {
                school: 'Information Technology Academy ITVET',
                degree: 'Diploma — Web Technologies / Front-End Developer',
                dates: 'Nov 2024 – Dec 2025',
                detail: 'HTML, CSS, Bootstrap, JavaScript, Angular, WordPress/PHP. Practical focus on building responsive, modern web interfaces.',
              },
              {
                school: 'Information Technology Academy ITVET',
                degree: 'Diploma — Information Technology  (Grade: A)',
                dates: 'Nov 2023 – Nov 2024',
                detail: 'Computer systems, networking, programming fundamentals, cybersecurity, database management, IT support. Certifications: IT Essentials – CISCO.',
              },
              {
                school: '186 Public School',
                degree: 'High School Diploma',
                dates: 'Sep 2012 – Jun 2024',
                detail: '',
              },
            ].map(e => (
              <div key={e.school + e.degree} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[11px]">{e.school}</span>
                  <span className="text-[10px] text-gray-500">{e.dates}</span>
                </div>
                <div className="text-[11px] text-gray-700">{e.degree}</div>
                {e.detail && <div className="text-[10px] text-gray-500 mt-[2px]">{e.detail}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
