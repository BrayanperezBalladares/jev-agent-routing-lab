import 'dotenv/config'

const NVIDIA_API_URL =
  'https://integrate.api.nvidia.com/v1/chat/completions'

const MODEL =
  'nvidia/nemotron-3-ultra-550b-a55b'

const apiKey =
  process.env.NVIDIA_API_KEY

if (!apiKey) {
  throw new Error(
    'Missing NVIDIA_API_KEY in .env',
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

interface NvidiaResponse {
  choices?: Array<{
    message?: {
      content?: string | null
      reasoning_content?: string | null
    }
  }>

  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
    total_tokens?: number
  }
}

async function runOnce(
  attempt: number,
) {
  const controller =
    new AbortController()

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      30_000,
    )

  const start =
    performance.now()

  try {
    const response =
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
            JSON.stringify({
              model:
                MODEL,

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

                  content:
                    `Current state:

The coding agent modified communities.service.ts but has not executed any tests after the change.`,
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
            }),

          signal:
            controller.signal,
        },
      )

    const latencyMs =
      performance.now() -
      start

    const raw =
      await response.text()

    if (!response.ok) {
      console.log(
        `Attempt ${attempt}: HTTP ${response.status}`,
      )

      console.log(
        raw.slice(
          0,
          500,
        ),
      )

      return
    }

    const data =
      JSON.parse(
        raw,
      ) as NvidiaResponse

    const content =
      data
        .choices?.[0]
        ?.message
        ?.content
        ?.trim() ??
      ''

    const reasoning =
      data
        .choices?.[0]
        ?.message
        ?.reasoning_content
        ?.trim() ??
      ''

    console.log(
      `Attempt ${attempt}`,
    )

    console.log(
      `  Latency: ${latencyMs.toFixed(1)} ms`,
    )

    console.log(
      `  Output: ${JSON.stringify(content)}`,
    )

    console.log(
      `  Reasoning returned: ${reasoning ? 'YES' : 'NO'}`,
    )

    console.log(
      `  Input tokens: ${data.usage?.prompt_tokens ?? 0}`,
    )

    console.log(
      `  Output tokens: ${data.usage?.completion_tokens ?? 0}`,
    )

    console.log(
      `  Total tokens: ${data.usage?.total_tokens ?? 0}`,
    )

    console.log(
      `  Correct: ${content === 'RUN_TESTS' ? 'YES' : 'NO'}`,
    )
  } catch (
    error
  ) {
    const latencyMs =
      performance.now() -
      start

    if (
      error instanceof Error &&
      (
        error.name ===
          'AbortError' ||
        error.name ===
          'TimeoutError'
      )
    ) {
      console.log(
        `Attempt ${attempt}: TIMEOUT after ${latencyMs.toFixed(0)} ms`,
      )

      return
    }

    console.log(
      `Attempt ${attempt}: ERROR`,
    )

    console.log(
      error,
    )
  } finally {
    clearTimeout(
      timeout,
    )
  }
}

async function main() {
  console.log()
  console.log(
    'NVIDIA NEMOTRON ULTRA STABILITY TEST',
  )

  console.log(
    '====================================',
  )

  console.log()
  console.log(
    `Model: ${MODEL}`,
  )

  console.log(
    'Expected: RUN_TESTS',
  )

  console.log(
    'Thinking: OFF',
  )

  console.log()

  for (
    let attempt = 1;
    attempt <= 3;
    attempt++
  ) {
    await runOnce(
      attempt,
    )

    console.log()

    if (
      attempt < 3
    ) {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1000,
          ),
      )
    }
  }
}

main().catch(
  (error) => {
    console.error(
      error,
    )

    process.exitCode = 1
  },
)