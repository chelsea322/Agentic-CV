import type { Metadata } from 'next'
import { Geist_Mono, Instrument_Serif, Inter_Tight } from 'next/font/google'
import './global.css'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const sans = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-sans',
})

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Chelsea Kelling — Agentic CV',
  description: 'Interactive AI Persona & Executive Brief',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
