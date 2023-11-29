import Ability from './Ability'
import InventoryItem from './InventoryItem'

export default interface Character {
  emoji: string
  name: string
  description: string
  appearance: string
  health: number
  health_description: string
  armor: number
  money: number
  alive: boolean
  hostile: boolean
  reputation: number
  reputation_description: string
  inventory: InventoryItem[]
  abilities: Ability[]
}
