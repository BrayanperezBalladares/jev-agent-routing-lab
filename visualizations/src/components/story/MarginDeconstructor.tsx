import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import './story.css'
import { BOUNDARY_EVOLUTION, type BoundaryResult } from '../../data/research-results'

export const MarginDeconstructor: React.FC = () => {
  const { t, i18n } = useTranslation(['story', 'common'])
  const isSpanish = i18n.language.startsWith('es')
  const [selectedId, setSelectedId] = useState<string>('V5U02')
  const [srAnnouncement, setSrAnnouncement] = useState<string>('')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const selectedState: BoundaryResult =
    BOUNDARY_EVOLUTION.find((b) => b.id === selectedId) || BOUNDARY_EVOLUTION[0]

  const states = BOUNDARY_EVOLUTION

  const handleSelectState = (state: BoundaryResult) => {
    setSelectedId(state.id)
    setSrAnnouncement(
      isSpanish
        ? `Estado diagnóstico seleccionado ${state.id}: ${state.label}. Confianza: ${state.averageConfidence.toFixed(3)}, margen: ${state.averageMargin.toFixed(3)}, elecciones observadas: ${state.searchCodeCount} SEARCH_CODE y ${state.askUserCount} ASK_USER en ${state.runs} ejecuciones.`
        : `Selected diagnostic state ${state.id}: ${state.label}. Confidence: ${state.averageConfidence.toFixed(3)}, margin: ${state.averageMargin.toFixed(3)}, observed choices: ${state.searchCodeCount} SEARCH_CODE and ${state.askUserCount} ASK_USER across ${state.runs} runs.`
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % states.length
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + states.length) % states.length
      e.preventDefault()
    } else if (e.key === 'Home') {
      nextIndex = 0
      e.preventDefault()
    } else if (e.key === 'End') {
      nextIndex = states.length - 1
      e.preventDefault()
    }

    if (nextIndex !== index) {
      handleSelectState(states[nextIndex])
      tabRefs.current[nextIndex]?.focus()
    }
  }

  const formatMetric = (val: number): string => {
    if (val === 1) return '1.000'
    if (val === 0) return '0.000'
    const str = val.toString()
    if (str.split('.')[1]?.length > 3) {
      return val.toFixed(4)
    }
    return val.toFixed(3)
  }

  const isMixedChoice = selectedState.askUserCount > 0

  return (
    <section
      className="story-section"
      id="margin-deconstructor"
      aria-label="Margin and Stability Deconstructor"
    >
      <div className="story-header">
        <div className="story-badge-row">
          <span className="badge badge-accent">{t('margin.badge')}</span>
          <span className="badge">{t('margin.badge2')}</span>
        </div>
        <h2 className="story-title">{t('margin.title')}</h2>
        <p className="story-subtitle">{t('margin.subtitle')}</p>
      </div>

      <div className="margin-workbench">
        {/* State Selector Bar */}
        <div className="state-selector-bar">
          <span className="state-selector-label">
            {t('margin.recordedStates')}
          </span>
          <div
            className="state-tabs-list"
            role="tablist"
            aria-label="Select recorded boundary state"
          >
            {states.map((state, idx) => {
              const isSelected = state.id === selectedId
              return (
                <button
                  key={state.id}
                  ref={(el) => { tabRefs.current[idx] = el }}
                  id={`margin-tab-${state.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`margin-panel-${state.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  className={`state-tab-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectState(state)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                >
                  <span className="tab-state-id">{state.id}</span>
                  <span className="tab-state-experiment">{state.experiment}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* State Snapshot Header */}
        <div
          id={`margin-panel-${selectedState.id}`}
          role="tabpanel"
          aria-labelledby={`margin-tab-${selectedState.id}`}
          className="margin-state-panel"
        >
          <div className="state-meta-banner">
            <div className="meta-banner-left">
              <span className="context-kicker-label">
                {t('margin.kicker', { id: selectedState.id })}
              </span>
              <span className="meta-banner-desc">
                {selectedState.label} &bull; {t('margin.suite')} <code>{selectedState.experiment}</code>
              </span>
            </div>
            <div className="meta-banner-right">
              <span className="badge">
                {t('margin.identicalEvals', { count: selectedState.runs })}
              </span>
              <span className={`badge ${isMixedChoice ? 'badge-amber' : 'badge-neutral'}`}>
                {isMixedChoice ? t('margin.mixedChoices') : t('margin.singleChoice')}
              </span>
            </div>
          </div>

          {/* Three-Pillar Conceptual Triad */}
          <div className="conceptual-triad-grid">
            {/* Pillar 1: Provider Confidence */}
            <div className="triad-card pillar-confidence">
              <div className="triad-card-header">
                <span className="triad-pillar-tag">{t('margin.pillar1Tag')}</span>
                <h3 className="triad-pillar-title">{t('margin.pillar1Title')}</h3>
              </div>
              <div className="triad-metric-display">
                <div className="triad-metric-value">
                  {formatMetric(selectedState.averageConfidence)}
                </div>
                <div className="triad-metric-caption">
                  {t('margin.pillar1Caption')}
                </div>
              </div>
              <div className="triad-axis-container">
                <div
                  className="triad-axis-track"
                  role="img"
                  aria-label={`Provider confidence: ${formatMetric(selectedState.averageConfidence)} on a 0.00 to 1.00 quantitative axis`}
                >
                  <div className="triad-axis-line" />
                  <div
                    className="triad-axis-marker"
                    style={{ left: `${Math.min(100, Math.max(0, selectedState.averageConfidence * 100))}%` }}
                    aria-hidden="true"
                  />
                </div>
                <div className="triad-axis-scale" aria-hidden="true">
                  <span>0.00</span>
                  <span>0.50</span>
                  <span>1.00</span>
                </div>
              </div>
            </div>

            {/* Pillar 2: Top-1 / Top-2 Margin */}
            <div className="triad-card pillar-margin">
              <div className="triad-card-header">
                <span className="triad-pillar-tag">{t('margin.pillar2Tag')}</span>
                <h3 className="triad-pillar-title">{t('margin.pillar2Title')}</h3>
              </div>
              <div className="triad-metric-display">
                <div className="triad-metric-value">
                  {formatMetric(selectedState.averageMargin)}
                </div>
                <div className="triad-metric-caption">
                  {t('margin.pillar2Caption')}
                </div>
              </div>
              <div className="triad-axis-container">
                <div
                  className="triad-axis-track"
                  role="img"
                  aria-label={`Top-1 / top-2 margin: ${formatMetric(selectedState.averageMargin)} on a 0.00 to 1.00 quantitative axis`}
                >
                  <div className="triad-axis-line" />
                  <div
                    className="triad-axis-marker"
                    style={{ left: `${Math.min(100, Math.max(0, selectedState.averageMargin * 100))}%` }}
                    aria-hidden="true"
                  />
                </div>
                <div className="triad-axis-scale" aria-hidden="true">
                  <span>0.00</span>
                  <span>0.50</span>
                  <span>1.00</span>
                </div>
              </div>
            </div>

            {/* Pillar 3: Repeated-Choice Stability */}
            <div className="triad-card pillar-stability">
              <div className="triad-card-header">
                <span className="triad-pillar-tag">{t('margin.pillar3Tag')}</span>
                <h3 className="triad-pillar-title">{t('margin.pillar3Title')}</h3>
              </div>
              <div className="triad-metric-display">
                <div className="triad-metric-value">
                  {selectedState.searchCodeCount} / {selectedState.askUserCount}
                </div>
                <div className="triad-metric-caption">
                  {t('margin.pillar3Caption', { runs: selectedState.runs })}
                </div>
              </div>
              <div className="triad-distribution-wrapper">
                <div
                  className="triad-distribution-track"
                  role="img"
                  aria-label={`Observed distribution: ${selectedState.searchCodeRatePct}% SEARCH_CODE and ${selectedState.askUserRatePct}% ASK_USER`}
                >
                  <div
                    className="distribution-segment-search"
                    style={{ width: `${selectedState.searchCodeRatePct}%` }}
                  />
                  <div
                    className="distribution-segment-ask"
                    style={{ width: `${selectedState.askUserRatePct}%` }}
                  />
                </div>
                <div className="triad-distribution-labels">
                  <span className="label-search">
                    SEARCH: {selectedState.searchCodeCount} ({selectedState.searchCodeRatePct}%)
                  </span>
                  <span className="label-ask">
                    ASK: {selectedState.askUserCount} ({selectedState.askUserRatePct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Consolidated Conceptual Reference Guide */}
          <div className="triad-conceptual-reference">
            <div className="reference-item">
              <span className="reference-term">{t('margin.referenceGuide.confidenceTerm')}</span>
              <p className="reference-desc">
                {t('margin.referenceGuide.confidenceDesc')}
              </p>
            </div>
            <div className="reference-item">
              <span className="reference-term">{t('margin.referenceGuide.marginTerm')}</span>
              <p className="reference-desc">
                {t('margin.referenceGuide.marginDesc')}
              </p>
            </div>
            <div className="reference-item">
              <span className="reference-term">{t('margin.referenceGuide.stabilityTerm')}</span>
              <p className="reference-desc">
                {t('margin.referenceGuide.stabilityDesc')}
              </p>
            </div>
          </div>

          {/* Canonical State Finding Callout */}
          <div className="state-interpretation-callout">
            <div className="interpretation-header">
              <span className="interpretation-label">{t('margin.findingLabel')}</span>
            </div>
            <p className="interpretation-text">
              &ldquo;{selectedState.interpretation}&rdquo;
            </p>
          </div>

          {/* Methodological Context & Guardrails */}
          <div className="methodology-guardrail-note">
            <div className="guardrail-title">
              {t('margin.guardrailTitle')}
            </div>
            <p className="guardrail-body">
              {t('margin.guardrailBody')}
            </p>
          </div>
        </div>

        {/* Screen Reader Live Region */}
        <div className="sr-only" aria-live="polite">
          {srAnnouncement}
        </div>
      </div>
    </section>
  )
}

export default MarginDeconstructor
