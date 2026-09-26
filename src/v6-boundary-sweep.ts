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
} from './types.js'

const DATASET_PATH =
  path.join(
    process.cwd(),
    'cases',
    'routing-v6-username-boundary.json',
  )

const RESULTS_DIR =
  path.join(
    process.cwd(),
    'results',
  )

const RUNS_PER_VARIANT =
  10

const DELAY_BETWEEN_RUNS_MS =
  1500

const DELAY_BETWEEN_VARIANTS_MS =
  3000

interface BoundaryCase {
  id: string

  level: number

  name: string

  expected:
    Action

  state:
    string
}

interface SuccessfulRun {
  run: number

  choice:
    Action

  expected:
    Action

  correct:
    boolean

  confidence:
    number

  probabilities:
    Partial<
      Record<
        Action,
        number
      >
    >

  askUserProbability:
    number

  searchCodeProbability:
    number

  askMinusSearch:
    number

  top1Action:
    Action

  top1Probability:
    number

  top2Action:
    Action

  top2Probability:
    number

  probabilityMargin:
    number

  providerLatencyMs?:
    number

  endToEndLatencyMs:
    number
}

interface FailedRun {
  run:
    number

  expected:
    Action

  error:
    string
}

type SweepRun =
  | SuccessfulRun
  | FailedRun

function sleep(
  milliseconds:
    number,
) {
  return new Promise<void>(
    (
      resolve,
    ) => {
      setTimeout(
        resolve,
        milliseconds,
      )
    },
  )
}

function mean(
  values:
    number[],
): number {
  if (
    values.length ===
    0
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
  values:
    number[],
): number {
  if (
    values.length ===
    0
  ) {
    return 0
  }

  return Math.min(
    ...values,
  )
}

function maximum(
  values:
    number[],
): number {
  if (
    values.length ===
    0
  ) {
    return 0
  }

  return Math.max(
    ...values,
  )
}

function getRanking(
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
        (
          action,
        ) => ({
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
      'Could not calculate action ranking.',
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
  Promise<
    BoundaryCase[]
  > {
  const raw =
    await readFile(
      DATASET_PATH,
      'utf8',
    )

  return JSON.parse(
    raw,
  ) as BoundaryCase[]
}

async function evaluateVariant(
  testCase:
    BoundaryCase,
) {
  console.log()

  console.log(
    `${testCase.id} — ${testCase.name}`,
  )

  console.log(
    `Expected anchor: ${testCase.expected}`,
  )

  console.log(
    '========================================',
  )

  const runs:
    SweepRun[] = []

  for (
    let run = 1;
    run <=
    RUNS_PER_VARIANT;
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

      const probabilities =
        answer.probabilities

      const ranking =
        getRanking(
          probabilities,
        )

      const askUserProbability =
        probabilities
          .ASK_USER ??
        0

      const searchCodeProbability =
        probabilities
          .SEARCH_CODE ??
        0

      const askMinusSearch =
        askUserProbability -
        searchCodeProbability

      const result:
        SuccessfulRun = {
        run,

        choice:
          answer.choice,

        expected:
          testCase.expected,

        correct:
          answer.choice ===
          testCase.expected,

        confidence:
          answer.confidence,

        probabilities,

        askUserProbability,

        searchCodeProbability,

        askMinusSearch,

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
        result,
      )

      console.log(
        [
          `${run.toString().padStart(2, '0')}`,
          answer.choice,
          `conf=${answer.confidence.toFixed(2)}`,
          `ASK=${askUserProbability.toFixed(2)}`,
          `SEARCH=${searchCodeProbability.toFixed(2)}`,
          `Δ=${askMinusSearch.toFixed(2)}`,
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
        `${run.toString().padStart(2, '0')} | ERROR | ${message.slice(0, 160)}`,
      )
    }

    if (
      run <
      RUNS_PER_VARIANT
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

  const choiceCounts =
    Object.fromEntries(
      ACTIONS.map(
        (
          action,
        ) => [
          action,

          successful.filter(
            (
              run,
            ) =>
              run.choice ===
              action,
          ).length,
        ],
      ),
    ) as Record<
      Action,
      number
    >

  const askProbabilities =
    successful.map(
      (
        run,
      ) =>
        run.askUserProbability,
    )

  const searchProbabilities =
    successful.map(
      (
        run,
      ) =>
        run.searchCodeProbability,
    )

  const differences =
    successful.map(
      (
        run,
      ) =>
        run.askMinusSearch,
    )

  const confidences =
    successful.map(
      (
        run,
      ) =>
        run.confidence,
    )

  const margins =
    successful.map(
      (
        run,
      ) =>
        run.probabilityMargin,
    )

  const correctCount =
    successful.filter(
      (
        run,
      ) =>
        run.correct,
    ).length

  return {
    id:
      testCase.id,

    level:
      testCase.level,

    name:
      testCase.name,

    expected:
      testCase.expected,

    state:
      testCase.state,

    totalAttempts:
      runs.length,

    successfulRequests:
      successful.length,

    errors:
      runs.length -
      successful.length,

    correctResponses:
      correctCount,

    accuracyOnSuccessful:
      successful.length > 0
        ? correctCount /
          successful.length
        : 0,

    choiceCounts,

    askUserRate:
      successful.length > 0
        ? choiceCounts.ASK_USER /
          successful.length
        : 0,

    searchCodeRate:
      successful.length > 0
        ? choiceCounts.SEARCH_CODE /
          successful.length
        : 0,

    averageAskUserProbability:
      mean(
        askProbabilities,
      ),

    averageSearchCodeProbability:
      mean(
        searchProbabilities,
      ),

    averageAskMinusSearch:
      mean(
        differences,
      ),

    minAskMinusSearch:
      minimum(
        differences,
      ),

    maxAskMinusSearch:
      maximum(
        differences,
      ),

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

    averageMargin:
      mean(
        margins,
      ),

    minMargin:
      minimum(
        margins,
      ),

    maxMargin:
      maximum(
        margins,
      ),

    runs,
  }
}

async function main() {
  console.log()

  console.log(
    'JEV V6 USERNAME BOUNDARY SWEEP',
  )

  console.log(
    '==============================',
  )

  console.log()

  console.log(
    `Runs per variant: ${RUNS_PER_VARIANT}`,
  )

  const cases =
    await loadCases()

  console.log(
    `Variants: ${cases.length}`,
  )

  console.log(
    `Total attempts: ${cases.length * RUNS_PER_VARIANT}`,
  )

  const results = []

  for (
    let index = 0;
    index <
    cases.length;
    index++
  ) {
    const testCase =
      cases[
        index
      ]

    if (!testCase) {
      continue
    }

    const result =
      await evaluateVariant(
        testCase,
      )

    results.push(
      result,
    )

    if (
      index <
      cases.length -
        1
    ) {
      console.log()

      console.log(
        `Waiting ${DELAY_BETWEEN_VARIANTS_MS} ms before next variant...`,
      )

      await sleep(
        DELAY_BETWEEN_VARIANTS_MS,
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
      'v6-username-boundary-sweep',

    runsPerVariant:
      RUNS_PER_VARIANT,

    totalVariants:
      results.length,

    totalAttempts:
      results.length *
      RUNS_PER_VARIANT,

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
      `jev-v6-username-boundary-${timestamp}.json`,
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
    'BOUNDARY SUMMARY',
  )

  console.log(
    '================',
  )

  console.log()

  for (
    const result
    of results
  ) {
    console.log(
      [
        result.id,
        `expected=${result.expected}`,
        `ASK=${(result.askUserRate * 100).toFixed(0)}%`,
        `SEARCH=${(result.searchCodeRate * 100).toFixed(0)}%`,
        `PASK=${result.averageAskUserProbability.toFixed(3)}`,
        `PSEARCH=${result.averageSearchCodeProbability.toFixed(3)}`,
        `Δ=${result.averageAskMinusSearch.toFixed(3)}`,
        `conf=${result.averageConfidence.toFixed(3)}`,
      ].join(
        ' | ',
      ),
    )
  }

  console.log()

  console.log(
    `Saved: ${outputPath}`,
  )
}

main().catch(
  (
    error,
  ) => {
    console.error()

    console.error(
      'V6 boundary sweep failed:',
    )

    console.error(
      error,
    )

    process.exitCode =
      1
  },
)