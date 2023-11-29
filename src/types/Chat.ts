import ChatMessage from './ChatMessage'

export default interface Chat {
  character_name: string
  messages: [ChatMessage]
}
