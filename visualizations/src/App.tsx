import React, { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import { ThemeProvider } from './theme'
import { HeaderNav } from './components/HeaderNav'
import { Hero } from './components/Hero'
import { ResearchOverview } from './components/ResearchOverview'
import {
  AgentScenarioSandbox,
  HistoricRunReplay,
  MarginDeconstructor,
  ExplicitnessLadder,
} from './components/story'
import { ConfidenceStabilitySection } from './components/ConfidenceStabilitySection'
import { ResearchConclusion } from './components/ResearchConclusion'
import { MethodologyNotes } from './components/MethodologyNotes'

const HoldoutComparisonChart = React.lazy(
  () => import('./components/HoldoutComparisonChart')
)
const BenchmarkProgressionChart = React.lazy(
  () => import('./components/BenchmarkProgressionChart')
)
const DecisionBoundaryChart = React.lazy(
  () => import('./components/DecisionBoundaryChart')
)
const V8ExplicitnessChart = React.lazy(
  () => import('./components/V8ExplicitnessChart')
)

const ChartLoadingFallback: React.FC = () => {
  const { t } = useTranslation(['common'])
  return (
    <div className="chart-card" style={{ minHeight: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="badge badge-accent">{t('common.loading')}</span>
    </div>
  )
}

const DashboardContent: React.FC = () => {
  const { t } = useTranslation(['common'])

  return (
    <div className="dashboard-container">
      {/* Monograph Sticky Header with Theme & Language Controls */}
      <HeaderNav />

      {/* Main Research Content (Interactive Narrative Flow) */}
      <main id="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {/* 1. Hero: Minimal Narrative Hook */}
        <Hero />

        {/* Phase 1 Story: Step 1 — Interactive Agent Scenario Sandbox */}
        <AgentScenarioSandbox />

        {/* Narrative Transition Banner 1 */}
        <div className="story-transition-banner" role="note" aria-label="Research transition note">
          <div className="transition-lead">
            {t('transitions.step1to2Lead')}
          </div>
          <p className="transition-caption">
            {t('transitions.step1to2Caption')}
          </p>
        </div>

        {/* Phase 1 Story: Step 2 — Historic Run Replay (V5U02) */}
        <HistoricRunReplay />

        {/* Phase 2 Transition Banner: Deconstructing the Boundary */}
        <div className="story-transition-banner" role="note" aria-label="Research transition note">
          <div className="transition-lead">
            {t('transitions.step2to3Lead')}
          </div>
          <p className="transition-caption">
            {t('transitions.step2to3Caption')}
          </p>
        </div>

        {/* Phase 2 Story: Step 3 — Margin Deconstructor */}
        <MarginDeconstructor />

        {/* Phase 2 Transition Banner: Representation and Formulation */}
        <div className="story-transition-banner" role="note" aria-label="Research transition note">
          <div className="transition-lead">
            {t('transitions.step3to4Lead')}
          </div>
          <p className="transition-caption">
            {t('transitions.step3to4Caption')}
          </p>
        </div>

        {/* Phase 2 Story: Step 4 — Explicitness Ladder (C1–C6) */}
        <ExplicitnessLadder />

        {/* Primary Insight Transition to Deep Dashboard */}
        <div className="story-transition-banner" role="note" aria-label="Research progression note">
          <div className="transition-lead">
            {t('common.keyTakeaways')}: One-shot accuracy can hide routing instability near semantic decision boundaries.
          </div>
          <p className="transition-caption">
            With the experiential foundations established, examine how specialized routing performs across stationary holdouts,
            diagnostic stress suites, and full research datasets in the deep analytical sections below.
          </p>
        </div>

        {/* Research Overview & Scope */}
        <ResearchOverview />

        {/* 3. V3 Holdout Router Comparison */}
        <Suspense fallback={<ChartLoadingFallback />}>
          <HoldoutComparisonChart />
        </Suspense>

        {/* 4. Jev Benchmark Progression */}
        <Suspense fallback={<ChartLoadingFallback />}>
          <BenchmarkProgressionChart />
        </Suspense>

        {/* 5. ASK_USER ↔ SEARCH_CODE Decision Boundary */}
        <Suspense fallback={<ChartLoadingFallback />}>
          <DecisionBoundaryChart />
        </Suspense>

        {/* 6. V8 Implementation-Explicitness Analysis */}
        <Suspense fallback={<ChartLoadingFallback />}>
          <V8ExplicitnessChart />
        </Suspense>

        {/* 7. Confidence, Margin, and Stability */}
        <ConfidenceStabilitySection />

        {/* 8. Research Conclusions */}
        <ResearchConclusion />

        {/* 9. Methodology and Limitations */}
        <MethodologyNotes />
      </main>

      {/* Dashboard Footer */}
      <footer className="footer-section" role="contentinfo">
        <div>
          <strong>Jev Agent Routing Lab</strong> &mdash; Typesafe Semantic Routing Evaluation for SE Agents
        </div>
        <div>
          Data Source: <code style={{ fontSize: '0.75rem' }}>research-results.ts</code> &bull; Frozen Ground Truth
        </div>
      </footer>
    </div>
  )
}

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  )
}

export default App
