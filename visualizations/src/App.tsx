import React, { Suspense } from 'react'
import './App.css'
import { Hero } from './components/Hero'
import { ResearchOverview } from './components/ResearchOverview'
import { AgentScenarioSandbox, HistoricRunReplay } from './components/story'
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

const ChartLoadingFallback: React.FC = () => (
  <div className="chart-card" style={{ minHeight: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span className="badge badge-accent">Loading Research Visualization...</span>
  </div>
)

export const App: React.FC = () => {
  return (
    <div className="dashboard-container">
      {/* Sticky Quick-Navigation Header */}
      <nav className="app-header-nav" aria-label="Dashboard Section Navigation">
        <div className="nav-brand-group">
          <span className="badge badge-accent">JEV LAB</span>
          <span className="nav-brand-title">Agent Routing Research</span>
        </div>
        <div className="nav-links">
          <a href="#hero" className="nav-anchor">Hero</a>
          <a href="#agent-scenario-sandbox" className="nav-anchor">Scenario Sandbox</a>
          <a href="#historic-run-replay" className="nav-anchor">Boundary Replay</a>
          <a href="#research-overview" className="nav-anchor">Overview</a>
          <a href="#holdout-comparison" className="nav-anchor">Holdout</a>
          <a href="#benchmark-progression" className="nav-anchor">Progression</a>
          <a href="#decision-boundary" className="nav-anchor">Boundary</a>
          <a href="#v8-explicitness" className="nav-anchor">V8 Ablation</a>
          <a href="#confidence-stability" className="nav-anchor">Confidence & Margin</a>
          <a href="#conclusions" className="nav-anchor">Conclusions</a>
          <a href="#methodology" className="nav-anchor">Methodology</a>
        </div>
      </nav>

      {/* Main Research Content (Interactive Narrative Flow) */}
      <main id="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {/* 1. Hero: Minimal Narrative Hook */}
        <Hero />

        {/* Phase 1 Story: Step 1 — Interactive Agent Scenario Sandbox */}
        <AgentScenarioSandbox />

        {/* Short Narrative Transition Banner 1 */}
        <div className="story-transition-banner" role="note" aria-label="Research transition note">
          <div className="transition-lead">
            A correct one-shot decision still leaves another question: is that decision stable?
          </div>
          <p className="transition-caption">
            In production agent workflows, single-pass evaluations can mask underlying sensitivity.
            When ambiguous operational states are presented repeatedly, how consistently does a semantic evaluator choose the same action?
          </p>
        </div>

        {/* Phase 1 Story: Step 2 — Historic Run Replay (V5U02) */}
        <HistoricRunReplay />

        {/* Primary Insight Transition to Deep Dashboard */}
        <div className="story-transition-banner" role="note" aria-label="Research progression note">
          <div className="transition-lead">
            Primary Insight: One-shot accuracy can hide routing instability near semantic decision boundaries.
          </div>
          <p className="transition-caption">
            With the boundary concept established, examine how Jev performs across stationary holdouts, diagnostic stress suites, and implementation-explicitness ablations in the research dashboard below.
          </p>
        </div>

        {/* 2. Research Overview & Scope (Repositioned after experiential story) */}
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

export default App
