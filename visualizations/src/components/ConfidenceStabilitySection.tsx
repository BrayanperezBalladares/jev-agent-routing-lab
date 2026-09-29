import React from 'react'
import { useTranslation } from 'react-i18next'
import { RESEARCH_NOTES } from '../data/research-results'

export const ConfidenceStabilitySection: React.FC = () => {
  const { t } = useTranslation(['overview'])

  const conceptCards = [
    {
      id: 'low-conf',
      title: t('confidenceStability.cards.lowConf.title'),
      tag: t('confidenceStability.cards.lowConf.tag'),
      tagType: 'accent',
      explanation: t('confidenceStability.cards.lowConf.explanation'),
      empiricalEvidence: t('confidenceStability.cards.lowConf.evidence'),
    },
    {
      id: 'high-conf',
      title: t('confidenceStability.cards.highConf.title'),
      tag: t('confidenceStability.cards.highConf.tag'),
      tagType: 'danger',
      explanation: t('confidenceStability.cards.highConf.explanation'),
      empiricalEvidence: t('confidenceStability.cards.highConf.evidence'),
    },
    {
      id: 'stability-margin',
      title: t('confidenceStability.cards.stabilityMargin.title'),
      tag: t('confidenceStability.cards.stabilityMargin.tag'),
      tagType: 'warning',
      explanation: t('confidenceStability.cards.stabilityMargin.explanation'),
      empiricalEvidence: t('confidenceStability.cards.stabilityMargin.evidence'),
    },
  ]

  return (
    <section
      className="section-container confidence-stability-section"
      id="confidence-stability"
      aria-labelledby="confidence-stability-heading"
    >
      <header className="section-header">
        <div className="section-header-content">
          <h2 id="confidence-stability-heading" className="section-title">
            {t('confidenceStability.title')}{' '}
            <span className="badge badge-accent">{t('confidenceStability.badge')}</span>
          </h2>
          <p className="section-description">
            {t('confidenceStability.description')}
          </p>
        </div>
      </header>

      {/* Core Conceptual Cards */}
      <div className="concept-grid">
        {conceptCards.map((concept) => (
          <article key={concept.id} className="concept-card">
            <div className="concept-header">
              <span className={`badge badge-${concept.tagType}`}>
                {concept.tag}
              </span>
              <h3 className="concept-title">{concept.title}</h3>
            </div>
            <p className="concept-explanation">{concept.explanation}</p>
            <div className="concept-evidence">
              <strong className="evidence-label">Observed Behavior:</strong>{' '}
              {concept.empiricalEvidence}
            </div>
          </article>
        ))}
      </div>

      {/* Mathematical Margin Formulation Card */}
      <article className="formula-card" aria-label="Decision Boundary Margin Formula">
        <div className="formula-header">
          <div className="formula-title-group">
            <span className="badge badge-accent">{t('confidenceStability.formula.badge')}</span>
            <h3 className="formula-title">{t('confidenceStability.formula.title')}</h3>
          </div>
          <span className="formula-badge">{t('confidenceStability.formula.keyMetricBadge')}</span>
        </div>

        <div className="formula-content-wrapper">
          <div className="formula-math-block">
            <div className="formula-expression" aria-label="margin equals P of top 1 minus P of top 2">
              <span className="formula-var">margin</span>
              <span className="formula-op">=</span>
              <span className="formula-fn">P(top<sub>1</sub>)</span>
              <span className="formula-op">&minus;</span>
              <span className="formula-fn">P(top<sub>2</sub>)</span>
            </div>
            <p className="formula-definition">
              {t('confidenceStability.formula.definition')}
            </p>
          </div>

          <div className="formula-mechanics-grid">
            <div className="mechanic-item">
              <span className="mechanic-tag boundary">
                {t('confidenceStability.formula.mechanicZeroTag')}
              </span>
              <p className="mechanic-text">
                {t('confidenceStability.formula.mechanicZeroText')}
              </p>
            </div>

            <div className="mechanic-item">
              <span className="mechanic-tag separated">
                {t('confidenceStability.formula.mechanicOneTag')}
              </span>
              <p className="mechanic-text">
                {t('confidenceStability.formula.mechanicOneText')}
              </p>
            </div>
          </div>
        </div>

        {/* Universal Threshold Avoidance Note */}
        <div className="threshold-caveat-card">
          <div className="caveat-header">
            <span className="badge badge-warning">{t('confidenceStability.caveat.badge')}</span>
            <strong className="caveat-title">
              {t('confidenceStability.caveat.title')}
            </strong>
          </div>
          <p className="caveat-body">
            {t('confidenceStability.caveat.body')}
          </p>
        </div>
      </article>

      {/* Canonical Warnings from RESEARCH_NOTES */}
      <section className="warnings-section" aria-label="Canonical Research Warnings">
        <h3 className="warnings-section-title">
          {t('confidenceStability.warningsTitle')}
        </h3>
        <div className="warnings-grid">
          <div className="warning-card">
            <div className="warning-card-header">
              <span className="badge badge-danger">Confidence Calibration</span>
            </div>
            <p className="warning-card-text">
              {RESEARCH_NOTES.confidenceWarning}
            </p>
          </div>

          <div className="warning-card">
            <div className="warning-card-header">
              <span className="badge badge-warning">Margin Scope</span>
            </div>
            <p className="warning-card-text">{RESEARCH_NOTES.marginWarning}</p>
          </div>

          <div className="warning-card">
            <div className="warning-card-header">
              <span className="badge badge-accent">Repeated Samples</span>
            </div>
            <p className="warning-card-text">
              {RESEARCH_NOTES.repetitionWarning}
            </p>
          </div>

          <div className="warning-card">
            <div className="warning-card-header">
              <span className="badge">Diagnostic Nature</span>
            </div>
            <p className="warning-card-text">
              {RESEARCH_NOTES.diagnosticWarning}
            </p>
          </div>
        </div>
      </section>
    </section>
  )
}

export default ConfidenceStabilitySection
