import { ChatMessage } from './ChatMessage'

export type Chat = {
  character_name: string
  messages: [ChatMessage]
}
