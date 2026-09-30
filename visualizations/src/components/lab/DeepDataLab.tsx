import React, { useState, useRef, useCallback, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import './DeepDataLab.css'

// Lazy loaded chart components to keep bundle slim and render only active figure
const HoldoutComparisonChart = React.lazy(
  () => import('../HoldoutComparisonChart')
)
const BenchmarkProgressionChart = React.lazy(
  () => import('../BenchmarkProgressionChart')
)
const DecisionBoundaryChart = React.lazy(
  () => import('../DecisionBoundaryChart')
)
const V8ExplicitnessChart = React.lazy(
  () => import('../V8ExplicitnessChart')
)
const ConfidenceStabilitySection = React.lazy(
  () => import('../ConfidenceStabilitySection')
)

export type DataLabTabId =
  | 'holdout'
  | 'progression'
  | 'boundary'
  | 'explicitness'
  | 'stability'

interface TabConfig {
  id: DataLabTabId
  figureNumber: string
}

const LAB_TABS: TabConfig[] = [
  { id: 'holdout', figureNumber: '01' },
  { id: 'progression', figureNumber: '02' },
  { id: 'boundary', figureNumber: '03' },
  { id: 'explicitness', figureNumber: '04' },
  { id: 'stability', figureNumber: '05' },
]

const ChartLoadingFallback: React.FC = () => {
  const { t } = useTranslation(['common'])
  return (
    <div
      className="chart-card"
      style={{
        minHeight: 380,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span className="badge badge-accent">{t('common.loading')}</span>
    </div>
  )
}

export const DeepDataLab: React.FC = () => {
  const { t } = useTranslation(['datalab', 'common'])
  const [activeTab, setActiveTab] = useState<DataLabTabId>('holdout')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex = -1
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        nextIndex = (index + 1) % LAB_TABS.length
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        nextIndex = (index - 1 + LAB_TABS.length) % LAB_TABS.length
      } else if (e.key === 'Home') {
        e.preventDefault()
        nextIndex = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        nextIndex = LAB_TABS.length - 1
      }

      if (nextIndex >= 0) {
        setActiveTab(LAB_TABS[nextIndex].id)
        tabRefs.current[nextIndex]?.focus()
      }
    },
    []
  )

  const renderActiveFigure = () => {
    switch (activeTab) {
      case 'holdout':
        return (
          <Suspense fallback={<ChartLoadingFallback />}>
            <HoldoutComparisonChart standalone={false} />
          </Suspense>
        )
      case 'progression':
        return (
          <Suspense fallback={<ChartLoadingFallback />}>
            <BenchmarkProgressionChart standalone={false} />
          </Suspense>
        )
      case 'boundary':
        return (
          <Suspense fallback={<ChartLoadingFallback />}>
            <DecisionBoundaryChart standalone={false} />
          </Suspense>
        )
      case 'explicitness':
        return (
          <Suspense fallback={<ChartLoadingFallback />}>
            <V8ExplicitnessChart standalone={false} />
          </Suspense>
        )
      case 'stability':
        return (
          <Suspense fallback={<ChartLoadingFallback />}>
            <ConfidenceStabilitySection embedded={true} />
          </Suspense>
        )
      default:
        return null
    }
  }

  return (
    <section
      className="section-container deep-data-lab-section"
      id="deep-data-lab"
      aria-labelledby="datalab-heading"
    >
      {/* Anchor alias to support existing references */}
      <span id="research-overview" style={{ position: 'absolute', top: 0, left: 0, height: 0, width: 0, overflow: 'hidden' }} aria-hidden="true" />

      {/* Chapter Header */}
      <header className="section-header datalab-header-block">
        <div className="section-badge-row">
          <span className="badge badge-accent">{t('datalab:badge')}</span>
          <span className="badge">{t('datalab:badgeChapter')}</span>
        </div>
        <h2 id="datalab-heading" className="section-title">
          {t('datalab:title')}
        </h2>
        <p className="datalab-intro-lead">{t('datalab:subtitle')}</p>
      </header>

      {/* Question-Driven Segmented Tab Navigation */}
      <nav className="datalab-tab-nav-wrapper" aria-label={t('datalab:tabsAriaLabel')}>
        <div
          className="datalab-tablist"
          role="tablist"
          aria-label={t('datalab:tabsAriaLabel')}
        >
          {LAB_TABS.map((tab, idx) => {
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[idx] = el
                }}
                role="tab"
                id={`datalab-tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`datalab-panel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                className={`datalab-tab-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              >
                <span className="datalab-tab-badge">FIG {tab.figureNumber}</span>
                <span>{t(`datalab:tabs.${tab.id}.label`)}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Active Tabpanel (One focused figure at a time) */}
      <div
        role="tabpanel"
        id={`datalab-panel-${activeTab}`}
        aria-labelledby={`datalab-tab-${activeTab}`}
        tabIndex={0}
        className="datalab-tabpanel"
      >
        {/* Editorial Question Banner */}
        <div className="datalab-question-banner">
          <div className="datalab-question-top">
            <span className="datalab-figure-badge">
              {t(`datalab:tabs.${activeTab}.figureBadge`)}
            </span>
            <h3 className="datalab-question-title">
              {t(`datalab:tabs.${activeTab}.question`)}
            </h3>
          </div>
          <p className="datalab-figure-subtitle">
            {t(`datalab:tabs.${activeTab}.figureTitle`)}
          </p>
        </div>

        {/* The Active Analytical Figure */}
        <div className="datalab-chart-container">
          {renderActiveFigure()}
        </div>

        {/* Contextual Reading / Descriptive Caption */}
        <div className="datalab-caption-box" role="region" aria-label={t('datalab:captionHeading')}>
          <div className="datalab-caption-header">
            <span className="datalab-caption-tag">{t('datalab:captionHeading')}</span>
          </div>
          <p className="datalab-caption-text">
            {t(`datalab:tabs.${activeTab}.caption`)}
          </p>
        </div>

        {/* Methodological Caveat */}
        <div className="datalab-methodology-box" role="note" aria-label={t('datalab:methodologyHeading')}>
          <div className="datalab-methodology-header">
            <span className="datalab-methodology-tag">{t('datalab:methodologyHeading')}</span>
          </div>
          <p className="datalab-methodology-text">
            {t(`datalab:tabs.${activeTab}.methodology`)}
          </p>
        </div>
      </div>
    </section>
  )
}

export default DeepDataLab
