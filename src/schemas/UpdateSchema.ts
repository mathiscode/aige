import {
  ActionsSchema,
  CharacterSchema,
  InventoryItemSchema,
  QuestSchema,
  WeatherSchema
} from '.'

export default {
  scene: {
    type: 'string',
    description: 'The new scene description after the action is committed. This is the main text that the player sees and must be different from the last scene'
  },
  scene_emoji: {
    type: 'string',
    description: 'An emoji that represents the new scene'
  },
  actions: ActionsSchema,
  rumor: {
    type: 'string',
    description: 'A rumor that the player has heard'
  },
  health_delta: {
    type: 'number',
    description: 'The change in health of the player (if armor is > 0, armor is damaged instead)'
  },
  health_description: {
    type: 'string',
    description: 'The description of the new health of the player (first-person perspective)'
  },
  armor_delta: {
    type: 'number',
    description: 'The change in armor of the player (if armor is 0, health is damaged instead)'
  },
  money_delta: {
    type: 'number',
    description: 'The change in money of the player'
  },
  experience_delta: {
    type: 'number',
    description: 'The change in experience of the player'
  },
  reputation_delta: {
    type: 'number',
    description: 'The change in reputation of the player'
  },
  reputation_description: {
    type: 'string',
    description: 'The description of the new reputation value of the player, values > 0 = good, values < 0 = bad'
  },
  inventory_removed: {
    type: 'string',
    description: 'The item removed from the inventory (if any)'
  },
  inventory_added: InventoryItemSchema,
  quest_removed: {
    type: 'string',
    description: 'The name of the quest removed (if any), if complete give rewards'
  },
  quest_added: QuestSchema,
  character_removed: {
    type: 'string',
    description: 'The character removed (if any)'
  },
  character_added: CharacterSchema,
  location: {
    type: 'string',
    description: 'The new location of the player (if changed)'
  },
  location_description: {
    type: 'string',
    description: 'The description of the new location of the player (if changed)'
  },
  appearance: {
    type: 'string',
    description: 'The new appearance of the player (if changed)'
  },
  weather: WeatherSchema,
  weather_emoji: {
    type: 'string',
    description: 'An emoji that represents the new weather of the location (if changed)'
  },
  weather_description: {
    type: 'string',
    description: 'The description of the new weather of the location (if changed)'
  }
}
