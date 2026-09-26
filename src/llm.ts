import 'dotenv/config'

import OpenAI from 'openai'

import {
  ACTIONS,
  type Action,
} from './types.js'

const API_URL =
  'https://ai-gateway.vercel.sh/v1'

export const LLM_MODEL =
  'openai/gpt-5-mini'

export const LLM_INPUT_PRICE_PER_MILLION =
  0.25

export const LLM_OUTPUT_PRICE_PER_MILLION =
  2

const apiKey =
  process.env.AI_GATEWAY_API_KEY

if (!apiKey) {
  throw new Error(
    'Missing AI_GATEWAY_API_KEY. Add it to the .env file.',
  )
}

const client =
  new OpenAI({
    apiKey,
    baseURL:
      API_URL,
    maxRetries:
      3,
  })

const ROUTING_INSTRUCTIONS = `
You are a routing component inside a software engineering agent.

Choose the single most useful NEXT action.

Available actions:

SEARCH_CODE:
Search the repository when the relevant implementation location is unknown.

READ_FILE:
Inspect a specific implementation file when the relevant file is already known or code behavior needs investigation.

RUN_TESTS:
Run tests when code has been modified and needs verification.

QUERY_DATABASE:
Inspect database records, schema, constraints, or state when database behavior may explain the problem.

ASK_USER:
Ask the user when requirements are insufficient to determine the correct behavior or next action.

Choose based on the current state only.
Do not invent missing information.
`.trim()

interface RoutingOutput {
  choice: Action
}

export interface LlmEvaluation {
  choice: Action

  latencyMs: number

  inputTokens: number
  outputTokens: number
  reasoningTokens: number

  estimatedCost: number

  responseId?: string
}

export class LlmAccessError
  extends Error {
  status: number

  constructor(
    status: number,
    message: string,
  ) {
    super(message)

    this.name =
      'LlmAccessError'

    this.status =
      status
  }
}

function getHttpStatus(
  error: unknown,
): number | undefined {
  if (
    typeof error !==
      'object' ||
    error === null ||
    !('status' in error)
  ) {
    return undefined
  }

  const status =
    (
      error as {
        status?: unknown
      }
    ).status

  if (
    typeof status ===
    'number'
  ) {
    return status
  }

  return undefined
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message
  }

  return String(
    error,
  )
}

function isAction(
  value: unknown,
): value is Action {
  return (
    typeof value ===
      'string' &&
    (
      ACTIONS as readonly string[]
    ).includes(
      value,
    )
  )
}

export async function evaluateWithLlm(
  state: string,
): Promise<LlmEvaluation> {
  const start =
    performance.now()

  let response

  try {
    response =
      await client.responses.create({
        model:
          LLM_MODEL,

        reasoning: {
          effort:
            'minimal',
        },

        instructions:
          ROUTING_INSTRUCTIONS,

        input:
          `Current state:\n\n${state}`,

        max_output_tokens:
          256,

        text: {
          format: {
            type:
              'json_schema',

            name:
              'routing_decision',

            strict:
              true,

            schema: {
              type:
                'object',

              properties: {
                choice: {
                  type:
                    'string',

                  enum: [
                    'SEARCH_CODE',
                    'READ_FILE',
                    'RUN_TESTS',
                    'QUERY_DATABASE',
                    'ASK_USER',
                  ],
                },
              },

              required: [
                'choice',
              ],

              additionalProperties:
                false,
            },
          },
        },
      })
  } catch (
    error
  ) {
    const status =
      getHttpStatus(
        error,
      )

    if (
      status === 401 ||
      status === 403
    ) {
      throw new LlmAccessError(
        status,
        `LLM access failed with HTTP ${status}: ${getErrorMessage(error)}`,
      )
    }

    throw error
  }

  const latencyMs =
    performance.now() -
    start

  const outputText =
    response.output_text

  if (
    !outputText
  ) {
    throw new Error(
      `${LLM_MODEL} returned no output text.`,
    )
  }

  let parsed:
    RoutingOutput

  try {
    parsed =
      JSON.parse(
        outputText,
      ) as RoutingOutput
  } catch {
    throw new Error(
      `Invalid JSON returned by ${LLM_MODEL}: ${outputText}`,
    )
  }

  if (
    !isAction(
      parsed.choice,
    )
  ) {
    throw new Error(
      `Invalid routing action returned by ${LLM_MODEL}: ${String(parsed.choice)}`,
    )
  }

  const usage =
    response.usage as
      | {
          input_tokens?: number

          output_tokens?: number

          output_tokens_details?: {
            reasoning_tokens?: number
          }
        }
      | undefined

  const inputTokens =
    usage
      ?.input_tokens ??
    0

  const outputTokens =
    usage
      ?.output_tokens ??
    0

  const reasoningTokens =
    usage
      ?.output_tokens_details
      ?.reasoning_tokens ??
    0

  const estimatedCost =
    (
      inputTokens *
      LLM_INPUT_PRICE_PER_MILLION
    ) /
      1_000_000 +
    (
      outputTokens *
      LLM_OUTPUT_PRICE_PER_MILLION
    ) /
      1_000_000

  return {
    choice:
      parsed.choice,

    latencyMs,

    inputTokens,

    outputTokens,

    reasoningTokens,

    estimatedCost,

    responseId:
      response.id,
  }
}