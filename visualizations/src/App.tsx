import React from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import { ThemeProvider } from './theme'
import { HeaderNav } from './components/HeaderNav'
import { Hero } from './components/Hero'
import {
  AgentScenarioSandbox,
  HistoricRunReplay,
  MarginDeconstructor,
  ExplicitnessLadder,
  InvestigativeProgressionTimeline,
  UncertaintyGovernorSchema,
} from './components/story'
import { DeepDataLab } from './components/lab/DeepDataLab'
import { MethodologyNotes } from './components/MethodologyNotes'
import { ResearchConclusion } from './components/ResearchConclusion'

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

        {/* Phase 3 Transition Banner: Investigative Trail */}
        <div className="story-transition-banner" role="note" aria-label="Research transition note">
          <div className="transition-lead">
            {t('transitions.step4to5Lead')}
          </div>
          <p className="transition-caption">
            {t('transitions.step4to5Caption')}
          </p>
        </div>

        {/* Phase 3 Story: Step 5 — Investigative Progression Timeline (V1–V8) */}
        <InvestigativeProgressionTimeline />

        {/* Phase 3 Transition Banner: Future Agent Architecture */}
        <div className="story-transition-banner" role="note" aria-label="Research transition note">
          <div className="transition-lead">
            {t('transitions.step5to6Lead')}
          </div>
          <p className="transition-caption">
            {t('transitions.step5to6Caption')}
          </p>
        </div>

        {/* Phase 3 Story: Step 6 — Uncertainty Governor Schema */}
        <UncertaintyGovernorSchema />

        {/* Primary Insight Transition to Deep Data Lab */}
        <div className="story-transition-banner" role="note" aria-label="Research progression note">
          <div className="transition-lead">
            {t('transitions.deepDataLabLead')}
          </div>
          <p className="transition-caption">
            {t('transitions.deepDataLabCaption')}
          </p>
        </div>

        {/* Phase 4: Chapter V — Deep Data Lab (Question-Driven Analytical Workbench) */}
        <DeepDataLab />

        {/* Chapter VI — Methodological Constraints & Research Reference */}
        <MethodologyNotes />

        {/* Chapter VII — Research Conclusions & Synthesis */}
        <ResearchConclusion />
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
