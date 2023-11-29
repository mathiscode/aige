import { AbilitiesSchema, ActionsSchema, CharactersSchema, InventorySchema, QuestsSchema, WeatherSchema } from '../schemas'

export const schema = {
  type: 'function',
  function: {
    name: 'create_game',
    description: 'Creates a new game; use the language parameter to determine the language of your responses',
    parameters: {
      type: 'object',
      required: ['location', 'location_description', 'appearance', 'scene', 'scene_emoji', 'rumor', 'health', 'health_description', 'armor', 'money', 'money_name', 'weight_capacity', 'weight_unit', 'experience', 'reputation', 'reputation_description', 'weather', 'weather_emoji', 'weather_description', 'actions', 'inventory', 'abilities', 'characters', 'quests'],
      properties: {
        actions: ActionsSchema,
        abilities: AbilitiesSchema,
        characters: CharactersSchema,
        quests: QuestsSchema,
        inventory: InventorySchema,
        location: {
          type: 'string',
          description: 'The location of the game'
        },
        location_description: {
          type: 'string',
          description: 'The description of the location'
        },
        appearance: {
          type: 'string',
          description: 'The appearance of the player'
        },
        scene: {
          type: 'string',
          description: 'The vivid and immersive description of the current scene or results of the last player action; this is the main text that the player sees'
        },
        scene_emoji: {
          type: 'string',
          description: 'An emoji that represents the scene'
        },
        rumor: {
          type: 'string',
          description: 'A rumor that the player has heard'
        },
        health: {
          type: 'number',
          description: 'The health of the player'
        },
        health_description: {
          type: 'string',
          description: 'The description of the health of the player (first-person perspective)'
        },
        armor: {
          type: 'number',
          description: 'The armor of the player'
        },
        money: {
          type: 'number',
          description: 'The money of the player'
        },
        money_name: {
          type: 'string',
          description: 'The name of the money in this universe'
        },
        weight_capacity: {
          type: 'number',
          description: 'The amount of weight the player can carry'
        },
        weight_unit: {
          type: 'string',
          description: 'The unit of weight in this universe'
        },
        experience: {
          type: 'number',
          description: 'The experience of the player'
        },
        reputation: {
          type: 'number',
          description: 'The reputation of the player, with 0 being neutral, negative values being bad, and positive values being good'
        },
        reputation_description: {
          type: 'string',
          description: 'The description of the reputation of the player (first-person perspective)'
        },
        weather: WeatherSchema,
        weather_emoji: {
          type: 'string',
          description: 'The emoji of the weather enum'
        },
        weather_description: {
          type: 'string',
          description: 'The description of the weather enum'
        }
      }
    }
  }
}

export const execute = (parameters: any) => {
  return parameters
}
