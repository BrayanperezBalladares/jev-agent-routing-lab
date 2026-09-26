import {
  evaluateWithNvidia,
  NVIDIA_MODEL,
} from './nvidia-llm.js'

async function main() {
  console.log()

  console.log(
    'NVIDIA / NEMOTRON SMOKE TEST',
  )

  console.log(
    '============================',
  )

  console.log()

  console.log(
    `Model: ${NVIDIA_MODEL}`,
  )

  console.log()

  console.log(
    'Sending one request...',
  )

  console.log()

  const result =
    await evaluateWithNvidia(
      'The coding agent modified communities.service.ts but has not executed any tests after the change.',
    )

  console.log(
    `Choice: ${result.choice}`,
  )

  console.log(
    `Latency: ${result.latencyMs.toFixed(1)} ms`,
  )

  console.log(
    `Input tokens: ${result.inputTokens}`,
  )

  console.log(
    `Output tokens: ${result.outputTokens}`,
  )

  console.log(
    `Total tokens: ${result.totalTokens}`,
  )

  console.log(
    `Raw output: ${result.rawOutput}`,
  )

  console.log(
    'Endpoint cost: $0',
  )
}

main().catch(
  (error) => {
    console.error()

    console.error(
      'NVIDIA smoke test failed:',
    )

    console.error(
      error,
    )

    process.exitCode = 1
  },
)