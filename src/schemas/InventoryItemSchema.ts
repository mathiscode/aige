export default {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'The name of the item'
    },
    description: {
      type: 'string',
      description: 'The description of the item'
    },
    value: {
      type: 'number',
      description: 'The value of the item'
    },
    weight: {
      type: 'number',
      description: 'The weight of the item'
    },
    rarity: {
      type: 'number',
      description: 'The rarity of the item'
    },
    type: {
      type: 'string',
      description: 'The type of the item'
    },
    consumable: {
      type: 'boolean',
      description: 'Whether or not the item is consumable'
    }
  }
}
