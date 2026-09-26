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
    'routing-v4-minimal-pairs.json',
  )

const RESULTS_DIR =
  path.join(
    process.cwd(),
    'results',
  )

const TARGET_IDS = [
  'MP05B',
  'MP08B',
  'MP09B',
  'MP06B',
  'MP07B',
] as const

const RUNS_PER_CASE =
  10

/*
 * We are measuring decision consistency,
 * not maximum request throughput.
 *
 * Pacing reduces the chance that provider
 * throttling dominates the experiment.
 */
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

  providerLatencyMs?:
    number

  endToEndLatencyMs:
    number
}

interface FailedRun {
  run: number

  expected: Action

  error: string
}

type FocusRun =
  | SuccessfulRun
  | FailedRun

interface CaseSummary {
  id: string

  name: string

  expected: Action

  totalRuns: number

  successfulRequests: number

  errors: number

  correctResponses: number

  wrongResponses: number

  accuracyOnSuccessful:
    number

  correctRateOverAllAttempts:
    number

  choiceCounts:
    Record<Action, number>

  averageConfidence:
    number

  minConfidence:
    number

  maxConfidence:
    number

  averageProbabilityMargin:
    number

  minProbabilityMargin:
    number

  maxProbabilityMargin:
    number

  averageEndToEndLatencyMs:
    number

  averageProviderLatencyMs:
    number | null

  runs:
    FocusRun[]
}

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
): number {
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

function minimum(
  values: number[],
): number {
  if (
    values.length === 0
  ) {
    return 0
  }

  return Math.min(
    ...values,
  )
}

function maximum(
  values: number[],
): number {
  if (
    values.length === 0
  ) {
    return 0
  }

  return Math.max(
    ...values,
  )
}

function getProbabilityRanking(
  probabilities:
    Partial<
      Record<
        Action,
        number
      >
    >,
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

  const top1 =
    ranking[0]

  const top2 =
    ranking[1]

  if (
    !top1 ||
    !top2
  ) {
    throw new Error(
      'Could not calculate probability ranking.',
    )
  }

  return {
    top1Action:
      top1.action,

    top1Probability:
      top1.probability,

    top2Action:
      top2.action,

    top2Probability:
      top2.probability,

    probabilityMargin:
      top1.probability -
      top2.probability,
  }
}

function createEmptyChoiceCounts():
  Record<Action, number> {
  return {
    SEARCH_CODE:
      0,

    READ_FILE:
      0,

    RUN_TESTS:
      0,

    QUERY_DATABASE:
      0,

    ASK_USER:
      0,
  }
}

async function loadCases():
  Promise<BenchmarkCase[]> {
  const raw =
    await readFile(
      DATASET_PATH,
      'utf8',
    )

  const parsed =
    JSON.parse(
      raw,
    ) as BenchmarkCase[]

  return parsed
}

async function runCase(
  testCase:
    BenchmarkCase,
): Promise<CaseSummary> {
  console.log()

  console.log(
    `${testCase.id} — ${testCase.name}`,
  )

  console.log(
    `Expected: ${testCase.expected}`,
  )

  console.log(
    '----------------------------------------',
  )

  const runs:
    FocusRun[] = []

  for (
    let run = 1;
    run <= RUNS_PER_CASE;
    run++
  ) {
    console.log(
      `Run ${run}/${RUNS_PER_CASE}...`,
    )

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
        getProbabilityRanking(
          answer.probabilities,
        )

      const correct =
        answer.choice ===
        testCase.expected

      const successfulRun:
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
          evaluation
            .providerLatencyMs,

        endToEndLatencyMs:
          evaluation
            .endToEndLatencyMs,
      }

      runs.push(
        successfulRun,
      )

      console.log(
        [
          `  ${answer.choice}`,
          correct
            ? 'CORRECT'
            : 'WRONG',
          `conf=${answer.confidence.toFixed(2)}`,
          `margin=${ranking.probabilityMargin.toFixed(2)}`,
          `${evaluation.endToEndLatencyMs.toFixed(0)}ms`,
        ].join(
          ' | ',
        ),
      )

      console.log(
        `  top2=${ranking.top2Action} (${ranking.top2Probability.toFixed(2)})`,
      )
    } catch (
      error
    ) {
      const message =
        error instanceof Error
          ? error.message
          : String(error)

      const failedRun:
        FailedRun = {
        run,

        expected:
          testCase.expected,

        error:
          message,
      }

      runs.push(
        failedRun,
      )

      console.log(
        `  ERROR: ${message.slice(0, 200)}`,
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

  const successfulRuns =
    runs.filter(
      (
        run,
      ): run is SuccessfulRun =>
        'choice' in run,
    )

  const errors =
    runs.length -
    successfulRuns.length

  const correctResponses =
    successfulRuns.filter(
      (run) =>
        run.correct,
    ).length

  const wrongResponses =
    successfulRuns.length -
    correctResponses

  const choiceCounts =
    createEmptyChoiceCounts()

  for (
    const run
    of successfulRuns
  ) {
    choiceCounts[
      run.choice
    ]++
  }

  const confidences =
    successfulRuns.map(
      (run) =>
        run.confidence,
    )

  const margins =
    successfulRuns.map(
      (run) =>
        run.probabilityMargin,
    )

  const endToEndLatencies =
    successfulRuns.map(
      (run) =>
        run.endToEndLatencyMs,
    )

  const providerLatencies =
    successfulRuns
      .map(
        (run) =>
          run.providerLatencyMs,
      )
      .filter(
        (
          value,
        ): value is number =>
          value !==
          undefined,
      )

  return {
    id:
      testCase.id,

    name:
      testCase.name,

    expected:
      testCase.expected,

    totalRuns:
      runs.length,

    successfulRequests:
      successfulRuns.length,

    errors,

    correctResponses,

    wrongResponses,

    accuracyOnSuccessful:
      successfulRuns.length >
      0
        ? correctResponses /
          successfulRuns.length
        : 0,

    correctRateOverAllAttempts:
      correctResponses /
      runs.length,

    choiceCounts,

    averageConfidence:
      mean(
        confidences,
      ),

    minConfidence:
      minimum(
        confidences,
      ),

    maxConfidence:
      maximum(
        confidences,
      ),

    averageProbabilityMargin:
      mean(
        margins,
      ),

    minProbabilityMargin:
      minimum(
        margins,
      ),

    maxProbabilityMargin:
      maximum(
        margins,
      ),

    averageEndToEndLatencyMs:
      mean(
        endToEndLatencies,
      ),

    averageProviderLatencyMs:
      providerLatencies.length >
      0
        ? mean(
            providerLatencies,
          )
        : null,

    runs,
  }
}

async function main() {
  console.log()

  console.log(
    'JEV V4 FOCUSED CONSISTENCY',
  )

  console.log(
    '==========================',
  )

  console.log()

  console.log(
    `Cases: ${TARGET_IDS.join(', ')}`,
  )

  console.log(
    `Runs per case: ${RUNS_PER_CASE}`,
  )

  console.log(
    `Total attempts: ${TARGET_IDS.length * RUNS_PER_CASE}`,
  )

  console.log()

  const allCases =
    await loadCases()

  const selectedCases =
    TARGET_IDS.map(
      (id) => {
        const testCase =
          allCases.find(
            (candidate) =>
              candidate.id ===
              id,
          )

        if (!testCase) {
          throw new Error(
            `Case ${id} was not found in routing-v4-minimal-pairs.json.`,
          )
        }

        return testCase
      },
    )

  const caseSummaries:
    CaseSummary[] = []

  for (
    let index = 0;
    index <
    selectedCases.length;
    index++
  ) {
    const testCase =
      selectedCases[
        index
      ]

    if (!testCase) {
      continue
    }

    const summary =
      await runCase(
        testCase,
      )

    caseSummaries.push(
      summary,
    )

    if (
      index <
      selectedCases.length -
        1
    ) {
      console.log()

      console.log(
        `Waiting ${DELAY_BETWEEN_CASES_MS}ms before next case...`,
      )

      await sleep(
        DELAY_BETWEEN_CASES_MS,
      )
    }
  }

  const allRuns =
    caseSummaries.flatMap(
      (caseSummary) =>
        caseSummary.runs,
    )

  const successfulRuns =
    allRuns.filter(
      (
        run,
      ): run is SuccessfulRun =>
        'choice' in run,
    )

  const errors =
    allRuns.length -
    successfulRuns.length

  const correctResponses =
    successfulRuns.filter(
      (run) =>
        run.correct,
    ).length

  const wrongResponses =
    successfulRuns.length -
    correctResponses

  const confidences =
    successfulRuns.map(
      (run) =>
        run.confidence,
    )

  const margins =
    successfulRuns.map(
      (run) =>
        run.probabilityMargin,
    )

  const report = {
    runAt:
      new Date()
        .toISOString(),

    model:
      'typesafe-ai/jev',

    experiment:
      'v4-focused-consistency',

    sourceDataset:
      'routing-v4-minimal-pairs',

    targetIds:
      TARGET_IDS,

    runsPerCase:
      RUNS_PER_CASE,

    pacing: {
      delayBetweenRunsMs:
        DELAY_BETWEEN_RUNS_MS,

      delayBetweenCasesMs:
        DELAY_BETWEEN_CASES_MS,
    },

    summary: {
      totalAttempts:
        allRuns.length,

      successfulRequests:
        successfulRuns.length,

      errors,

      correctResponses,

      wrongResponses,

      accuracyOnSuccessful:
        successfulRuns.length >
        0
          ? correctResponses /
            successfulRuns.length
          : 0,

      correctRateOverAllAttempts:
        allRuns.length >
        0
          ? correctResponses /
            allRuns.length
          : 0,

      averageConfidence:
        mean(
          confidences,
        ),

      minConfidence:
        minimum(
          confidences,
        ),

      maxConfidence:
        maximum(
          confidences,
        ),

      averageProbabilityMargin:
        mean(
          margins,
        ),

      minProbabilityMargin:
        minimum(
          margins,
        ),

      maxProbabilityMargin:
        maximum(
          margins,
        ),
    },

    cases:
      caseSummaries,
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
      `jev-v4-focus-consistency-${timestamp}.json`,
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
    'GLOBAL SUMMARY',
  )

  console.log(
    '==============',
  )

  console.log()

  console.log(
    `Successful requests: ${successfulRuns.length}/${allRuns.length}`,
  )

  console.log(
    `Errors: ${errors}`,
  )

  console.log(
    `Correct: ${correctResponses}`,
  )

  console.log(
    `Wrong: ${wrongResponses}`,
  )

  console.log(
    `Accuracy on successful: ${(report.summary.accuracyOnSuccessful * 100).toFixed(2)}%`,
  )

  console.log(
    `Correct over all attempts: ${(report.summary.correctRateOverAllAttempts * 100).toFixed(2)}%`,
  )

  console.log(
    `Average confidence: ${report.summary.averageConfidence.toFixed(3)}`,
  )

  console.log(
    `Confidence range: ${report.summary.minConfidence.toFixed(3)} - ${report.summary.maxConfidence.toFixed(3)}`,
  )

  console.log(
    `Average probability margin: ${report.summary.averageProbabilityMargin.toFixed(3)}`,
  )

  console.log(
    `Margin range: ${report.summary.minProbabilityMargin.toFixed(3)} - ${report.summary.maxProbabilityMargin.toFixed(3)}`,
  )

  console.log()

  console.log(
    'PER CASE',
  )

  console.log(
    '========',
  )

  console.log()

  for (
    const caseSummary
    of caseSummaries
  ) {
    console.log(
      `${caseSummary.id} | expected=${caseSummary.expected}`,
    )

    console.log(
      `  successful=${caseSummary.successfulRequests}/${caseSummary.totalRuns}`,
    )

    console.log(
      `  correct=${caseSummary.correctResponses}`,
    )

    console.log(
      `  wrong=${caseSummary.wrongResponses}`,
    )

    console.log(
      `  choices=${JSON.stringify(caseSummary.choiceCounts)}`,
    )

    console.log(
      `  confidence avg=${caseSummary.averageConfidence.toFixed(3)} range=${caseSummary.minConfidence.toFixed(3)}-${caseSummary.maxConfidence.toFixed(3)}`,
    )

    console.log(
      `  margin avg=${caseSummary.averageProbabilityMargin.toFixed(3)} range=${caseSummary.minProbabilityMargin.toFixed(3)}-${caseSummary.maxProbabilityMargin.toFixed(3)}`,
    )

    console.log()
  }

  console.log(
    `Saved: ${outputPath}`,
  )
}

main().catch(
  (error) => {
    console.error()

    console.error(
      'Focused consistency experiment failed:',
    )

    console.error(
      error,
    )

    process.exitCode = 1
  },
)