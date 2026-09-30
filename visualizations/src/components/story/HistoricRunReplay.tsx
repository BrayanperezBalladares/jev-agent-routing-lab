import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './story.css'

export const HistoricRunReplay: React.FC = () => {
  const { t, i18n } = useTranslation(['story', 'common'])
  const isSpanish = i18n.language.startsWith('es')
  const [isReplayed, setIsReplayed] = useState<boolean>(false)
  const [srAnnouncement, setSrAnnouncement] = useState<string>('')

  const handleReplay = () => {
    setIsReplayed(true)
    setSrAnnouncement(
      isSpanish
        ? 'Evaluaciones históricas reproducidas: 20 ejecuciones idénticas produjeron 14 elecciones SEARCH_CODE y 6 ASK_USER. Confianza promedio: 0.315, margen promedio: 0.0705.'
        : 'Historical evaluations replayed: 20 identical runs yielded 14 SEARCH_CODE and 6 ASK_USER choices. Average confidence: 0.315, average margin: 0.0705.'
    )
  }

  const handleReset = () => {
    setIsReplayed(false)
    setSrAnnouncement(isSpanish ? 'Repetición restablecida.' : 'Replay reset.')
  }

  const searchTokens = Array.from({ length: 14 }, (_, i) => ({
    id: `search-${i + 1}`,
    index: i + 1,
    action: 'SEARCH_CODE' as const,
  }))

  const askTokens = Array.from({ length: 6 }, (_, i) => ({
    id: `ask-${i + 1}`,
    index: i + 1,
    action: 'ASK_USER' as const,
  }))

  const canonicalPrompt =
    'An account was removed months ago and another person now requests the same username. Existing product documentation describes deletion but never states whether the identifier becomes available again.'

  return (
    <section
      className="story-section"
      id="historic-run-replay"
      aria-label="Historical Run Replay"
    >
      <div className="story-header">
        <div className="story-badge-row">
          <span className="badge badge-accent">{t('replay.badge')}</span>
          <span className="badge">{t('replay.badge2')}</span>
        </div>
        <h2 className="story-title">{t('replay.title')}</h2>
        <p className="story-subtitle">{t('replay.subtitle')}</p>
      </div>

      <div className="replay-workbench">
        {/* State V5U02 Context Snapshot */}
        <div className="replay-prompt-box">
          <div className="context-kicker-bar">
            <span className="context-kicker-label">
              {t('replay.contextKicker')}
            </span>
            <span className="context-kicker-meta">
              <code>routing-v5-cue-stripped.json</code> &bull; Target: <code>ASK_USER</code>
            </span>
          </div>
          <blockquote className="replay-prompt-body">
            &ldquo;{canonicalPrompt}&rdquo;
          </blockquote>

          {/* Spanish Reading Translation */}
          {isSpanish && (
            <div className="context-reading-translation">
              <div className="reading-translation-header">
                <span className="reading-translation-label">{t('common.readingTranslationLabel', { ns: 'common' })}:</span>
              </div>
              <div className="reading-translation-body">
                &ldquo;{t('replay.readingTranslation')}&rdquo;
              </div>
            </div>
          )}
        </div>

        {/* Pre-Replay: Strong Focal Question */}
        {!isReplayed ? (
          <div className="replay-pre-trigger-block">
            <div className="replay-question-lead">
              {t('replay.questionLead')}
            </div>
            <div className="replay-question-sub">
              {t('replay.questionSub')}
            </div>
            <div className="replay-trigger-action-row">
              <button
                type="button"
                className="replay-trigger-btn"
                onClick={handleReplay}
              >
                <span aria-hidden="true">&#x25B6;</span>
                {t('replay.triggerButton')}
              </button>
              <span className="replay-trigger-hint">
                {t('replay.triggerHint')}
              </span>
            </div>
          </div>
        ) : (
          /* Post-Replay: High-Contrast 14 vs 6 Visual Split */
          <div
            className="replay-display-panel"
            role="region"
            aria-label="Observed historical replay results"
          >
            {/* The Central Visual Takeaway */}
            <div className="replay-focal-headline">
              <div className="focal-title-row">
                <span className="focal-tag">{t('replay.focalTag')}</span>
                <span className="focal-main-title">
                  {t('replay.focalTitle')}
                </span>
              </div>
              <p className="focal-subtitle">
                {t('replay.focalSubtitle')}
              </p>
            </div>

            {/* Distribution Ratio Bar */}
            <div className="distribution-bar-wrapper">
              <div className="distribution-labels-row">
                <span className="label-search">
                  {t('replay.distSearch')}
                </span>
                <span className="label-ask">
                  {t('replay.distAsk')}
                </span>
              </div>
              <div
                className="distribution-track"
                role="progressbar"
                aria-valuenow={70}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="SEARCH_CODE versus ASK_USER outcome distribution: 70 percent to 30 percent"
              >
                <div className="distribution-segment-search" />
                <div className="distribution-segment-ask" />
              </div>
            </div>

            {/* Grouped Outcome Regions: 14 vs 6 Visual Focal Point */}
            <div className="outcome-split-showcase">
              {/* Outcome Region 1: SEARCH_CODE (14) */}
              <div className="outcome-region region-search">
                <div className="outcome-region-header">
                  <div className="outcome-action-title">
                    <span className="action-glyph" aria-hidden="true">⌕</span>
                    <span className="outcome-name">SEARCH_CODE</span>
                  </div>
                  <div className="outcome-action-stats">
                    <span className="outcome-fraction">14 / 20</span>
                    <span className="outcome-percentage">70%</span>
                  </div>
                </div>

                <div
                  className="outcome-markers-bank"
                  aria-label="14 historical runs routed to SEARCH_CODE"
                >
                  {searchTokens.map((tItem) => (
                    <div
                      key={tItem.id}
                      className="outcome-marker marker-search"
                      title={`Observed evaluation: SEARCH_CODE (${tItem.index}/14)`}
                    >
                      <span className="marker-icon" aria-hidden="true">⌕</span>
                      <span className="marker-label">SEARCH</span>
                    </div>
                  ))}
                </div>

                <div className="outcome-region-caption">
                  {t('replay.searchCaption')}
                </div>
              </div>

              {/* Outcome Region 2: ASK_USER (6) */}
              <div className="outcome-region region-ask">
                <div className="outcome-region-header">
                  <div className="outcome-action-title">
                    <span className="action-glyph" aria-hidden="true">?</span>
                    <span className="outcome-name">ASK_USER</span>
                  </div>
                  <div className="outcome-action-stats">
                    <span className="outcome-fraction">6 / 20</span>
                    <span className="outcome-percentage">30%</span>
                  </div>
                </div>

                <div
                  className="outcome-markers-bank"
                  aria-label="6 historical runs routed to ASK_USER"
                >
                  {askTokens.map((tItem) => (
                    <div
                      key={tItem.id}
                      className="outcome-marker marker-ask"
                      title={`Observed evaluation: ASK_USER (${tItem.index}/6)`}
                    >
                      <span className="marker-icon" aria-hidden="true">?</span>
                      <span className="marker-label">ASK</span>
                    </div>
                  ))}
                </div>

                <div className="outcome-region-caption">
                  {t('replay.askCaption')}
                </div>
              </div>
            </div>

            {/* Secondary Explanatory Metrics Grid */}
            <div className="replay-metrics-grid">
              <div className="metric-stat-box">
                <span className="metric-stat-label">{t('replay.recordedRuns')}</span>
                <span className="metric-stat-value">20</span>
                <span className="metric-stat-sub">{t('replay.identicalEvals')}</span>
              </div>

              <div className="metric-stat-box">
                <span className="metric-stat-label">{t('replay.observedSplit')}</span>
                <span className="metric-stat-value">70% / 30%</span>
                <span className="metric-stat-sub">{t('replay.splitSub')}</span>
              </div>

              <div className="metric-stat-box">
                <span className="metric-stat-label">{t('replay.avgConfidence')}</span>
                <span className="metric-stat-value">0.315</span>
                <span className="metric-stat-sub">{t('replay.confSub')}</span>
              </div>

              <div className="metric-stat-box">
                <span className="metric-stat-label">{t('replay.topMargin')}</span>
                <span className="metric-stat-value">0.0705</span>
                <span className="metric-stat-sub">{t('replay.marginSub')}</span>
              </div>
            </div>

            {/* Methodological Definitions & Threshold Disclaimer */}
            <div className="replay-notes-block">
              <div className="replay-note-item">
                <span className="replay-note-term">{t('replay.providerConfTerm')}</span>
                <span className="replay-note-def">{t('replay.providerConfDef')}</span>
              </div>

              <div className="replay-note-item">
                <span className="replay-note-term">{t('replay.marginTerm')}</span>
                <span className="replay-note-def">{t('replay.marginDef')}</span>
              </div>

              <div className="replay-note-item">
                <span className="replay-note-term">{t('replay.thresholdTerm')}</span>
                <span className="replay-note-def">{t('replay.thresholdDef')}</span>
              </div>
            </div>

            {/* Replay Controls Footer */}
            <div className="replay-footer-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                {t('replay.resetReplay')}
              </button>
              <span className="replay-footer-meta">
                {t('replay.footerMeta')}
              </span>
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

export default HistoricRunReplay
