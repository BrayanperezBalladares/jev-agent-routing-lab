import {
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises'

import {
  evaluateWithNvidia,
  NvidiaAccessError,
  NVIDIA_MODEL,
} from './nvidia-llm.js'

import type {
  Action,
  BenchmarkCase,
} from './types.js'

interface NvidiaBenchmarkResult {
  id: string
  name: string
  difficulty: string

  expected: Action
  acceptable: Action[]

  chosen?: Action

  exactMatch: boolean
  acceptableMatch: boolean

  latencyMs?: number

  inputTokens?: number
  outputTokens?: number
  totalTokens?: number

  estimatedCost?: number

  rawOutput?: string
  responseId?: string

  error?: string
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

function percentile(
  values: number[],
  p: number,
): number {
  if (
    values.length === 0
  ) {
    return 0
  }

  const sorted =
    [...values].sort(
      (a, b) =>
        a - b,
    )

  const index =
    (
      sorted.length - 1
    ) * p

  const lower =
    Math.floor(
      index,
    )

  const upper =
    Math.ceil(
      index,
    )

  if (
    lower === upper
  ) {
    return (
      sorted[lower] ??
      0
    )
  }

  const weight =
    index - lower

  const lowerValue =
    sorted[lower] ??
    0

  const upperValue =
    sorted[upper] ??
    lowerValue

  return (
    lowerValue *
      (
        1 - weight
      ) +
    upperValue *
      weight
  )
}

function percent(
  value: number,
): string {
  return `${(
    value * 100
  ).toFixed(1)}%`
}

function sleep(
  ms: number,
): Promise<void> {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        ms,
      ),
  )
}

async function main() {
  const datasetName =
    process.argv[2] ??
    'routing-holdout.json'

  const datasetLabel =
    datasetName
      .replace(
        /\.json$/i,
        '',
      )
      .replace(
        /[^a-zA-Z0-9-_]/g,
        '-',
      )

  const rawCases =
    await readFile(
      new URL(
        `../cases/${datasetName}`,
        import.meta.url,
      ),
      'utf8',
    )

  const cases =
    JSON.parse(
      rawCases,
    ) as BenchmarkCase[]

  const results:
    NvidiaBenchmarkResult[] = []

  console.log()
  console.log(
    'NVIDIA / DEEPSEEK ROUTING BENCHMARK',
  )

  console.log(
    '====================================',
  )

  console.log()

  console.log(
    `Model:   ${NVIDIA_MODEL}`,
  )

  console.log(
    `Dataset: ${datasetName}`,
  )

  console.log(
    `Cases:   ${cases.length}`,
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
      const evaluation =
        await evaluateWithNvidia(
          testCase.state,
        )

      const acceptable = [
        testCase.expected,
        ...(
          testCase.acceptable ??
          []
        ),
      ]

      const exactMatch =
        evaluation.choice ===
        testCase.expected

      const acceptableMatch =
        acceptable.includes(
          evaluation.choice,
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
          evaluation.choice,

        exactMatch,

        acceptableMatch,

        latencyMs:
          evaluation.latencyMs,

        inputTokens:
          evaluation.inputTokens,

        outputTokens:
          evaluation.outputTokens,

        totalTokens:
          evaluation.totalTokens,

        estimatedCost:
          evaluation.estimatedCost,

        rawOutput:
          evaluation.rawOutput,

        responseId:
          evaluation.responseId,
      })

      console.log(
        `${evaluation.choice} | ${
          exactMatch
            ? 'EXACT'
            : acceptableMatch
              ? 'ACCEPTABLE'
              : 'WRONG'
        } | ${Math.round(evaluation.latencyMs)}ms`,
      )
    } catch (
      error
    ) {
      if (
        error instanceof
        NvidiaAccessError
      ) {
        console.log(
          'ACCESS ERROR',
        )

        console.error()
        console.error(
          error.message,
        )

        console.error()
        console.error(
          'Benchmark aborted because the NVIDIA endpoint is not accessible with the current account or quota.',
        )

        throw error
      }

      const message =
        error instanceof Error
          ? error.message
          : String(error)

      results.push({
        id:
          testCase.id,

        name:
          testCase.name,

        difficulty:
          testCase.difficulty,

        expected:
          testCase.expected,

        acceptable: [
          testCase.expected,
          ...(
            testCase.acceptable ??
            []
          ),
        ],

        exactMatch:
          false,

        acceptableMatch:
          false,

        error:
          message,
      })

      console.log(
        'ERROR',
      )

      console.error(
        message,
      )
    }

    await sleep(
      1000,
    )
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

  const wrong =
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

  const latencies =
    successful
      .map(
        (result) =>
          result.latencyMs,
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
        (
          result.inputTokens ??
          0
        ),
      0,
    )

  const totalOutputTokens =
    successful.reduce(
      (sum, result) =>
        sum +
        (
          result.outputTokens ??
          0
        ),
      0,
    )

  const totalTokens =
    successful.reduce(
      (sum, result) =>
        sum +
        (
          result.totalTokens ??
          0
        ),
      0,
    )

  const totalEstimatedCost =
    successful.reduce(
      (sum, result) =>
        sum +
        (
          result.estimatedCost ??
          0
        ),
      0,
    )

  const summary = {
    model:
      NVIDIA_MODEL,

    provider:
      'NVIDIA NIM',

    endpointType:
      'Free Endpoint',

    dataset:
      datasetLabel,

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

    wrongDecisions:
      wrong.length,

    exactAccuracy,

    acceptableRate,

    averageLatencyMs:
      average(
        latencies,
      ),

    medianLatencyMs:
      percentile(
        latencies,
        0.5,
      ),

    p95LatencyMs:
      percentile(
        latencies,
        0.95,
      ),

    minLatencyMs:
      latencies.length
        ? Math.min(
            ...latencies,
          )
        : 0,

    maxLatencyMs:
      latencies.length
        ? Math.max(
            ...latencies,
          )
        : 0,

    totalInputTokens,

    totalOutputTokens,

    totalTokens,

    totalEstimatedCost,
  }

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
          result.chosen ??
          'ERROR',

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
          result.latencyMs !==
          undefined
            ? `${Math.round(result.latencyMs)}ms`
            : '-',
      }),
    ),
  )

  console.log()

  console.log(
    `Exact accuracy:     ${percent(exactAccuracy)}`,
  )

  console.log(
    `Acceptable rate:    ${percent(acceptableRate)}`,
  )

  console.log(
    `Wrong decisions:    ${wrong.length}`,
  )

  console.log(
    `Errors:             ${errors.length}`,
  )

  console.log()

  console.log(
    `Average latency:    ${average(latencies).toFixed(1)} ms`,
  )

  console.log(
    `Median latency:     ${percentile(latencies, 0.5).toFixed(1)} ms`,
  )

  console.log(
    `P95 latency:        ${percentile(latencies, 0.95).toFixed(1)} ms`,
  )

  console.log()

  console.log(
    `Input tokens:       ${totalInputTokens}`,
  )

  console.log(
    `Output tokens:      ${totalOutputTokens}`,
  )

  console.log(
    `Total tokens:       ${totalTokens}`,
  )

  console.log()

  console.log(
    `Estimated cost:     $${totalEstimatedCost.toFixed(8)}`,
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
        `  Output:   ${result.rawOutput}`,
      )

      console.log()
    }
  }

  await mkdir(
    new URL(
      '../results/',
      import.meta.url,
    ),
    {
      recursive:
        true,
    },
  )

  const timestamp =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        '-',
      )

  const outputFile =
    new URL(
      `../results/nvidia-${datasetLabel}-${timestamp}.json`,
      import.meta.url,
    )

  await writeFile(
    outputFile,

    JSON.stringify(
      {
        runAt:
          new Date()
            .toISOString(),

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
    `Results saved to results/nvidia-${datasetLabel}-${timestamp}.json`,
  )
}

main().catch(
  (error) => {
    console.error()
    console.error(
      'NVIDIA benchmark failed:',
    )

    console.error(
      error,
    )

    process.exitCode = 1
  },
)