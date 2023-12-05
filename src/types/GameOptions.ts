import { GameClientOptions } from './GameClientOptions'

/**
 * The options of a game
 */
export type GameOptions = {
  [key: string]: any
  clientOptions?: GameClientOptions
  universe?: string
  playerName?: string
  playerClass?: string
  language?: string,
  prompts?: {
    create?: string
    name?: string
    class?: string
    summarize?: string
    quest?: string
  }
}