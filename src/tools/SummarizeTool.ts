export const schema = {
  type: 'function',
  function: {
    name: 'summarize',
    description: 'Summarize the provided object using the least amount of tokens possible',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'The summary'
        }
      }
    }
  }
}

export const execute = (parameters: any) => {
  return parameters.summary
}
