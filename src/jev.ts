import 'dotenv/config'

import type {
  JevEvaluation,
  JevResponse,
} from './types.js'

const API_URL =
  'https://ai-gateway.vercel.sh/v1/evaluate'

const MODEL = 'typesafe-ai/jev'

const MAX_ATTEMPTS = 4

const RETRYABLE_STATUS_CODES =
  new Set([
    429,
    502,
    503,
    504,
  ])

const ROUTING_CRITERIA = {
  SEARCH_CODE:
    'Search the repository when the relevant implementation location is unknown.',

  READ_FILE:
    'Inspect a specific implementation file when the relevant file is already known or code behavior needs investigation.',

  RUN_TESTS:
    'Run tests when code has been modified and needs verification.',

  QUERY_DATABASE:
    'Inspect database records, schema, constraints, or state when database behavior may explain the problem.',

  ASK_USER:
    'Ask the user when requirements are insufficient to determine the correct behavior or next action.',
} as const

function sleep(
  ms: number,
): Promise<void> {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms),
  )
}

function getRetryDelayMs(
  response: Response,
  attempt: number,
): number {
  const retryAfter =
    response.headers.get(
      'retry-after',
    )

  if (retryAfter) {
    const seconds =
      Number(retryAfter)

    if (
      Number.isFinite(seconds) &&
      seconds > 0
    ) {
      return seconds * 1000
    }
  }

  // 2s → 4s → 8s
  return (
    2 ** attempt
  ) * 1000
}

export async function evaluateNextAction(
  state: string,
): Promise<JevEvaluation> {
  const apiKey =
    process.env.AI_GATEWAY_API_KEY

  if (!apiKey) {
    throw new Error(
      'Missing AI_GATEWAY_API_KEY. Add it to the .env file.',
    )
  }

  const body = {
    model: MODEL,

    state,

    questions: {
      nextAction: {
        type: 'choice',

        instructions:
          'Choose the single most useful next action for the coding agent.',

        criteria:
          ROUTING_CRITERIA,
      },
    },
  }

  const overallStart =
    performance.now()

  let lastError =
    'Unknown AI Gateway error'

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt++
  ) {
    const response =
      await fetch(
        API_URL,
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify(body),
        },
      )

    const raw =
      await response.text()

    if (response.ok) {
      const endToEndLatencyMs =
        performance.now() -
        overallStart

      let data:
        JevResponse

      try {
        data =
          JSON.parse(
            raw,
          ) as JevResponse
      } catch {
        throw new Error(
          `Invalid JSON returned by AI Gateway: ${raw}`,
        )
      }

      const providerAttempt =
        data
          .providerMetadata
          ?.gateway
          ?.routing
          ?.modelAttempts
          ?.[0]
          ?.providerAttempts
          ?.[0]

      let providerLatencyMs:
        | number
        | undefined

      if (
        providerAttempt
          ?.startTime !==
          undefined &&
        providerAttempt
          .endTime !==
          undefined
      ) {
        providerLatencyMs =
          providerAttempt
            .endTime -
          providerAttempt
            .startTime
      }

      return {
        response: data,
        endToEndLatencyMs,
        providerLatencyMs,
      }
    }

    lastError =
      `AI Gateway returned ${response.status}: ${raw}`

    const retryable =
      RETRYABLE_STATUS_CODES.has(
        response.status,
      )

    const hasAttemptsLeft =
      attempt < MAX_ATTEMPTS

    if (
      !retryable ||
      !hasAttemptsLeft
    ) {
      throw new Error(
        lastError,
      )
    }

    const delayMs =
      getRetryDelayMs(
        response,
        attempt,
      )

    console.warn(
      `AI Gateway ${response.status}. Retry ${attempt}/${MAX_ATTEMPTS - 1} in ${(delayMs / 1000).toFixed(1)}s...`,
    )

    await sleep(
      delayMs,
    )
  }

  throw new Error(
    lastError,
  )
}