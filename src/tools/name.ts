export const schema = {
  type: 'function',
  function: {
    name: 'set_name',
    description: 'Set a random player name from the provided universe',
    parameters: {
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          type: 'string',
          description: 'The chosen name'
        }
      }
    }
  }
}

export const execute = (parameters: any) => {
  return parameters.name
}
