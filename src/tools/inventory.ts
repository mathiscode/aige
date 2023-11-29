import { InventorySchema } from '../schemas'

export const schema = {
  type: 'function',
  function: {
    name: 'set_inventory',
    description: 'Set a random player inventory from the provided universe',
    parameters: {
      type: 'object',
      required: ['inventory'],
      properties: {
        inventory: InventorySchema
      }
    }
  }
}

export const execute = (parameters: any) => {
  return parameters.inventory
}
