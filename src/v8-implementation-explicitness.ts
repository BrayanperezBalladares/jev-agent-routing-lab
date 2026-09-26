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
    'routing-v8-implementation-explicitness.json',
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

interface ExperimentCase {
  id: string
  level: number
  name: string
  expected: Action
  state: string
}

interface SuccessfulRun {
  run: number

  choice: Action

  expected: Action

  correct: boolean

  confidence: number

  probabilities:
    Partial<Record<Action, number>>

  askUserProbability: number

  searchCodeProbability: number

  queryDatabaseProbability: number

  searchMinusAsk: number

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

type ExperimentRun =
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

function entropyBits(
  counts:
    Record<Action, number>,
): number {
  const total =
    Object.values(
      counts,
    ).reduce(
      (
        sum,
        count,
      ) =>
        sum +
        count,
      0,
    )

  if (
    total === 0
  ) {
    return 0
  }

  let entropy =
    0

  for (
    const count
    of Object.values(
      counts,
    )
  ) {
    if (
      count === 0
    ) {
      continue
    }

    const probability =
      count /
      total

    entropy -=
      probability *
      Math.log2(
        probability,
      )
  }

  return entropy
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

async function loadCases():
  Promise<ExperimentCase[]> {
  const raw =
    await readFile(
      DATASET_PATH,
      'utf8',
    )

  return JSON.parse(
    raw,
  ) as ExperimentCase[]
}

async function evaluateVariant(
  testCase:
    ExperimentCase,
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
    ExperimentRun[] = []

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
        probabilities.ASK_USER ??
        0

      const searchCodeProbability =
        probabilities.SEARCH_CODE ??
        0

      const queryDatabaseProbability =
        probabilities.QUERY_DATABASE ??
        0

      const searchMinusAsk =
        searchCodeProbability -
        askUserProbability

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

        queryDatabaseProbability,

        searchMinusAsk,

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
          `SEARCH=${searchCodeProbability.toFixed(2)}`,
          `ASK=${askUserProbability.toFixed(2)}`,
          `DB=${queryDatabaseProbability.toFixed(2)}`,
          `Δ=${searchMinusAsk.toFixed(2)}`,
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

  const dominantChoiceCount =
    Math.max(
      ...Object.values(
        choiceCounts,
      ),
    )

  const correctResponses =
    successful.filter(
      (run) =>
        run.correct,
    ).length

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

  const askProbabilities =
    successful.map(
      (run) =>
        run.askUserProbability,
    )

  const searchProbabilities =
    successful.map(
      (run) =>
        run.searchCodeProbability,
    )

  const databaseProbabilities =
    successful.map(
      (run) =>
        run.queryDatabaseProbability,
    )

  const differences =
    successful.map(
      (run) =>
        run.searchMinusAsk,
    )

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

    correctResponses,

    wrongResponses:
      successful.length -
      correctResponses,

    accuracyOnSuccessful:
      successful.length > 0
        ? correctResponses /
          successful.length
        : 0,

    choiceCounts,

    searchCodeRate:
      successful.length > 0
        ? choiceCounts.SEARCH_CODE /
          successful.length
        : 0,

    askUserRate:
      successful.length > 0
        ? choiceCounts.ASK_USER /
          successful.length
        : 0,

    queryDatabaseRate:
      successful.length > 0
        ? choiceCounts.QUERY_DATABASE /
          successful.length
        : 0,

    dominantChoiceRate:
      successful.length > 0
        ? dominantChoiceCount /
          successful.length
        : 0,

    instabilityRate:
      successful.length > 0
        ? 1 -
          dominantChoiceCount /
          successful.length
        : 0,

    choiceEntropyBits:
      entropyBits(
        choiceCounts,
      ),

    averageSearchCodeProbability:
      mean(
        searchProbabilities,
      ),

    averageAskUserProbability:
      mean(
        askProbabilities,
      ),

    averageQueryDatabaseProbability:
      mean(
        databaseProbabilities,
      ),

    averageSearchMinusAsk:
      mean(
        differences,
      ),

    minSearchMinusAsk:
      minimum(
        differences,
      ),

    maxSearchMinusAsk:
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
    'JEV V8 IMPLEMENTATION EXPLICITNESS',
  )

  console.log(
    '=================================',
  )

  console.log()

  const cases =
    await loadCases()

  console.log(
    `Variants: ${cases.length}`,
  )

  console.log(
    `Runs per variant: ${RUNS_PER_VARIANT}`,
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
      cases[index]

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

  const totalAttempts =
    results.reduce(
      (
        total,
        result,
      ) =>
        total +
        result.totalAttempts,
      0,
    )

  const successfulRequests =
    results.reduce(
      (
        total,
        result,
      ) =>
        total +
        result.successfulRequests,
      0,
    )

  const errors =
    results.reduce(
      (
        total,
        result,
      ) =>
        total +
        result.errors,
      0,
    )

  const report = {
    runAt:
      new Date()
        .toISOString(),

    model:
      'typesafe-ai/jev',

    experiment:
      'v8-implementation-explicitness',

    runsPerVariant:
      RUNS_PER_VARIANT,

    totalVariants:
      results.length,

    totalAttempts,

    successfulRequests,

    errors,

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
      `jev-v8-implementation-explicitness-${timestamp}.json`,
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
    'EXPLICITNESS SUMMARY',
  )

  console.log(
    '====================',
  )

  console.log()

  for (
    const result
    of results
  ) {
    console.log(
      [
        result.id,
        `SEARCH=${(result.searchCodeRate * 100).toFixed(0)}%`,
        `ASK=${(result.askUserRate * 100).toFixed(0)}%`,
        `DB=${(result.queryDatabaseRate * 100).toFixed(0)}%`,
        `PSEARCH=${result.averageSearchCodeProbability.toFixed(3)}`,
        `PASK=${result.averageAskUserProbability.toFixed(3)}`,
        `Δ=${result.averageSearchMinusAsk.toFixed(3)}`,
        `conf=${result.averageConfidence.toFixed(3)}`,
        `margin=${result.averageMargin.toFixed(3)}`,
        `instability=${result.instabilityRate.toFixed(3)}`,
        `entropy=${result.choiceEntropyBits.toFixed(3)}`,
      ].join(
        ' | ',
      ),
    )
  }

  console.log()

  console.log(
    `Requests: ${successfulRequests}/${totalAttempts}`,
  )

  console.log(
    `Errors: ${errors}`,
  )

  console.log()

  console.log(
    `Saved: ${outputPath}`,
  )
}

main().catch(
  (error) => {
    console.error()

    console.error(
      'V8 experiment failed:',
    )

    console.error(
      error,
    )

    process.exitCode = 1
  },
)