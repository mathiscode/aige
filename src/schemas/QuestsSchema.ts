import QuestSchema from './QuestSchema'

export default {
  type: 'array',
  description: 'The quests of the player',
  minItems: 1,
  maxItems: 3,
  uniqueItems: true,
  items: QuestSchema
}
