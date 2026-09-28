import React, { useMemo, useState } from 'react'
import { echarts, ReactEChartsCore, type EChartsOption } from './echarts-core'
import { BOUNDARY_EVOLUTION, type BoundaryResult } from '../data/research-results'

export const DecisionBoundaryChart: React.FC = () => {
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
        textStyle: {
          color: '#8b9bb4',
          fontSize: 12,
        },
        itemWidth: 14,
        itemHeight: 10,
        data: [
          'SEARCH_CODE Choice Rate (%)',
          'ASK_USER Choice Rate (%)',
          'Average Margin P(top1)-P(top2)',
          'Average Confidence',
        ],
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
          const item: BoundaryResult = BOUNDARY_EVOLUTION[idx]

          return `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 290px; line-height: 1.5;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222938; padding-bottom: 8px; margin-bottom: 8px;">
                <div>
                  <strong style="color: #f0f3f8; font-size: 14px;">${item.id} (${item.experiment})</strong>
                  <div style="color: #64748b; font-size: 11px;">${item.label}</div>
                </div>
                <span style="font-size: 11px; background: rgba(56,189,248,0.12); color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${item.runs} Runs</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 4px; font-size: 12px; margin-bottom: 6px;">
                <span style="color: #8b9bb4;">Choice Distribution:</span>
                <span style="font-variant-numeric: tabular-nums;">
                  <strong style="color: #38bdf8;">SEARCH_CODE: ${item.searchCodeRatePct}%</strong> (${item.searchCodeCount}) |
                  <strong style="color: #f87171;">ASK_USER: ${item.askUserRatePct}%</strong> (${item.askUserCount})
                </span>
                <span style="color: #8b9bb4;">Average Margin:</span>
                <strong style="color: #fbbf24; font-variant-numeric: tabular-nums;">${item.averageMargin.toFixed(4)}</strong>
                <span style="color: #8b9bb4;">Average Confidence:</span>
                <strong style="color: #a78bfa; font-variant-numeric: tabular-nums;">${item.averageConfidence.toFixed(4)}</strong>
              </div>
              <div style="font-size: 11px; color: #8b9bb4; border-top: 1px solid #222938; padding-top: 6px; margin-top: 6px;">
                <strong style="color: #cbd5e1;">Empirical Interpretation:</strong> ${item.interpretation}
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
          fontSize: 11,
          lineHeight: 15,
        },
        axisTick: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: 100,
          interval: 20,
          name: 'Distribution (%)',
          nameTextStyle: { color: '#64748b', fontSize: 11 },
          axisLine: { show: false },
          axisLabel: {
            color: '#64748b',
            fontSize: 11,
            formatter: '{value}%',
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
          max: 1.1,
          interval: 0.2,
          name: 'Margin / Confidence',
          nameTextStyle: { color: '#fbbf24', fontSize: 11 },
          axisLine: { show: false },
          axisLabel: {
            color: '#fbbf24',
            fontSize: 11,
            formatter: '{value}',
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'SEARCH_CODE Choice Rate (%)',
          type: 'bar',
          stack: 'distribution',
          barWidth: 32,
          data: searchCodeData,
          itemStyle: {
            color: '#38bdf8',
          },
          markArea: {
            silent: true,
            itemStyle: {
              color: 'rgba(248, 113, 113, 0.04)',
            },
            data: [
              [
                {
                  name: 'Observed low-margin mixed-choice states',
                  xAxis: 0,
                  label: {
                    color: '#f87171',
                    fontSize: 11,
                    position: 'insideTopLeft',
                    offset: [10, 10],
                  },
                },
                {
                  xAxis: 3.4,
                },
              ],
              [
                {
                  name: 'Observed stable SEARCH_CODE routing',
                  xAxis: 3.6,
                  label: {
                    color: '#38bdf8',
                    fontSize: 11,
                    position: 'insideTopLeft',
                    offset: [10, 10],
                  },
                },
                {
                  xAxis: 5,
                },
              ],
            ],
          },
        },
        {
          name: 'ASK_USER Choice Rate (%)',
          type: 'bar',
          stack: 'distribution',
          barWidth: 32,
          data: askUserData,
          itemStyle: {
            color: '#f87171',
            borderRadius: [4, 4, 0, 0],
          },
        },
        {
          name: 'Average Margin P(top1)-P(top2)',
          type: 'line',
          yAxisIndex: 1,
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
          yAxisIndex: 1,
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
    <section className="section-container" id="decision-boundary" aria-label="ASK_USER vs SEARCH_CODE Decision Boundary">
      <div className="section-header">
        <div className="section-badge-row">
          <span className="badge badge-accent">Core Finding</span>
          <span className="badge badge-warning">Empirical Boundary</span>
        </div>
        <h2 className="section-title">ASK_USER &harr; SEARCH_CODE Decision Boundary</h2>
        <p className="section-subtitle">
          Visualizing the empirical transition from mixed stochastic decisions near ambiguous semantic frontiers toward stable SEARCH_CODE routing in the tested runs.
        </p>
      </div>

      <div className="chart-card">
        <div className="chart-header-row">
          <div>
            <h3 className="card-title">100% Stacked Action Distribution vs. Probability Margin Evolution</h3>
            <p className="card-caption">
              Evolution across 6 diagnostic states: Left bars show observed action split; right lines track top-1/top-2 margin and confidence.
            </p>
          </div>
          <div className="legend-tag-group">
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: '#38bdf8' }}></span>
              SEARCH_CODE Rate
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: '#f87171' }}></span>
              ASK_USER Rate
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

        <div className="chart-wrapper" style={{ height: 420 }}>
          <ReactEChartsCore
            echarts={echarts}
            option={chartOption}
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        </div>

        {/* Boundary State Step Selector */}
        <div className="boundary-inspect-section">
          <div className="inspect-tabs" role="tablist" aria-label="Select boundary experiment for details">
            {BOUNDARY_EVOLUTION.map((b) => (
              <button
                key={b.id}
                role="tab"
                aria-selected={selectedBoundaryId === b.id}
                className={`inspect-tab-btn ${selectedBoundaryId === b.id ? 'active' : ''}`}
                onClick={() => setSelectedBoundaryId(b.id)}
              >
                <span className="tab-name">{b.id}</span>
                <span className="tab-split">
                  {b.searchCodeRatePct}% / {b.askUserRatePct}%
                </span>
              </button>
            ))}
          </div>

          <div className="router-detail-card" aria-live="polite">
            <div className="router-detail-header">
              <div>
                <div className="boundary-card-id-row">
                  <h4 className="router-name">{selectedBoundary.id}: {selectedBoundary.label}</h4>
                  <span className="badge badge-accent">{selectedBoundary.experiment}</span>
                </div>
                <p className="router-type-badge">{selectedBoundary.runs} Repeated Empirical Runs</p>
              </div>
              <div className="boundary-rate-pill">
                <span className="pill-search">{selectedBoundary.searchCodeRatePct}% SEARCH</span>
                <span className="pill-divider">&bull;</span>
                <span className="pill-ask">{selectedBoundary.askUserRatePct}% ASK</span>
              </div>
            </div>

            <div className="router-metrics-grid">
              <div className="router-metric-item">
                <span className="item-label">SEARCH_CODE Count</span>
                <span className="item-value" style={{ color: '#38bdf8' }}>
                  {selectedBoundary.searchCodeCount} / {selectedBoundary.runs}
                </span>
                <span className="item-sub">{selectedBoundary.searchCodeRatePct}% selection frequency</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">ASK_USER Count</span>
                <span className="item-value" style={{ color: '#f87171' }}>
                  {selectedBoundary.askUserCount} / {selectedBoundary.runs}
                </span>
                <span className="item-sub">{selectedBoundary.askUserRatePct}% selection frequency</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Average Margin (P1 - P2)</span>
                <span className="item-value" style={{ color: '#fbbf24' }}>
                  {selectedBoundary.averageMargin.toFixed(4)}
                </span>
                <span className="item-sub">
                  {selectedBoundary.askUserRatePct > 0 ? 'Mixed action choices in tested runs' : 'Consistent SEARCH_CODE in tested runs'}
                </span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Average Confidence</span>
                <span className="item-value" style={{ color: '#a78bfa' }}>
                  {selectedBoundary.averageConfidence.toFixed(4)}
                </span>
                <span className="item-sub">Provider-returned confidence signal</span>
              </div>
            </div>

            <div className="router-notes-box">
              <strong className="notes-heading">Observed Boundary Dynamics:</strong> {selectedBoundary.interpretation}
            </div>
          </div>
        </div>

        {/* Mandatory Methodological Disclaimer */}
        <div className="chart-methodology-note" role="note">
          <strong className="notice-tag">Empirical Methodology Note:</strong>
          <span>
            Repeated evaluations of identical text characterize empirical stochastic behavior and are not independent observations.
            Mixed choices (e.g. 70% SEARCH_CODE / 30% ASK_USER in V5U02 or 80/20 in V8-C1) must NOT be described as random model failure.
            Rather, they reflect observed routing instability near a semantic decision boundary where the probability margin between candidate actions is small in the tested runs.
          </span>
        </div>
      </div>
    </section>
  )
}

export default DecisionBoundaryChart
