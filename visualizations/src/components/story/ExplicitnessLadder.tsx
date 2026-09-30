import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import './story.css'
import {
  V8_IMPLEMENTATION_EXPLICITNESS,
  type V8VariantResult,
} from '../../data/research-results'

export const ExplicitnessLadder: React.FC = () => {
  const { t, i18n } = useTranslation(['story', 'common'])
  const isSpanish = i18n.language.startsWith('es')
  const [selectedVariantId, setSelectedVariantId] = useState<string>('C1')
  const [srAnnouncement, setSrAnnouncement] = useState<string>('')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const variants = V8_IMPLEMENTATION_EXPLICITNESS
  const selectedVariant: V8VariantResult =
    variants.find((v) => v.id === selectedVariantId) || variants[0]

  const handleSelectVariant = (variant: V8VariantResult) => {
    setSelectedVariantId(variant.id)
    setSrAnnouncement(
      isSpanish
        ? `Variante seleccionada ${variant.id}: ${variant.label}. Resultado: ${variant.searchCodeCount} SEARCH_CODE, ${variant.askUserCount} ASK_USER en ${variant.runs} ejecuciones. Margen promedio: ${variant.averageMargin.toFixed(3)}.`
        : `Selected variant ${variant.id}: ${variant.label}. Outcome: ${variant.searchCodeCount} SEARCH_CODE, ${variant.askUserCount} ASK_USER across ${variant.runs} runs. Average margin: ${variant.averageMargin.toFixed(3)}.`
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % variants.length
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + variants.length) % variants.length
      e.preventDefault()
    } else if (e.key === 'Home') {
      nextIndex = 0
      e.preventDefault()
    } else if (e.key === 'End') {
      nextIndex = variants.length - 1
      e.preventDefault()
    }

    if (nextIndex !== index) {
      handleSelectVariant(variants[nextIndex])
      tabRefs.current[nextIndex]?.focus()
    }
  }

  return (
    <section
      className="story-section"
      id="explicitness-ladder"
      aria-label="Implementation Explicitness Exploration"
    >
      <div className="story-header">
        <div className="story-badge-row">
          <span className="badge badge-accent">{t('ladder.badge')}</span>
          <span className="badge">{t('ladder.badge2')}</span>
        </div>
        <h2 className="story-title">{t('ladder.title')}</h2>
        <p className="story-subtitle">{t('ladder.subtitle')}</p>
      </div>

      <div className="ladder-workbench">
        {/* Discrete Variant Tabs (Compact C1-C6) */}
        <div className="ladder-tabs-bar">
          <div className="ladder-tabs-header">
            <div className="tabs-header-title-group">
              <span className="ladder-tabs-label">
                {t('ladder.testedVariants')}
              </span>
              <span className="ladder-tabs-sub">
                {t('ladder.contrastSub')}
              </span>
            </div>
            <span className="ladder-discrete-hint">
              {t('ladder.discreteHint')}
            </span>
          </div>

          <div
            className="ladder-tabs-list compact-tablist"
            role="tablist"
            aria-label="Select V8 implementation-explicitness variant"
          >
            {/* Primary Discovery Contrast Group (C1 & C2) */}
            <div className="tab-contrast-group" role="presentation">
              <span className="tab-group-label" aria-hidden="true">{t('ladder.primaryContrast')}</span>
              <div className="tab-group-buttons" role="presentation">
                {variants.slice(0, 2).map((variant, idx) => {
                  const isSelected = variant.id === selectedVariantId
                  const isMixed = variant.instabilityRatePct > 0
                  return (
                    <button
                      key={variant.id}
                      ref={(el) => { tabRefs.current[idx] = el }}
                      id={`ladder-tab-${variant.id}`}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls={`ladder-panel-${variant.id}`}
                      aria-label={`${variant.id} — ${variant.label} (${isMixed ? '20% mixed choices recorded' : 'single choice recorded'})`}
                      tabIndex={isSelected ? 0 : -1}
                      className={`ladder-tab-compact-btn ${isSelected ? 'active' : ''} ${variant.id === 'C1' ? 'tab-contrast-c1' : 'tab-contrast-c2'}`}
                      onClick={() => handleSelectVariant(variant)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                    >
                      <span className="tab-compact-id">{variant.id}</span>
                      <span className={`tab-compact-dot ${isMixed ? 'dot-mixed' : 'dot-stable'}`} aria-hidden="true" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="tab-group-divider" role="separator" aria-hidden="true" />

            {/* Additional Tested Variants Group (C3–C6) */}
            <div className="tab-additional-group" role="presentation">
              <span className="tab-group-label" aria-hidden="true">{t('ladder.additionalVariants')}</span>
              <div className="tab-group-buttons" role="presentation">
                {variants.slice(2).map((variant, sliceIdx) => {
                  const idx = sliceIdx + 2
                  const isSelected = variant.id === selectedVariantId
                  return (
                    <button
                      key={variant.id}
                      ref={(el) => { tabRefs.current[idx] = el }}
                      id={`ladder-tab-${variant.id}`}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      aria-controls={`ladder-panel-${variant.id}`}
                      aria-label={`${variant.id} — ${variant.label} (single choice recorded)`}
                      tabIndex={isSelected ? 0 : -1}
                      className={`ladder-tab-compact-btn tab-additional ${isSelected ? 'active' : ''}`}
                      onClick={() => handleSelectVariant(variant)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                    >
                      <span className="tab-compact-id">{variant.id}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Split-Pane Inspector: State Representation vs Observed Outcome */}
        <div
          id={`ladder-panel-${selectedVariant.id}`}
          role="tabpanel"
          aria-labelledby={`ladder-tab-${selectedVariant.id}`}
          className="ladder-split-grid"
        >
          {/* Left Pane: State Representation */}
          <div className="ladder-pane pane-representation">
            <div className="pane-header-row">
              <span className="context-kicker-label">
                {t('ladder.stateRepKicker', { id: selectedVariant.id })}
              </span>
              <span className="badge badge-neutral">
                {t('ladder.promptCueBadge')}
              </span>
            </div>

            <div className="representation-content">
              <div className="representation-heading-block">
                <span className="representation-id-label">{selectedVariant.id}</span>
                <h3 className="representation-label-title">{selectedVariant.label}</h3>
              </div>

              <div className="representation-quote-box">
                <span className="quote-label">{t('ladder.exactCueText')}</span>
                <blockquote className="representation-quote-body">
                  &ldquo;{selectedVariant.stateCue}&rdquo;
                </blockquote>
              </div>

              <div className="representation-focus-box">
                <strong className="focus-title">{t('ladder.whatChanged')}</strong>
                <p className="focus-description">
                  {t(`ladder.cFocus.${selectedVariant.id}`)}
                </p>
              </div>
            </div>
          </div>

          {/* Right Pane: Observed Routing Outcome */}
          <div className="ladder-pane pane-outcome">
            <div className="pane-header-row">
              <span className="context-kicker-label">
                {t('ladder.observedOutcomeKicker', { runs: selectedVariant.runs })}
              </span>
              <span className={`badge ${selectedVariant.instabilityRatePct > 0 ? 'badge-amber' : 'badge-neutral'}`}>
                {selectedVariant.instabilityRatePct > 0 ? t('ladder.mixedChoicesBadge') : t('ladder.singleChoiceBadge')}
              </span>
            </div>

            <div className="outcome-content">
              {/* Distribution Bar */}
              <div className="outcome-distribution-group">
                <div className="distribution-labels-row">
                  <span className="label-search">
                    SEARCH_CODE &bull; {selectedVariant.searchCodeCount} of {selectedVariant.runs} ({selectedVariant.searchCodeRatePct}%)
                  </span>
                  <span className="label-ask">
                    ASK_USER &bull; {selectedVariant.askUserCount} of {selectedVariant.runs} ({selectedVariant.askUserRatePct}%)
                  </span>
                </div>
                <div
                  className="distribution-track"
                  role="img"
                  aria-label={t('ladder.ratioLabel', { search: selectedVariant.searchCodeRatePct, ask: selectedVariant.askUserRatePct })}
                >
                  <div
                    className="distribution-segment-search"
                    style={{ width: `${selectedVariant.searchCodeRatePct}%` }}
                  />
                  <div
                    className="distribution-segment-ask"
                    style={{ width: `${selectedVariant.askUserRatePct}%` }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="ladder-metrics-grid">
                <div className="metric-stat-box">
                  <span className="metric-stat-label">{t('ladder.avgConfidence')}</span>
                  <span className="metric-stat-value">
                    {selectedVariant.averageConfidence.toFixed(3)}
                  </span>
                  <span className="metric-stat-sub">Provider signal</span>
                </div>

                <div className="metric-stat-box">
                  <span className="metric-stat-label">{t('ladder.avgMargin')}</span>
                  <span className="metric-stat-value">
                    {selectedVariant.averageMargin.toFixed(3)}
                  </span>
                  <span className="metric-stat-sub">Top-1 / Top-2 separation</span>
                </div>

                <div className="metric-stat-box">
                  <span className="metric-stat-label">{t('ladder.mixedRate')}</span>
                  <span className="metric-stat-value">
                    {selectedVariant.instabilityRatePct}%
                  </span>
                  <span className="metric-stat-sub">
                    {selectedVariant.instabilityRatePct > 0 ? 'Choice variation' : 'Single action selected'}
                  </span>
                </div>
              </div>

              {/* Canonical State Interpretation */}
              <div className="ladder-interpretation-card">
                <strong className="interpretation-card-title">{t('ladder.observedBehavior')}</strong>
                <p className="interpretation-card-body">
                  &ldquo;{selectedVariant.interpretation}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Persistent Interpretation Region */}
        <div
          className="persistent-interpretation-region"
          role="region"
          aria-label="Variant Interpretation Context"
        >
          <div className="interpretation-region-header">
            <span className="badge badge-accent">
              {selectedVariantId === 'C1'
                ? t('ladder.contextBadgeC1')
                : selectedVariantId === 'C2'
                ? t('ladder.contextBadgeC2')
                : t('ladder.contextBadgeOther')}
            </span>
            <span className="interpretation-region-meta">
              {selectedVariant.id} // {selectedVariant.label}
            </span>
          </div>
          <p className="interpretation-region-text">
            {selectedVariantId === 'C1' && t('ladder.contextTextC1')}
            {selectedVariantId === 'C2' && t('ladder.contextTextC2')}
            {['C3', 'C4', 'C5', 'C6'].includes(selectedVariantId) && t('ladder.contextTextOther')}
          </p>
        </div>

        {/* Methodological Scope & Boundary Policy Disclaimer */}
        <div className="ladder-disclaimer-card">
          <div className="disclaimer-header">
            <strong>{t('ladder.disclaimerTitle')}</strong>
          </div>
          <p className="disclaimer-body">
            {t('ladder.disclaimerBody')}
          </p>
        </div>

        {/* Screen Reader Live Region */}
        <div className="sr-only" aria-live="polite">
          {srAnnouncement}
        </div>
      </div>
    </section>
  )
}

export default ExplicitnessLadder
