import UpdateSchema from '../schemas/UpdateSchema'

export const schema = {
  type: 'function',
  function: {
    name: 'update_game',
    description: 'Commits a user action; returning the new scene and other updated game data',
    parameters: {
      type: 'object',
      properties: UpdateSchema,
      required: ['scene', 'scene_emoji', 'actions', 'rumor'],
    }
  }
}

export const execute = (parameters: any) => {
  return parameters
}
