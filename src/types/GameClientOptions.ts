import { ClientOptions } from 'openai'

export default interface GameClientOptions {
  clientOptions?: ClientOptions
  model?: string
  imageModel?: string
  contextWindow?: number
}
