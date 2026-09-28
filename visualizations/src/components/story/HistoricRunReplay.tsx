import React, { useState } from 'react'
import './story.css'

export const HistoricRunReplay: React.FC = () => {
  const [isReplayed, setIsReplayed] = useState<boolean>(false)
  const [srAnnouncement, setSrAnnouncement] = useState<string>('')

  const handleReplay = () => {
    setIsReplayed(true)
    setSrAnnouncement(
      'Historical evaluations replayed: 20 identical runs yielded 14 SEARCH_CODE and 6 ASK_USER choices. Average confidence: 0.315, average margin: 0.0705.'
    )
  }

  const handleReset = () => {
    setIsReplayed(false)
    setSrAnnouncement('Replay reset.')
  }

  // Exact 20 historical runs aggregated by choice (14 SEARCH_CODE, 6 ASK_USER)
  // No chronological order is implied or simulated
  const searchTokens = Array.from({ length: 14 }, (_, i) => ({
    id: `search-${i + 1}`,
    index: i + 1,
    action: 'SEARCH_CODE' as const,
  }))

  const askTokens = Array.from({ length: 6 }, (_, i) => ({
    id: `ask-${i + 1}`,
    index: i + 1,
    action: 'ASK_USER' as const,
  }))

  return (
    <section
      className="story-section"
      id="historic-run-replay"
      aria-label="Historical Run Replay"
    >
      <div className="story-header">
        <div className="story-badge-row">
          <span className="badge badge-warning">Boundary Exploration</span>
          <span className="badge">State V5U02 Diagnostic Probe</span>
        </div>
        <h2 className="story-title">When One-Shot Accuracy Hides Decision Instability</h2>
        <p className="story-subtitle">
          In single-shot evaluations, an agent prompt yields a single routing choice.
          What happens when the exact same prompt text is evaluated repeatedly across 20 identical runs?
        </p>
      </div>

      <div className="replay-workbench">
        {/* State V5U02 Context Snapshot */}
        <div className="replay-prompt-box">
          <div className="context-kicker-bar">
            <span className="context-kicker-label">
              HISTORICAL PROBE // STATE V5U02 (Requirement ambiguity)
            </span>
            <span className="context-kicker-meta">
              Dataset: <code>routing-v5-cue-stripped.json</code> &bull; Target: <code>ASK_USER</code>
            </span>
          </div>
          <blockquote className="replay-prompt-body">
            &ldquo;An account was removed months ago and another person now requests the same username.
            Existing product documentation describes deletion but never states whether the identifier becomes available again.&rdquo;
          </blockquote>
        </div>

        {/* Pre-Replay: Strong Focal Question */}
        {!isReplayed ? (
          <div className="replay-pre-trigger-block">
            <div className="replay-question-lead">
              In a single-shot benchmark, this state looked decisive.
            </div>
            <div className="replay-question-sub">
              What happened when the exact same prompt text was evaluated 20 times?
            </div>
            <div className="replay-trigger-action-row">
              <button
                type="button"
                className="replay-trigger-btn"
                onClick={handleReplay}
              >
                <span aria-hidden="true">&#x25B6;</span>
                Replay observed evaluations
              </button>
              <span className="replay-trigger-hint">
                Historical replay &bull; 20 recorded runs &bull; No live model inference
              </span>
            </div>
          </div>
        ) : (
          /* Post-Replay: High-Contrast 14 vs 6 Visual Split */
          <div
            className="replay-display-panel"
            role="region"
            aria-label="Observed historical replay results"
          >
            {/* The Central Visual Takeaway */}
            <div className="replay-focal-headline">
              <div className="focal-title-row">
                <span className="focal-tag">EMPIRICAL OUTCOME</span>
                <span className="focal-main-title">
                  SAME INPUT &bull; TWO OBSERVED ROUTING CHOICES
                </span>
              </div>
              <p className="focal-subtitle">
                Evaluated across 20 identical runs under the same conditions, routing drifted between two competing actions.
              </p>
            </div>

            {/* Distribution Ratio Bar */}
            <div className="distribution-bar-wrapper">
              <div className="distribution-labels-row">
                <span className="label-search">
                  SEARCH_CODE &bull; 14 of 20 (70%)
                </span>
                <span className="label-ask">
                  ASK_USER &bull; 6 of 20 (30%)
                </span>
              </div>
              <div
                className="distribution-track"
                role="progressbar"
                aria-valuenow={70}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="SEARCH_CODE versus ASK_USER outcome distribution: 70 percent to 30 percent"
              >
                <div className="distribution-segment-search" />
                <div className="distribution-segment-ask" />
              </div>
            </div>

            {/* Grouped Outcome Regions: 14 vs 6 Visual Focal Point */}
            <div className="outcome-split-showcase">
              {/* Outcome Region 1: SEARCH_CODE (14) */}
              <div className="outcome-region region-search">
                <div className="outcome-region-header">
                  <div className="outcome-action-title">
                    <span className="action-glyph" aria-hidden="true">⌕</span>
                    <span className="outcome-name">SEARCH_CODE</span>
                  </div>
                  <div className="outcome-action-stats">
                    <span className="outcome-fraction">14 / 20</span>
                    <span className="outcome-percentage">70%</span>
                  </div>
                </div>

                <div
                  className="outcome-markers-bank"
                  aria-label="14 historical runs routed to SEARCH_CODE"
                >
                  {searchTokens.map((t) => (
                    <div
                      key={t.id}
                      className="outcome-marker marker-search"
                      title={`Observed evaluation: SEARCH_CODE (${t.index}/14)`}
                    >
                      <span className="marker-icon" aria-hidden="true">⌕</span>
                      <span className="marker-label">SEARCH</span>
                    </div>
                  ))}
                </div>

                <div className="outcome-region-caption">
                  14 evaluations routed to autonomous codebase inspection
                </div>
              </div>

              {/* Outcome Region 2: ASK_USER (6) */}
              <div className="outcome-region region-ask">
                <div className="outcome-region-header">
                  <div className="outcome-action-title">
                    <span className="action-glyph" aria-hidden="true">?</span>
                    <span className="outcome-name">ASK_USER</span>
                  </div>
                  <div className="outcome-action-stats">
                    <span className="outcome-fraction">6 / 20</span>
                    <span className="outcome-percentage">30%</span>
                  </div>
                </div>

                <div
                  className="outcome-markers-bank"
                  aria-label="6 historical runs routed to ASK_USER"
                >
                  {askTokens.map((t) => (
                    <div
                      key={t.id}
                      className="outcome-marker marker-ask"
                      title={`Observed evaluation: ASK_USER (${t.index}/6)`}
                    >
                      <span className="marker-icon" aria-hidden="true">?</span>
                      <span className="marker-label">ASK</span>
                    </div>
                  ))}
                </div>

                <div className="outcome-region-caption">
                  6 evaluations routed to developer clarification
                </div>
              </div>
            </div>

            {/* Secondary Explanatory Metrics Grid */}
            <div className="replay-metrics-grid">
              <div className="metric-stat-box">
                <span className="metric-stat-label">Recorded Runs</span>
                <span className="metric-stat-value">20</span>
                <span className="metric-stat-sub">Identical evaluations</span>
              </div>

              <div className="metric-stat-box">
                <span className="metric-stat-label">Observed Split</span>
                <span className="metric-stat-value">70% / 30%</span>
                <span className="metric-stat-sub">14 SEARCH / 6 ASK</span>
              </div>

              <div className="metric-stat-box">
                <span className="metric-stat-label">Average Confidence</span>
                <span className="metric-stat-value">0.315</span>
                <span className="metric-stat-sub">Provider-returned signal</span>
              </div>

              <div className="metric-stat-box">
                <span className="metric-stat-label">Top-1 / Top-2 Margin</span>
                <span className="metric-stat-value">0.0705</span>
                <span className="metric-stat-sub">Low separation</span>
              </div>
            </div>

            {/* Methodological Definitions & Threshold Disclaimer */}
            <div className="replay-notes-block">
              <div className="replay-note-item">
                <span className="replay-note-term">Provider Confidence:</span>
                <span className="replay-note-def">
                  A provider-returned confidence signal. It is not treated as a calibrated
                  probability that the selected action is correct, and its exact internal
                  semantics are not assumed.
                </span>
              </div>

              <div className="replay-note-item">
                <span className="replay-note-term">Top-1 / Top-2 Margin:</span>
                <span className="replay-note-def">
                  Top-1 / top-2 margin is the numerical gap between the two highest action probabilities.
                </span>
              </div>

              <div className="replay-note-item">
                <span className="replay-note-term">Operational Threshold Caveat:</span>
                <span className="replay-note-def">
                  Small average margins appeared in several mixed-choice states observed in these experiments.
                  The study did not establish a numeric operational threshold.
                </span>
              </div>
            </div>

            {/* Replay Controls Footer */}
            <div className="replay-footer-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                Reset replay
              </button>
              <span className="replay-footer-meta">
                Historical record &bull; V5 consistency suite
              </span>
            </div>
          </div>
        )}

        {/* Screen Reader Live Region */}
        <div className="sr-only" aria-live="polite">
          {srAnnouncement}
        </div>
      </div>
    </section>
  )
}
