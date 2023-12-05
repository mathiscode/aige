export const schema = {
  type: 'function',
  function: {
    name: 'set_class',
    description: 'Set a random player class/type from the provided universe',
    parameters: {
      type: 'object',
      required: ['class'],
      properties: {
        class: {
          type: 'string',
          description: 'The chosen class'
        }
      }
    }
  }
}

export const execute = (parameters: any) => {
  return parameters.class
}
