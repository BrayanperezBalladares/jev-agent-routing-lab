import React, { useMemo, useState } from 'react'
import { echarts, ReactEChartsCore, type EChartsOption } from './echarts-core'
import { V8_IMPLEMENTATION_EXPLICITNESS, type V8VariantResult } from '../data/research-results'

export const V8ExplicitnessChart: React.FC = () => {
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
        textStyle: {
          color: '#8b9bb4',
          fontSize: 12,
        },
        itemWidth: 14,
        itemHeight: 10,
        data: ['Instability Rate (%)', 'Average Margin (P1 - P2)', 'Average Confidence'],
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#131720',
        borderColor: '#333e54',
        borderWidth: 1,
        padding: [12, 16],
        textStyle: {
          color: '#f0f3f8',
          fontSize: 13,
        },
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(56, 189, 248, 0.05)',
          },
        },
        formatter: (params: unknown) => {
          const items = params as Array<{ dataIndex: number }>
          if (!items || items.length === 0) return ''
          const idx = items[0].dataIndex
          const item: V8VariantResult = V8_IMPLEMENTATION_EXPLICITNESS[idx]

          return `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 300px; line-height: 1.5;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222938; padding-bottom: 8px; margin-bottom: 8px;">
                <div>
                  <strong style="color: #f0f3f8; font-size: 14px;">Variant ${item.id}: ${item.label}</strong>
                </div>
                <span style="font-size: 11px; background: ${item.instabilityRatePct > 0 ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)'}; color: ${item.instabilityRatePct > 0 ? '#f87171' : '#34d399'}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                  ${item.instabilityRatePct > 0 ? `${item.instabilityRatePct}% Instability` : '0% Instability'}
                </span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 4px; font-size: 12px; margin-bottom: 6px;">
                <span style="color: #8b9bb4;">Action Rates:</span>
                <span style="font-variant-numeric: tabular-nums;">
                  <strong style="color: #38bdf8;">SEARCH: ${item.searchCodeRatePct}%</strong> (${item.searchCodeCount}) |
                  <strong style="color: #f87171;">ASK: ${item.askUserRatePct}%</strong> (${item.askUserCount})
                </span>
                <span style="color: #8b9bb4;">Average Margin:</span>
                <strong style="color: #fbbf24; font-variant-numeric: tabular-nums;">${item.averageMargin.toFixed(3)}</strong>
                <span style="color: #8b9bb4;">Average Confidence:</span>
                <strong style="color: #a78bfa; font-variant-numeric: tabular-nums;">${item.averageConfidence.toFixed(3)}</strong>
              </div>
              <div style="font-size: 11px; color: #38bdf8; background: rgba(56,189,248,0.06); padding: 6px; border-radius: 4px; margin-top: 6px; border: 1px solid #222938;">
                <strong style="color: #cbd5e1;">State Cue:</strong> &ldquo;${item.stateCue}&rdquo;
              </div>
              <div style="font-size: 11px; color: #8b9bb4; border-top: 1px solid #222938; padding-top: 6px; margin-top: 6px;">
                <strong style="color: #cbd5e1;">Interpretation:</strong> ${item.interpretation}
              </div>
            </div>
          `
        },
      },
      xAxis: {
        type: 'category',
        data: xLabels,
        axisLine: { lineStyle: { color: '#222938' } },
        axisLabel: {
          color: '#cbd5e1',
          fontSize: 12,
          fontWeight: 600,
          interval: 0,
        },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: 1.1,
          interval: 0.2,
          name: 'Margin & Confidence',
          nameTextStyle: { color: '#fbbf24', fontSize: 11 },
          axisLine: { show: false },
          axisLabel: {
            color: '#fbbf24',
            fontSize: 11,
            formatter: '{value}',
          },
          splitLine: {
            lineStyle: {
              color: '#1a2234',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          min: 0,
          max: 30,
          interval: 10,
          name: 'Instability Rate (%)',
          nameTextStyle: { color: '#f87171', fontSize: 11 },
          axisLine: { show: false },
          axisLabel: {
            color: '#f87171',
            fontSize: 11,
            formatter: '{value}%',
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Instability Rate (%)',
          type: 'bar',
          yAxisIndex: 1,
          barWidth: 26,
          data: instabilityData,
          itemStyle: {
            color: '#f87171',
            borderRadius: [4, 4, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            color: '#f87171',
            fontSize: 10,
            formatter: (params: unknown) => {
              const p = params as { value?: number | string | null }
              if (!p.value || Number(p.value) === 0) return ''
              return `${p.value}%`
            },
          },
        },
        {
          name: 'Average Margin (P1 - P2)',
          type: 'line',
          yAxisIndex: 0,
          symbol: 'diamond',
          symbolSize: 9,
          data: marginData,
          lineStyle: {
            color: '#fbbf24',
            width: 2.5,
          },
          itemStyle: {
            color: '#fbbf24',
            borderColor: '#131720',
            borderWidth: 1.5,
          },
        },
        {
          name: 'Average Confidence',
          type: 'line',
          yAxisIndex: 0,
          symbol: 'circle',
          symbolSize: 8,
          data: confidenceData,
          lineStyle: {
            color: '#a78bfa',
            width: 2,
            type: 'dashed',
          },
          itemStyle: {
            color: '#a78bfa',
            borderColor: '#131720',
            borderWidth: 1.5,
          },
        },
      ],
    }
  }, [])

  return (
    <section className="section-container" id="v8-explicitness" aria-label="V8 Implementation-Explicitness Ablation">
      <div className="section-header">
        <div className="section-badge-row">
          <span className="badge badge-accent">V8 Ablation Suite</span>
          <span className="badge badge-purple">State Cue Analysis</span>
        </div>
        <h2 className="section-title">V8 Implementation-Explicitness Analysis</h2>
        <p className="section-subtitle">
          Observed progression across six prompt variants (C1 &rarr; C6) testing how explicitly qualifying unresolved operational information collapses ambiguity and resolves routing instability.
        </p>
      </div>

      <div className="chart-card">
        <div className="chart-header-row">
          <div>
            <h3 className="card-title">Progression from Boundary Ambiguity to Stable SEARCH_CODE Routing</h3>
            <p className="card-caption">
              Progression C1 &rarr; C6: Bars depict stochastic instability; lines depict probability separation margin and model confidence.
            </p>
          </div>
          <div className="legend-tag-group">
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: '#f87171' }}></span>
              Instability Rate (%)
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: '#fbbf24' }}></span>
              Avg Margin (P1 - P2)
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: '#a78bfa' }}></span>
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

        {/* Progression Stage Cards (C1 vs C2 vs C3+) */}
        <div className="explicitness-stages-grid">
          <div className={`stage-card ${selectedVariant.id === 'C1' ? 'active' : ''}`} onClick={() => setSelectedVariantId('C1')}>
            <div className="stage-header">
              <span className="stage-pill warn">C1: Requirement Only</span>
              <span className="stage-instability">20% Instability</span>
            </div>
            <p className="stage-summary">
              Approved requirement provided, but operational uncertainty is left implicit. Results in low margin (0.034) and mixed choices.
            </p>
          </div>

          <div className={`stage-card ${selectedVariant.id === 'C2' ? 'active' : ''}`} onClick={() => setSelectedVariantId('C2')}>
            <div className="stage-header">
              <span className="stage-pill mid">C2: Implementation Not Discussed</span>
              <span className="stage-instability green">0% Instability</span>
            </div>
            <p className="stage-summary">
              Explicitly notes implementation is not discussed. Achieves 100% empirical SEARCH_CODE consistency with moderate margin (0.284).
            </p>
          </div>

          <div className={`stage-card ${['C3', 'C4', 'C5', 'C6'].includes(selectedVariant.id) ? 'active' : ''}`} onClick={() => setSelectedVariantId('C3')}>
            <div className="stage-header">
              <span className="stage-pill strong">C3&ndash;C6: Location Explicit</span>
              <span className="stage-instability green">0% Instability</span>
            </div>
            <p className="stage-summary">
              Explicitly frames missing information as unknown repository location. Coincided with margin rising to ~1.00 and observed stable SEARCH_CODE routing in the tested runs.
            </p>
          </div>
        </div>

        {/* Interactive Variant Detail Inspector */}
        <div className="variant-inspect-section">
          <div className="inspect-tabs" role="tablist" aria-label="Select variant C1 through C6">
            {V8_IMPLEMENTATION_EXPLICITNESS.map((v) => (
              <button
                key={v.id}
                role="tab"
                aria-selected={selectedVariantId === v.id}
                className={`inspect-tab-btn ${selectedVariantId === v.id ? 'active' : ''}`}
                onClick={() => setSelectedVariantId(v.id)}
              >
                <span className="tab-name">{v.id}</span>
                <span className="tab-margin">Margin: {v.averageMargin.toFixed(2)}</span>
              </button>
            ))}
          </div>

          <div className="router-detail-card" aria-live="polite">
            <div className="router-detail-header">
              <div>
                <div className="boundary-card-id-row">
                  <h4 className="router-name">Variant {selectedVariant.id}: {selectedVariant.label}</h4>
                  <span className={`badge ${selectedVariant.instabilityRatePct > 0 ? 'badge-warning' : 'badge-success'}`}>
                    {selectedVariant.instabilityRatePct}% Instability
                  </span>
                </div>
                <p className="router-type-badge">{selectedVariant.runs} Repeated Empirical Runs</p>
              </div>
              <div className="variant-margin-badge">
                <span className="score-val" style={{ color: '#fbbf24' }}>{selectedVariant.averageMargin.toFixed(3)}</span>
                <span className="score-lbl">Top-1/Top-2 Margin</span>
              </div>
            </div>

            {/* State Cue Callout */}
            <div className="state-cue-box">
              <span className="cue-tag">Prompt State Cue:</span>
              <blockquote className="cue-text">&ldquo;{selectedVariant.stateCue}&rdquo;</blockquote>
            </div>

            <div className="router-metrics-grid">
              <div className="router-metric-item">
                <span className="item-label">SEARCH_CODE Rate</span>
                <span className="item-value" style={{ color: '#38bdf8' }}>{selectedVariant.searchCodeRatePct}%</span>
                <span className="item-sub">{selectedVariant.searchCodeCount} of {selectedVariant.runs} runs</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">ASK_USER Rate</span>
                <span className="item-value" style={{ color: '#f87171' }}>{selectedVariant.askUserRatePct}%</span>
                <span className="item-sub">{selectedVariant.askUserCount} of {selectedVariant.runs} runs</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Average Confidence</span>
                <span className="item-value" style={{ color: '#a78bfa' }}>{selectedVariant.averageConfidence.toFixed(3)}</span>
                <span className="item-sub">Provider-returned confidence signal</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Empirical Instability</span>
                <span className="item-value" style={{ color: selectedVariant.instabilityRatePct > 0 ? '#f87171' : '#34d399' }}>
                  {selectedVariant.instabilityRatePct}%
                </span>
                <span className="item-sub">Observed decision divergence</span>
              </div>
            </div>

            <div className="router-notes-box">
              <strong className="notes-heading">Observed Transition Dynamics:</strong> {selectedVariant.interpretation}
            </div>
          </div>
        </div>

        {/* Methodological Boundary Note */}
        <div className="chart-methodology-note" role="note">
          <strong className="notice-tag">Scope Limitation:</strong>
          <span>
            These findings describe an observed empirical progression within the controlled V8 diagnostic family and do NOT establish universal causality
            or production margin thresholds. Semantic routers operate on multi-dimensional prompt representations; state explicitness is an observed
            disambiguation mechanism in this benchmark, not an invariant guarantee across arbitrary architectures.
          </span>
        </div>
      </div>
    </section>
  )
}

export default V8ExplicitnessChart
