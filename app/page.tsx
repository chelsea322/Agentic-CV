'use client'

import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useChat } from '@ai-sdk/react'
import AuroraBackground from './components/AuroraBackground'
import CvView from './components/CvView'

const PROMPT_SUGGESTIONS = [
  'How did you transform UX culture at Miradore?',
  'What is your AI prototyping workflow?',
  'How do you handle design tokens and code?',
  'What is your background in research and systems?',
  'Where are you still growing for a role like this?',
]

type Mode = 'agent' | 'cv'
type Theme = 'dark' | 'light'

// Storage can throw (private windows, blocked cookies): never let it break the page.
const readStorage = (key: string) => {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}
const writeStorage = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value)
  } catch {}
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function HybridCVPage() {
  const { messages, input, handleInputChange, handleSubmit, append, status, error } = useChat()
  const [mode, setMode] = useState<Mode>('agent')
  const [modeReady, setModeReady] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [sent, setSent] = useState(false)
  const stageRef = useRef<HTMLElement>(null)

  const isStreaming = status === 'streaming'
  const isWaiting = status === 'submitted'
  const lastMessage = messages[messages.length - 1]

  useEffect(() => {
    const savedMode = readStorage('cv-view-mode')
    if (savedMode === 'agent' || savedMode === 'cv') setMode(savedMode)
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
    setModeReady(true)
  }, [])

  useEffect(() => {
    if (modeReady) writeStorage('cv-view-mode', mode)
  }, [mode, modeReady])

  // Bring each new message into view (the composer stays pinned below it).
  useEffect(() => {
    if (messages.length === 0) return
    window.scrollTo({ top: document.body.scrollHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [messages.length])

  // Follow the system theme until the visitor makes an explicit choice.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (event: MediaQueryListEvent) => {
      if (readStorage('cv-theme')) return
      const next: Theme = event.matches ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      setTheme(next)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Theme change: a soft bloom of the new palette spreads from the toggle.
  const switchTheme = (origin: HTMLElement) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const apply = () => {
      document.documentElement.dataset.theme = next
      writeStorage('cv-theme', next)
      setTheme(next)
    }

    if (!document.startViewTransition || prefersReducedMotion()) {
      apply()
      return
    }

    const box = origin.getBoundingClientRect()
    const x = box.left + box.width / 2
    const y = box.top + box.height / 2
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const root = document.documentElement
    root.style.setProperty('--bloom-x', `${x}px`)
    root.style.setProperty('--bloom-y', `${y}px`)
    root.style.setProperty('--bloom-r', `${radius}px`)
    root.classList.add('is-bloom')

    const transition = document.startViewTransition(() => {
      flushSync(apply)
    })
    transition.finished.finally(() => root.classList.remove('is-bloom'))
  }

  // Iris: the next view opens outward from the control that asked for it.
  const switchMode = (next: Mode, origin: HTMLElement) => {
    if (next === mode) return

    const stage = stageRef.current
    if (!stage || !document.startViewTransition || prefersReducedMotion()) {
      setMode(next)
      return
    }

    const stageBox = stage.getBoundingClientRect()
    const originBox = origin.getBoundingClientRect()
    const x = originBox.left + originBox.width / 2 - stageBox.left
    const y = originBox.top + originBox.height / 2 - stageBox.top
    // Cover the visible viewport from the toggle, wherever the stage is scrolled.
    const radius = Math.hypot(
      Math.max(x, stageBox.width - x),
      window.innerHeight - stageBox.top - y,
    )

    const root = document.documentElement
    root.style.setProperty('--iris-x', `${x}px`)
    root.style.setProperty('--iris-y', `${y}px`)
    root.style.setProperty('--iris-r', `${radius}px`)
    root.classList.add('is-iris')

    const transition = document.startViewTransition(() => {
      flushSync(() => setMode(next))
    })
    transition.finished.finally(() => root.classList.remove('is-iris'))
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (input.trim()) {
      setSent(true)
      window.setTimeout(() => setSent(false), 900)
    }
    handleSubmit(event)
  }

  const askFromCv = (question: string, origin: HTMLElement) => {
    switchMode('agent', origin)
    append({ role: 'user', content: question })
  }

  return (
    <div
      className={`site-shell ${modeReady ? 'is-ready' : ''}`}
      data-mode={mode}
      aria-busy={!modeReady}
    >
      <a className="skip-link" href="#top">Skip to content</a>

      <div className="atmosphere" aria-hidden="true">
        <span className="atmosphere-base" />
        <AuroraBackground />
        <span className="atmosphere-veil" />
      </div>

      <header className="site-header">
        <a className="identity-mark" href="#top" aria-label="Chelsea Kelling, home">
          <span className="identity-monogram" aria-hidden="true">CK</span>
          <span className="identity-name">Chelsea Kelling</span>
        </a>

        <div className="header-controls">
          <div className="mode-switch" role="group" aria-label="Choose view" data-mode={mode}>
            <span className="mode-switch-indicator" aria-hidden="true" />
            <button
              type="button"
              aria-pressed={mode === 'agent'}
              onClick={(event) => switchMode('agent', event.currentTarget)}
            >
              Chat
            </button>
            <button
              type="button"
              aria-pressed={mode === 'cv'}
              onClick={(event) => switchMode('cv', event.currentTarget)}
            >
              CV
            </button>
          </div>

          <button
            type="button"
            className="theme-toggle"
            data-theme-state={theme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            onClick={(event) => switchTheme(event.currentTarget)}
          >
            <svg className="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
            </svg>
            <svg className="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
            </svg>
          </button>
        </div>
      </header>

      <main id="top" ref={stageRef} className="mode-stage" tabIndex={-1}>
        <section
          className={`mode-view agent-view ${mode === 'agent' ? 'is-active' : 'is-inactive'}`}
          aria-label="Chat with an AI version of Chelsea"
          aria-hidden={mode !== 'agent'}
          inert={mode !== 'agent'}
        >
          <div className={`agent-layout ${messages.length ? 'has-messages' : ''}`}>
            {messages.length > 0 && (
              <div className="chat-history" role="log" aria-label="Conversation" aria-busy={isStreaming || isWaiting}>
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className={`chat-message ${message.role === 'user' ? 'from-user' : 'from-agent'}`}
                  >
                    <span className="message-author">
                      {message.role === 'user' ? 'You' : 'Chelsea (AI)'}
                    </span>
                    <div className="message-content">
                      {message.content}
                      {isStreaming && message === lastMessage && message.role !== 'user' && (
                        <span className="stream-caret" aria-hidden="true" />
                      )}
                    </div>
                  </article>
                ))}

                {isWaiting && (
                  <article className="chat-message from-agent is-pending">
                    <span className="message-author">Chelsea (AI)</span>
                    <div className="message-content" role="status">
                      <span className="typing-dots" aria-hidden="true"><i /><i /><i /></span>
                      <span className="sr-only">Chelsea is typing</span>
                    </div>
                  </article>
                )}
              </div>
            )}

            <div className="agent-composer">
              {messages.length === 0 && (
                <div className="agent-intro">
                  <p className="eyebrow reveal" style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
                    An AI version of Chelsea Kelling
                  </p>
                  <h1>
                    <span className="reveal-line" style={{ '--reveal-delay': '220ms' } as React.CSSProperties}>
                      <span>Good work begins</span>
                    </span>
                    <span className="reveal-line" style={{ '--reveal-delay': '360ms' } as React.CSSProperties}>
                      <span>with a good <em>question.</em></span>
                    </span>
                  </h1>
                  <p className="intro-description reveal" style={{ '--reveal-delay': '560ms' } as React.CSSProperties}>
                    Ask me about product design, systems, and the thinking behind the work.
                  </p>
                </div>
              )}

              {error && (
                <p className="composer-note is-error" role="alert">
                  Something went wrong. Please try again, or email me directly.
                </p>
              )}

              <div className="composer-controls reveal" style={{ '--reveal-delay': '700ms' } as React.CSSProperties}>
                <button
                  className="suggestion-toggle"
                  type="button"
                  aria-expanded={showSuggestions}
                  aria-controls="suggestion-list"
                  onClick={() => setShowSuggestions((isOpen) => !isOpen)}
                >
                  <span className="suggestion-toggle-mark" aria-hidden="true" />
                  {showSuggestions ? 'Close suggested questions' : 'A few places to begin'}
                </button>

                <div
                  id="suggestion-list"
                  className={`suggestion-list ${showSuggestions ? 'is-open' : ''}`}
                  inert={!showSuggestions}
                >
                  <div className="suggestion-list-inner">
                    {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                      <button
                        key={suggestion}
                        type="button"
                        style={{ '--i': index } as React.CSSProperties}
                        onClick={() => {
                          append({ role: 'user', content: suggestion })
                          setShowSuggestions(false)
                        }}
                      >
                        <span className="suggestion-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={onSubmit} className={`prompt-form ${sent ? 'is-sent' : ''}`}>
                  <label className="sr-only" htmlFor="agent-prompt">Ask me a question</label>
                  <input
                    id="agent-prompt"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask me about my work…"
                    autoComplete="off"
                    maxLength={1000}
                  />
                  <button type="submit" aria-label="Send question">
                    <span className="send-label">Send</span>
                    <span className="send-arrow" aria-hidden="true">↗</span>
                  </button>
                </form>
                <p className="composer-note">
                  I’m an AI version of Chelsea, grounded in my real CV and portfolio. For anything beyond it, email me.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`mode-view cv-view ${mode === 'cv' ? 'is-active' : 'is-inactive'}`}
          aria-label="Classic CV"
          aria-hidden={mode !== 'cv'}
          inert={mode !== 'cv'}
        >
          <CvView onAsk={askFromCv} />
        </section>
      </main>
    </div>
  )
}
