import 'dotenv/config'

import {
  ACTIONS,
  type Action,
} from './types.js'

const NVIDIA_API_URL =
  'https://integrate.api.nvidia.com/v1/chat/completions'

export const NVIDIA_MODEL =
  'nvidia/nemotron-3-ultra-550b-a55b'

const apiKey =
  process.env.NVIDIA_API_KEY

if (!apiKey) {
  throw new Error(
    'Missing NVIDIA_API_KEY. Add it to the .env file.',
  )
}

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

Return exactly ONE action name and nothing else.
`.trim()

interface NvidiaChatResponse {
  id?: string

  choices?: Array<{
    message?: {
      content?:
        | string
        | null

      reasoning_content?:
        | string
        | null
    }
  }>

  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

export interface NvidiaEvaluation {
  choice: Action

  latencyMs: number

  inputTokens: number
  outputTokens: number
  totalTokens: number

  estimatedCost: number

  rawOutput: string

  responseId?: string
}

export class NvidiaAccessError
  extends Error {
  status: number

  constructor(
    status: number,
    message: string,
  ) {
    super(message)

    this.name =
      'NvidiaAccessError'

    this.status =
      status
  }
}

function isAction(
  value: string,
): value is Action {
  return (
    ACTIONS as readonly string[]
  ).includes(
    value,
  )
}

function extractAction(
  output: string,
): Action {
  const normalized =
    output
      .trim()
      .toUpperCase()

  if (
    isAction(
      normalized,
    )
  ) {
    return normalized
  }

  const firstLine =
    normalized
      .split(
        /\r?\n/,
      )
      .map(
        (line) =>
          line.trim(),
      )
      .find(
        (line) =>
          line.length > 0,
      )

  if (
    firstLine
  ) {
    for (
      const action
      of ACTIONS
    ) {
      if (
        firstLine ===
          action ||
        firstLine.startsWith(
          `${action}:`,
        ) ||
        firstLine.startsWith(
          `${action} `,
        ) ||
        firstLine.startsWith(
          `${action} -`,
        )
      ) {
        return action
      }
    }
  }

  const actionPattern =
    /\b(SEARCH_CODE|READ_FILE|RUN_TESTS|QUERY_DATABASE|ASK_USER)\b/

  const match =
    normalized.match(
      actionPattern,
    )

  const candidate =
    match?.[1]

  if (
    candidate &&
    isAction(
      candidate,
    )
  ) {
    return candidate
  }

  throw new Error(
    `Could not extract a routing action from NVIDIA output: ${output}`,
  )
}

export async function evaluateWithNvidia(
  state: string,
): Promise<NvidiaEvaluation> {
  const requestBody = {
    model:
      NVIDIA_MODEL,

    messages: [
      {
        role:
          'system',

        content:
          ROUTING_INSTRUCTIONS,
      },
      {
        role:
          'user',

        content: `
Current state:

${state}

Return exactly ONE of these action names and nothing else:

SEARCH_CODE
READ_FILE
RUN_TESTS
QUERY_DATABASE
ASK_USER
`.trim(),
      },
    ],

    temperature:
      0,

    max_tokens:
      32,

    stream:
      false,

    chat_template_kwargs: {
      enable_thinking:
        false,
    },
  }

  const start =
    performance.now()

  let response:
    Response

  try {
    response =
      await fetch(
        NVIDIA_API_URL,
        {
          method:
            'POST',

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            Accept:
              'application/json',

            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify(
              requestBody,
            ),

          signal:
            AbortSignal.timeout(
              60_000,
            ),
        },
      )
  } catch (
    error
  ) {
    if (
      error instanceof Error &&
      (
        error.name ===
          'TimeoutError' ||
        error.name ===
          'AbortError'
      )
    ) {
      throw new Error(
        `NVIDIA request timed out after 60 seconds for ${NVIDIA_MODEL}.`,
      )
    }

    throw error
  }

  const raw =
    await response.text()

  if (
    !response.ok
  ) {
    if (
      response.status === 401 ||
      response.status === 402 ||
      response.status === 403
    ) {
      throw new NvidiaAccessError(
        response.status,
        `NVIDIA access failed with HTTP ${response.status}: ${raw}`,
      )
    }

    throw new Error(
      `NVIDIA returned HTTP ${response.status}: ${raw}`,
    )
  }

  const latencyMs =
    performance.now() -
    start

  let data:
    NvidiaChatResponse

  try {
    data =
      JSON.parse(
        raw,
      ) as NvidiaChatResponse
  } catch {
    throw new Error(
      `Invalid JSON returned by NVIDIA: ${raw}`,
    )
  }

  const rawOutput =
    data
      .choices?.[0]
      ?.message
      ?.content
      ?.trim() ??
    ''

  if (!rawOutput) {
    const reasoningOutput =
      data
        .choices?.[0]
        ?.message
        ?.reasoning_content
        ?.trim() ??
      ''

    throw new Error(
      `NVIDIA returned no final output. Reasoning output: ${reasoningOutput}`,
    )
  }

  const choice =
    extractAction(
      rawOutput,
    )

  const inputTokens =
    data
      .usage
      ?.prompt_tokens ??
    0

  const outputTokens =
    data
      .usage
      ?.completion_tokens ??
    0

  const totalTokens =
    data
      .usage
      ?.total_tokens ??
    (
      inputTokens +
      outputTokens
    )

  return {
    choice,

    latencyMs,

    inputTokens,

    outputTokens,

    totalTokens,

    estimatedCost:
      0,

    rawOutput,

    responseId:
      data.id,
  }
}