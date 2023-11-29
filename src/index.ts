/**
 * @module Core
 * 
 * @description This is the main module of the library. It exports all the classes and interfaces needed to create a game.
 */

export { default as Game } from './game'
export { default as Client } from './client'

export { default as GameClientOptions } from './types/GameClientOptions'
export { default as GameClientImageOptions } from './types/GameClientImageOptions'
export { default as GameOptions } from './types/GameOptions'
export { default as GameData } from './types/GameData'
export { default as GameEvent } from './types/GameEvent'
export { default as InventoryItem } from './types/InventoryItem'
export { default as Ability } from './types/Ability'
export { default as Chat } from './types/Chat'
export { default as ChatMessage } from './types/ChatMessage'
export { default as Character } from './types/Character'
export { default as Quest } from './types/Quest'

export { call, tools } from './tools'
