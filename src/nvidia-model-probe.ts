import 'dotenv/config'

const NVIDIA_API_URL =
  'https://integrate.api.nvidia.com/v1/chat/completions'

const apiKey =
  process.env.NVIDIA_API_KEY

if (!apiKey) {
  throw new Error(
    'Missing NVIDIA_API_KEY in .env',
  )
}

const MODELS = [
  'nvidia/nemotron-3.5-lightning-30b-a3b',
  'z-ai/glm-5-3-flash',
  'poolside/laguna-xs-2.1',
  'nvidia/nemotron-3-ultra-550b-a55b',
] as const

interface ProbeResult {
  model: string
  success: boolean
  latencyMs?: number
  output?: string
  status?: number
  error?: string
}

async function probeModel(
  model: string,
): Promise<ProbeResult> {
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
              model,

              messages: [
                {
                  role:
                    'user',

                  content:
                    'Reply with exactly: OK',
                },
              ],

              temperature:
                0,

              max_tokens:
                16,

              stream:
                false,
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

    if (
      !response.ok
    ) {
      return {
        model,
        success:
          false,
        latencyMs,
        status:
          response.status,
        error:
          raw.slice(
            0,
            500,
          ),
      }
    }

    let data:
      {
        choices?: Array<{
          message?: {
            content?:
              | string
              | null
          }
        }>
      }

    try {
      data =
        JSON.parse(
          raw,
        )
    } catch {
      return {
        model,
        success:
          false,
        latencyMs,
        error:
          `Invalid JSON: ${raw.slice(0, 500)}`,
      }
    }

    const output =
      data
        .choices?.[0]
        ?.message
        ?.content
        ?.trim() ??
      ''

    return {
      model,
      success:
        true,
      latencyMs,
      output,
    }
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
      return {
        model,
        success:
          false,
        latencyMs,
        error:
          'TIMEOUT after 30 seconds',
      }
    }

    return {
      model,
      success:
        false,
      latencyMs,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    }
  } finally {
    clearTimeout(
      timeout,
    )
  }
}

async function main() {
  console.log()
  console.log(
    'NVIDIA FREE MODEL PROBE',
  )

  console.log(
    '=======================',
  )

  console.log()

  const results:
    ProbeResult[] = []

  for (
    const [index, model]
    of MODELS.entries()
  ) {
    console.log(
      `[${index + 1}/${MODELS.length}] ${model}`,
    )

    const result =
      await probeModel(
        model,
      )

    results.push(
      result,
    )

    if (
      result.success
    ) {
      console.log(
        `  SUCCESS - ${result.latencyMs?.toFixed(0)} ms`,
      )

      console.log(
        `  Output: ${result.output}`,
      )
    } else {
      console.log(
        `  FAILED - ${result.latencyMs?.toFixed(0)} ms`,
      )

      if (
        result.status
      ) {
        console.log(
          `  HTTP: ${result.status}`,
        )
      }

      console.log(
        `  Error: ${result.error}`,
      )
    }

    console.log()
  }

  console.log(
    'SUMMARY',
  )

  console.log(
    '=======',
  )

  console.log()

  console.table(
    results.map(
      (result) => ({
        model:
          result.model,

        status:
          result.success
            ? 'OK'
            : 'FAILED',

        latency:
          result.latencyMs
            ? `${result.latencyMs.toFixed(0)} ms`
            : '-',

        output:
          result.output ??
          '-',

        error:
          result.error ??
          '-',
      }),
    ),
  )

  const working =
    results
      .filter(
        (
          result,
        ): result is ProbeResult & {
          latencyMs: number
        } =>
          result.success &&
          result.latencyMs !==
            undefined,
      )
      .sort(
        (a, b) =>
          a.latencyMs -
          b.latencyMs,
      )

  console.log()

  if (
    working.length === 0
  ) {
    console.log(
      'No NVIDIA model responded successfully.',
    )

    return
  }

  console.log(
    'Responsive models, fastest first:',
  )

  console.log()

  for (
    const result
    of working
  ) {
    console.log(
      `${result.model} - ${result.latencyMs.toFixed(0)} ms`,
    )
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