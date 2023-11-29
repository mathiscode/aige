import AbilitiesSchema from './AbilitiesSchema'
import InventorySchema from './InventorySchema'

export default {
  type: 'object',
  description: 'A character; must not be the player',
  properties: {
    abilities: AbilitiesSchema,
    inventory: InventorySchema,
    emoji: {
      type: 'string',
      description: 'The emoji of the character'
    },
    name: {
      type: 'string',
      description: 'The name of the character'
    },
    description: {
      type: 'string',
      description: 'The description of the character'
    },
    appearance: {
      type: 'string',
      description: 'The appearance of the character'
    },
    health: {
      type: 'number',
      description: 'The health of the character'
    },
    health_description: {
      type: 'string',
      description: 'The description of the health of the character'
    },
    armor: {
      type: 'number',
      description: 'The armor percentage of the character (0-100)'
    },
    money: {
      type: 'number',
      description: 'The money of the character'
    },
    alive: {
      type: 'boolean',
      description: 'Whether or not the character is alive'
    },
    hostile: {
      type: 'boolean',
      description: 'Whether or not the character is friendly or hostile with the player'
    },
    reputation: {
      type: 'number',
      description: 'The reputation of the character, with 0 being neutral, negative values being bad, and positive values being good'
    },
    reputation_description: {
      type: 'string',
      description: 'The description of the reputation of the character'
    }
  }
}
