import React from 'react'
import {
  HOLDOUT_COMPARISON,
  BOUNDARY_EVOLUTION,
  V8_IMPLEMENTATION_EXPLICITNESS,
} from '../data/research-results'

export const Hero: React.FC = () => {
  const jevHoldout = HOLDOUT_COMPARISON.find((r) => r.id === 'jev')
  const ruleHoldout = HOLDOUT_COMPARISON.find((r) => r.id === 'rules')

  const margins = BOUNDARY_EVOLUTION.map((b) => b.averageMargin)
  const maxMargin = Math.max(...margins).toFixed(2)
  const minMargin = Math.min(...margins).toFixed(3)

  const c1Variant = V8_IMPLEMENTATION_EXPLICITNESS.find((v) => v.id === 'C1')
  const c1Instability = c1Variant ? `${c1Variant.instabilityRatePct}%` : '20%'

  return (
    <header className="hero-section" id="hero" aria-label="Jev Agent Routing Lab Hero">
      <div className="hero-header-top">
        <div className="hero-title-group">
          <div className="hero-badge-row">
            <span className="badge badge-accent">Research Lab</span>
            <span className="badge badge-purple">Empirical Evaluation</span>
            <span className="badge">Frozen Data Ground Truth</span>
          </div>
          <h1 className="hero-title">Jev Agent Routing Lab</h1>
          <p className="hero-subtitle">
            Semantic routing, stability, and decision-boundary analysis for
            software-engineering agents.
          </p>
        </div>
      </div>

      {/* Compact Headline Metrics */}
      <section className="hero-metrics" aria-label="Key Headline Metrics">
        <div className="metric-grid metric-grid-4">
          <div className="metric-card">
            <div className="metric-label">
              <span>Jev Holdout Accuracy</span>
              <span className="badge badge-success">V3 Holdout</span>
            </div>
            <div className="metric-value">
              {jevHoldout?.semanticAccuracySuccessfulPct ?? 100}%
            </div>
            <div className="metric-subtext">
              {jevHoldout?.correctSuccessfulResponses ?? 50}/
              {jevHoldout?.attempts ?? 50} correct responses (frozen suite)
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">
              <span>Rule Baseline Accuracy</span>
              <span className="badge badge-warning">Keyword Router</span>
            </div>
            <div className="metric-value">
              {ruleHoldout?.semanticAccuracySuccessfulPct ?? 48}%
            </div>
            <div className="metric-subtext">
              {ruleHoldout?.correctSuccessfulResponses ?? 24}/
              {ruleHoldout?.attempts ?? 50} correct (lexical matching ceiling)
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">
              <span>Boundary Margin Span</span>
              <span className="badge badge-accent">Top-1 / Top-2</span>
            </div>
            <div className="metric-value">
              {maxMargin} &rarr; {minMargin}
            </div>
            <div className="metric-subtext">
              Observed minimum margin of {minMargin} at boundary state V8-C1
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-label">
              <span>Explicitness Impact</span>
              <span className="badge badge-purple">V8 Ablation</span>
            </div>
            <div className="metric-value">
              {c1Instability} &rarr; 0%
            </div>
            <div className="metric-subtext">
              {c1Instability} boundary instability in C1 dropping to 0% in C2–C6
            </div>
          </div>
        </div>
      </section>
    </header>
  )
}

export default Hero
