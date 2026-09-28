export type CanonicalAction =
  | 'SEARCH_CODE'
  | 'READ_FILE'
  | 'RUN_TESTS'
  | 'QUERY_DATABASE'
  | 'ASK_USER'

export interface ScenarioCase {
  id: string
  name: string
  contrastLabelDesktop: string
  contrastLabelMobile: string
  difficulty: string
  state: string
  expected: CanonicalAction
  pedagogicalRationale: string
}

export const CANONICAL_CASES: ScenarioCase[] = [
  {
    id: 'S01',
    name: 'Payment retry owner unknown',
    contrastLabelDesktop: 'S01 — Codebase uncertainty',
    contrastLabelMobile: 'S01 — Search',
    difficulty: 'intermediate',
    state:
      'Customers occasionally receive two payment attempts after a timeout. The API route, payment provider and queue worker are known, but nobody has established which component decides whether a failed charge should be retried.',
    expected: 'SEARCH_CODE',
    pedagogicalRationale:
      'The API route, payment provider, and queue worker are already known in the system, but the specific code component responsible for deciding retry behavior has not been identified. Because this is an implementation detail that exists within the codebase, SEARCH_CODE is the target action to locate the responsible handler before taking any modifying action.',
  },
  {
    id: 'U01',
    name: 'Failed payment retry policy',
    contrastLabelDesktop: 'U01 — Requirement ambiguity',
    contrastLabelMobile: 'U01 — Ask',
    difficulty: 'intermediate',
    state:
      'The system can either retry a failed payment automatically, require the customer to retry manually, or cancel the order. The product requirements specify the failure state but never choose among those behaviors.',
    expected: 'ASK_USER',
    pedagogicalRationale:
      'Multiple competing business recovery paths exist (automatic retry vs. manual retry vs. order cancellation), but the product requirements never specified which policy should be applied. Because code cannot invent business requirements, ASK_USER is the target action to obtain guidance from the human developer.',
  },
]

export const CANONICAL_ACTIONS: {
  id: CanonicalAction
  label: string
  glyph: string
  description: string
}[] = [
  {
    id: 'SEARCH_CODE',
    label: 'SEARCH_CODE',
    glyph: '⌕',
    description: 'Search repository symbols, files, or references to locate implementations or cues.',
  },
  {
    id: 'READ_FILE',
    label: 'READ_FILE',
    glyph: '📄',
    description: 'Inspect a known file path to examine its exact contents or configuration.',
  },
  {
    id: 'RUN_TESTS',
    label: 'RUN_TESTS',
    glyph: '▶',
    description: 'Execute test suites to observe runtime, regression, or failure behavior.',
  },
  {
    id: 'QUERY_DATABASE',
    label: 'QUERY_DATABASE',
    glyph: '⛁',
    description: 'Execute database queries to inspect schema, state, or record consistency.',
  },
  {
    id: 'ASK_USER',
    label: 'ASK_USER',
    glyph: '?',
    description: 'Prompt the developer for clarification or guidance on underspecified requirements.',
  },
]
