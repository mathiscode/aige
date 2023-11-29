import { ChatCompletionTool } from 'openai/resources'

import { schema as CreateSchema, execute as CreateExecute } from './create'
import { schema as ActionSchema, execute as ActionExecute } from './action'
import { schema as NameSchema, execute as NameExecute } from './name'
import { schema as ClassSchema, execute as ClassExecute } from './class'
import { schema as InventorySchema, execute as InventoryExecute } from './inventory'
import { schema as SummarizeSchema, execute as SummarizeExecute } from './summarize'
import { schema as ChatSchema, execute as ChatExecute } from './chat'
import { schema as ReputationSchema, execute as ReputationExecute } from './reputation'

import Client from '../client'

export interface Tool {
  schema: ChatCompletionTool
  execute: (parameters: any) => any
}

export const call = (client: Client , tool: Tool | Tool[]) => {
  return async (parameters: any) => {
    return await client.call(tool, parameters)
  }
}

export const tools = {
  create: {
    schema: CreateSchema,
    execute: CreateExecute
  } as Tool,
  action: {
    schema: ActionSchema,
    execute: ActionExecute
  } as Tool,
  name: {
    schema: NameSchema,
    execute: NameExecute
  } as Tool,
  class: {
    schema: ClassSchema,
    execute: ClassExecute
  } as Tool,
  inventory: {
    schema: InventorySchema,
    execute: InventoryExecute
  } as Tool,
  summarize: {
    schema: SummarizeSchema,
    execute: SummarizeExecute
  } as Tool,
  chat: {
    schema: ChatSchema,
    execute: ChatExecute
  } as Tool,
  reputation: {
    schema: ReputationSchema,
    execute: ReputationExecute
  } as Tool
}
