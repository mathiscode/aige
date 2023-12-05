import CreateSchema from '../schemas/CreateSchema'

export const schema = {
  type: 'function',
  function: {
    name: 'create_game',
    description: 'Creates a new game; use the language parameter to determine the language of your responses',
    parameters: {
      type: 'object',
      properties: CreateSchema,
      required: [
        'location', 'location_description', 'appearance', 'scene', 'scene_emoji', 'rumor',
        'health', 'health_description', 'armor', 'money', 'money_name', 'weight_capacity',
        'weight_unit', 'experience', 'reputation', 'reputation_description', 'weather',
        'weather_emoji', 'weather_description', 'actions', 'inventory', 'abilities',
        'characters', 'quests'
      ]
    }
  }
}

export const execute = (parameters: any) => {
  return parameters
}
