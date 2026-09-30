import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { echarts, ReactEChartsCore, type EChartsOption } from './echarts-core'
import { HOLDOUT_COMPARISON, type HoldoutRouterResult } from '../data/research-results'
import { useChartTheme } from '../hooks/useChartTheme'

interface HoldoutComparisonChartProps {
  standalone?: boolean
}

export const HoldoutComparisonChart: React.FC<HoldoutComparisonChartProps> = ({ standalone = true }) => {
  const { t } = useTranslation(['charts', 'common'])
  const chartTheme = useChartTheme()
  const [selectedRouterId, setSelectedRouterId] = useState<string>('jev')

  const selectedRouter = useMemo(() => {
    return HOLDOUT_COMPARISON.find((r) => r.id === selectedRouterId) ?? HOLDOUT_COMPARISON[0]
  }, [selectedRouterId])

  const chartOption: EChartsOption = useMemo(() => {
    const routerNames = HOLDOUT_COMPARISON.map((r) => r.name)
    const semanticAccuracyData = HOLDOUT_COMPARISON.map((r) => ({
      value: r.semanticAccuracySuccessfulPct,
      itemStyle: {
        color:
          r.id === 'jev'
            ? chartTheme.primary
            : r.id === 'nemotron-ultra'
              ? chartTheme.methodology
              : r.id === 'gpt-5-mini'
                ? chartTheme.accent
                : chartTheme.baselineSeries,
        borderRadius: [2, 2, 0, 0],
      },
    }))

    const allAttemptCorrectData = HOLDOUT_COMPARISON.map((r) => ({
      value: r.allAttemptCorrectRatePct,
      itemStyle: {
        color: chartTheme.secondarySeries,
        borderRadius: [2, 2, 0, 0],
      },
    }))

    return {
      backgroundColor: 'transparent',
      animationDuration: 500,
      grid: {
        top: 60,
        right: 25,
        bottom: 50,
        left: 55,
        containLabel: true,
      },
      legend: {
        top: 10,
        right: 20,
        textStyle: chartTheme.legendTextStyle,
        itemWidth: 14,
        itemHeight: 10,
        data: [
          t('holdout.legendSemantic', { ns: 'charts' }),
          t('holdout.legendAll', { ns: 'charts' }),
        ],
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: chartTheme.tooltipConfig.backgroundColor,
        borderColor: chartTheme.tooltipConfig.borderColor,
        borderWidth: chartTheme.tooltipConfig.borderWidth,
        padding: chartTheme.tooltipConfig.padding,
        textStyle: chartTheme.tooltipConfig.textStyle,
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
        formatter: (params: unknown) => {
          const items = params as Array<{ dataIndex: number }>
          if (!items || items.length === 0) return ''
          const idx = items[0].dataIndex
          const item: HoldoutRouterResult = HOLDOUT_COMPARISON[idx]

          const latencyInfo = item.medianLatencyMs
            ? `${item.medianLatencyMs}ms (median) / ${item.averageLatencyMs ? item.averageLatencyMs.toFixed(0) : 'N/A'}ms (avg)`
            : item.averageLatencyMs
              ? `${item.averageLatencyMs}ms (avg)`
              : 'N/A'

          const costInfo = item.costUsd !== undefined ? `$${item.costUsd.toFixed(6)}` : 'N/A'

          return `
            <div style="font-family: ${chartTheme.fontSans}; min-width: 260px; line-height: 1.5; color: ${chartTheme.textPrimary};">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${chartTheme.tooltipBorder}; padding-bottom: 8px; margin-bottom: 8px;">
                <strong style="color: ${chartTheme.textPrimary}; font-size: 14px;">${item.name}</strong>
                <span style="color: ${chartTheme.primary}; font-size: 11px; padding: 2px 6px; border-radius: 2px; font-family: ${chartTheme.fontMono};">${item.routerType}</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 4px; font-size: 12px; margin-bottom: 6px;">
                <span style="color: ${chartTheme.textSecondary};">${t('holdout.semanticAccuracy', { ns: 'charts' })}:</span>
                <strong style="color: ${chartTheme.primary}; font-variant-numeric: tabular-nums;">${item.semanticAccuracySuccessfulPct.toFixed(1)}%</strong>
                <span style="color: ${chartTheme.textSecondary};">${t('holdout.allAttemptRate', { ns: 'charts' })}:</span>
                <strong style="color: ${chartTheme.textSecondary}; font-variant-numeric: tabular-nums;">${item.allAttemptCorrectRatePct.toFixed(1)}%</strong>
                <span style="color: ${chartTheme.textSecondary};">${t('holdout.successfulRequests', { ns: 'charts' })} / ${t('holdout.attempts', { ns: 'charts' })}:</span>
                <span style="color: ${chartTheme.textPrimary}; font-variant-numeric: tabular-nums;">${item.successfulRequests} / ${item.attempts}</span>
                <span style="color: ${chartTheme.textSecondary};">${t('holdout.medianLatency', { ns: 'charts' })}:</span>
                <span style="color: ${chartTheme.textPrimary}; font-variant-numeric: tabular-nums;">${latencyInfo}</span>
                <span style="color: ${chartTheme.textSecondary};">${t('holdout.cost', { ns: 'charts' })}:</span>
                <span style="color: ${chartTheme.textPrimary}; font-variant-numeric: tabular-nums;">${costInfo}</span>
              </div>
              <div style="font-size: 11px; color: ${chartTheme.textMutedColor}; border-top: 1px solid ${chartTheme.tooltipBorder}; padding-top: 6px; margin-top: 6px;">
                <em>${t('holdout.costBasis', { ns: 'charts' })}:</em> ${item.costBasis}
              </div>
            </div>
          `
        },
      },
      xAxis: {
        type: 'category',
        data: routerNames,
        axisLine: chartTheme.axisLineStyle,
        axisLabel: {
          ...chartTheme.axisLabelStyle,
          margin: 12,
        },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        interval: 20,
        axisLine: { show: false },
        axisLabel: {
          ...chartTheme.axisLabelStyle,
          fontSize: 11,
          formatter: '{value}%',
        },
        splitLine: chartTheme.splitLineStyle,
      },
      series: [
        {
          name: t('holdout.legendSemantic', { ns: 'charts' }),
          type: 'bar',
          barWidth: 28,
          barGap: '20%',
          data: semanticAccuracyData,
          label: {
            show: true,
            position: 'top',
            color: chartTheme.textSecondary,
            fontSize: 11,
            formatter: (params: unknown) => {
              const p = params as { value?: number | string | null }
              if (p.value === undefined || p.value === null) return ''
              return `${Number(p.value).toFixed(1)}%`
            },
          },
        },
        {
          name: t('holdout.legendAll', { ns: 'charts' }),
          type: 'bar',
          barWidth: 28,
          data: allAttemptCorrectData,
          label: {
            show: true,
            position: 'top',
            color: chartTheme.textMutedColor,
            fontSize: 11,
            formatter: (params: unknown) => {
              const p = params as { value?: number | string | null }
              if (p.value === undefined || p.value === null) return ''
              return `${Number(p.value).toFixed(1)}%`
            },
          },
        },
      ],
    }
  }, [chartTheme, t])

  const chartContent = (
    <div className={`chart-card ${!standalone ? 'embedded-chart-card' : ''}`}>
      <div className="chart-header-row">
        <div>
          <h3 className="card-title">Semantic Decision Accuracy vs. Infrastructure Reliability</h3>
          <p className="card-caption">
            Primary metric: percentage of successful requests routed to ground-truth action (50 balanced test cases).
          </p>
        </div>
          <div className="legend-tag-group">
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.primary }}></span>
              Jev (Specialized)
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.methodology }}></span>
              Nemotron Ultra
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.accent }}></span>
              GPT-5-mini
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.baselineSeries }}></span>
              Rule Baseline
            </span>
          </div>
        </div>

        <div className="chart-wrapper" style={{ height: 380 }}>
          <ReactEChartsCore
            echarts={echarts}
            option={chartOption}
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        </div>

        {/* Interactive Router Inspection Row */}
        <div className="router-inspect-section">
          <div className="inspect-tabs" role="tablist" aria-label="Select router for detail inspection">
            {HOLDOUT_COMPARISON.map((r) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={selectedRouterId === r.id}
                className={`inspect-tab-btn ${selectedRouterId === r.id ? 'active' : ''}`}
                onClick={() => setSelectedRouterId(r.id)}
              >
                <span className="tab-name">{r.name}</span>
                <span className="tab-score">{r.semanticAccuracySuccessfulPct.toFixed(1)}%</span>
              </button>
            ))}
          </div>

          <div className="router-detail-card" aria-live="polite">
            <div className="router-detail-header">
              <div>
                <h4 className="router-name">{selectedRouter.name}</h4>
                <span className="router-type-badge">{selectedRouter.routerType}</span>
              </div>
              <div className="router-score-badge">
                <span className="score-val">{selectedRouter.semanticAccuracySuccessfulPct.toFixed(1)}%</span>
                <span className="score-lbl">{t('holdout.semanticAccuracy', { ns: 'charts' })}</span>
              </div>
            </div>

            <div className="router-metrics-grid">
              <div className="router-metric-item">
                <span className="item-label">{t('holdout.successfulRequests', { ns: 'charts' })}</span>
                <span className="item-value">{selectedRouter.requestSuccessRatePct}%</span>
                <span className="item-sub">
                  {selectedRouter.successfulRequests} of {selectedRouter.attempts} attempts
                </span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">{t('holdout.allAttemptRate', { ns: 'charts' })}</span>
                <span className="item-value">{selectedRouter.correctSuccessfulResponses}</span>
                <span className="item-sub">All-attempt rate: {selectedRouter.allAttemptCorrectRatePct}%</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">{t('holdout.medianLatency', { ns: 'charts' })}</span>
                <span className="item-value">
                  {selectedRouter.medianLatencyMs ? `${selectedRouter.medianLatencyMs}ms` : `${selectedRouter.averageLatencyMs}ms`}
                </span>
                <span className="item-sub">
                  {selectedRouter.medianLatencyMs ? `Avg: ${selectedRouter.averageLatencyMs?.toFixed(0)}ms` : 'Local deterministic'}
                </span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">{t('holdout.cost', { ns: 'charts' })}</span>
                <span className="item-value">
                  {selectedRouter.costUsd !== undefined ? `$${selectedRouter.costUsd.toFixed(6)}` : 'N/A'}
                </span>
                <span className="item-sub">{selectedRouter.costBasis}</span>
              </div>
            </div>

            <div className="router-notes-box">
              <strong className="notes-heading">{t('holdout.notes', { ns: 'charts' })}:</strong> {selectedRouter.notes}
            </div>
          </div>
        </div>

        {/* Mandatory Methodological Disclaimer */}
        <div className="chart-methodology-note" role="note">
          <strong className="notice-tag">Methodological Note:</strong>
          <span>
            This evaluation is NOT a universal model leaderboard. Provider infrastructure, retry policies, gateway networking,
            and cost accounting methodologies differed across systems. Semantic routing accuracy and infrastructure reliability
            are reported separately to prevent conflating operational network drops with decision failure.
          </span>
        </div>
      </div>
  )

  if (!standalone) {
    return chartContent
  }

  return (
    <section className="section-container" id="holdout-comparison" aria-label={t('holdout.title', { ns: 'charts' })}>
      <div className="section-header">
        <div className="section-badge-row">
          <span className="badge badge-accent">{t('holdout.badge', { ns: 'charts' })}</span>
          <span className="badge">50 Test Cases</span>
        </div>
        <h2 className="section-title">{t('holdout.title', { ns: 'charts' })}</h2>
        <p className="section-subtitle">{t('holdout.description', { ns: 'charts' })}</p>
      </div>
      {chartContent}
    </section>
  )
}

export default HoldoutComparisonChart
