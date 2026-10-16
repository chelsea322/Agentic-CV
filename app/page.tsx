'use client'

import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useChat } from '@ai-sdk/react'

const PROMPT_SUGGESTIONS = [
  "How did Chelsea transform UX culture at Miradore?",
  "What is her exact AI prototyping workflow?",
  "How does she handle design tokens and code?",
  "What is her background in research and systems?",
]

type Mode = 'agent' | 'cv'

export default function HybridCVPage() {
  const { messages, input, handleInputChange, handleSubmit, append, status, error } = useChat()
  const [mode, setMode] = useState<Mode>('agent')
  const [modeReady, setModeReady] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLElement>(null)

  const isStreaming = status === 'streaming'
  const isWaiting = status === 'submitted'
  const lastMessage = messages[messages.length - 1]

  useEffect(() => {
    const savedMode = window.localStorage.getItem('cv-view-mode')
    if (savedMode === 'agent' || savedMode === 'cv') setMode(savedMode)
    setModeReady(true)
  }, [])

  useEffect(() => {
    if (modeReady) window.localStorage.setItem('cv-view-mode', mode)
  }, [mode, modeReady])

  // Flashlight: a soft pool of light follows the pointer (fine pointers only).
  useEffect(() => {
    const shell = shellRef.current
    if (!shell) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        shell.style.setProperty('--mx', `${event.clientX}px`)
        shell.style.setProperty('--my', `${event.clientY}px`)
        shell.dataset.lit = 'true'
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  // Iris wipe: the next view opens from the toggle, like an old film cut.
  const switchMode = (next: Mode, origin: HTMLElement) => {
    if (next === mode) return

    const stage = stageRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!stage || !document.startViewTransition || reduceMotion) {
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

  return (
    <div
      ref={shellRef}
      className={`site-shell ${modeReady ? 'is-ready' : ''}`}
      data-mode={mode}
      aria-busy={!modeReady}
    >
      <div className="atmosphere" aria-hidden="true">
        <span className="atmosphere-blinds" />
        <span className="atmosphere-smoke" />
        <span className="atmosphere-flashlight" />
        <span className="atmosphere-vignette" />
      </div>

      <header className="site-header">
        <a className="identity-mark" href="#top" aria-label="Chelsea Kelling, home">
          <span className="identity-monogram" aria-hidden="true">CK</span>
          <span>CHELSEA KELLING</span>
        </a>

        <div className="mode-switch" role="group" aria-label="Choose view" data-mode={mode}>
          <span className="mode-switch-indicator" aria-hidden="true" />
          <button
            type="button"
            aria-pressed={mode === 'agent'}
            onClick={(event) => switchMode('agent', event.currentTarget)}
          >
            Agent
          </button>
          <button
            type="button"
            aria-pressed={mode === 'cv'}
            onClick={(event) => switchMode('cv', event.currentTarget)}
          >
            CV
          </button>
        </div>
      </header>

      <main id="top" ref={stageRef} className="mode-stage">
        <section
          className={`mode-view agent-view ${mode === 'agent' ? 'is-active' : 'is-inactive'}`}
          aria-label="Ask Chelsea's AI agent"
          aria-hidden={mode !== 'agent'}
          inert={mode !== 'agent'}
        >
          <div className={`agent-layout ${messages.length ? 'has-messages' : ''}`}>
            {messages.length > 0 && (
              <div className="chat-history" aria-live="polite">
                {messages.map((message) => (
                  <article
                    key={message.id}
                    className={`chat-message ${message.role === 'user' ? 'from-user' : 'from-agent'}`}
                  >
                    <span className="message-author">
                      {message.role === 'user' ? 'YOU' : 'CHELSEA / AI'}
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
                  <article className="chat-message from-agent is-pending" aria-hidden="true">
                    <span className="message-author">CHELSEA / AI</span>
                    <div className="message-content"><span className="stream-caret" /></div>
                  </article>
                )}
              </div>
            )}

            <div className="agent-composer">
              {messages.length === 0 && (
                <div className="agent-intro">
                  <p className="eyebrow reveal" style={{ '--reveal-delay': '80ms' } as React.CSSProperties}>
                    A CONVERSATION WITH CHELSEA KELLING
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
                    Explore product design, systems, and the thinking behind the work.
                  </p>
                </div>
              )}

              {error && (
                <p className="composer-note" role="alert">
                  Something went wrong. Please try again, or email me directly.
                </p>
              )}

              <div className="composer-controls reveal" style={{ '--reveal-delay': '700ms' } as React.CSSProperties}>
                <button
                  className="suggestion-toggle"
                  type="button"
                  aria-expanded={showSuggestions}
                  onClick={() => setShowSuggestions((isOpen) => !isOpen)}
                >
                  <span className="suggestion-toggle-mark" aria-hidden="true">{showSuggestions ? '−' : '+'}</span>
                  {showSuggestions ? 'Close suggested questions' : 'A few places to begin'}
                </button>

                <div
                  className={`suggestion-list ${showSuggestions ? 'is-open' : ''}`}
                  aria-hidden={!showSuggestions}
                  inert={!showSuggestions}
                >
                  {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      type="button"
                      tabIndex={showSuggestions ? 0 : -1}
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

                <form onSubmit={handleSubmit} className="prompt-form">
                  <label className="sr-only" htmlFor="agent-prompt">Ask about Chelsea's experience</label>
                  <input
                    id="agent-prompt"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask about experience, process, or perspective..."
                    autoComplete="off"
                  />
                  <button type="submit" aria-label="Send question">SEND <span aria-hidden="true">↗</span></button>
                </form>
                <p className="composer-note">Thoughtful answers, grounded in real experience.</p>
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
          <div className="cv-document">
            <div className="cv-heading">
              <div>
                <p className="eyebrow">CURRICULUM VITAE</p>
                <h1>Chelsea Kelling</h1>
                <p className="cv-role">Lead Product Designer &amp; Systems Catalyst</p>
              </div>
              <a className="cv-contact" href="mailto:c.lou.kelling@gmail.com">Get in touch <span aria-hidden="true">↗</span></a>
            </div>

            <div className="cv-summary">
              <p>
                Product designer with 9+ years turning complex enterprise workflows into durable systems,
                rituals, and high-density products. Focused on UX architecture, design systems, AI-native
                prototyping, and servicing UX.
              </p>
              <span>TAMPERE / HELSINKI, FINLAND · REMOTE</span>
            </div>

            <div className="cv-sections">
              <section className="cv-section">
                <h2>Experience</h2>
                <article className="cv-entry">
                  <div className="cv-entry-meta">
                    <h3>Lead UX Designer</h3>
                    <span>2019 — 2024</span>
                  </div>
                  <p className="cv-organization">Miradore</p>
                  <p>
                    Built the UX function and design system from scratch. Scaled cross-department design
                    rituals and product maturity across the organization.
                  </p>
                </article>
              </section>

              <section className="cv-section">
                <h2>Research</h2>
                <article className="cv-entry">
                  <h3>Human-Technology Interaction</h3>
                  <p className="cv-organization">Tampere University</p>
                  <p>Research across usability and cognitive accessibility.</p>
                </article>
              </section>

              <section className="cv-section">
                <h2>Selected work</h2>
                <article className="cv-entry">
                  <h3>Brand Architecture</h3>
                  <p>Developed high-end brand concepts blending sensory restraint with high visual polish.</p>
                </article>
              </section>

              <section className="cv-section">
                <h2>Expertise</h2>
                <p className="cv-skills">UX Architecture <span>·</span> Design Systems <span>·</span> AI-Native Prototyping <span>·</span> Servicing UX</p>
              </section>
            </div>

            <footer className="cv-footer">
              <span>CHELSEA KELLING</span>
              <a href="mailto:c.lou.kelling@gmail.com">C.LOU.KELLING@GMAIL.COM</a>
            </footer>
          </div>
        </section>
      </main>
    </div>
  )
}
