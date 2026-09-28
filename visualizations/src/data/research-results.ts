export type RouterId =
  | 'jev'
  | 'rules'
  | 'gpt-5-mini'
  | 'nemotron-ultra'

export interface HoldoutRouterResult {
  id: RouterId
  name: string
  routerType: string

  attempts: number
  successfulRequests: number
  correctSuccessfulResponses: number
  correctAllAttempts: number

  requestSuccessRatePct: number
  semanticAccuracySuccessfulPct: number
  allAttemptCorrectRatePct: number

  medianLatencyMs?: number
  averageLatencyMs?: number

  costUsd?: number
  costBasis: string

  notes: string
}

export interface BenchmarkResult {
  id: 'V1' | 'V2' | 'V3' | 'V4' | 'V5'
  name: string
  description: string

  attempts: number
  successfulRequests: number
  correctSuccessfulResponses: number

  requestSuccessRatePct: number
  semanticAccuracySuccessfulPct: number
  allAttemptCorrectRatePct: number

  averageConfidence?: number

  datasetType:
    | 'initial'
    | 'hard'
    | 'holdout'
    | 'diagnostic'

  notes: string
}

export interface BoundaryResult {
  id: string
  experiment: string
  label: string

  runs: number

  searchCodeCount: number
  askUserCount: number

  searchCodeRatePct: number
  askUserRatePct: number

  averageConfidence: number
  averageMargin: number

  interpretation: string
}

export interface V8VariantResult {
  id:
    | 'C1'
    | 'C2'
    | 'C3'
    | 'C4'
    | 'C5'
    | 'C6'

  label: string
  stateCue: string

  runs: number

  searchCodeCount: number
  askUserCount: number

  searchCodeRatePct: number
  askUserRatePct: number

  averageConfidence: number
  averageMargin: number

  instabilityRatePct: number

  interpretation: string
}

/**
 * Balanced V3 holdout comparison.
 *
 * Important:
 * These systems were not evaluated under perfectly identical
 * infrastructure, retry, latency, or pricing conditions.
 *
 * This data should therefore not be presented as a universal
 * model leaderboard.
 */
export const HOLDOUT_COMPARISON: HoldoutRouterResult[] = [
  {
    id: 'jev',
    name: 'Jev',
    routerType: 'Specialized semantic evaluator',

    attempts: 50,
    successfulRequests: 50,
    correctSuccessfulResponses: 50,
    correctAllAttempts: 50,

    requestSuccessRatePct: 100,
    semanticAccuracySuccessfulPct: 100,
    allAttemptCorrectRatePct: 100,

    medianLatencyMs: 292,
    averageLatencyMs: 3649,

    costUsd: 0.00096537,
    costBasis: 'Observed Vercel AI Gateway market cost',

    notes:
      'End-to-end mean latency was heavily distorted by two retry outliers. Median latency is more representative.',
  },

  {
    id: 'rules',
    name: 'Rule baseline',
    routerType: 'Deterministic keyword router',

    attempts: 50,
    successfulRequests: 50,
    correctSuccessfulResponses: 24,
    correctAllAttempts: 24,

    requestSuccessRatePct: 100,
    semanticAccuracySuccessfulPct: 48,
    allAttemptCorrectRatePct: 48,

    averageLatencyMs: 0.028,

    costUsd: 0,
    costBasis: 'Local deterministic execution',

    notes:
      'Simple lexical baseline. Earlier datasets influenced its design, so the balanced holdout is the more informative comparison.',
  },

  {
    id: 'gpt-5-mini',
    name: 'GPT-5-mini',
    routerType: 'General-purpose LLM',

    attempts: 50,
    successfulRequests: 50,
    correctSuccessfulResponses: 40,
    correctAllAttempts: 40,

    requestSuccessRatePct: 100,
    semanticAccuracySuccessfulPct: 80,
    allAttemptCorrectRatePct: 80,

    medianLatencyMs: 1293,
    averageLatencyMs: 11821,

    costUsd: 0.005615,
    costBasis: 'Estimated model list pricing',

    notes:
      'Latency included several very large outliers. Cost methodology is not directly equivalent to the Jev gateway market-cost field.',
  },

  {
    id: 'nemotron-ultra',
    name: 'Nemotron Ultra',
    routerType: 'General-purpose reasoning model',

    attempts: 50,
    successfulRequests: 48,
    correctSuccessfulResponses: 47,
    correctAllAttempts: 47,

    requestSuccessRatePct: 96,
    semanticAccuracySuccessfulPct: 97.9167,
    allAttemptCorrectRatePct: 94,

    medianLatencyMs: 746,
    averageLatencyMs: 1732.916,

    costUsd: 0,
    costBasis:
      'Observed Free Endpoint during the experiment; not an intrinsic cost guarantee',

    notes:
      'Two requests failed operationally. One successful response was a semantic routing error.',
  },
]

/**
 * Main Jev benchmark progression.
 *
 * V4 and V5 are diagnostic/adaptive suites, not independent
 * untouched holdouts.
 */
export const JEV_BENCHMARK_PROGRESSION: BenchmarkResult[] = [
  {
    id: 'V1',
    name: 'Baseline',
    description: 'Initial routing validation',

    attempts: 20,
    successfulRequests: 20,
    correctSuccessfulResponses: 20,

    requestSuccessRatePct: 100,
    semanticAccuracySuccessfulPct: 100,
    allAttemptCorrectRatePct: 100,

    averageConfidence: 0.9525,

    datasetType: 'initial',

    notes:
      'Initial dataset used to verify the five-action routing formulation.',
  },

  {
    id: 'V2',
    name: 'Hard cases',
    description: 'More difficult semantic distinctions',

    attempts: 30,
    successfulRequests: 30,
    correctSuccessfulResponses: 30,

    requestSuccessRatePct: 100,
    semanticAccuracySuccessfulPct: 100,
    allAttemptCorrectRatePct: 100,

    averageConfidence: 0.979,

    datasetType: 'hard',

    notes:
      'Introduced more difficult routing cases while keeping the same action definitions.',
  },

  {
    id: 'V3',
    name: 'Balanced holdout',
    description:
      'Balanced evaluation after the routing criteria and simple rule baseline were frozen',

    attempts: 50,
    successfulRequests: 50,
    correctSuccessfulResponses: 50,

    requestSuccessRatePct: 100,
    semanticAccuracySuccessfulPct: 100,
    allAttemptCorrectRatePct: 100,

    averageConfidence: 0.958,

    datasetType: 'holdout',

    notes:
      'Primary balanced holdout used for the cross-router comparison.',
  },

  {
    id: 'V4',
    name: 'Minimal pairs',
    description:
      'Adversarial pairs where small semantic changes should change the routed action',

    attempts: 40,
    successfulRequests: 39,
    correctSuccessfulResponses: 39,

    requestSuccessRatePct: 97.5,
    semanticAccuracySuccessfulPct: 100,
    allAttemptCorrectRatePct: 97.5,

    averageConfidence: 0.9646,

    datasetType: 'diagnostic',

    notes:
      'One infrastructure failure. All successful semantic decisions matched the benchmark.',
  },

  {
    id: 'V5',
    name: 'Cue-stripped',
    description:
      'Reduced obvious lexical cues and introduced competing evidence',

    attempts: 40,
    successfulRequests: 39,
    correctSuccessfulResponses: 39,

    requestSuccessRatePct: 97.5,
    semanticAccuracySuccessfulPct: 100,
    allAttemptCorrectRatePct: 97.5,

    averageConfidence: 0.9356,

    datasetType: 'diagnostic',

    notes:
      'One infrastructure failure. This suite exposed the low-margin V5U02 state selected for repeated testing.',
  },
]

/**
 * Selected ASK_USER <-> SEARCH_CODE boundary states.
 *
 * Repeated identical evaluations characterize empirical
 * stochastic behavior. They are not independent samples.
 */
export const BOUNDARY_EVOLUTION: BoundaryResult[] = [
  {
    id: 'V5U02',
    experiment: 'V5 consistency',
    label: 'Requirement ambiguity',

    runs: 20,

    searchCodeCount: 14,
    askUserCount: 6,

    searchCodeRatePct: 70,
    askUserRatePct: 30,

    averageConfidence: 0.315,
    averageMargin: 0.0705,

    interpretation:
      'Exact repeated state alternated between ASK_USER and SEARCH_CODE.',
  },

  {
    id: 'V6-B3',
    experiment: 'V6',
    label: 'Indirect documentation wording',

    runs: 10,

    searchCodeCount: 6,
    askUserCount: 4,

    searchCodeRatePct: 60,
    askUserRatePct: 40,

    averageConfidence: 0.317,
    averageMargin: 0.068,

    interpretation:
      'The wording remained close to the observed ASK_USER / SEARCH_CODE boundary.',
  },

  {
    id: 'V7-A5',
    experiment: 'V7',
    label: 'Approved rule only',

    runs: 10,

    searchCodeCount: 7,
    askUserCount: 3,

    searchCodeRatePct: 70,
    askUserRatePct: 30,

    averageConfidence: 0.248,
    averageMargin: 0.047,

    interpretation:
      'Approved requirement alone did not clearly identify what operational uncertainty remained.',
  },

  {
    id: 'V8-C1',
    experiment: 'V8',
    label: 'Approved rule only — replication',

    runs: 10,

    searchCodeCount: 8,
    askUserCount: 2,

    searchCodeRatePct: 80,
    askUserRatePct: 20,

    averageConfidence: 0.242,
    averageMargin: 0.034,

    interpretation:
      'Same wording family again showed a small probability margin and mixed choices.',
  },

  {
    id: 'V8-C2',
    experiment: 'V8',
    label: 'Implementation not discussed',

    runs: 10,

    searchCodeCount: 10,
    askUserCount: 0,

    searchCodeRatePct: 100,
    askUserRatePct: 0,

    averageConfidence: 0.534,
    averageMargin: 0.284,

    interpretation:
      'Choice became empirically stable while internal separation remained moderate.',
  },

  {
    id: 'V8-C3',
    experiment: 'V8',
    label: 'Implementation location unclear',

    runs: 10,

    searchCodeCount: 10,
    askUserCount: 0,

    searchCodeRatePct: 100,
    askUserRatePct: 0,

    averageConfidence: 1,
    averageMargin: 1,

    interpretation:
      'Explicitly identifying implementation location as the unresolved information strongly mapped the state to SEARCH_CODE.',
  },
]

/**
 * Full V8 implementation-explicitness ablation.
 */
export const V8_IMPLEMENTATION_EXPLICITNESS: V8VariantResult[] = [
  {
    id: 'C1',
    label: 'Approved requirement only',
    stateCue:
      'The approved requirement defines username reuse, but no implementation uncertainty is explicitly stated.',

    runs: 10,

    searchCodeCount: 8,
    askUserCount: 2,

    searchCodeRatePct: 80,
    askUserRatePct: 20,

    averageConfidence: 0.242,
    averageMargin: 0.034,

    instabilityRatePct: 20,

    interpretation:
      'Observed decision-boundary behavior between SEARCH_CODE and ASK_USER.',
  },

  {
    id: 'C2',
    label: 'Implementation not discussed',
    stateCue:
      'Adds that the implementation is not discussed.',

    runs: 10,

    searchCodeCount: 10,
    askUserCount: 0,

    searchCodeRatePct: 100,
    askUserRatePct: 0,

    averageConfidence: 0.534,
    averageMargin: 0.284,

    instabilityRatePct: 0,

    interpretation:
      'Empirically stable SEARCH_CODE choice with moderate internal separation.',
  },

  {
    id: 'C3',
    label: 'Implementation location unclear',
    stateCue:
      'Explicitly states that it is unclear where the behavior is implemented.',

    runs: 10,

    searchCodeCount: 10,
    askUserCount: 0,

    searchCodeRatePct: 100,
    askUserRatePct: 0,

    averageConfidence: 1,
    averageMargin: 1,

    instabilityRatePct: 0,

    interpretation:
      'Strongly separated SEARCH_CODE routing in all tested runs.',
  },

  {
    id: 'C4',
    label: 'Responsible implementation unknown',
    stateCue:
      'States that the implementation responsible for the behavior is unknown.',

    runs: 10,

    searchCodeCount: 10,
    askUserCount: 0,

    searchCodeRatePct: 100,
    askUserRatePct: 0,

    averageConfidence: 0.987,
    averageMargin: 0.982,

    instabilityRatePct: 0,

    interpretation:
      'Near-deterministic SEARCH_CODE routing.',
  },

  {
    id: 'C5',
    label: 'Implementation not located',
    stateCue:
      'States that the implementation responsible for the behavior has not been located.',

    runs: 10,

    searchCodeCount: 10,
    askUserCount: 0,

    searchCodeRatePct: 100,
    askUserRatePct: 0,

    averageConfidence: 1,
    averageMargin: 1,

    instabilityRatePct: 0,

    interpretation:
      'Deterministic SEARCH_CODE routing in the observed runs.',
  },

  {
    id: 'C6',
    label: 'Implementation not located in repository',
    stateCue:
      'Explicitly states that the implementation has not been located in the repository.',

    runs: 10,

    searchCodeCount: 10,
    askUserCount: 0,

    searchCodeRatePct: 100,
    askUserRatePct: 0,

    averageConfidence: 1,
    averageMargin: 1,

    instabilityRatePct: 0,

    interpretation:
      'Deterministic SEARCH_CODE routing in the observed runs.',
  },
]

export const RESEARCH_NOTES = {
  primaryFinding:
    'One-shot accuracy can hide routing instability near semantic decision boundaries.',

  stateRepresentationFinding:
    'Routing became substantially clearer when the agent state explicitly described what operational information was still missing.',

  confidenceWarning:
    'Confidence is not a calibrated probability that the selected action is correct.',

  marginWarning:
    'Observed top-1/top-2 margin behavior is domain-specific and does not establish a universal production threshold.',

  repetitionWarning:
    'Repeated evaluations of identical text characterize empirical stochastic behavior and are not independent samples.',

  diagnosticWarning:
    'V4 through V8 are adaptive diagnostic experiments and should not be presented as independent untouched holdouts.',

  comparatorWarning:
    'Cross-router latency and cost figures are not perfectly normalized because provider infrastructure, retry behavior, and pricing methodology differed.',
} as const