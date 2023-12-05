/**
 * @module Core
 * 
 * @description This is the main module of the library. It exports all the classes and interfaces needed to create a game.
 */

export { default as Game } from './game'
export { default as Client } from './client'

export { GameClientOptions } from './types/GameClientOptions'
export { GameClientImageOptions } from './types/GameClientImageOptions'
export { GameOptions } from './types/GameOptions'
export { GameData } from './types/GameData'
export { GameEvent } from './types/GameEvent'
export { InventoryItem } from './types/InventoryItem'
export { Ability } from './types/Ability'
export { Chat } from './types/Chat'
export { ChatMessage } from './types/ChatMessage'
export { Character } from './types/Character'
export { Quest } from './types/Quest'

export { call, tools } from './tools'
