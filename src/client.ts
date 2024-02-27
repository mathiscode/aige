import OpenAI from 'openai'

import Game from './game'
import { Tool } from './tools'
import { GameClientOptions, GameClientImageOptions } from './types'
import { ChatCompletionCreateParams, ChatCompletionToolChoiceOption, ImageGenerateParams } from 'openai/resources'

export type CallParameters = {
  messages?: ChatCompletionCreateParams['messages']
  tool_choice?: ChatCompletionToolChoiceOption
  debug?: boolean
}

export default class Client {
  client: OpenAI
  model: string
  imageModel: string
  contextWindow: number
  game: Game
  tokens: number = 0

  constructor(options: GameClientOptions = {}, game: Game) {
    const defaultClientOptions = {
      clientOptions: {
        apiKey: process.env['OPENAI_API_KEY'],
        timeout: process.env['OPENAI_API_TIMEOUT'] || 30000,
        maxRetries: 0
      }
    }

    options.clientOptions = options.clientOptions || {}

    this.client = new OpenAI({ ...defaultClientOptions, ...options.clientOptions })
    this.model = options.model || process.env['OPENAI_MODEL'] || 'gpt-3.5-turbo-0125'
    this.imageModel = options.imageModel || 'dall-e-2'
    this.contextWindow = options.contextWindow || 16385
    this.game = game
  }

  async call (tool: Tool | Tool[], parameters: CallParameters) {
    const tools = []
    if (Array.isArray(tool)) {
      for (const t of tool) tools.push(t.schema)
    } else {
      tools.push(tool.schema)
    }

    if (parameters.debug) console.dir(tools, { depth: null })

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: parameters.messages || [],
      tool_choice: parameters.tool_choice,
      tools
    })

    const message = response.choices[0]?.message
    const usage = response.usage?.total_tokens

    if (!message) throw new Error('No message found')
    this.game.history.push(message)
    if (usage && !isNaN(usage)) this.tokens += usage

    if (!message?.tool_calls) {
      const directMessage = message?.content
      if (!directMessage) throw new Error('No direct message found')
      return { scene_emoji: '🤖', scene: directMessage }
    } else {
      for (const tool_call of message.tool_calls) {
        const called = Array.isArray(tool) ? tool.find(t => t.schema.function.name === tool_call.function.name) : tool
        if (called) {
          try {
            const parsedArgs = JSON.parse(tool_call.function.arguments)
            return called.execute(parsedArgs)
          } catch (err) {
            throw new Error(`Failed to parse ${tool_call.function.name} arguments: ${err}`)
          }
        }
      }
    }
  }

  async image (prompt: string, options: GameClientImageOptions = {}) {
    const response = await this.client.images.generate({
      user: options.user || `AIGE-${Math.random().toString(36).slice(2)}`,
      size: options.size as ImageGenerateParams['size']  || '512x512',
      style: options.style as ImageGenerateParams['style'] || 'vivid',
      quality: options.quality as ImageGenerateParams['quality'] || 'hd',
      model: options.model || this.imageModel,
      response_format: options.response_format as ImageGenerateParams['response_format'] || 'url',
      prompt
    })

    return response.data[0]
  }
}
