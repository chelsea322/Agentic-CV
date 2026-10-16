import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Manrope } from 'next/font/google'
import './global.css'

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Chelsea Kelling · Agentic CV',
  description: 'Chat with an AI version of Chelsea Kelling, Senior Product Designer, or browse her CV.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b0a1c' },
    { media: '(prefers-color-scheme: light)', color: '#f5f1fb' },
  ],
}

// Runs before first paint so the saved (or system) theme never flashes.
const THEME_SCRIPT = `try{var t=localStorage.getItem('cv-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
