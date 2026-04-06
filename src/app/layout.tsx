import type { Metadata } from 'next'
import { VT323, Share_Tech_Mono } from 'next/font/google'
import './globals.css'

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-share-tech-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Demetre Nutsubidze — Front End Developer',
  description: 'Front End Developer from Tbilisi. React, Next.js, TypeScript, Angular. Portfolio built as a Windows 98 OS simulation — open apps, play games, chat with AI.',
  openGraph: {
    title: 'Demetre Nutsubidze — PortfolioOS',
    description: 'A Windows 98-style OS portfolio. Open real apps, play Minesweeper, chat with AI, see live visitor cursors.',
    url: 'https://dos-snowy.vercel.app',
    siteName: 'PortfolioOS',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Demetre Nutsubidze — PortfolioOS',
    description: 'A Windows 98-style OS portfolio. Open real apps, play Minesweeper, chat with AI, see live visitor cursors.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${vt323.variable} ${shareTechMono.variable}`}>
      <body className="overflow-hidden bg-[#0a0a0f]">{children}</body>
    </html>
  )
}
