import InventorySchema from './InventorySchema'

export default {
  type: 'object',
  required: ['emoji', 'name', 'description', 'completed', 'reward'],
  properties: {
    emoji: {
      type: 'string',
      description: 'The emoji of the quest'
    },
    name: {
      type: 'string',
      description: 'The name of the quest'
    },
    description: {
      type: 'string',
      description: 'The description of the quest'
    },
    completed: {
      type: 'boolean',
      description: 'Whether or not the quest is completed'
    },
    reward: {
      type: 'object',
      description: 'The reward of the quest',
      properties: {
        inventory: InventorySchema,
        money: {
          type: 'number',
          description: 'The money of the reward'
        },
        experience: {
          type: 'number',
          description: 'The experience of the reward'
        },
        reputation: {
          type: 'number',
          description: 'The reputation of the reward'
        }
      }
    }
  }
}
