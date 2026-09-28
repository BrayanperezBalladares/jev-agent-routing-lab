import React from 'react'
import { RESEARCH_NOTES } from '../data/research-results'

interface MethodologyItem {
  id: string
  title: string
  category: string
  badgeType: 'accent' | 'warning' | 'purple' | 'danger'
  content: string
  canonicalNote?: string
}

const METHODOLOGY_ITEMS: MethodologyItem[] = [
  {
    id: 'synthetic-scenarios',
    title: 'Synthetic SE Scenarios',
    category: 'Scope & Domain',
    badgeType: 'accent',
    content:
      'Scenarios represent bounded, isolated software-engineering situations constructed to evaluate single-step routing choices. They deliberately omit full multi-turn conversational history, developer feedback loops, and live file tree modifications.',
  },
  {
    id: 'fixed-action-space',
    title: 'Fixed Action Space',
    category: 'Action Framing',
    badgeType: 'purple',
    content:
      'Routing targets are constrained to five discrete canonical actions: SEARCH_CODE, ASK_USER, RUN_TESTS, EDIT_FILE, and FINISH_TASK. This protocol measures discrimination among defined action slots, not open-ended agent reasoning or dynamic tool creation.',
  },
  {
    id: 'diagnostic-suites',
    title: 'Diagnostic Suites (V4–V8)',
    category: 'Dataset Nature',
    badgeType: 'warning',
    content:
      'Suites V4 through V8 were iteratively curated to stress-test semantic boundaries, minimal pairs, and cue-stripping. As formalized in research guidelines, these suites are adaptive diagnostic probes, NOT untouched holdouts.',
    canonicalNote: RESEARCH_NOTES.diagnosticWarning,
  },
  {
    id: 'repeated-runs',
    title: 'Repeated Identical Runs',
    category: 'Sampling Dynamics',
    badgeType: 'warning',
    content:
      'Evaluating identical input text repeatedly across 10 to 20 runs characterizes empirical stochastic behavior under real inference conditions. These runs quantify decision drift, but do not represent independent statistical observations.',
    canonicalNote: RESEARCH_NOTES.repetitionWarning,
  },
  {
    id: 'provider-variability',
    title: 'Provider Infrastructure Variability',
    category: 'Execution Environment',
    badgeType: 'purple',
    content:
      'Jev, GPT-5-mini, and Nemotron Ultra operated through distinct infrastructure stacks, cloud gateways, and geographic endpoints. Operational latencies, network timeouts, and gateway retries reflect these diverse runtime conditions.',
  },
  {
    id: 'confidence-calibration',
    title: 'Confidence Calibration Limits',
    category: 'Metric Boundaries',
    badgeType: 'danger',
    content:
      'Confidence is a provider-returned signal and is not treated as a calibrated probability that the selected action is correct.',
    canonicalNote: RESEARCH_NOTES.confidenceWarning,
  },
  {
    id: 'latency-cost-comparability',
    title: 'Latency & Cost Comparability',
    category: 'Comparative Validity',
    badgeType: 'accent',
    content:
      'Cost and latency figures across models cannot be interpreted as a universal benchmark leaderboard. As noted in research findings, pricing basis (observed gateway market cost vs. theoretical list price vs. free experimental tier) and retry policies varied.',
    canonicalNote: RESEARCH_NOTES.comparatorWarning,
  },
]

export const MethodologyNotes: React.FC = () => {
  return (
    <section
      className="section-container methodology-section"
      aria-labelledby="methodology-notes-heading"
    >
      <header className="section-header">
        <div className="section-header-content">
          <h2 id="methodology-notes-heading" className="section-title">
            Research Methodology &amp; Limitations
            <span className="badge badge-warning">Experimental Boundaries</span>
          </h2>
          <p className="section-description">
            Critical constraints, environmental conditions, and methodological
            parameters governing the interpretation of these experimental
            findings.
          </p>
        </div>
      </header>

      <div className="methodology-grid">
        {METHODOLOGY_ITEMS.map((item) => (
          <article key={item.id} className="methodology-card">
            <div className="methodology-card-header">
              <span className={`badge badge-${item.badgeType}`}>
                {item.category}
              </span>
              <h3 className="methodology-card-title">{item.title}</h3>
            </div>
            <p className="methodology-card-content">{item.content}</p>
            {item.canonicalNote && (
              <div className="methodology-card-note">
                <span className="note-label">Canonical Reference:</span>{' '}
                <em>&ldquo;{item.canonicalNote}&rdquo;</em>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default MethodologyNotes
