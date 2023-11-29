export default {
  type: 'array',
  description: 'Suggested actions that the player can take',
  minItems: 3,
  maxItems: 6,
  uniqueItems: true,
  items: {
    type: 'string'
  }
}
