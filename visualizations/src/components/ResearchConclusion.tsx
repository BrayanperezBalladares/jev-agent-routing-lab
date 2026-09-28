import React from 'react'
import {
  RESEARCH_NOTES,
  HOLDOUT_COMPARISON,
  BOUNDARY_EVOLUTION,
  V8_IMPLEMENTATION_EXPLICITNESS,
} from '../data/research-results'

export const ResearchConclusion: React.FC = () => {
  const jevHoldout = HOLDOUT_COMPARISON.find((r) => r.id === 'jev')
  const ruleHoldout = HOLDOUT_COMPARISON.find((r) => r.id === 'rules')
  const minBoundaryMargin = Math.min(
    ...BOUNDARY_EVOLUTION.map((b) => b.averageMargin)
  ).toFixed(3)
  const c1Instability =
    V8_IMPLEMENTATION_EXPLICITNESS.find((v) => v.id === 'C1')
      ?.instabilityRatePct ?? 20

  return (
    <section
      className="section-container research-conclusion-section"
      aria-labelledby="research-conclusions-heading"
    >
      <header className="section-header">
        <div className="section-header-content">
          <h2 id="research-conclusions-heading" className="section-title">
            Research Conclusions &amp; Synthesis
            <span className="badge badge-accent">Core Insights</span>
          </h2>
          <p className="section-description">
            Synthesis of empirical findings across frozen holdout suites,
            boundary evolution probes, and state-explicitness ablations.
          </p>
        </div>
      </header>

      {/* Primary Takeaway Hero Card */}
      <article
        className="conclusion-primary-card"
        aria-label="Primary Research Finding"
      >
        <div className="conclusion-primary-header">
          <span className="badge badge-accent">Primary Takeaway</span>
          <span className="conclusion-source-tag">
            Cross-Experiment Finding
          </span>
        </div>
        <blockquote className="conclusion-primary-quote">
          &ldquo;{RESEARCH_NOTES.primaryFinding}&rdquo;
        </blockquote>
        <p className="conclusion-primary-desc">
          In our evaluated software-engineering agent routing setting, single-pass
          benchmark evaluations masked empirical routing instability. Even when achieving
          100% one-shot accuracy on balanced benchmarks, repeated evaluations under
          identical conditions uncovered stochastic switching between{' '}
          <code>ASK_USER</code> and <code>SEARCH_CODE</code> near subtle decision boundaries.
        </p>
      </article>

      {/* Secondary Takeaway Card */}
      <article
        className="conclusion-secondary-card"
        aria-label="Secondary Research Finding"
      >
        <div className="conclusion-secondary-header">
          <span className="badge badge-purple">Secondary Takeaway</span>
          <span className="conclusion-source-tag">
            State-Representation Finding
          </span>
        </div>
        <blockquote className="conclusion-secondary-quote">
          &ldquo;{RESEARCH_NOTES.stateRepresentationFinding}&rdquo;
        </blockquote>
        <p className="conclusion-secondary-desc">
          In the tested routing setting, decision stability was strongly associated with
          how the prompt represented unresolved operational context. When prompts solely
          stated requirements, the router exhibited boundary instability. Explicitly
          articulating that implementation location was unknown coincided with progression
          toward stable <code>SEARCH_CODE</code> routing and widened margin separation from{' '}
          {minBoundaryMargin} to 1.00 in the tested runs.
        </p>
      </article>

      {/* Tripartite Empirical Synthesis Grid */}
      <div className="conclusion-synthesis-grid">
        <article className="synthesis-card">
          <div className="synthesis-card-header">
            <span className="badge badge-success">Holdout Synthesis</span>
            <h3 className="synthesis-card-title">Macro Semantic Accuracy</h3>
          </div>
          <p className="synthesis-card-body">
            On the frozen balanced holdout suite (V3), specialized semantic
            routing achieved {jevHoldout?.semanticAccuracySuccessfulPct ?? 100}%
            accuracy ({jevHoldout?.correctSuccessfulResponses ?? 50}/
            {jevHoldout?.attempts ?? 50} correct), decisively outperforming the
            deterministic keyword baseline of{' '}
            {ruleHoldout?.semanticAccuracySuccessfulPct ?? 48}% (
            {ruleHoldout?.correctSuccessfulResponses ?? 24}/
            {ruleHoldout?.attempts ?? 50} correct). However, high macro accuracy
            alone does not predict boundary stability in non-stationary workflows.
          </p>
          <div className="synthesis-card-footer">
            <span className="synthesis-metric">
              Holdout Delta: +
              {(jevHoldout?.semanticAccuracySuccessfulPct ?? 100) -
                (ruleHoldout?.semanticAccuracySuccessfulPct ?? 48)}
              % vs Lexical Baseline
            </span>
          </div>
        </article>

        <article className="synthesis-card">
          <div className="synthesis-card-header">
            <span className="badge badge-warning">Boundary Evolution</span>
            <h3 className="synthesis-card-title">Stochastic Oscillation</h3>
          </div>
          <p className="synthesis-card-body">
            Probing identical states across repeated evaluations (V5–V8) exposed
            significant stochastic switching at the decision frontier. In state
            V5U02, choices split 70% <code>SEARCH_CODE</code> and 30%{' '}
            <code>ASK_USER</code> with a narrow margin of 0.0705. Across
            boundary evolutions, the minimum observed margin compressed down to{' '}
            {minBoundaryMargin}, showing that the router oscillated when operational
            cues were ambiguous in the evaluated runs.
          </p>
          <div className="synthesis-card-footer">
            <span className="synthesis-metric">
              Boundary Margin Compression: Down to {minBoundaryMargin}
            </span>
          </div>
        </article>

        <article className="synthesis-card">
          <div className="synthesis-card-header">
            <span className="badge badge-purple">Explicitness Ablation</span>
            <h3 className="synthesis-card-title">Operational Disambiguation</h3>
          </div>
          <p className="synthesis-card-body">
            In the V8 ablation suite, variant C1 (specifying requirements only)
            demonstrated a {c1Instability}% decision-boundary instability rate.
            By systematically introducing explicit state cues regarding missing
            implementation details (variants C2 through C6), instability
            dropped to 0% across all runs while confidence and margin climbed to
            near-maximal separation.
          </p>
          <div className="synthesis-card-footer">
            <span className="synthesis-metric">
              Instability Reduction: {c1Instability}% &rarr; 0% (C1 vs C2–C6)
            </span>
          </div>
        </article>
      </div>
    </section>
  )
}

export default ResearchConclusion
