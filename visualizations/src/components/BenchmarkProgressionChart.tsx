import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { echarts, ReactEChartsCore, type EChartsOption } from './echarts-core'
import { JEV_BENCHMARK_PROGRESSION, type BenchmarkResult } from '../data/research-results'
import { useChartTheme } from '../hooks/useChartTheme'

export const BenchmarkProgressionChart: React.FC = () => {
  const { t } = useTranslation(['charts', 'common'])
  const chartTheme = useChartTheme()
  const [selectedVersionId, setSelectedVersionId] = useState<string>('V3')

  const selectedVersion = useMemo(() => {
    return (
      JEV_BENCHMARK_PROGRESSION.find((v) => v.id === selectedVersionId) ??
      JEV_BENCHMARK_PROGRESSION[2]
    )
  }, [selectedVersionId])

  const chartOption: EChartsOption = useMemo(() => {
    const versionLabels = JEV_BENCHMARK_PROGRESSION.map((b) => `${b.id}\n${b.name}`)

    const semanticAccuracyData = JEV_BENCHMARK_PROGRESSION.map((b) => ({
      value: b.semanticAccuracySuccessfulPct,
      itemStyle: {
        color: chartTheme.primary,
        borderRadius: [2, 2, 0, 0],
      },
    }))

    const requestSuccessData = JEV_BENCHMARK_PROGRESSION.map((b) => ({
      value: b.requestSuccessRatePct,
      itemStyle: {
        color: b.requestSuccessRatePct === 100 ? chartTheme.success : chartTheme.warning,
        borderRadius: [2, 2, 0, 0],
      },
    }))

    const confidenceData = JEV_BENCHMARK_PROGRESSION.map((b) =>
      b.averageConfidence !== undefined ? Number((b.averageConfidence * 100).toFixed(1)) : null
    )

    return {
      backgroundColor: 'transparent',
      animationDuration: 500,
      grid: {
        top: 70,
        right: 55,
        bottom: 60,
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
          t('progression.legendSemantic', { ns: 'charts' }),
          t('progression.legendAll', { ns: 'charts' }),
          t('progression.legendConfidence', { ns: 'charts' }),
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
          type: 'cross',
          lineStyle: { color: chartTheme.primary, opacity: 0.3 },
        },
        formatter: (params: unknown) => {
          const items = params as Array<{ dataIndex: number }>
          if (!items || items.length === 0) return ''
          const idx = items[0].dataIndex
          const item: BenchmarkResult = JEV_BENCHMARK_PROGRESSION[idx]

          const confidenceDisplay =
            item.averageConfidence !== undefined
              ? (item.averageConfidence * 100).toFixed(2) + '%'
              : 'N/A'

          return `
            <div style="font-family: ${chartTheme.fontSans}; min-width: 280px; line-height: 1.5; color: ${chartTheme.textPrimary};">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${chartTheme.tooltipBorder}; padding-bottom: 8px; margin-bottom: 8px;">
                <strong style="color: ${chartTheme.textPrimary}; font-size: 14px;">${item.id} — ${item.name}</strong>
                <span style="color: ${chartTheme.primary}; font-size: 11px; padding: 2px 6px; border-radius: 2px; font-family: ${chartTheme.fontMono};">${item.datasetType}</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 4px; font-size: 12px; margin-bottom: 6px;">
                <span style="color: ${chartTheme.textSecondary};">Semantic Accuracy:</span>
                <strong style="color: ${chartTheme.primary}; font-variant-numeric: tabular-nums;">${item.semanticAccuracySuccessfulPct.toFixed(1)}%</strong>
                <span style="color: ${chartTheme.textSecondary};">Request Success Rate:</span>
                <strong style="color: ${item.requestSuccessRatePct === 100 ? chartTheme.success : chartTheme.warning}; font-variant-numeric: tabular-nums;">${item.requestSuccessRatePct.toFixed(1)}%</strong>
                <span style="color: ${chartTheme.textSecondary};">Successful / Total:</span>
                <span style="color: ${chartTheme.textPrimary}; font-variant-numeric: tabular-nums;">${item.successfulRequests} / ${item.attempts}</span>
                <span style="color: ${chartTheme.textSecondary};">Average Confidence:</span>
                <span style="color: ${chartTheme.methodology}; font-variant-numeric: tabular-nums;">${confidenceDisplay}</span>
              </div>
              <div style="font-size: 11px; color: ${chartTheme.textMutedColor}; border-top: 1px solid ${chartTheme.tooltipBorder}; padding-top: 6px; margin-top: 6px;">
                <em>Dataset Context:</em> ${item.description}
              </div>
            </div>
          `
        },
      },
      xAxis: {
        type: 'category',
        data: versionLabels,
        axisLine: chartTheme.axisLineStyle,
        axisLabel: {
          ...chartTheme.axisLabelStyle,
          margin: 12,
        },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: t('progression.yAxisAccuracy', { ns: 'charts' }),
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
          name: t('progression.yAxisConfidence', { ns: 'charts' }),
          nameTextStyle: {
            color: chartTheme.textColor,
            fontSize: 11,
          },
          min: 0,
          max: 100,
          interval: 20,
          position: 'right',
          axisLine: { show: false },
          axisLabel: {
            ...chartTheme.axisLabelStyle,
            fontSize: 11,
            formatter: (val: number) => (val / 100).toFixed(1),
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: t('progression.legendSemantic', { ns: 'charts' }),
          type: 'bar',
          barWidth: 24,
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
          name: t('progression.legendAll', { ns: 'charts' }),
          type: 'bar',
          barWidth: 24,
          data: requestSuccessData,
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
        {
          name: t('progression.legendConfidence', { ns: 'charts' }),
          type: 'line',
          yAxisIndex: 1,
          data: confidenceData,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: chartTheme.methodology },
          lineStyle: { color: chartTheme.methodology, width: 2 },
        },
      ],
    }
  }, [chartTheme, t])

  return (
    <section className="section-container" id="benchmark-progression" aria-label={t('progression.title', { ns: 'charts' })}>
      <div className="section-header">
        <div className="section-badge-row">
          <span className="badge badge-accent">{t('progression.badge', { ns: 'charts' })}</span>
          <span className="badge">5 Test Suites</span>
        </div>
        <h2 className="section-title">{t('progression.title', { ns: 'charts' })}</h2>
        <p className="section-subtitle">{t('progression.description', { ns: 'charts' })}</p>
      </div>

      <div className="chart-card">
        <div className="chart-header-row">
          <div>
            <h3 className="card-title">Progression Across Benchmark Iterations (V1–V5)</h3>
            <p className="card-caption">
              {t('progression.notice', { ns: 'charts' })}
            </p>
          </div>
          <div className="legend-tag-group">
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.primary }}></span>
              Semantic Accuracy
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.success }}></span>
              Request Success
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.methodology }}></span>
              Avg Confidence
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

        {/* Interactive Version Selector */}
        <div className="router-inspect-section">
          <div className="inspect-tabs" role="tablist" aria-label="Select benchmark version for inspection">
            {JEV_BENCHMARK_PROGRESSION.map((b) => (
              <button
                key={b.id}
                role="tab"
                aria-selected={selectedVersionId === b.id}
                className={`inspect-tab-btn ${selectedVersionId === b.id ? 'active' : ''}`}
                onClick={() => setSelectedVersionId(b.id)}
              >
                <span className="tab-name">{b.id}</span>
                <span className="tab-score">{b.semanticAccuracySuccessfulPct.toFixed(1)}%</span>
              </button>
            ))}
          </div>

          <div className="router-detail-card" aria-live="polite">
            <div className="router-detail-header">
              <div>
                <h4 className="router-name">{selectedVersion.id} — {selectedVersion.name}</h4>
                <span className="router-type-badge">{selectedVersion.datasetType}</span>
              </div>
              <div className="router-score-badge">
                <span className="score-val">{selectedVersion.semanticAccuracySuccessfulPct.toFixed(1)}%</span>
                <span className="score-lbl">Semantic Accuracy</span>
              </div>
            </div>

            <div className="router-metrics-grid">
              <div className="router-metric-item">
                <span className="item-label">Dataset Description</span>
                <span className="item-sub" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedVersion.description}
                </span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Request Success</span>
                <span className="item-value">{selectedVersion.requestSuccessRatePct}%</span>
                <span className="item-sub">{selectedVersion.successfulRequests} of {selectedVersion.attempts} cases</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Average Confidence</span>
                <span className="item-value">
                  {selectedVersion.averageConfidence !== undefined
                    ? `${(selectedVersion.averageConfidence * 100).toFixed(1)}%`
                    : 'N/A'}
                </span>
                <span className="item-sub">Provider-returned confidence</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Version Role</span>
                <span className="item-sub" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedVersion.id === 'V3'
                    ? 'Stationary Holdout Benchmark'
                    : selectedVersion.datasetType === 'diagnostic'
                      ? 'Adaptive Stress-Test Probe'
                      : 'Progressive Baseline Suite'}
                </span>
              </div>
            </div>

            <div className="router-notes-box">
              <strong className="notes-heading">Methodological Notes:</strong> {selectedVersion.notes}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BenchmarkProgressionChart
