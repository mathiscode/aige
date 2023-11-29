import Ability from './Ability'
import Character from './Character'
import Chat from './Chat'
import InventoryItem from './InventoryItem'
import Quest from './Quest'

/**
 * The data of a game
 */
export default interface GameData {
  [key: string]: any
  health: number
  health_description: string
  armor: number
  money: number
  money_name: string
  weight_unit: string
  weight_capacity: number
  experience: number
  reputation: number
  reputation_description: string
  location?: string
  location_description?: string
  appearance?: string
  rumor?: string
  scene?: string
  weather?: string
  weather_description?: string
  actions?: string[]
  scene_emoji?: string
  quests?: Quest[]
  characters?: Character[]
  inventory?: InventoryItem[]
  chats?: Chat[]
  abilities?: Ability[]
}
