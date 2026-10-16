'use client'

import { useId, useState } from 'react'
import { EXPERIENCE, EXPERTISE, WORK, type CvEntry } from '../../data/cv-entries'

type Props = {
  onAsk: (question: string, origin: HTMLElement) => void
}

function Entry({
  entry,
  open,
  onToggle,
  onAsk,
}: {
  entry: CvEntry
  open: boolean
  onToggle: () => void
  onAsk: Props['onAsk']
}) {
  const panelId = useId()
  const expandable = Boolean(entry.details?.length || entry.ask)

  return (
    <article className={`cv-entry ${open ? 'is-open' : ''} ${expandable ? 'is-expandable' : ''}`}>
      <span className="cv-entry-node" aria-hidden="true" />
      <div className="cv-entry-meta">
        <h3>
          {expandable ? (
            <button type="button" className="cv-entry-toggle" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
              <span>{entry.title}</span>
              <span className="cv-chevron" aria-hidden="true" />
            </button>
          ) : (
            entry.title
          )}
        </h3>
        {entry.period && <span className="cv-period">{entry.period}</span>}
      </div>
      {entry.organization && <p className="cv-organization">{entry.organization}</p>}
      <p className="cv-summary-text">{entry.summary}</p>

      {expandable && (
        <div id={panelId} className="cv-entry-panel" role="region" aria-label={`${entry.title} details`} inert={!open}>
          <div className="cv-entry-panel-inner">
            {entry.details && (
              <ul>
                {entry.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
            {entry.ask && (
              <button type="button" className="cv-ask" onClick={(event) => onAsk(entry.ask!, event.currentTarget)}>
                Ask me about this <span aria-hidden="true">↗</span>
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

export default function CvView({ onAsk }: Props) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())
  const [skill, setSkill] = useState<string | null>(null)

  const expandableIds = [...EXPERIENCE, ...WORK].filter((e) => e.details?.length || e.ask).map((e) => e.id)
  const allOpen = expandableIds.every((id) => openIds.has(id))

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const activeSkill = EXPERTISE.find((s) => s.id === skill)

  const renderEntries = (entries: CvEntry[]) =>
    entries.map((entry) => (
      <Entry key={entry.id} entry={entry} open={openIds.has(entry.id)} onToggle={() => toggle(entry.id)} onAsk={onAsk} />
    ))

  return (
    <div className="cv-document">
      <div className="cv-heading">
        <div>
          <p className="eyebrow">Curriculum vitae</p>
          <h1>Chelsea Kelling</h1>
          <p className="cv-role">Senior Product Designer</p>
        </div>
        <a className="cv-contact" href="mailto:c.lou.kelling@gmail.com">
          Get in touch <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="cv-summary">
        <p>
          Product designer with 9+ years of experience and a background in psychology. At my best in small teams where I
          pair with engineers, test with real users, and shape the product directly. Focused on design systems,
          onboarding, and AI-assisted prototyping.
        </p>
        <span>Tampere, Finland · Remote</span>
      </div>

      <div className="cv-toolbar">
        <p>Tap an entry to open the detail.</p>
        <button
          type="button"
          className="cv-expand-all"
          onClick={() => setOpenIds(allOpen ? new Set() : new Set(expandableIds))}
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <div className="cv-sections">
        <section className="cv-section" aria-labelledby="cv-exp">
          <h2 id="cv-exp">
            <span aria-hidden="true">01</span>Experience
          </h2>
          <div className="cv-timeline">{renderEntries(EXPERIENCE)}</div>
        </section>

        <section className="cv-section" aria-labelledby="cv-work">
          <h2 id="cv-work">
            <span aria-hidden="true">02</span>Selected work
          </h2>
          <div className="cv-timeline">{renderEntries(WORK)}</div>
          <blockquote className="cv-quote">
            <p>“It was so easy to use, I didn’t even need instructions.”</p>
            <footer>A customer, on a recent feature for transferring MDM licenses</footer>
          </blockquote>
        </section>

        <section className="cv-section" aria-labelledby="cv-edu">
          <h2 id="cv-edu">
            <span aria-hidden="true">03</span>Education
          </h2>
          <article className="cv-entry">
            <h3>B.Sc. Psychology (Honors), minor in Communications</h3>
            <p className="cv-organization">Missouri State University</p>
            <p className="cv-summary-text">
              Also: M.Sc. Human-Technology Interaction coursework, Tampere University; Product-Led Growth certificate,
              ProductLed.
            </p>
          </article>
        </section>

        <section className="cv-section" aria-labelledby="cv-skills">
          <h2 id="cv-skills">
            <span aria-hidden="true">04</span>Expertise
          </h2>
          <ul className="cv-skill-list">
            {EXPERTISE.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="cv-skill"
                  aria-pressed={skill === s.id}
                  onClick={() => setSkill((cur) => (cur === s.id ? null : s.id))}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
          <div className={`cv-skill-note ${activeSkill ? 'is-open' : ''}`} aria-live="polite">
            <div>
              {activeSkill ? (
                <>
                  <p>{activeSkill.note}</p>
                  <button type="button" className="cv-ask" onClick={(e) => onAsk(activeSkill.ask, e.currentTarget)}>
                    Ask me about this <span aria-hidden="true">↗</span>
                  </button>
                </>
              ) : (
                <p>Select a skill to see where it shows up in my work.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="cv-footer">
        <span>Chelsea Kelling</span>
        <a href="mailto:c.lou.kelling@gmail.com">c.lou.kelling@gmail.com</a>
      </footer>
    </div>
  )
}
