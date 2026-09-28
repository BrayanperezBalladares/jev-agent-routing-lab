import React, { useState, useRef } from 'react'
import './story.css'
import { BOUNDARY_EVOLUTION, type BoundaryResult } from '../../data/research-results'

export const MarginDeconstructor: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('V5U02')
  const [srAnnouncement, setSrAnnouncement] = useState<string>('')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const selectedState: BoundaryResult =
    BOUNDARY_EVOLUTION.find((b) => b.id === selectedId) || BOUNDARY_EVOLUTION[0]

  const states = BOUNDARY_EVOLUTION

  const handleSelectState = (state: BoundaryResult) => {
    setSelectedId(state.id)
    setSrAnnouncement(
      `Selected diagnostic state ${state.id}: ${state.label}. Confidence: ${state.averageConfidence.toFixed(3)}, margin: ${state.averageMargin.toFixed(3)}, observed choices: ${state.searchCodeCount} SEARCH_CODE and ${state.askUserCount} ASK_USER across ${state.runs} runs.`
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
          <span className="badge badge-purple">Conceptual Framework</span>
          <span className="badge">Diagnostic Boundary Analysis</span>
        </div>
        <h2 className="story-title">Deconstructing the Decision Boundary</h2>
        <p className="story-subtitle">
          Understanding boundary behavior requires distinguishing between provider-returned
          confidence, candidate margin separation, and observed repeated-choice stability.
        </p>
      </div>

      <div className="margin-workbench">
        {/* State Selector Bar */}
        <div className="state-selector-bar">
          <span className="state-selector-label">
            Recorded Boundary States:
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
                DIAGNOSTIC STATE // {selectedState.id}
              </span>
              <span className="meta-banner-desc">
                {selectedState.label} &bull; Suite: <code>{selectedState.experiment}</code>
              </span>
            </div>
            <div className="meta-banner-right">
              <span className="badge">
                {selectedState.runs} Identical Evaluations
              </span>
              <span className={`badge ${isMixedChoice ? 'badge-amber' : 'badge-neutral'}`}>
                {isMixedChoice ? 'Mixed Observed Choices' : 'Single Observed Choice'}
              </span>
            </div>
          </div>

          {/* Three-Pillar Conceptual Triad */}
          <div className="conceptual-triad-grid">
            {/* Pillar 1: Provider Confidence */}
            <div className="triad-card pillar-confidence">
              <div className="triad-card-header">
                <span className="triad-pillar-tag">SIGNAL 1</span>
                <h3 className="triad-pillar-title">Provider Confidence</h3>
              </div>
              <div className="triad-metric-display">
                <div className="triad-metric-value">
                  {formatMetric(selectedState.averageConfidence)}
                </div>
                <div className="triad-metric-caption">
                  Provider-returned signal &bull; Non-calibrated
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
                <span className="triad-pillar-tag">SIGNAL 2</span>
                <h3 className="triad-pillar-title">Top-1 / Top-2 Margin</h3>
              </div>
              <div className="triad-metric-display">
                <div className="triad-metric-value">
                  {formatMetric(selectedState.averageMargin)}
                </div>
                <div className="triad-metric-caption">
                  Candidate separation &bull; Top-1 vs Top-2 gap
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
                <span className="triad-pillar-tag">BEHAVIOR</span>
                <h3 className="triad-pillar-title">Repeated-Choice Stability</h3>
              </div>
              <div className="triad-metric-display">
                <div className="triad-metric-value">
                  {selectedState.searchCodeCount} / {selectedState.askUserCount}
                </div>
                <div className="triad-metric-caption">
                  SEARCH_CODE vs ASK_USER ({selectedState.runs} runs)
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

          {/* Consolidated Conceptual Reference Guide (Secondary Static Definitions) */}
          <div className="triad-conceptual-reference">
            <div className="reference-item">
              <span className="reference-term">Provider Confidence</span>
              <p className="reference-desc">
                A provider-returned confidence signal. It is not treated as a calibrated
                probability that the selected action is correct, and its exact internal
                semantics are not assumed.
              </p>
            </div>
            <div className="reference-item">
              <span className="reference-term">Top-1 / Top-2 Margin</span>
              <p className="reference-desc">
                Top-1 / top-2 margin is the numerical gap between the two highest
                action probabilities.
              </p>
            </div>
            <div className="reference-item">
              <span className="reference-term">Repeated-Choice Stability</span>
              <p className="reference-desc">
                Repeated evaluations show whether identical input text produced the
                same or mixed observed routing choices in this experiment.
              </p>
            </div>
          </div>

          {/* Canonical State Interpretation Callout */}
          <div className="state-interpretation-callout">
            <div className="interpretation-header">
              <span className="interpretation-label">Observed Diagnostic Finding</span>
            </div>
            <p className="interpretation-text">
              &ldquo;{selectedState.interpretation}&rdquo;
            </p>
          </div>

          {/* Methodological Context & Guardrails */}
          <div className="methodology-guardrail-note">
            <div className="guardrail-title">
              Methodological Interpretation &amp; Non-Threshold Policy
            </div>
            <p className="guardrail-body">
              Several mixed-choice states in these diagnostic suites had small average margins
              (such as V5U02 at 0.0705 or V8-C1 at 0.034). In these recorded runs, V8-C2 showed a single observed SEARCH_CODE choice across 10 evaluations with an average margin of 0.284.
              However, <strong>the study did not establish a universal margin threshold</strong>, and a single
              low-margin observation is not sufficient evidence of instability. Repeated identical evaluations
              characterize empirical stochastic behavior rather than independent samples. Choice stability in a
              diagnostic probe does not imply universal correctness or production readiness.
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
