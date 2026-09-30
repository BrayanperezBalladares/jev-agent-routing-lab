import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

export type WalkthroughMode = 'clear' | 'uncertain'

export const UncertaintyGovernorSchema: React.FC = () => {
  const { t } = useTranslation(['story', 'common'])
  const [activeMode, setActiveMode] = useState<WalkthroughMode>('clear')

  return (
    <section
      className="story-section governor-section"
      id="uncertainty-governor"
      aria-label={t('governor.title')}
    >
      {/* Header with Mandatory Conceptual Status Badges */}
      <div className="story-header">
        <div className="story-badge-row">
          <span className="badge badge-accent">{t('governor.badge')}</span>
          <span className="badge badge-status">{t('governor.badge2')}</span>
        </div>
        <h2 className="story-title">{t('governor.title')}</h2>
        <p className="story-subtitle">{t('governor.subtitle')}</p>
      </div>

      {/* Prominent Core Architectural Principle Banner */}
      <div className="principle-callout-card" role="region" aria-label={t('governor.corePrincipleTitle')}>
        <div className="principle-tag-row">
          <span className="principle-tag">{t('governor.corePrincipleTag')}</span>
        </div>
        <h3 className="principle-headline">
          {t('governor.corePrincipleTitle')}
        </h3>
        <p className="principle-body">
          {t('governor.corePrincipleDesc')}
        </p>
      </div>

      {/* Interactive Walkthrough Mode Selector */}
      <div className="walkthrough-control-bar">
        <span className="walkthrough-label">{t('governor.modesLabel')}</span>
        <div className="walkthrough-btn-group" role="group" aria-label={t('governor.modesLabel')}>
          <button
            type="button"
            className={`walkthrough-toggle-btn ${activeMode === 'clear' ? 'active' : ''}`}
            aria-pressed={activeMode === 'clear'}
            onClick={() => setActiveMode('clear')}
          >
            <span className="toggle-title">{t('governor.modeClear')}</span>
            <span className="toggle-sub">{t('governor.modeClearSub')}</span>
          </button>
          <button
            type="button"
            className={`walkthrough-toggle-btn ${activeMode === 'uncertain' ? 'active' : ''}`}
            aria-pressed={activeMode === 'uncertain'}
            onClick={() => setActiveMode('uncertain')}
          >
            <span className="toggle-title">{t('governor.modeUncertain')}</span>
            <span className="toggle-sub">{t('governor.modeUncertainSub')}</span>
          </button>
        </div>
        <span className="walkthrough-disclaimer-note">
          {t('governor.walkthroughDisclaimer')}
        </span>
      </div>

      {/* Publication Architecture Diagram */}
      <div
        className={`architecture-diagram-container mode-${activeMode}`}
        role="region"
        aria-label="Systems Architecture Flowchart"
      >
        {/* Node 1: Input Agent State */}
        <div className="arch-node-row">
          <div className="arch-node node-state highlighted">
            <div className="node-header">
              <span className="node-role">{t('governor.nodes.state.role')}</span>
              <span className="node-step">01</span>
            </div>
            <h4 className="node-title">{t('governor.nodes.state.title')}</h4>
            <p className="node-desc">{t('governor.nodes.state.desc')}</p>
          </div>
        </div>

        <div className="arch-connector-vertical" aria-hidden="true">
          <span className="connector-line" />
          <span className="connector-arrow">&darr;</span>
        </div>

        {/* Node 2: Jev Semantic Evaluator */}
        <div className="arch-node-row">
          <div className="arch-node node-evaluator highlighted">
            <div className="node-header">
              <span className="node-role">{t('governor.nodes.evaluator.role')}</span>
              <span className="node-step">02</span>
            </div>
            <h4 className="node-title">{t('governor.nodes.evaluator.title')}</h4>
            <p className="node-desc">{t('governor.nodes.evaluator.desc')}</p>
          </div>
        </div>

        <div className="arch-connector-vertical" aria-hidden="true">
          <span className="connector-line" />
          <span className="connector-arrow">&darr;</span>
        </div>

        {/* Node 3: Selected Action + Signals */}
        <div className="arch-node-row">
          <div className="arch-node node-signals highlighted">
            <div className="node-header">
              <span className="node-role">{t('governor.nodes.signals.role')}</span>
              <span className="node-step">03</span>
            </div>
            <h4 className="node-title">{t('governor.nodes.signals.title')}</h4>
            <p className="node-desc">{t('governor.nodes.signals.desc')}</p>
          </div>
        </div>

        <div className="arch-connector-vertical" aria-hidden="true">
          <span className="connector-line" />
          <span className="connector-arrow">&darr;</span>
        </div>

        {/* Node 4: Uncertainty Policy Gate */}
        <div className="arch-node-row">
          <div className="arch-node node-policy highlighted">
            <div className="node-header">
              <span className="node-role">{t('governor.nodes.policy.role')}</span>
              <span className="node-step">04</span>
            </div>
            <h4 className="node-title">{t('governor.nodes.policy.title')}</h4>
            <p className="node-desc">{t('governor.nodes.policy.desc')}</p>
          </div>
        </div>

        {/* Branch Split Connector */}
        <div className="arch-branch-split-row" aria-hidden="true">
          <div className={`branch-indicator left ${activeMode === 'clear' ? 'active-branch' : 'dimmed'}`}>
            <span>&swarr; {t('governor.proceedFlowIndicator')}</span>
          </div>
          <div className={`branch-indicator right ${activeMode === 'uncertain' ? 'active-branch' : 'dimmed'}`}>
            <span>{t('governor.fallbackFlowIndicator')} &searr;</span>
          </div>
        </div>

        {/* Split Rows: Proceed Flow vs Fallback Flow */}
        <div className="arch-split-columns-grid">
          {/* Column A: Proceed Flow */}
          <div className={`arch-column-proceed ${activeMode === 'clear' ? 'branch-active' : 'branch-inactive'}`}>
            <div className="arch-node node-proceed">
              <div className="node-header">
                <span className="node-role">{t('governor.nodes.proceed.role')}</span>
                <span className="node-step">05A</span>
              </div>
              <h4 className="node-title">{t('governor.nodes.proceed.title')}</h4>
              <p className="node-desc">{t('governor.nodes.proceed.desc')}</p>
            </div>

            <div className="arch-connector-vertical" aria-hidden="true">
              <span className="connector-line" />
              <span className="connector-arrow">&darr;</span>
            </div>

            <div className="arch-node node-permission">
              <div className="node-header">
                <span className="node-role">{t('governor.nodes.permission.role')}</span>
                <span className="node-step">06A</span>
              </div>
              <h4 className="node-title">{t('governor.nodes.permission.title')}</h4>
              <p className="node-desc">{t('governor.nodes.permission.desc')}</p>
              <div className="permission-pill-tag">
                <span>Independent Safety Gate</span>
              </div>
            </div>

            <div className="arch-connector-vertical" aria-hidden="true">
              <span className="connector-line" />
              <span className="connector-arrow">&darr;</span>
            </div>

            <div className="arch-node node-execution">
              <div className="node-header">
                <span className="node-role">{t('governor.nodes.execution.role')}</span>
                <span className="node-step">07A</span>
              </div>
              <h4 className="node-title">{t('governor.nodes.execution.title')}</h4>
              <p className="node-desc">{t('governor.nodes.execution.desc')}</p>
            </div>
          </div>

          {/* Column B: Fallback Flow */}
          <div className={`arch-column-fallback ${activeMode === 'uncertain' ? 'branch-active' : 'branch-inactive'}`}>
            <div className="arch-node node-fallback">
              <div className="node-header">
                <span className="node-role">{t('governor.nodes.fallback.role')}</span>
                <span className="node-step">05B</span>
              </div>
              <h4 className="node-title">{t('governor.nodes.fallback.title')}</h4>
              <p className="node-desc">{t('governor.nodes.fallback.desc')}</p>
            </div>

            <div className="arch-connector-vertical" aria-hidden="true">
              <span className="connector-line" />
              <span className="connector-arrow">&darr;</span>
            </div>

            {/* 3 Conceptual Fallback Options Card Group */}
            <div className="fallback-options-card" role="region" aria-label={t('governor.fallbacks.title')}>
              <h5 className="fallback-group-title">{t('governor.fallbacks.title')}</h5>
              <div className="fallback-items-stack">
                <div className="fallback-item">
                  <span className="fallback-item-title">{t('governor.fallbacks.opt1Title')}</span>
                  <p className="fallback-item-desc">{t('governor.fallbacks.opt1Desc')}</p>
                </div>
                <div className="fallback-item">
                  <span className="fallback-item-title">{t('governor.fallbacks.opt2Title')}</span>
                  <p className="fallback-item-desc">{t('governor.fallbacks.opt2Desc')}</p>
                </div>
                <div className="fallback-item">
                  <span className="fallback-item-title">{t('governor.fallbacks.opt3Title')}</span>
                  <p className="fallback-item-desc">{t('governor.fallbacks.opt3Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uncertainty Policy Factors & Non-Threshold Policy Footer */}
      <div className="governor-footer-card">
        <div className="factors-header">
          <span className="factors-title">{t('governor.policySignals.title')}</span>
        </div>
        <div className="factors-grid">
          <div className="factor-item">
            <span className="factor-bullet">&bull;</span>
            <span>{t('governor.policySignals.factor1')}</span>
          </div>
          <div className="factor-item">
            <span className="factor-bullet">&bull;</span>
            <span>{t('governor.policySignals.factor2')}</span>
          </div>
          <div className="factor-item">
            <span className="factor-bullet">&bull;</span>
            <span>{t('governor.policySignals.factor3')}</span>
          </div>
          <div className="factor-item">
            <span className="factor-bullet">&bull;</span>
            <span>{t('governor.policySignals.factor4')}</span>
          </div>
        </div>

        <div className="mandatory-disclosure-banner">
          <span className="disclosure-badge">{t('common.warning')}</span>
          <p className="disclosure-text">{t('governor.mandatoryDisclosure')}</p>
        </div>
      </div>
    </section>
  )
}

export default UncertaintyGovernorSchema
