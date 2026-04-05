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
  title: 'Demetre Nutsubidze — Portfolio',
  description: 'Front End Developer Portfolio',
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
