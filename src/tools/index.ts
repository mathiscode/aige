import { ChatCompletionTool } from 'openai/resources'

import { schema as CreateSchema, execute as CreateExecute } from './CreateTool'
import { schema as UpdateSchema, execute as UpdateExecute } from './UpdateTool'
import { schema as NameSchema, execute as NameExecute } from './NameTool'
import { schema as ClassSchema, execute as ClassExecute } from './ClassTool'
import { schema as ChatSchema, execute as ChatExecute } from './ChatTool'
import { schema as ReputationSchema, execute as ReputationExecute } from './ReputationTool'
import { schema as InventorySchema, execute as InventoryExecute } from './InventoryTool'
import { schema as SummarizeSchema, execute as SummarizeExecute } from './SummarizeTool'

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
    schema: UpdateSchema,
    execute: UpdateExecute
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
