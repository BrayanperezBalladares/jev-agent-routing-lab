import React from 'react'
import { RESEARCH_NOTES } from '../data/research-results'

interface ConceptCardData {
  id: string
  title: string
  tag: string
  tagType: 'warning' | 'danger' | 'accent'
  explanation: string
  empiricalEvidence: string
}

const CONCEPT_CARDS: ConceptCardData[] = [
  {
    id: 'low-conf',
    title: 'Low Confidence \u2260 Incorrect',
    tag: 'Probability Dispersion',
    tagType: 'accent',
    explanation:
      'A router can select the correct action even when probability is diffusely spread across several viable candidates. In open-ended software tasks, multiple exploratory paths (e.g., searching code vs. inspecting tests) can carry plausible likelihood without invalidating the final pick.',
    empiricalEvidence:
      'Across diagnostic runs, valid exploratory choices regularly resolved with raw confidence in the 0.30–0.45 range while maintaining semantic fidelity.',
  },
  {
    id: 'high-conf',
    title: 'High Confidence \u2260 Universally Correct',
    tag: 'Spurious Certainty',
    tagType: 'danger',
    explanation:
      'High peak confidence can mask lexical bias, shortcut learning, or edge-case misclassification. A model can assign >0.95 confidence to a route based on strong surface keywords even when subtle semantic constraints dictate an alternative action.',
    empiricalEvidence:
      'The confidence field is a provider-returned confidence signal, not a calibrated probability that the selected action is correct across out-of-distribution inputs.',
  },
  {
    id: 'stability-margin',
    title: 'Empirical Stability \u2260 Internal Certainty',
    tag: 'Determinism vs Margin',
    tagType: 'warning',
    explanation:
      'A 100% selection rate across repeated identical runs can coexist with a narrow probability margin. The model may repeatedly choose the same winner, but remain perilously close to an alternative candidate.',
    empiricalEvidence:
      'In V8-C2, 10 of 10 runs selected SEARCH_CODE (100% empirical stability), yet the average margin was only 0.284 with a runner-up probability of 0.250.',
  },
]

export const ConfidenceStabilitySection: React.FC = () => {
  return (
    <section
      className="section-container confidence-stability-section"
      aria-labelledby="confidence-stability-heading"
    >
      <header className="section-header">
        <div className="section-header-content">
          <h2 id="confidence-stability-heading" className="section-title">
            Confidence, Margin &amp; Stability Mechanics
            <span className="badge badge-accent">Educational Foundations</span>
          </h2>
          <p className="section-description">
            Analysis of metric behaviors at semantic decision frontiers. Why
            one-shot confidence scores, top-candidate margins, and empirical
            repetition cannot be treated as interchangeable indicators of safety.
          </p>
        </div>
      </header>

      {/* Core Conceptual Cards */}
      <div className="concept-grid">
        {CONCEPT_CARDS.map((concept) => (
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
            <span className="badge badge-purple">Mathematical Definition</span>
            <h3 className="formula-title">Decision Boundary Margin</h3>
          </div>
          <span className="formula-badge">Key Diagnostic Metric</span>
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
              The scalar difference between the probability assigned to the
              highest-ranked action and the immediate runner-up candidate action.
            </p>
          </div>

          <div className="formula-mechanics-grid">
            <div className="mechanic-item">
              <span className="mechanic-tag boundary">
                As margin &rarr; 0.00
              </span>
              <p className="mechanic-text">
                The router operates near an empirical semantic decision boundary.
                Observed evaluations showed stochastic alternation between candidate
                actions (e.g., <code>SEARCH_CODE</code> vs <code>ASK_USER</code>).
              </p>
            </div>

            <div className="mechanic-item">
              <span className="mechanic-tag separated">
                As margin &rarr; 1.00
              </span>
              <p className="mechanic-text">
                The router exhibits clear internal separation between the top
                candidate and runner-up, coinciding with consistent routing in the
                tested runs.
              </p>
            </div>
          </div>
        </div>

        {/* Universal Threshold Avoidance Note */}
        <div className="threshold-caveat-card">
          <div className="caveat-header">
            <span className="badge badge-warning">Caution</span>
            <strong className="caveat-title">
              No Universal Safety Threshold
            </strong>
          </div>
          <p className="caveat-body">
            Empirical observation confirms that margin magnitude is domain- and
            policy-specific. Asserting universal production rules (e.g.{' '}
            <em>&ldquo;margin &lt; 0.2 is always unsafe&rdquo;</em>) is invalid.
            The required safety margin depends on the cost asymmetry between
            candidate actions: selecting between two read-only queries warrants
            a different threshold than selecting between autonomous file editing
            and human escalation.
          </p>
        </div>
      </article>

      {/* Canonical Warnings from RESEARCH_NOTES */}
      <section className="warnings-section" aria-label="Canonical Research Warnings">
        <h3 className="warnings-section-title">
          Canonical Research Methodological Warnings
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
              <span className="badge badge-purple">Diagnostic Nature</span>
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
