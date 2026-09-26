import {
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises'

import { evaluateNextAction } from './jev.js'

import type {
  Action,
  BenchmarkCase,
} from './types.js'

interface BenchmarkResult {
  id: string
  name: string
  difficulty: string

  expected: Action
  acceptable: Action[]

  chosen?: Action

  exactMatch: boolean
  acceptableMatch: boolean

  confidence?: number
  probabilities?: Partial<
    Record<Action, number>
  >

  endToEndLatencyMs?: number
  providerLatencyMs?: number

  inputTokens?: number
  outputTokens?: number

  marketCost?: number
  gatewayCost?: number

  error?: string
}

function average(
  values: number[],
): number {
  if (values.length === 0) {
    return 0
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length
  )
}

function percent(
  value: number,
): string {
  return `${(value * 100).toFixed(1)}%`
}

function sleep(
  ms: number,
): Promise<void> {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms),
  )
}

async function main() {
  const datasetName =
  process.argv[2] ??
  'routing-baseline.json'

const datasetUrl =
  new URL(
    `../cases/${datasetName}`,
    import.meta.url,
  )

const rawCases =
  await readFile(
    datasetUrl,
    'utf8',
  )

  const cases =
    JSON.parse(
      rawCases,
    ) as BenchmarkCase[]

  const results:
    BenchmarkResult[] = []

  console.log()
  console.log(
    'JEV AGENT ROUTING BENCHMARK',
  )
  console.log(
    '===========================',
  )

  console.log(
  `Dataset: ${datasetName}`,
)

  console.log()
  console.log(
    `Cases: ${cases.length}`,
  )
  console.log()

  for (
    const [index, testCase]
    of cases.entries()
  ) {
    process.stdout.write(
      `[${index + 1}/${cases.length}] ${testCase.id} - ${testCase.name} ... `,
    )

    try {
      const {
        response,
        endToEndLatencyMs,
        providerLatencyMs,
      } =
        await evaluateNextAction(
          testCase.state,
        )

      const answer =
        response.answers.nextAction

      const acceptable = [
        testCase.expected,
        ...(testCase.acceptable ??
          []),
      ]

      const exactMatch =
        answer.choice ===
        testCase.expected

      const acceptableMatch =
        acceptable.includes(
          answer.choice,
        )

      const marketCost =
        Number(
          response
            .providerMetadata
            ?.gateway
            ?.marketCost ?? 0,
        )

      const gatewayCost =
        Number(
          response
            .providerMetadata
            ?.gateway
            ?.gatewayCost ?? 0,
        )

      results.push({
        id: testCase.id,
        name: testCase.name,
        difficulty:
          testCase.difficulty,

        expected:
          testCase.expected,

        acceptable,

        chosen:
          answer.choice,

        exactMatch,
        acceptableMatch,

        confidence:
          answer.confidence,

        probabilities:
          answer.probabilities,

        endToEndLatencyMs,
        providerLatencyMs,

        inputTokens:
          response.usage
            ?.inputTokens ?? 0,

        outputTokens:
          response.usage
            ?.outputTokens ?? 0,

        marketCost,
        gatewayCost,
      })

      console.log(
        `${answer.choice} | conf=${answer.confidence.toFixed(2)} | provider=${providerLatencyMs ?? '-'}ms | total=${Math.round(endToEndLatencyMs)}ms`,
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error)

      results.push({
        id: testCase.id,
        name: testCase.name,
        difficulty:
          testCase.difficulty,

        expected:
          testCase.expected,

        acceptable: [
          testCase.expected,
          ...(testCase.acceptable ??
            []),
        ],

        exactMatch: false,
        acceptableMatch: false,

        error: message,
      })

      console.log('ERROR')
      console.error(message)
    }

    await sleep(100)
  }

  const successful =
    results.filter(
      (result) =>
        !result.error,
    )

  const errors =
    results.filter(
      (result) =>
        result.error,
    )

  const exactMatches =
    successful.filter(
      (result) =>
        result.exactMatch,
    )

  const acceptableMatches =
    successful.filter(
      (result) =>
        result.acceptableMatch,
    )

  const wrongDecisions =
    successful.filter(
      (result) =>
        !result.acceptableMatch,
    )

  const exactAccuracy =
    successful.length === 0
      ? 0
      : exactMatches.length /
        successful.length

  const acceptableRate =
    successful.length === 0
      ? 0
      : acceptableMatches.length /
        successful.length

  const allConfidences =
    successful
      .map(
        (result) =>
          result.confidence,
      )
      .filter(
        (
          value,
        ): value is number =>
          value !== undefined,
      )

  const correctConfidences =
    acceptableMatches
      .map(
        (result) =>
          result.confidence,
      )
      .filter(
        (
          value,
        ): value is number =>
          value !== undefined,
      )

  const wrongConfidences =
    wrongDecisions
      .map(
        (result) =>
          result.confidence,
      )
      .filter(
        (
          value,
        ): value is number =>
          value !== undefined,
      )

  const endToEndLatencies =
    successful
      .map(
        (result) =>
          result
            .endToEndLatencyMs,
      )
      .filter(
        (
          value,
        ): value is number =>
          value !== undefined,
      )

  const providerLatencies =
    successful
      .map(
        (result) =>
          result.providerLatencyMs,
      )
      .filter(
        (
          value,
        ): value is number =>
          value !== undefined,
      )

  const totalInputTokens =
    successful.reduce(
      (sum, result) =>
        sum +
        (result.inputTokens ??
          0),
      0,
    )

  const totalOutputTokens =
    successful.reduce(
      (sum, result) =>
        sum +
        (result.outputTokens ??
          0),
      0,
    )

  const totalMarketCost =
    successful.reduce(
      (sum, result) =>
        sum +
        (result.marketCost ??
          0),
      0,
    )

  const totalGatewayCost =
    successful.reduce(
      (sum, result) =>
        sum +
        (result.gatewayCost ??
          0),
      0,
    )

  const summary = {
    totalCases:
      cases.length,

    successfulRequests:
      successful.length,

    errors:
      errors.length,

    exactMatches:
      exactMatches.length,

    acceptableMatches:
      acceptableMatches.length,

    exactAccuracy,
    acceptableRate,

    averageConfidence:
      average(
        allConfidences,
      ),

    correctDecisionAverageConfidence:
      average(
        correctConfidences,
      ),

    wrongDecisionAverageConfidence:
      average(
        wrongConfidences,
      ),

    averageEndToEndLatencyMs:
      average(
        endToEndLatencies,
      ),

    averageProviderLatencyMs:
      average(
        providerLatencies,
      ),

    minEndToEndLatencyMs:
      endToEndLatencies.length
        ? Math.min(
            ...endToEndLatencies,
          )
        : 0,

    maxEndToEndLatencyMs:
      endToEndLatencies.length
        ? Math.max(
            ...endToEndLatencies,
          )
        : 0,

    totalInputTokens,
    totalOutputTokens,

    totalMarketCost,
    totalGatewayCost,
  }

  console.log()
  console.log('RESULTS')
  console.log('=======')
  console.log()

  console.table(
    results.map(
      (result) => ({
        case: result.id,

        difficulty:
          result.difficulty,

        expected:
          result.expected,

        chosen:
          result.chosen ??
          'ERROR',

        exact:
          result.exactMatch
            ? 'YES'
            : 'NO',

        acceptable:
          result.acceptableMatch
            ? 'YES'
            : 'NO',

        confidence:
          result.confidence
            ?.toFixed(2) ??
          '-',

        provider:
          result.providerLatencyMs !==
          undefined
            ? `${result.providerLatencyMs}ms`
            : '-',

        total:
          result.endToEndLatencyMs !==
          undefined
            ? `${Math.round(
                result
                  .endToEndLatencyMs,
              )}ms`
            : '-',
      }),
    ),
  )

  console.log()

  console.log(
    `Exact accuracy:       ${percent(exactAccuracy)}`,
  )

  console.log(
    `Acceptable rate:      ${percent(acceptableRate)}`,
  )

  console.log()

  console.log(
    `Average confidence:   ${average(allConfidences).toFixed(3)}`,
  )

  console.log(
    `Correct confidence:   ${average(correctConfidences).toFixed(3)}`,
  )

  console.log(
    `Wrong confidence:     ${average(wrongConfidences).toFixed(3)}`,
  )

  console.log()

  console.log(
    `Avg provider latency: ${average(providerLatencies).toFixed(1)} ms`,
  )

  console.log(
    `Avg total latency:    ${average(endToEndLatencies).toFixed(1)} ms`,
  )

  console.log()

  console.log(
    `Input tokens:         ${totalInputTokens}`,
  )

  console.log(
    `Output tokens:        ${totalOutputTokens}`,
  )

  console.log()

  console.log(
    `Market cost:          $${totalMarketCost.toFixed(8)}`,
  )

  console.log(
    `Gateway billed cost:  $${totalGatewayCost.toFixed(8)}`,
  )

  const timestamp =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        '-',
      )

  const datasetLabel =
  datasetName
    .replace(/\.json$/i, '')
    .replace(
      /[^a-zA-Z0-9-_]/g,
      '-',
    )

  const resultsDirectory =
    new URL(
      '../results/',
      import.meta.url,
    )

  await mkdir(
    resultsDirectory,
    {
      recursive: true,
    },
  )

  const outputFile =
  new URL(
    `../results/${datasetLabel}-${timestamp}.json`,
    import.meta.url,
  )

  await writeFile(
    outputFile,

    JSON.stringify(
      {
        runAt:
          new Date()
            .toISOString(),

        model:
          'typesafe-ai/jev',

        summary,
        results,
      },

      null,
      2,
    ),

    'utf8',
  )

  console.log()
  console.log(
  `Full results saved to results/${datasetLabel}-${timestamp}.json`,
)
}

main().catch(
  (error) => {
    console.error()
    console.error(
      'Benchmark failed:',
    )
    console.error(error)

    process.exitCode = 1
  },
)