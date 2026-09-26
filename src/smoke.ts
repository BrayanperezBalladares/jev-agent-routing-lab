import 'dotenv/config'

const API_URL = 'https://ai-gateway.vercel.sh/v1/evaluate'

const apiKey = process.env.AI_GATEWAY_API_KEY

if (!apiKey) {
  throw new Error(
    'AI_GATEWAY_API_KEY no está definida en el archivo .env',
  )
}

const body = {
  model: 'typesafe-ai/jev',

  state:
    'The coding agent modified communities.service.ts but has not run tests after the change.',

  questions: {
    nextAction: {
      type: 'choice',

      instructions:
        'Choose the single most useful next action for the coding agent.',

      criteria: {
        SEARCH_CODE:
          'Search the repository when the relevant implementation location is unknown.',

        READ_FILE:
          'Inspect implementation code when the relevant file is already known.',

        RUN_TESTS:
          'Run tests when code has been modified and needs verification.',

        QUERY_DATABASE:
          'Inspect database state or constraints when database behavior may explain the problem.',

        ASK_USER:
          'Ask the user when requirements are insufficient to determine the next action.',
      },
    },
  },
}

const start = performance.now()

const response = await fetch(API_URL, {
  method: 'POST',

  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },

  body: JSON.stringify(body),
})

const latencyMs = performance.now() - start

const text = await response.text()

if (!response.ok) {
  throw new Error(
    `AI Gateway error ${response.status}: ${text}`,
  )
}

const result = JSON.parse(text)

console.log()
console.log('JEV SMOKE TEST')
console.log('==============')
console.log()

console.log(
  JSON.stringify(result, null, 2),
)

console.log()
console.log(
  `Latency: ${latencyMs.toFixed(1)} ms`,
)