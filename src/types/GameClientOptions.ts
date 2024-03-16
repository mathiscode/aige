import { ClientOptions } from 'openai'

export type GameClientOptions = {
  clientOptions?: ClientOptions
  model?: string
  imageModel?: string
  contextWindow?: number
  limit?: number
}
