export const ACTIONS = [
  'SEARCH_CODE',
  'READ_FILE',
  'RUN_TESTS',
  'QUERY_DATABASE',
  'ASK_USER',
] as const

export type Action = (typeof ACTIONS)[number]

export type Difficulty =
  | 'easy'
  | 'intermediate'
  | 'ambiguous'
  | 'adversarial'

export interface BenchmarkCase {
  id: string
  name: string
  difficulty: Difficulty
  state: string
  expected: Action
  acceptable?: Action[]
}

export interface JevChoiceAnswer {
  type: 'choice'
  choice: Action
  probabilities: Partial<Record<Action, number>>
  confidence: number
}

export interface JevResponse {
  model: string

  answers: {
    nextAction: JevChoiceAnswer
  }

  usage?: {
    inputTokens?: number
    outputTokens?: number
  }

  providerMetadata?: {
    typesafe?: {
      confidence?: Record<string, number>
    }

    gateway?: {
      cost?: string
      marketCost?: string
      surchargeCost?: string
      gatewayCost?: string

      routing?: {
        modelAttempts?: Array<{
          providerAttempts?: Array<{
            provider?: string
            success?: boolean
            startTime?: number
            endTime?: number
            statusCode?: number
          }>
        }>
      }
    }
  }
}

export interface JevEvaluation {
  response: JevResponse
  endToEndLatencyMs: number
  providerLatencyMs?: number
}