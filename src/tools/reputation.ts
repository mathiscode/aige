export const schema = {
  type: 'function',
  function: {
    name: 'describe_reputation',
    description: 'Describe the updated player reputation (negative reputation is bad, positive reputation is good)',
    parameters: {
      type: 'object',
      required: ['description'],
      properties: {
        long_description: {
          type: 'string',
          description: 'How other characters view the player'
        },
        short_description: {
          type: 'string',
          description: 'A short first-person description of the reputation of the player'
        }
      }
    }
  }
}

export const execute = (parameters: any) => {
  return parameters
}
