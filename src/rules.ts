import type {
  Action,
} from './types.js'

export interface RuleDecision {
  choice: Action
  scores: Record<Action, number>
  matchedRules: string[]
}

const ACTIONS: Action[] = [
  'SEARCH_CODE',
  'READ_FILE',
  'RUN_TESTS',
  'QUERY_DATABASE',
  'ASK_USER',
]

function createScores():
  Record<Action, number> {
  return {
    SEARCH_CODE: 0,
    READ_FILE: 0,
    RUN_TESTS: 0,
    QUERY_DATABASE: 0,
    ASK_USER: 0,
  }
}

function containsAny(
  text: string,
  patterns: string[],
): boolean {
  return patterns.some(
    (pattern) =>
      text.includes(pattern),
  )
}

export function ruleBasedRouter(
  state: string,
): RuleDecision {
  const text =
    state.toLowerCase()

  const scores =
    createScores()

  const matchedRules:
    string[] = []

  // --------------------------------------------------
  // ASK_USER
  // --------------------------------------------------

  if (
    containsAny(
      text,
      [
        'specification does not',
        'requirements do not',
        'requirements does not',
        'does not say',
        'does not state',
        'never states',
        'never defines',
        'not define',
        'not defined',
        'undefined',
        'unresolved issue',
        'no requirement',
        'nothing in the specification',
      ],
    )
  ) {
    scores.ASK_USER += 5

    matchedRules.push(
      'Missing or undefined product requirement',
    )
  }

  if (
    containsAny(
      text,
      [
        'whether',
        'should happen',
        'should be',
        'expected behavior',
        'policy',
      ],
    )
  ) {
    scores.ASK_USER += 1

    matchedRules.push(
      'Possible unresolved product decision',
    )
  }

  // --------------------------------------------------
  // RUN_TESTS
  // --------------------------------------------------

  const codeWasChanged =
    containsAny(
      text,
      [
        'modified',
        'changed',
        'updated',
        'refactored',
        'corrected',
        'patch',
        'fix implemented',
        'implementation is complete',
        'edits are complete',
      ],
    )

  const notVerified =
    containsAny(
      text,
      [
        'not been tested',
        'not been verified',
        'not yet been verified',
        'not exercised',
        'not been exercised',
        'no tests have been',
        'tests have not been',
        'has not been tested',
        'has not been verified',
        'no evidence',
        'needs verification',
        'missing is evidence',
      ],
    )

  if (
    codeWasChanged &&
    notVerified
  ) {
    scores.RUN_TESTS += 6

    matchedRules.push(
      'Code changed but behavior is unverified',
    )
  }

  // --------------------------------------------------
  // READ_FILE
  // --------------------------------------------------

  if (
    containsAny(
      text,
      [
        '.ts',
        '.js',
        '.tsx',
        '.jsx',
      ],
    )
  ) {
    scores.READ_FILE += 1

    matchedRules.push(
      'Specific source file mentioned',
    )
  }

  if (
    containsAny(
      text,
      [
        'stack points',
        'stack trace',
        'points directly to',
        'narrowed down to',
        'isolated to',
        'line ',
        'debugger shows',
        'already identified',
        'has been identified',
        'known to be inside',
        'known guard',
        'specific mapper',
        'compile error',
      ],
    )
  ) {
    scores.READ_FILE += 4

    matchedRules.push(
      'Implementation location already known',
    )
  }

  if (
    containsAny(
      text,
      [
        'has not yet been examined',
        'has not been examined',
        'has not been inspected',
        'not yet been inspected',
        'need to understand the implementation',
        'decision logic has not',
      ],
    )
  ) {
    scores.READ_FILE += 3

    matchedRules.push(
      'Known implementation still needs inspection',
    )
  }

  // --------------------------------------------------
  // SEARCH_CODE
  // --------------------------------------------------

  if (
    containsAny(
      text,
      [
        'do not know where',
        'does not know where',
        'do not know which',
        'does not know which',
        'unsure where',
        'unclear where',
        'location is unknown',
        'has not been located',
        'not been located',
        'not been identified',
        'no replacement file has been identified',
        'implementation has not yet been identified',
        'responsible has not been identified',
      ],
    )
  ) {
    scores.SEARCH_CODE += 6

    matchedRules.push(
      'Relevant implementation location unknown',
    )
  }

  if (
    containsAny(
      text,
      [
        'several guards',
        'several decorators',
        'several interceptors',
        'which component',
        'where the',
      ],
    )
  ) {
    scores.SEARCH_CODE += 1

    matchedRules.push(
      'Multiple possible implementation locations',
    )
  }

  // --------------------------------------------------
  // QUERY_DATABASE
  // --------------------------------------------------

  if (
    containsAny(
      text,
      [
        'foreign-key',
        'foreign key',
        'duplicate-key',
        'duplicate key',
        'unique constraint',
        'persisted records',
        'actual persisted',
        'stored memberships',
        'stored records',
        'database state',
        'test database',
        'soft-deleted',
        'soft deleted',
        'schema migration',
        'constraint name',
        'existing membership',
        'row already',
        'data already existing',
      ],
    )
  ) {
    scores.QUERY_DATABASE += 3

    matchedRules.push(
      'Database state or constraint signal',
    )
  }

  if (
    containsAny(
      text,
      [
        'service has already been inspected',
        'service method has already been inspected',
        'service behavior has already been verified',
        'service logic has already been reviewed',
        'implementation has been reviewed',
        'application code is unchanged',
        'service passes valid identifiers',
      ],
    )
  ) {
    scores.QUERY_DATABASE += 3

    matchedRules.push(
      'Application logic already investigated',
    )
  }

  // --------------------------------------------------
  // Tie-breaking
  // --------------------------------------------------

  const priority: Action[] = [
    'ASK_USER',
    'RUN_TESTS',
    'QUERY_DATABASE',
    'READ_FILE',
    'SEARCH_CODE',
  ]

  let choice: Action =
    priority[0]

  let bestScore =
    Number.NEGATIVE_INFINITY

  for (
    const action
    of priority
  ) {
    const score =
      scores[action]

    if (
      score > bestScore
    ) {
      bestScore = score
      choice = action
    }
  }

  // No meaningful signal:
  // searching the repository is the safest discovery step.
  if (bestScore <= 0) {
    choice =
      'SEARCH_CODE'

    matchedRules.push(
      'No strong signal; default to repository search',
    )
  }

  return {
    choice,
    scores,
    matchedRules,
  }
}