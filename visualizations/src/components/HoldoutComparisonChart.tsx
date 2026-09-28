import React, { useMemo, useState } from 'react'
import { echarts, ReactEChartsCore, type EChartsOption } from './echarts-core'
import { HOLDOUT_COMPARISON, type HoldoutRouterResult } from '../data/research-results'

export const HoldoutComparisonChart: React.FC = () => {
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
            ? '#38bdf8'
            : r.id === 'nemotron-ultra'
              ? '#34d399'
              : r.id === 'gpt-5-mini'
                ? '#818cf8'
                : '#64748b',
        borderRadius: [4, 4, 0, 0],
      },
    }))

    const allAttemptCorrectData = HOLDOUT_COMPARISON.map((r) => ({
      value: r.allAttemptCorrectRatePct,
      itemStyle: {
        color: '#475569',
        borderRadius: [4, 4, 0, 0],
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
        textStyle: {
          color: '#8b9bb4',
          fontSize: 12,
        },
        itemWidth: 14,
        itemHeight: 10,
        data: ['Semantic Accuracy (Successful Requests)', 'All-Attempt Correct Rate (Infra + Semantic)'],
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
            color: 'rgba(56, 189, 248, 0.08)',
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
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 260px; line-height: 1.5;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222938; padding-bottom: 8px; margin-bottom: 8px;">
                <strong style="color: #f0f3f8; font-size: 14px;">${item.name}</strong>
                <span style="color: #38bdf8; font-size: 11px; background: rgba(56,189,248,0.12); padding: 2px 6px; border-radius: 4px; font-family: monospace;">${item.routerType}</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr auto; gap: 4px; font-size: 12px; margin-bottom: 6px;">
                <span style="color: #8b9bb4;">Semantic Accuracy (Successful):</span>
                <strong style="color: #38bdf8; font-variant-numeric: tabular-nums;">${item.semanticAccuracySuccessfulPct.toFixed(1)}%</strong>
                <span style="color: #8b9bb4;">All-Attempt Correct Rate:</span>
                <strong style="color: #94a3b8; font-variant-numeric: tabular-nums;">${item.allAttemptCorrectRatePct.toFixed(1)}%</strong>
                <span style="color: #8b9bb4;">Successful / Total Attempts:</span>
                <span style="color: #f0f3f8; font-variant-numeric: tabular-nums;">${item.successfulRequests} / ${item.attempts}</span>
                <span style="color: #8b9bb4;">Correct Responses:</span>
                <span style="color: #f0f3f8; font-variant-numeric: tabular-nums;">${item.correctSuccessfulResponses}</span>
                <span style="color: #8b9bb4;">Latency:</span>
                <span style="color: #f0f3f8; font-variant-numeric: tabular-nums;">${latencyInfo}</span>
                <span style="color: #8b9bb4;">Cost:</span>
                <span style="color: #f0f3f8; font-variant-numeric: tabular-nums;">${costInfo}</span>
              </div>
              <div style="font-size: 11px; color: #56657f; border-top: 1px solid #222938; padding-top: 6px; margin-top: 6px;">
                <em>Cost Basis:</em> ${item.costBasis}
              </div>
            </div>
          `
        },
      },
      xAxis: {
        type: 'category',
        data: routerNames,
        axisLine: { lineStyle: { color: '#222938' } },
        axisLabel: {
          color: '#cbd5e1',
          fontSize: 12,
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
      series: [
        {
          name: 'Semantic Accuracy (Successful Requests)',
          type: 'bar',
          barWidth: 28,
          barGap: '20%',
          data: semanticAccuracyData,
          label: {
            show: true,
            position: 'top',
            color: '#cbd5e1',
            fontSize: 11,
            formatter: (params: unknown) => {
              const p = params as { value?: number | string | null }
              if (p.value === undefined || p.value === null) return ''
              return `${Number(p.value).toFixed(1)}%`
            },
          },
        },
        {
          name: 'All-Attempt Correct Rate (Infra + Semantic)',
          type: 'bar',
          barWidth: 28,
          data: allAttemptCorrectData,
          label: {
            show: true,
            position: 'top',
            color: '#64748b',
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
  }, [])

  return (
    <section className="section-container" id="holdout-comparison" aria-label="V3 Holdout Router Comparison">
      <div className="section-header">
        <div className="section-badge-row">
          <span className="badge badge-accent">V3 Benchmark</span>
          <span className="badge">50 Test Cases</span>
        </div>
        <h2 className="section-title">V3 Holdout Router Comparison</h2>
        <p className="section-subtitle">
          Evaluating semantic decision fidelity and infrastructure reliability across four distinct routing architectures on a frozen 50-case benchmark.
        </p>
      </div>

      <div className="chart-card">
        <div className="chart-header-row">
          <div>
            <h3 className="card-title">Semantic Decision Accuracy vs. Infrastructure Reliability</h3>
            <p className="card-caption">
              Primary metric: percentage of successful requests routed to ground-truth action (50 balanced test cases).
            </p>
          </div>
          <div className="legend-tag-group">
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: '#38bdf8' }}></span>
              Jev (Specialized)
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: '#34d399' }}></span>
              Nemotron Ultra
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: '#818cf8' }}></span>
              GPT-5-mini
            </span>
            <span className="legend-tag">
              <span className="legend-dot" style={{ background: '#64748b' }}></span>
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
                <span className="score-lbl">Semantic Accuracy</span>
              </div>
            </div>

            <div className="router-metrics-grid">
              <div className="router-metric-item">
                <span className="item-label">Request Success</span>
                <span className="item-value">{selectedRouter.requestSuccessRatePct}%</span>
                <span className="item-sub">
                  {selectedRouter.successfulRequests} of {selectedRouter.attempts} attempts
                </span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Correct Responses</span>
                <span className="item-value">{selectedRouter.correctSuccessfulResponses}</span>
                <span className="item-sub">All-attempt rate: {selectedRouter.allAttemptCorrectRatePct}%</span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Latency Profile</span>
                <span className="item-value">
                  {selectedRouter.medianLatencyMs ? `${selectedRouter.medianLatencyMs}ms` : `${selectedRouter.averageLatencyMs}ms`}
                </span>
                <span className="item-sub">
                  {selectedRouter.medianLatencyMs ? `Avg: ${selectedRouter.averageLatencyMs?.toFixed(0)}ms` : 'Local deterministic'}
                </span>
              </div>
              <div className="router-metric-item">
                <span className="item-label">Cost / Cost Basis</span>
                <span className="item-value">
                  {selectedRouter.costUsd !== undefined ? `$${selectedRouter.costUsd.toFixed(6)}` : 'N/A'}
                </span>
                <span className="item-sub">{selectedRouter.costBasis}</span>
              </div>
            </div>

            <div className="router-notes-box">
              <strong className="notes-heading">Evaluation Context:</strong> {selectedRouter.notes}
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
    </section>
  )
}

export default HoldoutComparisonChart
