import React, { useMemo, useState } from 'react'
import { echarts, ReactEChartsCore, type EChartsOption } from './echarts-core'
import { JEV_BENCHMARK_PROGRESSION, type BenchmarkResult } from '../data/research-results'

export const BenchmarkProgressionChart: React.FC = () => {
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
        color: b.id === 'V3' ? '#38bdf8' : b.datasetType === 'diagnostic' ? '#a78bfa' : '#38bdf8',
        borderRadius: [4, 4, 0, 0],
      },
    }))

    const requestSuccessData = JEV_BENCHMARK_PROGRESSION.map((b) => ({
      value: b.requestSuccessRatePct,
      itemStyle: {
        color: b.requestSuccessRatePct === 100 ? '#10b981' : '#f59e0b',
        borderRadius: [4, 4, 0, 0],
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
        textStyle: {
          color: '#8b9bb4',
          fontSize: 12,
        },
        itemWidth: 14,
        itemHeight: 10,
        data: ['Semantic Accuracy (%)', 'Request Success Rate (%)', 'Avg Confidence (x100%)'],
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
          type: 'cross',
          lineStyle: { color: '#38bdf8', opacity: 0.3 },
        },
        formatter: (params: unknown) => {
          const items = params as Array<{ dataIndex: number }>
          if (!items || items.length === 0) return ''
          const idx = items[0].dataIndex
          const item: BenchmarkResult = JEV_BENCHMARK_PROGRESSION[idx]

          const typeBadgeColor =
            item.id === 'V3'
              ? 'background: rgba(56, 189, 248, 0.15); color: #38bdf8;'
              : item.datasetType === 'diagnostic'
                ? 'background: rgba(167, 139, 250, 0.15); color: #a78bfa;'
                : 'background: rgba(16, 185, 129, 0.15); color: #10b981;'

          const typeLabel =
            item.id === 'V3'
              ? 'V3 Balanced Holdout'
              : item.datasetType === 'diagnostic'
                ? 'Diagnostic / Stress Suite'
                : 'Benchmark Baseline'

          const confidenceDisplay =
            item.averageConfidence !== undefined
              ? (item.averageConfidence * 100).toFixed(2) + '%'
              : 'N/A'

          return `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 280px; line-height: 1.5;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222938; padding-bottom: 8px; margin-bottom: 8px;">
                <div>
                  <strong style="color: #f0f3f8; font-size: 14px;">${item.id} &mdash; ${item.name}</strong>
                  <div style="color: #64748b; font-size: 11px;">${item.description}</div>
                </div>
                <span style="font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 500; ${typeBadgeColor}">${typeLabel}</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 4px; font-size: 12px; margin-bottom: 6px;">
                <span style="color: #8b9bb4;">Semantic Accuracy:</span>
                <strong style="color: #38bdf8; font-variant-numeric: tabular-nums;">${item.semanticAccuracySuccessfulPct.toFixed(1)}%</strong>
                <span style="color: #8b9bb4;">Request Success:</span>
                <strong style="color: ${item.requestSuccessRatePct === 100 ? '#10b981' : '#f59e0b'}; font-variant-numeric: tabular-nums;">${item.requestSuccessRatePct.toFixed(1)}%</strong>
                <span style="color: #8b9bb4;">Attempts / Successful:</span>
                <span style="color: #f0f3f8; font-variant-numeric: tabular-nums;">${item.attempts} attempts (${item.successfulRequests} successful)</span>
                <span style="color: #8b9bb4;">Correct Responses:</span>
                <span style="color: #f0f3f8; font-variant-numeric: tabular-nums;">${item.correctSuccessfulResponses}</span>
                <span style="color: #8b9bb4;">Average Confidence:</span>
                <span style="color: #a78bfa; font-variant-numeric: tabular-nums;">${confidenceDisplay}</span>
              </div>
              <div style="font-size: 11px; color: #8b9bb4; border-top: 1px solid #222938; padding-top: 6px; margin-top: 6px;">
                <strong style="color: #cbd5e1;">Suite Notes:</strong> ${item.notes}
              </div>
            </div>
          `
        },
      },
      xAxis: {
        type: 'category',
        data: versionLabels,
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
          name: 'Rate (%)',
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
          max: 100,
          show: false,
        },
      ],
      series: [
        {
          name: 'Semantic Accuracy (%)',
          type: 'bar',
          barWidth: 22,
          data: semanticAccuracyData,
          label: {
            show: true,
            position: 'top',
            color: '#38bdf8',
            fontSize: 10,
            formatter: '{c}%',
          },
        },
        {
          name: 'Request Success Rate (%)',
          type: 'bar',
          barWidth: 22,
          data: requestSuccessData,
          label: {
            show: true,
            position: 'top',
            color: '#cbd5e1',
            fontSize: 10,
            formatter: '{c}%',
          },
        },
        {
          name: 'Avg Confidence (x100%)',
          type: 'line',
          yAxisIndex: 1,
          symbol: 'circle',
          symbolSize: 7,
          data: confidenceData,
          lineStyle: {
            color: '#a78bfa',
            width: 2,
            type: 'dotted',
          },
          itemStyle: {
            color: '#a78bfa',
          },
        },
      ],
    }
  }, [])

  return (
    <section className="section-container" id="benchmark-progression" aria-label="Jev Benchmark Progression">
      <div className="section-header">
        <div className="section-badge-row">
          <span className="badge badge-accent">Suite Evolution</span>
          <span className="badge">V1 &rarr; V5</span>
        </div>
        <h2 className="section-title">Jev Benchmark Progression</h2>
        <p className="section-subtitle">
          Tracking routing accuracy, infrastructure completion, and confidence degradation across frozen benchmarks and adversarial diagnostic suites.
        </p>
      </div>

      <div className="chart-card">
        {/* Methodological Suite Distinctions Header */}
        <div className="progression-banner-grid">
          <div className="progression-banner-card frozen-zone">
            <div className="zone-indicator">
              <span className="status-dot green"></span>
              <strong className="zone-title">V1 &ndash; V3: Systematic Benchmark Progression</strong>
            </div>
            <p className="zone-desc">
              Standard stationary evaluation. V1 (Baseline, 20 cases), V2 (Hard cases, 30 cases), and V3 (Frozen Balanced Holdout, 50 cases). Designed to measure generalization across predefined semantic distributions.
            </p>
          </div>
          <div className="progression-banner-card diagnostic-zone">
            <div className="zone-indicator">
              <span className="status-dot purple"></span>
              <strong className="zone-title">V4 &ndash; V5: Adaptive Diagnostic Suites</strong>
            </div>
            <p className="zone-desc">
              Active perturbation suites. V4 (Adversarial Minimal Pairs) and V5 (Cue-Stripped Prompts). Specifically crafted to stress boundary conditions and probe stochastic sensitivity. Not untouched holdouts.
            </p>
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

        {/* Interactive Suite Detail Tab Navigation */}
        <div className="suite-inspect-section">
          <div className="inspect-tabs" role="tablist" aria-label="Select benchmark version for details">
            {JEV_BENCHMARK_PROGRESSION.map((b) => (
              <button
                key={b.id}
                role="tab"
                aria-selected={selectedVersionId === b.id}
                className={`inspect-tab-btn ${selectedVersionId === b.id ? 'active' : ''}`}
                onClick={() => setSelectedVersionId(b.id)}
              >
                <span className="tab-name">{b.id}: {b.name}</span>
                <span className="tab-type-tag">
                  {b.id === 'V3' ? 'Holdout' : b.datasetType}
                </span>
              </button>
            ))}
          </div>

          <div className="router-detail-card" aria-live="polite">
            <div className="router-detail-header">
              <div>
                <h4 className="router-name">
                  {selectedVersion.id} &ndash; {selectedVersion.name}
                </h4>
                <p className="router-type-badge">{selectedVersion.description}</p>
              </div>
              <div className="suite-type-pill">
                <span className={`badge ${selectedVersion.id === 'V3' ? 'badge-success' : selectedVersion.datasetType === 'diagnostic' ? 'badge-purple' : 'badge-accent'}`}>
                  {selectedVersion.id === 'V3' ? 'Balanced Holdout (Canonical)' : `${selectedVersion.datasetType.toUpperCase()} SUITE`}
                </span>
              </div>
            </div>

            <div className="router-metrics-grid">
              <div className="router-metric-item">
                <span className="item-label">Semantic Accuracy</span>
                <span className="item-value">{selectedVersion.semanticAccuracySuccessfulPct.toFixed(1)}%</span>
                <span className="item-sub">
                  {selectedVersion.correctSuccessfulResponses} / {selectedVersion.successfulRequests} successful
                </span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Request Success</span>
                <span className="item-value">{selectedVersion.requestSuccessRatePct.toFixed(1)}%</span>
                <span className="item-sub">
                  {selectedVersion.successfulRequests} / {selectedVersion.attempts} attempts
                </span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Average Confidence</span>
                <span className="item-value">
                  {selectedVersion.averageConfidence !== undefined
                    ? (selectedVersion.averageConfidence * 100).toFixed(2) + '%'
                    : 'N/A'}
                </span>
                <span className="item-sub">Provider-returned confidence signal</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">All-Attempt Correct Rate</span>
                <span className="item-value">{selectedVersion.allAttemptCorrectRatePct.toFixed(1)}%</span>
                <span className="item-sub">End-to-end reliability</span>
              </div>
            </div>

            <div className="router-notes-box">
              <strong className="notes-heading">Methodological Analysis:</strong> {selectedVersion.notes}
            </div>
          </div>
        </div>

        <div className="chart-methodology-note" role="note">
          <strong className="notice-tag">Crucial Distinction:</strong>
          <span>
            The benchmark progression must not be interpreted as an uninterrupted line of stationary validation holdouts.
            While V1&ndash;V3 represent frozen evaluation distributions, V4 and V5 are intentionally adversarial suites built to surface
            failure frontiers. In V5, cue stripping revealed boundary instability (such as the V5U02 state), guiding the deep diagnostic investigation in V6&ndash;V8.
          </span>
        </div>
      </div>
    </section>
  )
}

export default BenchmarkProgressionChart
