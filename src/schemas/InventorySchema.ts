import InventoryItemSchema from './InventoryItemSchema'

export default {
  type: 'array',
  description: 'The chosen inventory',
  minItems: 1,
  maxItems: 5,
  uniqueItems: true,
  items: InventoryItemSchema
}
