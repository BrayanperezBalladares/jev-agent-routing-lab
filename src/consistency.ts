import {
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises'

import { evaluateNextAction } from './jev.js'

import type {
  Action,
} from './types.js'

interface ConsistencyCase {
  id: string
  name: string
  state: string
}

interface RunResult {
  run: number
  choice?: Action
  confidence?: number
  probabilities?: Partial<
    Record<Action, number>
  >
  providerLatencyMs?: number
  endToEndLatencyMs?: number
  error?: string
}

interface CaseResult {
  id: string
  name: string
  runs: RunResult[]
}

const RUNS_PER_CASE = 10

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

function sleep(
  ms: number,
): Promise<void> {
  return new Promise(
    (resolve) => setTimeout(resolve, ms),
  )
}

async function main() {
  const raw =
    await readFile(
      new URL(
        '../cases/consistency.json',
        import.meta.url,
      ),
      'utf8',
    )

  const allCases =
  JSON.parse(raw) as ConsistencyCase[]

const requestedIds =
  process.argv
    .slice(2)
    .map(
      (id) =>
        id.toUpperCase(),
    )

const cases =
  requestedIds.length === 0
    ? allCases
    : allCases.filter(
        (testCase) =>
          requestedIds.includes(
            testCase.id.toUpperCase(),
          ),
      )

if (cases.length === 0) {
  throw new Error(
    `No matching cases found for: ${requestedIds.join(', ')}`,
  )
}

  const results: CaseResult[] = []

  console.log()
  console.log(
    'JEV CONSISTENCY BENCHMARK',
  )
  console.log(
    '=========================',
  )
  console.log()

  console.log(
    `Cases: ${cases.length}`,
  )

  console.log(
    `Runs per case: ${RUNS_PER_CASE}`,
  )

  console.log(
    `Total requests: ${
      cases.length *
      RUNS_PER_CASE
    }`,
  )

  console.log()

  for (
    const testCase
    of cases
  ) {
    console.log(
      `${testCase.id} - ${testCase.name}`,
    )

    const runs:
      RunResult[] = []

    for (
      let run = 1;
      run <= RUNS_PER_CASE;
      run++
    ) {
      process.stdout.write(
        `  Run ${run}/${RUNS_PER_CASE} ... `,
      )

      try {
        const {
          response,
          providerLatencyMs,
          endToEndLatencyMs,
        } =
          await evaluateNextAction(
            testCase.state,
          )

        const answer =
          response.answers.nextAction

        runs.push({
          run,
          choice: answer.choice,
          confidence:
            answer.confidence,
          probabilities:
            answer.probabilities,
          providerLatencyMs,
          endToEndLatencyMs,
        })

        console.log(
          `${answer.choice} | conf=${answer.confidence.toFixed(2)}`,
        )
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error)

        runs.push({
          run,
          error: message,
        })

        console.log('ERROR')
      }

      await sleep(1000)
    }

    results.push({
      id: testCase.id,
      name: testCase.name,
      runs,
    })

    console.log()
  }

  console.log()
  console.log('SUMMARY')
  console.log('=======')
  console.log()

  for (
    const result
    of results
  ) {
    const successful =
      result.runs.filter(
        (run) =>
          !run.error &&
          run.choice,
      )

    const counts =
      new Map<Action, number>()

    for (
      const run
      of successful
    ) {
      if (!run.choice) {
        continue
      }

      counts.set(
        run.choice,
        (
          counts.get(
            run.choice,
          ) ?? 0
        ) + 1,
      )
    }

    const sortedCounts =
      [...counts.entries()]
        .sort(
          (a, b) =>
            b[1] - a[1],
        )

    const dominantChoice =
      sortedCounts[0]?.[0]

    const dominantCount =
      sortedCounts[0]?.[1] ?? 0

    const consistencyRate =
      successful.length === 0
        ? 0
        : dominantCount /
          successful.length

    const confidences =
      successful
        .map(
          (run) =>
            run.confidence,
        )
        .filter(
          (
            value,
          ): value is number =>
            value !== undefined,
        )

    console.log(
      `${result.id} - ${result.name}`,
    )

    console.log(
      `  Dominant choice: ${dominantChoice ?? 'NONE'}`,
    )

    console.log(
      `  Consistency: ${(consistencyRate * 100).toFixed(1)}%`,
    )

    console.log(
      `  Average confidence: ${average(confidences).toFixed(3)}`,
    )

    console.log(
      '  Distribution:',
    )

    for (
      const [
        choice,
        count,
      ] of sortedCounts
    ) {
      console.log(
        `    ${choice}: ${count}/${successful.length}`,
      )
    }

    console.log()
  }

  const timestamp =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        '-',
      )

  await mkdir(
    new URL(
      '../results/',
      import.meta.url,
    ),
    {
      recursive: true,
    },
  )

  const outputFile =
    new URL(
      `../results/consistency-${timestamp}.json`,
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

        runsPerCase:
          RUNS_PER_CASE,

        results,
      },

      null,
      2,
    ),

    'utf8',
  )

  console.log(
    `Results saved to results/consistency-${timestamp}.json`,
  )
}

main().catch(
  (error) => {
    console.error(
      'Consistency benchmark failed:',
    )

    console.error(error)

    process.exitCode = 1
  },
)