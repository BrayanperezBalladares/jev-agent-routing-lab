import {
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises'

import path from 'node:path'

import {
  evaluateNextAction,
} from './jev.js'

import {
  ACTIONS,
  type Action,
  type BenchmarkCase,
} from './types.js'

const DATASET_PATH =
  path.join(
    process.cwd(),
    'cases',
    'routing-v5-cue-stripped.json',
  )

const RESULTS_DIR =
  path.join(
    process.cwd(),
    'results',
  )

const TARGET_IDS = [
  'V5U02',
  'V5S03',
] as const

const RUNS_PER_CASE = 20

const DELAY_BETWEEN_RUNS_MS =
  1500

const DELAY_BETWEEN_CASES_MS =
  3000

interface SuccessfulRun {
  run: number

  choice: Action

  expected: Action

  correct: boolean

  confidence: number

  probabilities:
    Partial<Record<Action, number>>

  top1Action: Action

  top1Probability: number

  top2Action: Action

  top2Probability: number

  probabilityMargin: number

  providerLatencyMs?: number

  endToEndLatencyMs: number
}

interface FailedRun {
  run: number

  expected: Action

  error: string
}

type BoundaryRun =
  | SuccessfulRun
  | FailedRun

function sleep(
  milliseconds: number,
) {
  return new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds,
      )
    },
  )
}

function mean(
  values: number[],
) {
  if (
    values.length === 0
  ) {
    return 0
  }

  return (
    values.reduce(
      (
        total,
        value,
      ) =>
        total +
        value,
      0,
    ) /
    values.length
  )
}

function min(
  values: number[],
) {
  return values.length > 0
    ? Math.min(
        ...values,
      )
    : 0
}

function max(
  values: number[],
) {
  return values.length > 0
    ? Math.max(
        ...values,
      )
    : 0
}

function getRanking(
  probabilities:
    Partial<Record<Action, number>>,
) {
  const ranking =
    ACTIONS
      .map(
        (action) => ({
          action,

          probability:
            probabilities[
              action
            ] ??
            0,
        }),
      )
      .sort(
        (
          first,
          second,
        ) =>
          second.probability -
          first.probability,
      )

  const first =
    ranking[0]

  const second =
    ranking[1]

  if (
    !first ||
    !second
  ) {
    throw new Error(
      'Unable to calculate probability ranking.',
    )
  }

  return {
    top1Action:
      first.action,

    top1Probability:
      first.probability,

    top2Action:
      second.action,

    top2Probability:
      second.probability,

    probabilityMargin:
      first.probability -
      second.probability,
  }
}

async function loadCases():
  Promise<BenchmarkCase[]> {
  const raw =
    await readFile(
      DATASET_PATH,
      'utf8',
    )

  return JSON.parse(
    raw,
  ) as BenchmarkCase[]
}

async function runCase(
  testCase:
    BenchmarkCase,
) {
  console.log()

  console.log(
    `${testCase.id} — ${testCase.name}`,
  )

  console.log(
    `Expected: ${testCase.expected}`,
  )

  console.log(
    '================================',
  )

  const runs:
    BoundaryRun[] = []

  for (
    let run = 1;
    run <= RUNS_PER_CASE;
    run++
  ) {
    try {
      const evaluation =
        await evaluateNextAction(
          testCase.state,
        )

      const answer =
        evaluation
          .response
          .answers
          .nextAction

      const ranking =
        getRanking(
          answer.probabilities,
        )

      const correct =
        answer.choice ===
        testCase.expected

      const result:
        SuccessfulRun = {
        run,

        choice:
          answer.choice,

        expected:
          testCase.expected,

        correct,

        confidence:
          answer.confidence,

        probabilities:
          answer.probabilities,

        top1Action:
          ranking.top1Action,

        top1Probability:
          ranking.top1Probability,

        top2Action:
          ranking.top2Action,

        top2Probability:
          ranking.top2Probability,

        probabilityMargin:
          ranking.probabilityMargin,

        providerLatencyMs:
          evaluation.providerLatencyMs,

        endToEndLatencyMs:
          evaluation.endToEndLatencyMs,
      }

      runs.push(
        result,
      )

      console.log(
        [
          `${run.toString().padStart(2, '0')}`,
          answer.choice,
          correct
            ? 'CORRECT'
            : 'WRONG',
          `conf=${answer.confidence.toFixed(2)}`,
          `top1=${ranking.top1Probability.toFixed(2)}`,
          `top2=${ranking.top2Action}:${ranking.top2Probability.toFixed(2)}`,
          `margin=${ranking.probabilityMargin.toFixed(2)}`,
        ].join(
          ' | ',
        ),
      )
    } catch (
      error
    ) {
      const message =
        error instanceof Error
          ? error.message
          : String(error)

      runs.push({
        run,

        expected:
          testCase.expected,

        error:
          message,
      })

      console.log(
        `${run.toString().padStart(2, '0')} | ERROR | ${message.slice(0, 180)}`,
      )
    }

    if (
      run <
      RUNS_PER_CASE
    ) {
      await sleep(
        DELAY_BETWEEN_RUNS_MS,
      )
    }
  }

  const successful =
    runs.filter(
      (
        run,
      ): run is SuccessfulRun =>
        'choice' in run,
    )

  const correct =
    successful.filter(
      (run) =>
        run.correct,
    )

  const wrong =
    successful.filter(
      (run) =>
        !run.correct,
    )

  const choiceCounts =
    Object.fromEntries(
      ACTIONS.map(
        (action) => [
          action,
          successful.filter(
            (run) =>
              run.choice ===
              action,
          ).length,
        ],
      ),
    ) as Record<Action, number>

  const confidences =
    successful.map(
      (run) =>
        run.confidence,
    )

  const margins =
    successful.map(
      (run) =>
        run.probabilityMargin,
    )

  return {
    id:
      testCase.id,

    name:
      testCase.name,

    expected:
      testCase.expected,

    totalAttempts:
      runs.length,

    successfulRequests:
      successful.length,

    errors:
      runs.length -
      successful.length,

    correctResponses:
      correct.length,

    wrongResponses:
      wrong.length,

    accuracyOnSuccessful:
      successful.length > 0
        ? correct.length /
          successful.length
        : 0,

    choiceCounts,

    averageConfidence:
      mean(
        confidences,
      ),

    minConfidence:
      min(
        confidences,
      ),

    maxConfidence:
      max(
        confidences,
      ),

    averageMargin:
      mean(
        margins,
      ),

    minMargin:
      min(
        margins,
      ),

    maxMargin:
      max(
        margins,
      ),

    runs,
  }
}

async function main() {
  console.log()

  console.log(
    'JEV V5 BOUNDARY CONSISTENCY',
  )

  console.log(
    '===========================',
  )

  console.log()

  console.log(
    `Targets: ${TARGET_IDS.join(', ')}`,
  )

  console.log(
    `Runs per case: ${RUNS_PER_CASE}`,
  )

  console.log(
    `Total attempts: ${TARGET_IDS.length * RUNS_PER_CASE}`,
  )

  const cases =
    await loadCases()

  const selected =
    TARGET_IDS.map(
      (id) => {
        const testCase =
          cases.find(
            (candidate) =>
              candidate.id ===
              id,
          )

        if (!testCase) {
          throw new Error(
            `Could not find ${id}.`,
          )
        }

        return testCase
      },
    )

  const results = []

  for (
    let index = 0;
    index <
    selected.length;
    index++
  ) {
    const testCase =
      selected[
        index
      ]

    if (!testCase) {
      continue
    }

    const result =
      await runCase(
        testCase,
      )

    results.push(
      result,
    )

    if (
      index <
      selected.length -
        1
    ) {
      console.log()

      console.log(
        `Waiting ${DELAY_BETWEEN_CASES_MS} ms...`,
      )

      await sleep(
        DELAY_BETWEEN_CASES_MS,
      )
    }
  }

  const report = {
    runAt:
      new Date()
        .toISOString(),

    model:
      'typesafe-ai/jev',

    experiment:
      'v5-boundary-consistency',

    sourceDataset:
      'routing-v5-cue-stripped',

    targetIds:
      TARGET_IDS,

    runsPerCase:
      RUNS_PER_CASE,

    results,
  }

  await mkdir(
    RESULTS_DIR,
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

  const outputPath =
    path.join(
      RESULTS_DIR,
      `jev-v5-boundary-${timestamp}.json`,
    )

  await writeFile(
    outputPath,
    JSON.stringify(
      report,
      null,
      2,
    ),
    'utf8',
  )

  console.log()

  console.log(
    'SUMMARY',
  )

  console.log(
    '=======',
  )

  for (
    const result
    of results
  ) {
    console.log()

    console.log(
      `${result.id}`,
    )

    console.log(
      `  choices: ${JSON.stringify(result.choiceCounts)}`,
    )

    console.log(
      `  correct: ${result.correctResponses}/${result.successfulRequests}`,
    )

    console.log(
      `  confidence: ${result.minConfidence.toFixed(2)} - ${result.maxConfidence.toFixed(2)} (avg ${result.averageConfidence.toFixed(3)})`,
    )

    console.log(
      `  margin: ${result.minMargin.toFixed(2)} - ${result.maxMargin.toFixed(2)} (avg ${result.averageMargin.toFixed(3)})`,
    )
  }

  console.log()

  console.log(
    `Saved: ${outputPath}`,
  )
}

main().catch(
  (error) => {
    console.error()

    console.error(
      'V5 boundary experiment failed:',
    )

    console.error(
      error,
    )

    process.exitCode = 1
  },
)