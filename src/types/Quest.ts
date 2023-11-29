import InventoryItem from './InventoryItem'

export default interface Quest {
  emoji: string
  name: string
  description: string
  completed: boolean
  reward: {
    money: number
    experience: number
    reputation: number
    inventory: InventoryItem[]
  }
}
