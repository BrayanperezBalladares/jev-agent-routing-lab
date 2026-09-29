import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { echarts, ReactEChartsCore, type EChartsOption } from './echarts-core'
import { V8_IMPLEMENTATION_EXPLICITNESS, type V8VariantResult } from '../data/research-results'
import { useChartTheme } from '../hooks/useChartTheme'

export const V8ExplicitnessChart: React.FC = () => {
  const { t } = useTranslation(['charts', 'common'])
  const chartTheme = useChartTheme()
  const [selectedVariantId, setSelectedVariantId] = useState<string>('C1')

  const selectedVariant = useMemo(() => {
    return (
      V8_IMPLEMENTATION_EXPLICITNESS.find((v) => v.id === selectedVariantId) ??
      V8_IMPLEMENTATION_EXPLICITNESS[0]
    )
  }, [selectedVariantId])

  const chartOption: EChartsOption = useMemo(() => {
    const xLabels = V8_IMPLEMENTATION_EXPLICITNESS.map((v) => v.id)

    const marginData = V8_IMPLEMENTATION_EXPLICITNESS.map((v) => Number(v.averageMargin.toFixed(3)))
    const confidenceData = V8_IMPLEMENTATION_EXPLICITNESS.map((v) => Number(v.averageConfidence.toFixed(3)))
    const instabilityData = V8_IMPLEMENTATION_EXPLICITNESS.map((v) => v.instabilityRatePct)

    return {
      backgroundColor: 'transparent',
      animationDuration: 500,
      grid: {
        top: 75,
        right: 55,
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
          t('explicitness.legendInstability', { ns: 'charts' }),
          t('explicitness.legendMargin', { ns: 'charts' }),
          t('explicitness.legendConfidence', { ns: 'charts' }),
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
          const item: V8VariantResult = V8_IMPLEMENTATION_EXPLICITNESS[idx]

          return `
            <div style="font-family: ${chartTheme.fontSans}; min-width: 300px; line-height: 1.5; color: ${chartTheme.textPrimary};">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${chartTheme.tooltipBorder}; padding-bottom: 8px; margin-bottom: 8px;">
                <div>
                  <strong style="color: ${chartTheme.textPrimary}; font-size: 14px;">Variant ${item.id}: ${item.label}</strong>
                </div>
                <span style="font-size: 11px; color: ${item.instabilityRatePct > 0 ? chartTheme.askUser : chartTheme.success}; padding: 2px 6px; border-radius: 2px; font-weight: 600; font-family: ${chartTheme.fontMono};">
                  ${item.instabilityRatePct > 0 ? `${item.instabilityRatePct}% Instability` : '0% Instability'}
                </span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 4px; font-size: 12px; margin-bottom: 6px;">
                <span style="color: ${chartTheme.textSecondary};">Action Rates:</span>
                <span style="font-variant-numeric: tabular-nums;">
                  <strong style="color: ${chartTheme.searchCode};">SEARCH: ${item.searchCodeRatePct}%</strong> (${item.searchCodeCount}) |
                  <strong style="color: ${chartTheme.askUser};">ASK: ${item.askUserRatePct}%</strong> (${item.askUserCount})
                </span>
                <span style="color: ${chartTheme.textSecondary};">${t('explicitness.legendMargin', { ns: 'charts' })}:</span>
                <strong style="color: ${chartTheme.accent}; font-variant-numeric: tabular-nums;">${item.averageMargin.toFixed(3)}</strong>
                <span style="color: ${chartTheme.textSecondary};">${t('explicitness.legendConfidence', { ns: 'charts' })}:</span>
                <strong style="color: ${chartTheme.primary}; font-variant-numeric: tabular-nums;">${item.averageConfidence.toFixed(3)}</strong>
              </div>
              <div style="font-size: 11px; color: ${chartTheme.textPrimary}; background: var(--surface-secondary); padding: 6px; border-radius: 2px; margin-top: 6px; border: 1px solid ${chartTheme.tooltipBorder};">
                <strong style="color: ${chartTheme.textSecondary};">State Cue:</strong> &ldquo;${item.stateCue}&rdquo;
              </div>
              <div style="font-size: 11px; color: ${chartTheme.textMutedColor}; border-top: 1px solid ${chartTheme.tooltipBorder}; padding-top: 6px; margin-top: 6px;">
                <strong style="color: ${chartTheme.textPrimary};">Interpretation:</strong> ${item.interpretation}
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
          margin: 12,
        },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          name: t('explicitness.legendInstability', { ns: 'charts' }),
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
          name: t('explicitness.yAxisMargin', { ns: 'charts' }),
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
          name: t('explicitness.legendInstability', { ns: 'charts' }),
          type: 'bar',
          barWidth: 28,
          data: instabilityData,
          itemStyle: {
            color: chartTheme.askUser,
            borderRadius: [2, 2, 0, 0],
          },
        },
        {
          name: t('explicitness.legendMargin', { ns: 'charts' }),
          type: 'line',
          yAxisIndex: 1,
          data: marginData,
          symbol: 'diamond',
          symbolSize: 9,
          itemStyle: { color: chartTheme.accent },
          lineStyle: { color: chartTheme.accent, width: 2 },
        },
        {
          name: t('explicitness.legendConfidence', { ns: 'charts' }),
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
    <section className="section-container" id="v8-explicitness" aria-label={t('explicitness.title', { ns: 'charts' })}>
      <div className="section-header">
        <div className="section-badge-row">
          <span className="badge badge-accent">{t('explicitness.badge', { ns: 'charts' })}</span>
          <span className="badge">C1–C6 Progression</span>
        </div>
        <h2 className="section-title">{t('explicitness.title', { ns: 'charts' })}</h2>
        <p className="section-subtitle">{t('explicitness.description', { ns: 'charts' })}</p>
      </div>

      <div className="chart-card">
        <div className="chart-header-row">
          <div>
            <h3 className="card-title">Impact of State Explicitness on Decision Margin &amp; Stability</h3>
            <p className="card-caption">
              Making unresolved implementation location explicit (C2–C6) coincided with 0% instability and near-maximal margin separation in the evaluated runs.
            </p>
          </div>
          <div className="legend-tag-group">
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.askUser }}></span>
              Instability Rate (%)
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.accent }}></span>
              Margin (P1 - P2)
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: chartTheme.primary }}></span>
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

        {/* Interactive Variant Tabs */}
        <div className="router-inspect-section">
          <div className="inspect-tabs" role="tablist" aria-label="Select variant for detailed inspection">
            {V8_IMPLEMENTATION_EXPLICITNESS.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={selectedVariantId === v.id}
                className={`inspect-tab-btn ${selectedVariantId === v.id ? 'active' : ''}`}
                onClick={() => setSelectedVariantId(v.id)}
              >
                <span className="tab-name">{v.id}</span>
                <span className="tab-score">
                  {v.instabilityRatePct > 0 ? `${v.instabilityRatePct}% mixed` : 'stable'}
                </span>
              </button>
            ))}
          </div>

          <div className="router-detail-card" aria-live="polite">
            <div className="router-detail-header">
              <div>
                <h4 className="router-name">Variant {selectedVariant.id} — {selectedVariant.label}</h4>
                <span className="router-type-badge">
                  {selectedVariant.instabilityRatePct > 0 ? 'Boundary Instability' : 'Stable Routing'}
                </span>
              </div>
              <div className="router-score-badge">
                <span className="score-val">{selectedVariant.averageMargin.toFixed(3)}</span>
                <span className="score-lbl">Average Margin</span>
              </div>
            </div>

            <div className="router-metrics-grid">
              <div className="router-metric-item">
                <span className="item-label">Prompt Cue Text</span>
                <span className="item-sub" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  &ldquo;{selectedVariant.stateCue}&rdquo;
                </span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Choice Distribution</span>
                <span className="item-value">
                  {selectedVariant.searchCodeCount} SEARCH / {selectedVariant.askUserCount} ASK
                </span>
                <span className="item-sub">Across {selectedVariant.runs} repeated runs</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Instability Rate</span>
                <span className="item-value">
                  {selectedVariant.instabilityRatePct}%
                </span>
                <span className="item-sub">
                  {selectedVariant.instabilityRatePct > 0 ? 'Stochastic alternation observed' : 'Consistent single action'}
                </span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Average Confidence</span>
                <span className="item-value">{selectedVariant.averageConfidence.toFixed(3)}</span>
                <span className="item-sub">Provider-returned confidence</span>
              </div>
            </div>

            <div className="router-notes-box">
              <strong className="notes-heading">Behavioral Interpretation:</strong> {selectedVariant.interpretation}
            </div>
          </div>
        </div>

        {/* Methodological Caveat */}
        <div className="chart-methodology-note" role="note">
          <strong className="notice-tag">Ablation Interpretation:</strong>
          <span>
            The V8 ablation demonstrates that prompt wording and state explicitness strongly affected decision stability in these experiments.
            When the prompt explicitly acknowledged missing implementation details, the router converged to SEARCH_CODE with near-maximal margin separation in the evaluated runs.
          </span>
        </div>
      </div>
    </section>
  )
}

export default V8ExplicitnessChart
