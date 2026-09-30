import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  JEV_BENCHMARK_PROGRESSION,
  BOUNDARY_EVOLUTION,
  V8_IMPLEMENTATION_EXPLICITNESS,
  HOLDOUT_COMPARISON,
} from '../../data/research-results'

export type MilestoneId =
  | 'V1'
  | 'V2'
  | 'V3'
  | 'V4'
  | 'V5'
  | 'V5_repeat'
  | 'V6'
  | 'V7'
  | 'V8'

interface MilestoneMeta {
  id: MilestoneId
  displayId: string
  phase: 'validation' | 'diagnostic'
  canonicalDataKey?: string
}

const MILESTONES: MilestoneMeta[] = [
  { id: 'V1', displayId: 'V1', phase: 'validation' },
  { id: 'V2', displayId: 'V2', phase: 'validation' },
  { id: 'V3', displayId: 'V3', phase: 'validation' },
  { id: 'V4', displayId: 'V4', phase: 'diagnostic' },
  { id: 'V5', displayId: 'V5', phase: 'diagnostic' },
  { id: 'V5_repeat', displayId: 'V5 Rep', phase: 'diagnostic' },
  { id: 'V6', displayId: 'V6', phase: 'diagnostic' },
  { id: 'V7', displayId: 'V7', phase: 'diagnostic' },
  { id: 'V8', displayId: 'V8', phase: 'diagnostic' },
]

export const InvestigativeProgressionTimeline: React.FC = () => {
  const { t } = useTranslation(['story', 'common'])
  const [activeId, setActiveId] = useState<MilestoneId>('V1')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const activeIndex = MILESTONES.findIndex((m) => m.id === activeId)
  const activeMeta = MILESTONES[activeIndex]

  // Retrieve canonical research numbers to ensure ground-truth consistency
  const v1Data = JEV_BENCHMARK_PROGRESSION.find((b) => b.id === 'V1')
  const v2Data = JEV_BENCHMARK_PROGRESSION.find((b) => b.id === 'V2')
  const v3Data = JEV_BENCHMARK_PROGRESSION.find((b) => b.id === 'V3')
  const v3JevHoldout = HOLDOUT_COMPARISON.find((r) => r.id === 'jev')
  const v4Data = JEV_BENCHMARK_PROGRESSION.find((b) => b.id === 'V4')
  const v5Data = JEV_BENCHMARK_PROGRESSION.find((b) => b.id === 'V5')
  const v5RepeatData = BOUNDARY_EVOLUTION.find((b) => b.id === 'V5U02')
  const v6B3Data = BOUNDARY_EVOLUTION.find((b) => b.id === 'V6-B3')
  const v7A5Data = BOUNDARY_EVOLUTION.find((b) => b.id === 'V7-A5')
  const v8C1Data = V8_IMPLEMENTATION_EXPLICITNESS.find((c) => c.id === 'C1')
  const v8C2Data = V8_IMPLEMENTATION_EXPLICITNESS.find((c) => c.id === 'C2')

  const handleSelectMilestone = (id: MilestoneId) => {
    setActiveId(id)
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % MILESTONES.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + MILESTONES.length) % MILESTONES.length
    } else if (e.key === 'Home') {
      nextIndex = 0
    } else if (e.key === 'End') {
      nextIndex = MILESTONES.length - 1
    }

    if (nextIndex >= 0) {
      e.preventDefault()
      setActiveId(MILESTONES[nextIndex].id)
      tabRefs.current[nextIndex]?.focus()
    }
  }

  // Next milestone navigation helper
  const nextMilestone = activeIndex < MILESTONES.length - 1 ? MILESTONES[activeIndex + 1] : null

  return (
    <section
      className="story-section timeline-section"
      id="investigative-timeline"
      aria-label={t('timeline.title')}
    >
      <div className="story-header">
        <div className="story-badge-row">
          <span className="badge badge-accent">{t('timeline.badge')}</span>
          <span className="badge">{t('timeline.badge2')}</span>
        </div>
        <h2 className="story-title">{t('timeline.title')}</h2>
        <p className="story-subtitle">{t('timeline.subtitle')}</p>
      </div>

      {/* Screen-reader keyboard instructions */}
      <p className="sr-only">{t('timeline.keyboardHint')}</p>

      {/* Main Two-Column Investigative Layout */}
      <div className="timeline-workbench">
        {/* Left Column: Milestone Research Rail */}
        <aside className="timeline-rail" aria-label={t('timeline.milestoneSelectorLabel')}>
          {/* Phase 1 Group: Validation / Benchmark */}
          <div className="timeline-phase-group">
            <div className="phase-header">
              <span className="phase-indicator-dot dot-validation" aria-hidden="true" />
              <div className="phase-text-block">
                <span className="phase-title">{t('timeline.phaseValidation')}</span>
                <span className="phase-sub">{t('timeline.phaseValidationDesc')}</span>
              </div>
            </div>

            <div className="milestone-buttons-list" role="tablist" aria-orientation="vertical">
              {MILESTONES.filter((m) => m.phase === 'validation').map((m) => {
                const idx = MILESTONES.findIndex((item) => item.id === m.id)
                const isSelected = activeId === m.id
                return (
                  <button
                    key={m.id}
                    ref={(el) => { tabRefs.current[idx] = el }}
                    id={`timeline-tab-${m.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`timeline-panel-${m.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    className={`timeline-milestone-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectMilestone(m.id)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                  >
                    <span className="milestone-btn-id">{m.displayId}</span>
                    <span className="milestone-btn-name">{t(`timeline.milestones.${m.id}.name`)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Investigative Pivot Ruled Divider */}
          <div className="timeline-pivot-divider" role="separator" aria-label={t('timeline.pivotTitle')}>
            <span className="pivot-line" aria-hidden="true" />
            <span className="pivot-badge">{t('timeline.pivotKicker')}</span>
            <span className="pivot-line" aria-hidden="true" />
          </div>

          {/* Phase 2 Group: Adaptive Diagnostics */}
          <div className="timeline-phase-group">
            <div className="phase-header">
              <span className="phase-indicator-dot dot-diagnostic" aria-hidden="true" />
              <div className="phase-text-block">
                <span className="phase-title">{t('timeline.phaseDiagnostic')}</span>
                <span className="phase-sub">{t('timeline.phaseDiagnosticDesc')}</span>
              </div>
            </div>

            <div className="milestone-buttons-list" role="tablist" aria-orientation="vertical">
              {MILESTONES.filter((m) => m.phase === 'diagnostic').map((m) => {
                const idx = MILESTONES.findIndex((item) => item.id === m.id)
                const isSelected = activeId === m.id
                return (
                  <button
                    key={m.id}
                    ref={(el) => { tabRefs.current[idx] = el }}
                    id={`timeline-tab-${m.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={`timeline-panel-${m.id}`}
                    tabIndex={isSelected ? 0 : -1}
                    className={`timeline-milestone-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectMilestone(m.id)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                  >
                    <span className="milestone-btn-id">{m.displayId}</span>
                    <span className="milestone-btn-name">{t(`timeline.milestones.${m.id}.name`)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Right Column: Active Milestone Narrative Panel */}
        <article
          id={`timeline-panel-${activeId}`}
          className="timeline-narrative-panel"
          role="tabpanel"
          aria-labelledby={`timeline-tab-${activeId}`}
        >
          {/* Active Milestone Meta Bar */}
          <div className="panel-meta-bar">
            <div className="panel-id-group">
              <span className="badge badge-accent">{activeMeta.displayId}</span>
              <span className="panel-milestone-title">
                {t(`timeline.milestones.${activeId}.name`)}
              </span>
            </div>
            <span className={`badge ${activeMeta.phase === 'validation' ? 'badge-validation' : 'badge-diagnostic'}`}>
              {activeMeta.phase === 'validation' ? t('timeline.phaseValidation') : t('timeline.phaseDiagnostic')}
            </span>
          </div>

          {/* Layer 1: The Research Question (Visually Dominant) */}
          <div className="timeline-layer layer-question">
            <span className="layer-tag">{t('timeline.layerQuestion')}</span>
            <h3 className="layer-question-text">
              &ldquo;{t(`timeline.milestones.${activeId}.question`)}&rdquo;
            </h3>
          </div>

          {/* Layer 2: Experimental Test Formulation */}
          <div className="timeline-layer layer-test">
            <span className="layer-tag">{t('timeline.layerTest')}</span>
            <p className="layer-text">{t(`timeline.milestones.${activeId}.test`)}</p>
          </div>

          {/* Layer 3: Observed Findings & Empirical Evidence */}
          <div className="timeline-layer layer-observed">
            <span className="layer-tag">{t('timeline.layerObserved')}</span>
            <p className="layer-text">{t(`timeline.milestones.${activeId}.observed`)}</p>

            {/* Contextual Supporting Quantitative Pill Row */}
            <div className="evidence-pills-row" aria-label="Observed empirical metrics">
              {activeId === 'V1' && v1Data && (
                <>
                  <span className="evidence-pill">Exact Matches: <strong>{v1Data.correctSuccessfulResponses}/{v1Data.attempts} (100%)</strong></span>
                  <span className="evidence-pill">Avg Conf: <strong>{v1Data.averageConfidence}</strong></span>
                  <span className="evidence-pill">Est. Cost: <strong>~$0.000383</strong></span>
                </>
              )}
              {activeId === 'V2' && v2Data && (
                <>
                  <span className="evidence-pill">Exact Matches: <strong>{v2Data.correctSuccessfulResponses}/{v2Data.attempts} (100%)</strong></span>
                  <span className="evidence-pill">Avg Conf: <strong>{v2Data.averageConfidence}</strong></span>
                  <span className="evidence-pill">Est. Cost: <strong>~$0.000583</strong></span>
                </>
              )}
              {activeId === 'V3' && v3Data && (
                <>
                  <span className="evidence-pill">Exact Matches: <strong>{v3Data.correctSuccessfulResponses}/{v3Data.attempts} (100%)</strong></span>
                  <span className="evidence-pill">Avg Conf: <strong>{v3Data.averageConfidence}</strong></span>
                  <span className="evidence-pill">Jev Median Latency: <strong>{v3JevHoldout?.medianLatencyMs}ms</strong></span>
                  <span className="evidence-pill">Reference Comparators: <strong>Descriptive Only</strong></span>
                </>
              )}
              {activeId === 'V4' && v4Data && (
                <>
                  <span className="evidence-pill">Semantic Accuracy: <strong>39/39 (100%)</strong></span>
                  <span className="evidence-pill">Op. Success: <strong>{v4Data.requestSuccessRatePct}%</strong> (1 infra timeout)</span>
                  <span className="evidence-pill">Avg Conf: <strong>{v4Data.averageConfidence}</strong></span>
                </>
              )}
              {activeId === 'V5' && v5Data && (
                <>
                  <span className="evidence-pill">Semantic Accuracy: <strong>39/39 (100%)</strong></span>
                  <span className="evidence-pill">Op. Success: <strong>{v5Data.requestSuccessRatePct}%</strong></span>
                  <span className="evidence-pill">Avg Conf: <strong>{v5Data.averageConfidence}</strong></span>
                  <span className="evidence-pill pill-alert">V5U02 Low Separation Exposed</span>
                </>
              )}
              {activeId === 'V5_repeat' && v5RepeatData && (
                <>
                  <span className="evidence-pill">Runs: <strong>{v5RepeatData.runs}</strong></span>
                  <span className="evidence-pill">SEARCH: <strong>{v5RepeatData.searchCodeCount} (70%)</strong></span>
                  <span className="evidence-pill">ASK: <strong>{v5RepeatData.askUserCount} (30%)</strong></span>
                  <span className="evidence-pill">Avg Conf: <strong>{v5RepeatData.averageConfidence}</strong></span>
                  <span className="evidence-pill">Avg Margin: <strong>{v5RepeatData.averageMargin}</strong></span>
                </>
              )}
              {activeId === 'V6' && v6B3Data && (
                <>
                  <span className="evidence-pill">Probe: <strong>{v6B3Data.id}</strong></span>
                  <span className="evidence-pill">Split: <strong>{v6B3Data.searchCodeCount} SEARCH / {v6B3Data.askUserCount} ASK</strong></span>
                  <span className="evidence-pill">Avg Margin: <strong>{v6B3Data.averageMargin}</strong></span>
                </>
              )}
              {activeId === 'V7' && v7A5Data && (
                <>
                  <span className="evidence-pill">Probe: <strong>{v7A5Data.id}</strong></span>
                  <span className="evidence-pill">Split: <strong>{v7A5Data.searchCodeCount} SEARCH / {v7A5Data.askUserCount} ASK</strong></span>
                  <span className="evidence-pill">Avg Margin: <strong>{v7A5Data.averageMargin}</strong></span>
                </>
              )}
              {activeId === 'V8' && v8C1Data && v8C2Data && (
                <>
                  <span className="evidence-pill">C1 Instability: <strong>{v8C1Data.instabilityRatePct}%</strong> (margin: {v8C1Data.averageMargin})</span>
                  <span className="evidence-pill">C2 Stability: <strong>10/0 SEARCH</strong> (margin: {v8C2Data.averageMargin})</span>
                  <span className="evidence-pill">C3–C6: <strong>0% Mixed</strong> (margin: 0.98–1.00)</span>
                </>
              )}
            </div>
          </div>

          {/* Layer 4: Next Question & Emerging Uncertainty */}
          <div className="timeline-layer layer-next">
            <span className="layer-tag">{t('timeline.layerNextQuestion')}</span>
            <p className="layer-next-text">{t(`timeline.milestones.${activeId}.nextQuestion`)}</p>

            {nextMilestone && (
              <div className="next-milestone-action-row">
                <button
                  type="button"
                  className="btn-next-milestone"
                  onClick={() => handleSelectMilestone(nextMilestone.id)}
                >
                  <span>{t('timeline.jumpToNext', { id: nextMilestone.displayId })}</span>
                  <span aria-hidden="true">&rarr;</span>
                </button>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}

export default InvestigativeProgressionTimeline
