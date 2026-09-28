# Jev Agent Routing Lab — Research Visualizations

An interactive research dashboard analyzing semantic routing accuracy, repeated decision stability, confidence/margin dynamics, and decision boundaries for software-engineering agents.

## Purpose

This application provides empirical visualizations for the **Jev Agent Routing Lab** (`typesafe-ai/jev`), evaluating specialized semantic evaluators against keyword baselines and general-purpose LLMs across multi-candidate routing tasks.

Key empirical areas investigated:
- **Macro Semantic Accuracy**: Measuring multi-candidate action discrimination on frozen holdout suites.
- **Decision Stability & Stochastic Drift**: Quantifying empirical choice distribution across 10–20 repeated evaluations of identical text prompts.
- **Top-1 / Top-2 Margin Mechanics**: Visualizing probability separation (`margin = P(top1) - P(top2)`) across semantic boundary transitions.
- **ASK_USER ↔ SEARCH_CODE Decision Boundaries**: Characterizing the frontier where routers alternate between requesting user clarification and autonomous codebase inspection.
- **Agent-State Representation**: Examining how explicitly qualifying unresolved operational context resolves choice ambiguity.

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vite.dev/)
- **Charts & Visualizations**: [Apache ECharts](https://echarts.apache.org/) via [`echarts-for-react`](https://github.com/hustcc/echarts-for-react) (modular tree-shaken configuration)
- **Styling**: Vanilla CSS adhering to strict craft principles (flat deliberate palette, no neon glow, explicit transitions, tabular numbers, responsive dark theme)

## Canonical Data Source

All quantitative metrics and experimental notes displayed in this dashboard are imported strictly from:

```
src/data/research-results.ts
```

This file serves as the frozen ground-truth dataset for:
- `HOLDOUT_COMPARISON`: Balanced V3 holdout results across Jev, Rule baseline, GPT-5-mini, and Nemotron Ultra.
- `JEV_BENCHMARK_PROGRESSION`: Suite evolution across V1 through V5.
- `BOUNDARY_EVOLUTION`: Empirical repeated-run distributions across six diagnostic states (`V5U02` to `V8-C3`).
- `V8_IMPLEMENTATION_EXPLICITNESS`: Six-variant ablation (`C1` to `C6`) evaluating prompt state cues.
- `RESEARCH_NOTES`: Canonical caveats, findings, and methodological warnings.

> **Important**: `research-results.ts` is treated as canonical and immutable. Metrics must never be re-normalized, interpolated, or duplicated inline.

## Methodological Notice

> **Adaptive Diagnostics vs. Stationary Holdouts**:
> Suites **V1 through V3** represent frozen benchmark suites (culminating in the 50-case balanced holdout V3).
> In contrast, suites **V4 through V8** are **adaptive diagnostic experiments** specifically designed to probe failure frontiers, minimal pairs, and cue-stripping. They must **not** be presented as untouched holdouts.
>
> Furthermore, repeated evaluations of identical text characterize empirical stochastic behavior under inference conditions, not independent statistical observations.

## Development & Build Commands

All commands should be executed from within the `visualizations/` directory:

```bash
# Install dependencies
pnpm install

# Start local Vite development server with HMR
pnpm dev

# Typecheck and build production distribution
pnpm build

# Run ESLint validation
pnpm lint

# Pure TypeScript validation
npx tsc -b
```

## Production Architecture & Code Splitting

The production build optimizes bundle size and performance using modular ECharts imports (`BarChart`, `LineChart`, `SVGRenderer`, `Tooltip`, `Grid`, `Legend`, `MarkArea`) and automated vendor chunk splitting:
- `react-vendor`: React runtime, DOM bindings, and wrapper components.
- `echarts-vendor`: Modular Apache ECharts core and renderers.
- `index`: Application components and layout logic.
