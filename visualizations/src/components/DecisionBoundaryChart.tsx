import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { echarts, ReactEChartsCore, type EChartsOption } from './echarts-core'
import { BOUNDARY_EVOLUTION, type BoundaryResult } from '../data/research-results'
import { useChartTheme } from '../hooks/useChartTheme'

export const DecisionBoundaryChart: React.FC = () => {
  const { t } = useTranslation(['charts', 'common'])
  const chartTheme = useChartTheme()
  const [selectedBoundaryId, setSelectedBoundaryId] = useState<string>('V5U02')

  const selectedBoundary = useMemo(() => {
    return BOUNDARY_EVOLUTION.find((b) => b.id === selectedBoundaryId) ?? BOUNDARY_EVOLUTION[0]
  }, [selectedBoundaryId])

  const chartOption: EChartsOption = useMemo(() => {
    const xLabels = BOUNDARY_EVOLUTION.map((b) => `${b.id}\n${b.label}`)

    const searchCodeData = BOUNDARY_EVOLUTION.map((b) => b.searchCodeRatePct)
    const askUserData = BOUNDARY_EVOLUTION.map((b) => b.askUserRatePct)
    const marginData = BOUNDARY_EVOLUTION.map((b) => Number(b.averageMargin.toFixed(4)))
    const confidenceData = BOUNDARY_EVOLUTION.map((b) => Number(b.averageConfidence.toFixed(4)))

    return {
      backgroundColor: 'transparent',
      animationDuration: 500,
      grid: {
        top: 80,
        right: 65,
        bottom: 75,
        left: 55,
        containLabel: true,
      },
      legend: {
        top: 15,
        right: 20,
        textStyle: chartTheme.legendTextStyle,
        itemWidth: 14,
        itemHeight: 10,
        data: [
          t('boundary.searchRate', { ns: 'charts' }),
          t('boundary.askRate', { ns: 'charts' }),
          t('boundary.legendMargin', { ns: 'charts' }),
          t('boundary.legendConfidence', { ns: 'charts' }),
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
          const item: BoundaryResult = BOUNDARY_EVOLUTION[idx]

          return `
            <div style="font-family: ${chartTheme.fontSans}; min-width: 290px; line-height: 1.5; color: ${chartTheme.textPrimary};">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${chartTheme.tooltipBorder}; padding-bottom: 8px; margin-bottom: 8px;">
                <div>
                  <strong style="color: ${chartTheme.textPrimary}; font-size: 14px;">${item.id} (${item.experiment})</strong>
                  <div style="color: ${chartTheme.textSecondary}; font-size: 11px;">${item.label}</div>
                </div>
                <span style="font-size: 11px; color: ${chartTheme.primary}; padding: 2px 6px; border-radius: 2px; font-family: ${chartTheme.fontMono};">${item.runs} Runs</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 4px; font-size: 12px; margin-bottom: 6px;">
                <span style="color: ${chartTheme.textSecondary};">Choice Distribution:</span>
                <span style="font-variant-numeric: tabular-nums;">
                  <strong style="color: ${chartTheme.searchCode};">SEARCH: ${item.searchCodeRatePct}%</strong> (${item.searchCodeCount}) |
                  <strong style="color: ${chartTheme.askUser};">ASK: ${item.askUserRatePct}%</strong> (${item.askUserCount})
                </span>
                <span style="color: ${chartTheme.textSecondary};">${t('boundary.legendMargin', { ns: 'charts' })}:</span>
                <strong style="color: ${chartTheme.accent}; font-variant-numeric: tabular-nums;">${item.averageMargin.toFixed(4)}</strong>
                <span style="color: ${chartTheme.textSecondary};">${t('boundary.legendConfidence', { ns: 'charts' })}:</span>
                <strong style="color: ${chartTheme.primary}; font-variant-numeric: tabular-nums;">${item.averageConfidence.toFixed(4)}</strong>
              </div>
              <div style="font-size: 11px; color: ${chartTheme.textMutedColor}; border-top: 1px solid ${chartTheme.tooltipBorder}; padding-top: 6px; margin-top: 6px;">
                <strong style="color: ${chartTheme.textPrimary};">Empirical Interpretation:</strong> ${item.interpretation}
              </div>
            </div>
          `
        },
      },
      xAxis: {
        type: 'category',
        data: xLabels,
        axisLine: chartTheme.axisLineStyle,
        axisLabel: {
          ...chartTheme.axisLabelStyle,
          interval: 0,
          margin: 12,
        },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: t('boundary.searchRate', { ns: 'charts' }),
          nameTextStyle: {
            color: chartTheme.textColor,
            fontSize: 11,
          },
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
        {
          type: 'value',
          name: t('boundary.yAxis', { ns: 'charts' }),
          nameTextStyle: {
            color: chartTheme.textColor,
            fontSize: 11,
          },
          min: 0,
          max: 1.0,
          interval: 0.2,
          position: 'right',
          axisLine: { show: false },
          axisLabel: {
            ...chartTheme.axisLabelStyle,
            fontSize: 11,
            formatter: (val: number) => val.toFixed(1),
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: t('boundary.searchRate', { ns: 'charts' }),
          type: 'bar',
          stack: 'choices',
          barWidth: 28,
          data: searchCodeData,
          itemStyle: { color: chartTheme.searchCode },
        },
        {
          name: t('boundary.askRate', { ns: 'charts' }),
          type: 'bar',
          stack: 'choices',
          barWidth: 28,
          data: askUserData,
          itemStyle: { color: chartTheme.askUser },
        },
        {
          name: t('boundary.legendMargin', { ns: 'charts' }),
          type: 'line',
          yAxisIndex: 1,
          data: marginData,
          symbol: 'diamond',
          symbolSize: 9,
          itemStyle: { color: chartTheme.accent },
          lineStyle: { color: chartTheme.accent, width: 2 },
        },
        {
          name: t('boundary.legendConfidence', { ns: 'charts' }),
          type: 'line',
          yAxisIndex: 1,
          data: confidenceData,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: chartTheme.primary },
          lineStyle: { color: chartTheme.primary, width: 2, type: 'dashed' },
        },
      ],
    }
  }, [chartTheme, t])

  return (
    <section className="section-container" id="decision-boundary" aria-label={t('boundary.title', { ns: 'charts' })}>
      <div className="section-header">
        <div className="section-badge-row">
          <span className="badge badge-accent">{t('boundary.badge', { ns: 'charts' })}</span>
          <span className="badge">Diagnostic States</span>
        </div>
        <h2 className="section-title">{t('boundary.title', { ns: 'charts' })}</h2>
        <p className="section-subtitle">{t('boundary.description', { ns: 'charts' })}</p>
      </div>

      <div className="chart-card">
        <div className="chart-header-row">
          <div>
            <h3 className="card-title">Boundary Instability &amp; Top-1/Top-2 Margin Compression</h3>
            <p className="card-caption">
              Across repeated runs, states near the decision boundary exhibited choice switching accompanied by margin compression.
            </p>
          </div>
          <div className="legend-tag-group">
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.searchCode }}></span>
              SEARCH_CODE
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.askUser }}></span>
              ASK_USER
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.accent }}></span>
              Margin P1 - P2
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.primary }}></span>
              Avg Confidence
            </span>
          </div>
        </div>

        <div className="chart-wrapper" style={{ height: 400 }}>
          <ReactEChartsCore
            echarts={echarts}
            option={chartOption}
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        </div>

        {/* Interactive State Selector */}
        <div className="router-inspect-section">
          <div className="inspect-tabs" role="tablist" aria-label="Select diagnostic boundary state for inspection">
            {BOUNDARY_EVOLUTION.map((b) => (
              <button
                key={b.id}
                role="tab"
                aria-selected={selectedBoundaryId === b.id}
                className={`inspect-tab-btn ${selectedBoundaryId === b.id ? 'active' : ''}`}
                onClick={() => setSelectedBoundaryId(b.id)}
              >
                <span className="tab-name">{b.id}</span>
                <span className="tab-score">Margin: {b.averageMargin.toFixed(3)}</span>
              </button>
            ))}
          </div>

          <div className="router-detail-card" aria-live="polite">
            <div className="router-detail-header">
              <div>
                <h4 className="router-name">{selectedBoundary.id} — {selectedBoundary.label}</h4>
                <span className="router-type-badge">{selectedBoundary.experiment}</span>
              </div>
              <div className="router-score-badge">
                <span className="score-val">{selectedBoundary.averageMargin.toFixed(4)}</span>
                <span className="score-lbl">Top-1 / Top-2 Margin</span>
              </div>
            </div>

            <div className="router-metrics-grid">
              <div className="router-metric-item">
                <span className="item-label">Observed Choices</span>
                <span className="item-value">
                  {selectedBoundary.searchCodeCount} SEARCH / {selectedBoundary.askUserCount} ASK
                </span>
                <span className="item-sub">Across {selectedBoundary.runs} repeated runs</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Action Rates</span>
                <span className="item-value">
                  {selectedBoundary.searchCodeRatePct}% / {selectedBoundary.askUserRatePct}%
                </span>
                <span className="item-sub">SEARCH vs ASK distribution</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Average Confidence</span>
                <span className="item-value">{selectedBoundary.averageConfidence.toFixed(4)}</span>
                <span className="item-sub">Provider-returned signal</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Stability Assessment</span>
                <span className="item-value">
                  {selectedBoundary.askUserCount === 0 ? 'Single-Choice' : 'Mixed-Choice'}
                </span>
                <span className="item-sub">
                  {selectedBoundary.askUserCount > 0 ? 'Boundary instability observed' : 'Consistent routing observed'}
                </span>
              </div>
            </div>

            <div className="router-notes-box">
              <strong className="notes-heading">Diagnostic Finding:</strong> {selectedBoundary.interpretation}
            </div>
          </div>
        </div>

        {/* Methodological Caveat */}
        <div className="chart-methodology-note" role="note">
          <strong className="notice-tag">Boundary Interpretation:</strong>
          <span>
            These diagnostic cases were selected to stress-test routing transitions and characterize empirical drift.
            A narrow margin indicates that the top two candidate actions had similar probabilities in the evaluated model,
            which frequently coincided with mixed choices across repeated runs.
          </span>
        </div>
      </div>
    </section>
  )
}

export default DecisionBoundaryChart
