import {
  evaluateWithLlm,
  LLM_MODEL,
} from './llm.js'

async function main() {
  console.log()
  console.log(
    'LLM SMOKE TEST',
  )

  console.log(
    '==============',
  )

  console.log()
  console.log(
    `Model: ${LLM_MODEL}`,
  )

  console.log()

  const result =
    await evaluateWithLlm(
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
    `Reasoning tokens: ${result.reasoningTokens}`,
  )

  console.log(
    `Estimated cost: $${result.estimatedCost.toFixed(8)}`,
  )
}

main().catch(
  (error) => {
    console.error()
    console.error(
      'LLM smoke test failed:',
    )

    console.error(
      error,
    )

    process.exitCode = 1
  },
)