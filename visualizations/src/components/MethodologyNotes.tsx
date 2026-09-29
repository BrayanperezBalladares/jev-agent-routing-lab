import React from 'react'
import { useTranslation } from 'react-i18next'
import { RESEARCH_NOTES } from '../data/research-results'

interface MethodologyItem {
  id: string
  title: string
  category: string
  badgeType: 'accent' | 'warning' | 'purple' | 'danger'
  content: string
  canonicalNote?: string
}

export const MethodologyNotes: React.FC = () => {
  const { t } = useTranslation(['methodology'])

  const methodologyItems: MethodologyItem[] = [
    {
      id: 'synthetic-scenarios',
      title: t('items.syntheticScenarios.title'),
      category: t('items.syntheticScenarios.category'),
      badgeType: 'accent',
      content: t('items.syntheticScenarios.content'),
    },
    {
      id: 'fixed-action-space',
      title: t('items.fixedActionSpace.title'),
      category: t('items.fixedActionSpace.category'),
      badgeType: 'accent',
      content: t('items.fixedActionSpace.content'),
    },
    {
      id: 'diagnostic-suites',
      title: t('items.diagnosticSuites.title'),
      category: t('items.diagnosticSuites.category'),
      badgeType: 'warning',
      content: t('items.diagnosticSuites.content'),
      canonicalNote: RESEARCH_NOTES.diagnosticWarning,
    },
    {
      id: 'repeated-runs',
      title: t('items.repeatedRuns.title'),
      category: t('items.repeatedRuns.category'),
      badgeType: 'warning',
      content: t('items.repeatedRuns.content'),
      canonicalNote: RESEARCH_NOTES.repetitionWarning,
    },
    {
      id: 'provider-variability',
      title: t('items.providerVariability.title'),
      category: t('items.providerVariability.category'),
      badgeType: 'accent',
      content: t('items.providerVariability.content'),
    },
    {
      id: 'confidence-calibration',
      title: t('items.confidenceCalibration.title'),
      category: t('items.confidenceCalibration.category'),
      badgeType: 'danger',
      content: t('items.confidenceCalibration.content'),
      canonicalNote: RESEARCH_NOTES.confidenceWarning,
    },
    {
      id: 'latency-cost-comparability',
      title: t('items.latencyCostComparability.title'),
      category: t('items.latencyCostComparability.category'),
      badgeType: 'accent',
      content: t('items.latencyCostComparability.content'),
      canonicalNote: RESEARCH_NOTES.comparatorWarning,
    },
  ]

  return (
    <section
      className="section-container methodology-section"
      id="methodology"
      aria-labelledby="methodology-notes-heading"
    >
      <header className="section-header">
        <div className="section-header-content">
          <h2 id="methodology-notes-heading" className="section-title">
            {t('title')}{' '}
            <span className="badge badge-warning">{t('badge')}</span>
          </h2>
          <p className="section-description">
            {t('description')}
          </p>
        </div>
      </header>

      <div className="methodology-grid">
        {methodologyItems.map((item) => (
          <article key={item.id} className="methodology-card">
            <div className="methodology-card-header">
              <span className={`badge badge-${item.badgeType}`}>
                {item.category}
              </span>
              <h3 className="methodology-card-title">{item.title}</h3>
            </div>
            <p className="methodology-card-body">{item.content}</p>
            {item.canonicalNote && (
              <div className="methodology-canonical-note">
                <strong className="canonical-tag">Canonical Note:</strong>{' '}
                {item.canonicalNote}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default MethodologyNotes
