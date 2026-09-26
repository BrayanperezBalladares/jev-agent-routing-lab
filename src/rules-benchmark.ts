import {
  readFile,
  writeFile,
} from 'node:fs/promises'

import {
  ruleBasedRouter,
} from './rules.js'

import type {
  Action,
  BenchmarkCase,
} from './types.js'

interface RuleBenchmarkResult {
  id: string
  name: string
  difficulty: string

  expected: Action
  acceptable: Action[]

  chosen: Action

  exactMatch: boolean
  acceptableMatch: boolean

  scores:
    Record<Action, number>

  matchedRules:
    string[]

  latencyMs: number
}

function percent(
  value: number,
): string {
  return `${(
    value * 100
  ).toFixed(1)}%`
}

function average(
  values: number[],
): number {
  if (
    values.length === 0
  ) {
    return 0
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) /
    values.length
  )
}

async function loadCases(
  filename: string,
): Promise<BenchmarkCase[]> {
  const raw =
    await readFile(
      new URL(
        `../cases/${filename}`,
        import.meta.url,
      ),
      'utf8',
    )

  return JSON.parse(
    raw,
  ) as BenchmarkCase[]
}

async function main() {
  const requestedDataset =
    process.argv[2]

  let cases:
    BenchmarkCase[]

  let datasetLabel:
    string

  if (
    requestedDataset
  ) {
    cases =
      await loadCases(
        requestedDataset,
      )

    datasetLabel =
      requestedDataset
        .replace(
          /\.json$/i,
          '',
        )
        .replace(
          /[^a-zA-Z0-9-_]/g,
          '-',
        )
  } else {
    const baselineCases =
      await loadCases(
        'routing-baseline.json',
      )

    const hardCases =
      await loadCases(
        'routing-hard.json',
      )

    cases = [
      ...baselineCases,
      ...hardCases,
    ]

    datasetLabel =
      'baseline-hard'
  }

  const results:
    RuleBenchmarkResult[] = []

  console.log()
  console.log(
    'RULE-BASED ROUTER BENCHMARK',
  )

  console.log(
    '===========================',
  )

  console.log(
    `Dataset: ${datasetLabel}`,
  )

  console.log()

  console.log(
    `Cases: ${cases.length}`,
  )

  console.log()

  for (
    const testCase
    of cases
  ) {
    const start =
      performance.now()

    const decision =
      ruleBasedRouter(
        testCase.state,
      )

    const latencyMs =
      performance.now() -
      start

    const acceptable = [
      testCase.expected,
      ...(
        testCase.acceptable ??
        []
      ),
    ]

    const exactMatch =
      decision.choice ===
      testCase.expected

    const acceptableMatch =
      acceptable.includes(
        decision.choice,
      )

    results.push({
      id:
        testCase.id,

      name:
        testCase.name,

      difficulty:
        testCase.difficulty,

      expected:
        testCase.expected,

      acceptable,

      chosen:
        decision.choice,

      exactMatch,
      acceptableMatch,

      scores:
        decision.scores,

      matchedRules:
        decision.matchedRules,

      latencyMs,
    })

    console.log(
      `${testCase.id} | expected=${testCase.expected} | chosen=${decision.choice} | ${acceptableMatch ? 'OK' : 'WRONG'}`,
    )
  }

  const exactMatches =
    results.filter(
      (result) =>
        result.exactMatch,
    )

  const acceptableMatches =
    results.filter(
      (result) =>
        result.acceptableMatch,
    )

  const wrong =
    results.filter(
      (result) =>
        !result.acceptableMatch,
    )

  const exactAccuracy =
    results.length === 0
      ? 0
      : exactMatches.length /
        results.length

  const acceptableRate =
    results.length === 0
      ? 0
      : acceptableMatches.length /
        results.length

  const latencies =
    results.map(
      (result) =>
        result.latencyMs,
    )

  console.log()
  console.log(
    'RESULTS',
  )

  console.log(
    '=======',
  )

  console.log()

  console.table(
    results.map(
      (result) => ({
        case:
          result.id,

        difficulty:
          result.difficulty,

        expected:
          result.expected,

        chosen:
          result.chosen,

        exact:
          result.exactMatch
            ? 'YES'
            : 'NO',

        acceptable:
          result
            .acceptableMatch
            ? 'YES'
            : 'NO',

        latency:
          `${result.latencyMs.toFixed(4)}ms`,
      }),
    ),
  )

  console.log()

  console.log(
    `Exact accuracy:   ${percent(exactAccuracy)}`,
  )

  console.log(
    `Acceptable rate:  ${percent(acceptableRate)}`,
  )

  console.log(
    `Wrong decisions:  ${wrong.length}`,
  )

  console.log()

  console.log(
    `Average latency:  ${average(latencies).toFixed(4)} ms`,
  )

  console.log(
    'API calls:         0',
  )

  console.log(
    'Cost:              $0',
  )

  if (
    wrong.length > 0
  ) {
    console.log()
    console.log(
      'WRONG DECISIONS',
    )

    console.log(
      '===============',
    )

    console.log()

    for (
      const result
      of wrong
    ) {
      console.log(
        `${result.id} - ${result.name}`,
      )

      console.log(
        `  Expected: ${result.expected}`,
      )

      console.log(
        `  Chosen:   ${result.chosen}`,
      )

      console.log(
        '  Scores:',
        result.scores,
      )

      console.log(
        '  Matched rules:',
      )

      for (
        const rule
        of result.matchedRules
      ) {
        console.log(
          `    - ${rule}`,
        )
      }

      console.log()
    }
  }

  const timestamp =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        '-',
      )

  const outputFile =
    new URL(
      `../results/rules-${datasetLabel}-${timestamp}.json`,
      import.meta.url,
    )

  await writeFile(
    outputFile,

    JSON.stringify(
      {
        runAt:
          new Date()
            .toISOString(),

        router:
          'rule-based-v1',

        dataset:
          datasetLabel,

        summary: {
          totalCases:
            results.length,

          exactMatches:
            exactMatches.length,

          acceptableMatches:
            acceptableMatches.length,

          wrongDecisions:
            wrong.length,

          exactAccuracy,
          acceptableRate,

          averageLatencyMs:
            average(
              latencies,
            ),

          apiCalls: 0,

          cost: 0,
        },

        results,
      },

      null,
      2,
    ),

    'utf8',
  )

  console.log()

  console.log(
    `Results saved to results/rules-${datasetLabel}-${timestamp}.json`,
  )
}

main().catch(
  (error) => {
    console.error()
    console.error(
      'Rules benchmark failed:',
    )

    console.error(
      error,
    )

    process.exitCode = 1
  },
)