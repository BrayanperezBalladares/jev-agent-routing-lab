import React, { useState, useRef } from 'react'
import './story.css'
import {
  V8_IMPLEMENTATION_EXPLICITNESS,
  type V8VariantResult,
} from '../../data/research-results'

export const ExplicitnessLadder: React.FC = () => {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('C1')
  const [srAnnouncement, setSrAnnouncement] = useState<string>('')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const variants = V8_IMPLEMENTATION_EXPLICITNESS
  const selectedVariant: V8VariantResult =
    variants.find((v) => v.id === selectedVariantId) || variants[0]

  const handleSelectVariant = (variant: V8VariantResult) => {
    setSelectedVariantId(variant.id)
    setSrAnnouncement(
      `Selected variant ${variant.id}: ${variant.label}. Outcome: ${variant.searchCodeCount} SEARCH_CODE, ${variant.askUserCount} ASK_USER across ${variant.runs} runs. Average margin: ${variant.averageMargin.toFixed(3)}.`
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
          <span className="badge badge-accent">Ablation Study</span>
          <span className="badge">State Formulation Analysis</span>
        </div>
        <h2 className="story-title">How State Formulation Shapes Routing Stability</h2>
        <p className="story-subtitle">
          Explore six discrete tested variants (C1–C6) to observe how explicitly stating
          unresolved implementation location coincided with changes in routing behavior.
        </p>
      </div>

      <div className="ladder-workbench">
        {/* Discrete Variant Tabs (Compact C1-C6 - No Continuous Slider) */}
        <div className="ladder-tabs-bar">
          <div className="ladder-tabs-header">
            <div className="tabs-header-title-group">
              <span className="ladder-tabs-label">
                Tested Explicitness Variants
              </span>
              <span className="ladder-tabs-sub">
                C1 &rarr; C2 Primary Discovery Contrast &bull; C3&ndash;C6 Additional Tested Variants
              </span>
            </div>
            <span className="ladder-discrete-hint">
              Discrete benchmark variants &bull; Non-continuous
            </span>
          </div>

          <div
            className="ladder-tabs-list compact-tablist"
            role="tablist"
            aria-label="Select V8 implementation-explicitness variant"
          >
            {/* Primary Discovery Contrast Group (C1 & C2) */}
            <div className="tab-contrast-group" role="presentation">
              <span className="tab-group-label" aria-hidden="true">Primary Contrast:</span>
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
              <span className="tab-group-label" aria-hidden="true">Additional Tested Variants:</span>
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
                STATE REPRESENTATION // {selectedVariant.id}
              </span>
              <span className="badge badge-neutral">
                Tested Prompt Cue
              </span>
            </div>

            <div className="representation-content">
              <div className="representation-heading-block">
                <span className="representation-id-label">{selectedVariant.id}</span>
                <h3 className="representation-label-title">{selectedVariant.label}</h3>
              </div>

              <div className="representation-quote-box">
                <span className="quote-label">Exact Tested Cue Text:</span>
                <blockquote className="representation-quote-body">
                  &ldquo;{selectedVariant.stateCue}&rdquo;
                </blockquote>
              </div>

              <div className="representation-focus-box">
                <strong className="focus-title">What changed in this state?</strong>
                <p className="focus-description">
                  {selectedVariant.id === 'C1' && (
                    <>
                      Approved requirement only without stating where implementation uncertainty lies.
                      The model faces an ambiguous operational boundary between inspecting code and asking the user.
                    </>
                  )}
                  {selectedVariant.id === 'C2' && (
                    <>
                      Adds that the implementation is not discussed.
                      This clarifies that the behavior exists conceptually, but its code whereabouts remain unknown.
                    </>
                  )}
                  {selectedVariant.id === 'C3' && (
                    <>
                      Explicitly states that it is unclear where the behavior is implemented.
                      Directly points the agent toward autonomous codebase inspection.
                    </>
                  )}
                  {selectedVariant.id === 'C4' && (
                    <>
                      States that the implementation responsible for the behavior is unknown.
                    </>
                  )}
                  {selectedVariant.id === 'C5' && (
                    <>
                      States that the implementation responsible for the behavior has not been located.
                    </>
                  )}
                  {selectedVariant.id === 'C6' && (
                    <>
                      Explicitly states that the implementation has not been located in the repository.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Right Pane: Observed Routing Outcome */}
          <div className="ladder-pane pane-outcome">
            <div className="pane-header-row">
              <span className="context-kicker-label">
                OBSERVED OUTCOME // {selectedVariant.runs} RUNS
              </span>
              <span className={`badge ${selectedVariant.instabilityRatePct > 0 ? 'badge-amber' : 'badge-neutral'}`}>
                {selectedVariant.instabilityRatePct > 0 ? 'Mixed Observed Choices (20%)' : 'Single Observed Choice (0% Mixed)'}
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
                  aria-label={`SEARCH_CODE to ASK_USER ratio: ${selectedVariant.searchCodeRatePct}% to ${selectedVariant.askUserRatePct}%`}
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
                  <span className="metric-stat-label">Average Confidence</span>
                  <span className="metric-stat-value">
                    {selectedVariant.averageConfidence.toFixed(3)}
                  </span>
                  <span className="metric-stat-sub">Provider signal</span>
                </div>

                <div className="metric-stat-box">
                  <span className="metric-stat-label">Average Margin</span>
                  <span className="metric-stat-value">
                    {selectedVariant.averageMargin.toFixed(3)}
                  </span>
                  <span className="metric-stat-sub">Top-1 / Top-2 separation</span>
                </div>

                <div className="metric-stat-box">
                  <span className="metric-stat-label">Mixed-Choice Rate</span>
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
                <strong className="interpretation-card-title">Observed Behavior:</strong>
                <p className="interpretation-card-body">
                  &ldquo;{selectedVariant.interpretation}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Persistent Interpretation Region (Layout-Stable across all C1–C6 variants) */}
        <div
          className="persistent-interpretation-region"
          role="region"
          aria-label="Variant Interpretation Context"
        >
          <div className="interpretation-region-header">
            <span className="badge badge-accent">
              {selectedVariantId === 'C1'
                ? 'Observed Variant Context'
                : selectedVariantId === 'C2'
                ? 'Observed Local Transition'
                : 'Additional Tested Variant'}
            </span>
            <span className="interpretation-region-meta">
              {selectedVariant.id} // {selectedVariant.label}
            </span>
          </div>
          <p className="interpretation-region-text">
            {selectedVariantId === 'C1' && (
              <>Mixed observed choices were recorded in this tested variant.</>
            )}
            {selectedVariantId === 'C2' && (
              <>
                Observed local transition: recorded choices changed from 8/2 in C1 to 10/0 in C2 while average margin changed from 0.034 to 0.284.
              </>
            )}
            {['C3', 'C4', 'C5', 'C6'].includes(selectedVariantId) && (
              <>
                This variant retained a single observed SEARCH_CODE choice across the 10 recorded runs.
              </>
            )}
          </p>
        </div>

        {/* Methodological Scope & Boundary Policy Disclaimer */}
        <div className="ladder-disclaimer-card">
          <div className="disclaimer-header">
            <strong>Methodological Scope &amp; Non-Generalization Guardrails</strong>
          </div>
          <p className="disclaimer-body">
            In these recorded runs, V8-C2 showed a single observed SEARCH_CODE choice across 10 evaluations with an average margin of 0.284.
            Across these tested states, making unresolved implementation information more explicit coincided with
            increasingly stable SEARCH_CODE routing in the recorded runs. However, <strong>this was a local controlled
            diagnostic study</strong>. It does not establish a universal causal law about semantic routers, does not prove
            that prompt wording universally eliminates instability, and does not establish that margin 0.284 is an
            operational guarantee of correctness.
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
