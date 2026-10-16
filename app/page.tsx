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
                <p className="cv-role">Senior Product Designer</p>
              </div>
              <a className="cv-contact" href="mailto:c.lou.kelling@gmail.com">Get in touch <span aria-hidden="true">↗</span></a>
            </div>

            <div className="cv-summary">
              <p>
                Product designer with 9+ years of experience and a background in psychology. At my best in
                small teams where I pair with engineers, test with real users, and shape the product directly.
                Focused on design systems, onboarding, and AI-assisted prototyping.
              </p>
              <span>TAMPERE, FINLAND · REMOTE</span>
            </div>

            <div className="cv-sections">
              <section className="cv-section">
                <h2>Experience</h2>
                <article className="cv-entry">
                  <div className="cv-entry-meta">
                    <h3>Senior Product Designer</h3>
                    <span>2023 — Present</span>
                  </div>
                  <p className="cv-organization">GoTo (Miradore acquisition)</p>
                  <p>
                    Designing new features from first concept to shipped. Leading native MDM enrollment flows,
                    a large cross-product initiative, while integrating AI and expanding the design system.
                  </p>
                </article>
                <article className="cv-entry">
                  <div className="cv-entry-meta">
                    <h3>Lead UX Designer</h3>
                    <span>2021 — 2022</span>
                  </div>
                  <p className="cv-organization">Miradore</p>
                  <p>
                    First designer in the company. Built UX practices, research frameworks, and design
                    processes from the ground up, and optimized onboarding for product-led growth.
                  </p>
                </article>
                <article className="cv-entry">
                  <div className="cv-entry-meta">
                    <h3>UX / Service Design Consultant</h3>
                    <span>2017 — 2021</span>
                  </div>
                  <p className="cv-organization">Headsted, Konvos &amp; others</p>
                  <p>User testing and concept validation for early-stage wellness and behavior-change products.</p>
                </article>
                <article className="cv-entry">
                  <div className="cv-entry-meta">
                    <h3>UX Researcher</h3>
                    <span>2016 — 2019</span>
                  </div>
                  <p className="cv-organization">Tampere University</p>
                  <p>Published research on UX and storytelling in immersive VR.</p>
                </article>
              </section>

              <section className="cv-section">
                <h2>Selected work</h2>
                <article className="cv-entry">
                  <h3>Google Workspace integration</h3>
                  <p>
                    Design lead, 2024. Let admins import users from Google, unblocking subscription renewals
                    for top customers. 90% first-try success rate.
                  </p>
                </article>
                <article className="cv-entry">
                  <h3>Onboarding</h3>
                  <p>
                    Raised activation to 31% (industry average 15%) and lifted top-item clicks 60% in a
                    welcome-page A/B test.
                  </p>
                </article>
                <article className="cv-entry">
                  <h3>Live Showroom sandbox</h3>
                  <p>Led service design of a product demo environment now used by Marketing and Sales.</p>
                </article>
              </section>

              <section className="cv-section">
                <h2>Education</h2>
                <article className="cv-entry">
                  <h3>B.Sc. Psychology (Honors), minor in Communications</h3>
                  <p className="cv-organization">Missouri State University</p>
                  <p>Also: M.Sc. Human-Technology Interaction coursework, Tampere University; Product-Led Growth certificate, ProductLed.</p>
                </article>
              </section>

              <section className="cv-section">
                <h2>Expertise</h2>
                <p className="cv-skills">Design Systems <span>·</span> User Research <span>·</span> Onboarding &amp; PLG <span>·</span> AI-Assisted Prototyping <span>·</span> Service Design</p>
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
