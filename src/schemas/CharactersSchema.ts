import CharacterSchema from './CharacterSchema'

export default {
  type: 'array',
  description: 'Characters that the player can interact with',
  minItems: 1,
  maxItems: 4,
  uniqueItems: true,
  items: CharacterSchema
}
