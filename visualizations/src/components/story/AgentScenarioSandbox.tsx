import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './story.css'
import {
  CANONICAL_CASES,
  CANONICAL_ACTIONS,
  type CanonicalAction,
} from './story-data'

export const AgentScenarioSandbox: React.FC = () => {
  const { t, i18n } = useTranslation(['story', 'common'])
  const isSpanish = i18n.language.startsWith('es')
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0)
  const [selectedAction, setSelectedAction] = useState<CanonicalAction | null>(null)
  const [srAnnouncement, setSrAnnouncement] = useState<string>('')

  const activeCase = CANONICAL_CASES[activeCaseIndex]
  const isRevealed = selectedAction !== null

  const handleSelectAction = (actionId: CanonicalAction) => {
    setSelectedAction(actionId)
    const matched = actionId === activeCase.expected
    const message = matched
      ? isSpanish
        ? `Ha seleccionado ${actionId}. Coincide con la acción objetivo del benchmark.`
        : `You selected ${actionId}. This matches the benchmark target action.`
      : isSpanish
        ? `Ha seleccionado ${actionId}. La acción objetivo del benchmark es ${activeCase.expected}.`
        : `You selected ${actionId}. The benchmark target action is ${activeCase.expected}.`
    setSrAnnouncement(message)
  }

  const handleSwitchCase = (index: number) => {
    setActiveCaseIndex(index)
    setSelectedAction(null)
    setSrAnnouncement(
      isSpanish
        ? `Cambiado a caso de benchmark ${CANONICAL_CASES[index].id}: ${CANONICAL_CASES[index].name}.`
        : `Switched to benchmark case ${CANONICAL_CASES[index].id}: ${CANONICAL_CASES[index].name}.`
    )
  }

  const handleReset = () => {
    setSelectedAction(null)
    setSrAnnouncement(
      isSpanish
        ? 'Selección restablecida. Elija una acción para el agente.'
        : 'Selection reset. Choose an action for the agent.'
    )
  }

  return (
    <section
      className="story-section"
      id="agent-scenario-sandbox"
      aria-label="Interactive Agent Scenario Sandbox"
    >
      <div className="story-header">
        <div className="story-badge-row">
          <span className="badge badge-accent">{t('sandbox.badge')}</span>
          <span className="badge">{t('sandbox.badge2')}</span>
        </div>
        <h2 className="story-title">{t('sandbox.title')}</h2>
        <p className="story-subtitle">{t('sandbox.subtitle')}</p>
      </div>

      <div className="sandbox-workbench">
        {/* Case Switcher Bar with Semantic Contrast */}
        <div className="case-switcher-bar">
          <span className="case-switcher-label">
            {t('sandbox.contrastLabel')}
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
                <span className="case-btn-desktop">
                  {t(`sandbox.cases.${c.id}.contrastLabelDesktop`, { defaultValue: c.contrastLabelDesktop })}
                </span>
                <span className="case-btn-mobile">
                  {t(`sandbox.cases.${c.id}.contrastLabelMobile`, { defaultValue: c.contrastLabelMobile })}
                </span>
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
                  {t('sandbox.contextKicker')}
                </span>
                <span className="context-kicker-meta">
                  <code>routing-holdout.json</code> &bull; Case {activeCase.id}
                </span>
              </div>
              <div className="context-body-text">
                &ldquo;{activeCase.state}&rdquo;
              </div>

              {/* Spanish Reading Translation (source of record remains canonical English above) */}
              {isSpanish && (
                <div className="context-reading-translation">
                  <div className="reading-translation-header">
                    <span className="reading-translation-label">{t('sandbox.readingTranslationLabel')}:</span>
                  </div>
                  <div className="reading-translation-body">
                    &ldquo;{t(`sandbox.cases.${activeCase.id}.readingTranslation`)}&rdquo;
                  </div>
                </div>
              )}

              <div className="context-footer-row">
                <span className="context-scenario-name">
                  {t('sandbox.benchmarkCase')}{' '}
                  <strong>{t(`sandbox.cases.${activeCase.id}.name`, { defaultValue: activeCase.name })}</strong>
                </span>
                <span className="badge">{activeCase.difficulty}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Action Selection Panel */}
          <div className="actions-selection-panel">
            <fieldset className="actions-fieldset">
              <legend className="actions-legend">
                {t('sandbox.selectActionLegend')}
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
                        {t(`sandbox.actions.${action.id}.description`, { defaultValue: action.description })}
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
            aria-label={t('sandbox.outcomeTitle')}
          >
            <div className="reveal-header-row">
              <span className="panel-title">
                {t('sandbox.outcomeTitle')}
              </span>
              {selectedAction === activeCase.expected ? (
                <span className="reveal-match-badge match-success">
                  {t('sandbox.matchSuccess')}
                </span>
              ) : (
                <span className="reveal-match-badge match-alternative">
                  {t('sandbox.matchAlternative', { expected: activeCase.expected })}
                </span>
              )}
            </div>

            <div className="reveal-comparison-grid">
              <div className="reveal-comparison-card">
                <span className="reveal-slot-label">{t('sandbox.yourSelection')}</span>
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
                <span className="reveal-slot-label">{t('sandbox.benchmarkTarget')}</span>
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
                {t('sandbox.whyTargetFits')}
              </span>
              <p className="rationale-text">
                {t(`sandbox.cases.${activeCase.id}.pedagogicalRationale`, { defaultValue: activeCase.pedagogicalRationale })}
              </p>
            </div>

            <div className="sandbox-action-buttons">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                {t('sandbox.resetSelection')}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleSwitchCase(activeCaseIndex === 0 ? 1 : 0)}
              >
                {activeCaseIndex === 0 ? t('sandbox.switchToContrast') : t('sandbox.switchToPrimary')}
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

export default AgentScenarioSandbox
