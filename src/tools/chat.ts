import QuestSchema from '../schemas/QuestSchema'
import InventoryItemSchema from '../schemas/InventoryItemSchema'

export const schema = {
  type: 'function',
  function: {
    name: 'chat',
    description: 'Chat with a character, possibly affecting the game',
    parameters: {
      type: 'object',
      required: ['name', 'dialog'],
      properties: {
        name: {
          type: 'string',
          description: 'The name of the character you are role-playing; must not be the player'
        },
        dialog: {
          type: 'string',
          description: 'The dialog of your character'
        },
        effects: {
          type: 'object',
          properties: {
            health_delta: {
              type: 'number',
              description: 'The health delta of the player (if the character damages or heals the player)'
            },
            armor_delta: {
              type: 'number',
              description: 'The armor delta of the player (if the character damages or heals the player; armor is damaged before health)'
            },
            money_delta: {
              type: 'number',
              description: 'The money delta of the player (if the character robs or does business with the player)'
            },
            experience_delta: {
              type: 'number',
              description: 'The experience delta of the player (if the character trains or fights the player)'
            },
            reputation_delta: {
              type: 'number',
              description: 'The reputation delta of the player (character reputation affects how great the player delta is)'
            },
            inventory_added: InventoryItemSchema,
            inventory_removed: {
              type: 'string',
              description: 'The item removed from the player inventory (if the character takes an item from the player)'
            },
            quest_added: QuestSchema,
            quest_removed: {
              type: 'string',
              description: 'The quest removed from the player quests (if the character takes a quest from the player)'
            }
          }
        }
      }
    }
  }
}

export const execute = (parameters: any) => {
  return { ...parameters, chat: true }
}
