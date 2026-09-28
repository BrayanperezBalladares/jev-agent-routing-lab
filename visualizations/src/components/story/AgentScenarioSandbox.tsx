import React, { useState } from 'react'
import './story.css'
import {
  CANONICAL_CASES,
  CANONICAL_ACTIONS,
  type CanonicalAction,
} from './story-data'

export const AgentScenarioSandbox: React.FC = () => {
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0)
  const [selectedAction, setSelectedAction] = useState<CanonicalAction | null>(null)
  const [srAnnouncement, setSrAnnouncement] = useState<string>('')

  const activeCase = CANONICAL_CASES[activeCaseIndex]
  const isRevealed = selectedAction !== null

  const handleSelectAction = (actionId: CanonicalAction) => {
    setSelectedAction(actionId)
    const matched = actionId === activeCase.expected
    const message = matched
      ? `You selected ${actionId}. This matches the benchmark target action.`
      : `You selected ${actionId}. The benchmark target action is ${activeCase.expected}.`
    setSrAnnouncement(message)
  }

  const handleSwitchCase = (index: number) => {
    setActiveCaseIndex(index)
    setSelectedAction(null)
    setSrAnnouncement(
      `Switched to benchmark case ${CANONICAL_CASES[index].id}: ${CANONICAL_CASES[index].name}.`
    )
  }

  const handleReset = () => {
    setSelectedAction(null)
    setSrAnnouncement('Selection reset. Choose an action for the agent.')
  }

  return (
    <section
      className="story-section"
      id="agent-scenario-sandbox"
      aria-label="Interactive Agent Scenario Sandbox"
    >
      <div className="story-header">
        <div className="story-badge-row">
          <span className="badge badge-accent">Interactive Problem Space</span>
          <span className="badge">Canonical 5-Action Formulation</span>
        </div>
        <h2 className="story-title">What Should the Agent Do Next?</h2>
        <p className="story-subtitle">
          Autonomous engineering agents must map unstructured operational states to a discrete action slot.
          Read the verified benchmark scenario below and predict which tool action should be invoked.
        </p>
      </div>

      <div className="sandbox-workbench">
        {/* Case Switcher Bar with Semantic Contrast */}
        <div className="case-switcher-bar">
          <span className="case-switcher-label">
            Holdout Scenario Contrast:
          </span>
          <div
            className="case-switcher-buttons"
            role="tablist"
            aria-label="Select benchmark scenario"
          >
            {CANONICAL_CASES.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={activeCaseIndex === idx}
                className={`case-btn ${activeCaseIndex === idx ? 'active' : ''}`}
                onClick={() => handleSwitchCase(idx)}
              >
                <span className="case-btn-desktop">{c.contrastLabelDesktop}</span>
                <span className="case-btn-mobile">{c.contrastLabelMobile}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Workbench Layout */}
        <div className="sandbox-grid">
          {/* Column 1: Agent Context Window */}
          <div className="agent-state-panel">
            <div className="agent-context-box">
              <div className="context-kicker-bar">
                <span className="context-kicker-label">
                  AGENT CONTEXT // WORKSPACE SNAPSHOT
                </span>
                <span className="context-kicker-meta">
                  <code>routing-holdout.json</code> &bull; Case {activeCase.id}
                </span>
              </div>
              <div className="context-body-text">
                &ldquo;{activeCase.state}&rdquo;
              </div>
              <div className="context-footer-row">
                <span className="context-scenario-name">
                  Benchmark Case: <strong>{activeCase.name}</strong>
                </span>
                <span className="badge">{activeCase.difficulty}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Action Selection Panel */}
          <div className="actions-selection-panel">
            <fieldset className="actions-fieldset">
              <legend className="actions-legend">
                Select the canonical action for the agent:
              </legend>

              {CANONICAL_ACTIONS.map((action) => {
                const isSelected = selectedAction === action.id
                return (
                  <div key={action.id} className="action-option-wrapper">
                    <input
                      type="radio"
                      id={`action-radio-${action.id}`}
                      name="canonical-agent-action"
                      value={action.id}
                      checked={isSelected}
                      onChange={() => handleSelectAction(action.id)}
                      className="action-radio-native"
                    />
                    <label
                      htmlFor={`action-radio-${action.id}`}
                      className="action-option-label"
                    >
                      <div className="action-info-group">
                        <span className="action-glyph" aria-hidden="true">
                          {action.glyph}
                        </span>
                        <span className="action-name-text">
                          {action.label}
                        </span>
                      </div>
                      <span className="action-brief-desc">
                        {action.description}
                      </span>
                    </label>
                  </div>
                )
              })}
            </fieldset>
          </div>
        </div>

        {/* Predict-Then-Reveal Panel */}
        {isRevealed && (
          <div
            className="sandbox-reveal-container"
            role="region"
            aria-label="Benchmark comparison outcome"
          >
            <div className="reveal-header-row">
              <span className="panel-title">
                Benchmark Comparison Outcome
              </span>
              {selectedAction === activeCase.expected ? (
                <span className="reveal-match-badge match-success">
                  Prediction Matches Benchmark Target
                </span>
              ) : (
                <span className="reveal-match-badge match-alternative">
                  Alternative Choice (Benchmark Target: {activeCase.expected})
                </span>
              )}
            </div>

            <div className="reveal-comparison-grid">
              <div className="reveal-comparison-card">
                <span className="reveal-slot-label">Your Selection</span>
                <span
                  className={`reveal-action-display ${
                    selectedAction === 'SEARCH_CODE'
                      ? 'action-search-highlight'
                      : selectedAction === 'ASK_USER'
                        ? 'action-ask-highlight'
                        : ''
                  }`}
                >
                  {selectedAction}
                </span>
              </div>

              <div className="reveal-comparison-card">
                <span className="reveal-slot-label">Benchmark Target</span>
                <span
                  className={`reveal-action-display ${
                    activeCase.expected === 'SEARCH_CODE'
                      ? 'action-search-highlight'
                      : activeCase.expected === 'ASK_USER'
                        ? 'action-ask-highlight'
                        : ''
                  }`}
                >
                  {activeCase.expected}
                </span>
              </div>
            </div>

            <div className="reveal-rationale-section">
              <span className="rationale-title">
                Why this target fits the routing definition:
              </span>
              <p className="rationale-text">
                {activeCase.pedagogicalRationale}
              </p>
            </div>

            <div className="sandbox-action-buttons">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                Reset selection
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleSwitchCase(activeCaseIndex === 0 ? 1 : 0)}
              >
                Switch to {activeCaseIndex === 0 ? 'Contrast Case (U01)' : 'Primary Case (S01)'}
              </button>
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
