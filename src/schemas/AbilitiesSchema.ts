import AbilitySchema from './AbilitySchema'

export default {
  type: 'array',
  description: 'Special Abilities',
  minItems: 1,
  maxItems: 3,
  uniqueItems: true,
  items: AbilitySchema
}
