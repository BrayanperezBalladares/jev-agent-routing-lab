import React from 'react'
import { useTranslation } from 'react-i18next'
import { RESEARCH_NOTES } from '../data/research-results'

interface MethodologyItemKey {
  key: string
  canonicalNote?: string
}

const METHODOLOGY_KEYS: MethodologyItemKey[] = [
  { key: 'syntheticScope' },
  { key: 'frozenVsAdaptive', canonicalNote: RESEARCH_NOTES.diagnosticWarning },
  { key: 'repeatedRuns', canonicalNote: RESEARCH_NOTES.repetitionWarning },
  { key: 'confidenceSignal', canonicalNote: RESEARCH_NOTES.confidenceWarning },
  { key: 'marginSignal', canonicalNote: RESEARCH_NOTES.marginWarning },
  { key: 'infrastructureDrops' },
  { key: 'providerComparisons', canonicalNote: RESEARCH_NOTES.comparatorWarning },
  { key: 'costLatencyAccounting' },
  { key: 'architectureStatus' },
]

export const MethodologyNotes: React.FC = () => {
  const { t } = useTranslation(['methodology'])

  return (
    <section
      className="section-container methodology-section"
      id="methodology"
      aria-labelledby="methodology-notes-heading"
    >
      <header className="section-header">
        <div className="section-badge-row">
          <span className="badge badge-accent">{t('badge')}</span>
          <span className="badge">9 Constraints</span>
        </div>
        <h2 id="methodology-notes-heading" className="section-title">
          {t('title')}
        </h2>
        <p className="section-description">
          {t('description')}
        </p>
      </header>

      <div className="methodology-ruled-list">
        {METHODOLOGY_KEYS.map(({ key, canonicalNote }) => {
          const itemPath = `items.${key}`
          const num = t(`${itemPath}.num`)
          const title = t(`${itemPath}.title`)
          const category = t(`${itemPath}.category`)
          const content = t(`${itemPath}.content`)
          const rule = t(`${itemPath}.rule`)

          return (
            <article key={key} className="methodology-ruled-item">
              <div className="ruled-item-header">
                <span className="ruled-item-num" aria-hidden="true">{num}</span>
                <div className="ruled-item-title-block">
                  <span className="ruled-item-category">{category}</span>
                  <h3 className="ruled-item-title">{title}</h3>
                </div>
              </div>
              <p className="ruled-item-body">{content}</p>
              <div className="ruled-item-rule">
                <strong className="rule-tag">Constraint:</strong>
                <span>{rule}</span>
              </div>
              {canonicalNote && (
                <div className="methodology-canonical-note">
                  <strong className="canonical-tag">Canonical Note:</strong>{' '}
                  {canonicalNote}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default MethodologyNotes
