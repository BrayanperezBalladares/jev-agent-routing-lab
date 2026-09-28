import React from 'react'

interface ResearchArea {
  id: string
  title: string
  description: string
  badge: string
}

const RESEARCH_AREAS: ResearchArea[] = [
  {
    id: 'accuracy',
    title: 'Semantic Routing Accuracy',
    description:
      'Measuring multi-candidate action selection across nuanced software-engineering scenarios against ground-truth intent.',
    badge: 'Evaluation',
  },
  {
    id: 'stability',
    title: 'Repeated Decision Stability',
    description:
      'Quantifying stochastic routing drift across 10–20 identical prompt evaluations to expose hidden non-determinism.',
    badge: 'Reliability',
  },
  {
    id: 'uncertainty',
    title: 'Routing Uncertainty',
    description:
      'Analyzing top-1/top-2 candidate probability margins and raw confidence distributions across boundary transitions.',
    badge: 'Metrics',
  },
  {
    id: 'boundary',
    title: 'ASK_USER ↔ SEARCH_CODE Boundaries',
    description:
      'Characterizing the observed semantic transition where agents alternate between requesting user clarification and autonomous codebase inspection.',
    badge: 'Decision Frontier',
  },
  {
    id: 'state-rep',
    title: 'Agent-State Representation',
    description:
      'Evaluating how explicitly structuring unresolved operational information coincided with reduced choice instability and stable routing in the tested runs.',
    badge: 'Ablation',
  },
]

export const ResearchOverview: React.FC = () => {
  return (
    <section className="section-container" id="research-overview" aria-label="Research Scope and Focus Areas">
      <div className="section-header">
        <div className="section-badge-row">
          <span className="badge badge-accent">Scope & Objectives</span>
          <span className="badge">5 Core Pillars</span>
        </div>
        <h2 className="section-title">Research Overview & Methodology</h2>
        <p className="section-subtitle">
          Investigating semantic decision stability, probability separation, and state formulation for autonomous engineering agents beyond superficial one-shot benchmarks.
        </p>
      </div>

      {/* Research Areas Grid */}
      <div className="hero-research-areas">
        <div className="hero-areas-grid">
          {RESEARCH_AREAS.map((area) => (
            <article key={area.id} className="hero-area-card">
              <div className="hero-area-top">
                <h3 className="hero-area-title">{area.title}</h3>
                <span className="badge">{area.badge}</span>
              </div>
              <p className="hero-area-desc">{area.description}</p>
            </article>
          ))}
        </div>
      </div>

      {/* Methodology Distinction Callout Cards */}
      <div className="hero-distinction-section" style={{ marginTop: '24px' }}>
        <div className="distinction-grid">
          <article className="distinction-card frozen">
            <div className="distinction-header">
              <span className="badge badge-success">V1–V3</span>
              <h3 className="distinction-title">Benchmark Progression</h3>
            </div>
            <p className="distinction-text">
              Standard frozen evaluation suite progressing from initial baseline validation (V1, 20 cases) to hard semantic distinctions (V2, 30 cases) and balanced holdout (V3, 50 cases). Designed to measure macro semantic accuracy under stationary conditions.
            </p>
            <div className="distinction-footer">
              <span className="distinction-meta">
                Frozen test distribution &bull; Balanced action distribution &bull; Stationary holdout
              </span>
            </div>
          </article>

          <article className="distinction-card diagnostic">
            <div className="distinction-header">
              <span className="badge badge-warning">V4–V8</span>
              <h3 className="distinction-title">Adaptive Diagnostic Experiments</h3>
            </div>
            <p className="distinction-text">
              Targeted adversarial minimal pairs (V4), cue-stripped prompts (V5), and repeated boundary exploration suites (V6–V8) probing routing edge cases, margin collapse, and state representation.
            </p>
            <div className="distinction-notice">
              <strong className="notice-highlight">Methodological Note:</strong>{' '}
              V4–V8 are adaptive diagnostic experiments, NOT untouched holdouts.
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default ResearchOverview
