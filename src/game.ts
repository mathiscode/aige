import EventEmitter from 'events'
import { randomUUID } from 'crypto'
import { ChatCompletionMessage, ChatCompletionUserMessageParam } from 'openai/resources'

import { call, tools } from './tools'
import Client from './client'

import {
  Ability,
  Chat,
  Character,
  GameClientImageOptions,
  GameData,
  GameEvent,
  GameOptions,
  InventoryItem,
  Quest
} from './types'

/**
   * The main class of the library.
   * This is the class that you will use to create a game.
   * 
   * @example
   * const game = new Game({
   *  universe: 'Cyberpunk',
   *  playerName: 'Punk',
   *  playerClass: 'Hacker'
   * })
   */
export default class Game {
  id: string = randomUUID()
  options: GameOptions
  client: Client
  events: EventEmitter = new EventEmitter()
  chats: Chat[] = []
  history: (ChatCompletionMessage | ChatCompletionUserMessageParam)[] = []
  data: GameData = {
    armor: 0,
    money: 0,
    health: 0,
    experience: 0,
    reputation: 0,
    quests: [],
    inventory: [],
    characters: [],
    weight_unit: 'lbs',
    weight_capacity: 100,
    money_name: 'Credits',
    health_description: 'Healthy',
    reputation_description: 'Neutral'
  }

  constructor(options: GameOptions = {}) {
    options.language = options.language || 'en'
    options.prompts = options.prompts || {}
    options.prompts.create = options.prompts.create || 'Create game'
    options.prompts.name = options.prompts.name || 'Get name'
    options.prompts.class = options.prompts.class || 'Get class'
    options.prompts.summarize = options.prompts.summarize || 'Summarize this'
    options.prompts.quest = options.prompts.quest || 'Set the scene and actions to match the next step of this quest'

    this.options = options
    this.client = new Client(options.clientOptions, this)
  }

  /**
   * Calculate the player's level based on their experience
   */
  get level () {
    return Math.round(0.1 * Math.sqrt(this.data.experience)) + 1
  }

  /**
   * Calculate the player's weight carried
   */
  get weightCarried () {
    return this.data.inventory?.reduce((total, item) => total + item.weight, 0) || 0
  }

  /**
   * Determine if the player is overburdened
   */
  get overburdened () {
    return this.weightCarried > this.data.weight_capacity
  }

  /**
   * Initialize a new game
   */
  async init (): Promise<void> {
    if (!this.options.universe) {
      const universes: string[] = (await import('./assets/universes')).default
      this.options.universe = universes[Math.floor(Math.random() * universes.length)]
    }

    // TODO: Use OpenAI's ability to combine function calls
    if (!this.options.playerName) this.options.playerName = await call(this.client, tools.name)({ messages: [{ role: 'user', content: `${this.options.prompts?.name}; universe: ${this.options.universe}, language: ${this.options.language}` }] })
    if (!this.options.playerClass) this.options.playerClass = await call(this.client, tools.class)({ messages: [{ role: 'user', content: `${this.options.prompts?.class}; universe: ${this.options.universe}, player: ${this.options.playerName}, language: ${this.options.language}` }] })

    const data = await call(this.client, tools.create)({
      messages: [
        { role: 'user', content: `${this.options.prompts?.create}; universe: ${this.options.universe}, name: ${this.options.playerName}, class: ${this.options.playerClass}, language: ${this.options.language}` }
      ]
    })

    this.data = { ...this.data, ...data }
    this.events.emit('init', this)
  }

  /**
   * Commit an action on the game
   * 
   * @param action The action to commit
   */
  async action (action: string): Promise<Game> {
    const questSummary = this.data.quests?.map((quest: Quest) => {
      const rewardItems = quest.reward?.inventory?.map(item => `${item.name} (${item.type}, ${item.value} ${this.data.money_name})`).join(' | ')
      return `${quest.name}: ${quest.reward?.experience} experience, ${quest.reward?.money} ${this.data.money_name}, ${quest.reward?.reputation} reputation, ${rewardItems || ''}`
    })

    const dataSummary = `
      language: ${this.options.language},
      universe: ${this.options.universe},
      name: ${this.options.playerName},
      class: ${this.options.playerClass},
      health: ${this.data.health},
      armor: ${this.data.armor},
      money: ${this.data.money},
      experience: ${this.data.experience},
      reputation: ${this.data.reputation},
      inventory: ${this.data.inventory?.map(item => item.name).join(', ')},
      characters: ${this.data.characters?.map(character => character.name).join(', ')},
      quests: ${questSummary},
      last action: ${await call(this.client, tools.summarize)({ messages: [{ role: 'user', content: `${this.options.prompts?.summarize}: ${this.history[this.history.length - 1]?.content || 'N/A'}` }] })}
      last scene: ${await call(this.client, tools.summarize)({ messages: [{ role: 'user', content: `${this.options.prompts?.summarize}: ${this.data.scene}` }] })}
    `

    const message: ChatCompletionUserMessageParam = { role: 'user', content: `${action}; ${dataSummary}` }
    const availableTools = [tools.action]
    if (['talk', 'chat', 'ask', 'tell', 'speak', 'interact', 'converse', 'dialog', 'dialogue'].some(word => action.toLowerCase().includes(word))) availableTools.push(tools.chat)

    const data = await call(this.client, availableTools)({ messages: [message] })
    if (!data) throw new Error('No data returned')
    this.history.push(message)

    if (!this.data.characters) this.data.characters = []
    if (!this.data.inventory) this.data.inventory = []
    if (!this.data.quests) this.data.quests = []
    if (!this.chats) this.chats = []

    if (data.chat) {
      const chat = this.chats.find(chat => chat.character_name === data.name)
      const character = this.data.characters.find(character => character.name === data.name)
      this.events.emit('chat', { chat, character, dialog: data.dialog,  game: this })

      if (!chat) {
        const chat: Chat = {
          character_name: data.name,
          messages: [{
            from_player: false,
            content: data.dialog,
            timestamp: new Date().toISOString()
          }]
        }

        this.chats.push(chat)
      } else {
        chat.messages.push({
          from_player: false,
          content: data.dialog,
          timestamp: new Date().toISOString()
        })
      }

      if (data.effects) {
        data.health_delta = data.effects.health_delta
        data.armor_delta = data.effects.armor_delta
        data.money_delta = data.effects.money_delta
        data.experience_delta = data.effects.experience_delta
        data.reputation_delta = data.effects.reputation_delta
        data.inventory_added = data.effects.inventory_added
        data.inventory_removed = data.effects.inventory_removed
        data.quest_added = data.effects.quest_added
        data.quest_removed = data.effects.quest_removed
      }
    }

    if (data.health_delta) this.data.health += data.health_delta
    if (data.armor_delta) this.data.armor += data.armor_delta
    if (data.money_delta) this.data.money += data.money_delta
    if (data.experience_delta) this.data.experience += data.experience_delta

    if (this.data.health < 0) this.data.health = 0
    if (this.data.armor < 0) this.data.armor = 0
    if (this.data.money < 0) this.data.money = 0

    if (this.data.health === 0) this.events.emit(GameEvent.death, { game: this })
    if (this.data.armor === 0) this.events.emit(GameEvent.armor_destroyed, { game: this })
    if (this.data.money === 0) this.events.emit(GameEvent.financial_ruin, { game: this })

    if (data.reputation_delta) {
      this.data.reputation += data.reputation_delta
      const description = await call(this.client, tools.reputation)({
        messages: [
          { role: 'user', content: `Universe: ${this.options.universe}, Player: ${this.options.playerName}` },
          { role: 'user', content: `Get player perspective of reputation description; new reputation: ${this.data.reputation}` }
        ]
      })

      this.data.reputation_description = description.short_description || description.long_description
    }

    if (data.inventory_added) {
      this.events.emit(GameEvent.inventory_added, { item: data.inventory_added, game: this })
      this.data.inventory.push(data.inventory_added)
    }

    if (data.inventory_removed) {
      const item = this.data.inventory.find(item => item.name === data.inventory_removed)
      if (item) this.events.emit(GameEvent.inventory_removed, { item, game: this })
      this.data.inventory = this.data.inventory.filter(item => data.inventory_removed !== item.name)
    }

    if (data.character_added) {
      if (data.character_added.name !== this.options.playerName) {
        this.events.emit(GameEvent.character_added, { character: data.character_added, game: this })
        this.data.characters.push(data.character_added)
      }
    }

    if (data.character_removed) {
      const character = this.data.characters.find(character => character.name === data.character_removed)
      if (character) this.events.emit(GameEvent.character_removed, { character, game: this })
      this.data.characters = this.data.characters.filter(character => data.character_removed !== character.name)
    }

    if (data.quest_added) {
      this.events.emit(GameEvent.quest_added, { quest: data.quest_added, game: this })
      this.data.quests.push(data.quest_added)
    }

    if (data.quest_removed) {
      const quest = this.data.quests.find(quest => quest.name === data.quest_removed)
      if (quest) {
        if (quest.reward?.experience) this.data.experience += quest.reward.experience
        if (quest.reward?.money) this.data.money += quest.reward.money
        if (quest.reward?.reputation) this.data.reputation += quest.reward.reputation
        if (quest.reward?.inventory) this.data.inventory.push(...quest.reward.inventory)

        this.events.emit(GameEvent.quest_removed, { quest, game: this })
        this.data.quests = this.data.quests.filter(quest => quest.name !== data.quest_removed)
      }
    }

    if (this.data.health <= 0) throw new Error('You died')

    for (const delta of ['health_delta', 'armor_delta', 'money_delta', 'experience_delta', 'reputation_delta']) {
      if (!data[delta]) continue
      const attribute = delta.split('_')[0]
      if (data[delta] > 0) this.events.emit(GameEvent.gain, { attribute, amount: data[delta] })
      else this.events.emit(GameEvent.loss, { attribute, amount: data[delta] })
    }

    delete data.health_delta
    delete data.armor_delta
    delete data.money_delta
    delete data.experience_delta
    delete data.inventory_added
    delete data.inventory_removed
    delete data.quest_added
    delete data.quest_removed

    this.data = { ...this.data, ...data }
    this.events.emit(GameEvent.action, { action, game: this })
    return this
  }

  /**
   * Send a chat message to a character
   * 
   * Listen for game.events.on(GameEvent.chat) to get the response
   * 
   * @todo Prune chat history to fit context window
   */
  async chat (data: { character: Character, dialog: string }) {
    let chat = this.chats.find(chat => chat.character_name === data.character.name)
    if (!chat) {
      chat = {
        character_name: data.character.name,
        messages: [{
          from_player: true,
          content: data.dialog,
          timestamp: new Date().toISOString()
        }]
      }

      this.chats.push(chat)
    } else {
      chat.messages.push({
        from_player: true,
        content: data.dialog,
        timestamp: new Date().toISOString()
      })
    }

    const messages = [
      {
        role: 'user',
        content: `
          Game Info:
          Universe: ${this.options.universe}
          Location: ${this.data.location} (${this.data.location_description})
          Weather: ${this.data.weather} (${this.data.weather_description})
          Rumor: ${this.data.rumor}
          Characters: ${this.data.characters?.map(character => character.name).join(', ') || 'None'}
          Scene (from player perspective): ${this.data.scene}

          I am the character, ${data.character.name}, with these stats:
          Health: ${data.character.health}
          Armor: ${data.character.armor}
          Money: ${data.character.money}
          Reputation: ${data.character.reputation}
          Inventory: ${data.character.inventory?.map(item => item.name).join(', ') || 'None'}
          Abilities: ${data.character.abilities?.map(ability => `${ability.name} (${ability.description})`).join(' | ') || 'None'}
          I am ${data.character.hostile ? 'hostile' : 'friendly'} to the player
          I am ${data.character.alive ? 'alive' : 'dead'}

          I am speaking to the player, ${this.options.playerName}, class of ${this.options.playerClass}, with these stats:
          Armor: ${this.data.armor}%
          Money: ${this.data.money}
          Health (from player perspective): ${this.data.health}
          Reputation (from player perspective): ${this.data.reputation} (${this.data.reputation_description})
          Appearance (from player perspective): ${this.data.appearance}

          I can't forget, I'm ${data.character.name} speaking to ${this.options.playerName} - I must not break character!
        `
      },
      ...chat.messages.map(message => ({ role: message.from_player ? 'user' : 'assistant', content: message.content })),
    ]

    const tool_choice = { type: 'function', function: { name: 'chat' } }
    const response = await call(this.client, tools.chat)({ tool_choice, messages })
    if (!response) throw new Error('No response found')

    const { dialog } = response
    this.events.emit('chat', { chat, dialog, character: data.character, game: this })
    chat.messages.push({ from_player: false, content: dialog, timestamp: new Date().toISOString() })

    // TODO: Merge this with the action function's effect processing
    if (response.effects) {
      if (!this.data.quests) this.data.quests = []
      if (!this.data.inventory) this.data.inventory = []
      if (!this.data.characters) this.data.characters = []

      if (response.effects.health_delta) this.data.health += response.effects.health_delta
      if (response.effects.armor_delta) this.data.armor += response.effects.armor_delta
      if (response.effects.money_delta) this.data.money += response.effects.money_delta
      if (response.effects.experience_delta) this.data.experience += response.effects.experience_delta
      if (response.effects.reputation_delta) this.data.reputation += response.effects.reputation_delta
      if (response.effects.inventory_added) this.data.inventory.push(response.effects.inventory_added)
      if (response.effects.inventory_removed) this.data.inventory = this.data.inventory.filter(item => response.effects.inventory_removed !== item.name)
      if (response.effects.quest_added) this.data.quests.push(response.effects.quest_added)
      if (response.effects.quest_removed) this.data.quests = this.data.quests.filter(quest => response.effects.quest_removed !== quest.name)

      if (this.data.health < 0) this.data.health = 0
      if (this.data.armor < 0) this.data.armor = 0
      if (this.data.money < 0) this.data.money = 0

      if (this.data.health === 0) this.events.emit(GameEvent.death, { game: this })
      if (this.data.armor === 0) this.events.emit(GameEvent.armor_destroyed, { game: this })
      if (this.data.money === 0) this.events.emit(GameEvent.financial_ruin, { game: this })

      if (response.effects.inventory_added) this.events.emit(GameEvent.inventory_added, { item: response.effects.inventory_added, game: this })
      if (response.effects.inventory_removed) {
        const item = this.data.inventory.find(item => item.name === response.effects.inventory_removed)
        if (item) this.events.emit(GameEvent.inventory_removed, { item, game: this })
      }

      if (response.effects.quest_added) this.events.emit(GameEvent.quest_added, { quest: response.effects.quest_added, game: this })
      if (response.effects.quest_removed) {
        const quest = this.data.quests.find(quest => quest.name === response.effects.quest_removed)
        if (quest) this.events.emit(GameEvent.quest_removed, { quest, game: this })
      }

      if (response.effects.character_added) this.events.emit(GameEvent.character_added, { character: response.effects.character_added, game: this })
      if (response.effects.character_removed) {
        const character = this.data.characters.find(character => character.name === response.effects.character_removed)
        if (character) this.events.emit(GameEvent.character_removed, { character, game: this })
      }

      if (response.effects.reputation_delta) {
        const description = await call(this.client, tools.reputation)({
          messages: [
            { role: 'user', content: `Universe: ${this.options.universe}, Player: ${this.options.playerName}` },
            { role: 'user', content: `Get player perspective of reputation description; new reputation: ${this.data.reputation}` }
          ]
        })

        this.data.reputation_description = description.short_description || description.long_description
      }

      for (const delta of ['health_delta', 'armor_delta', 'money_delta', 'experience_delta', 'reputation_delta']) {
        if (!response.effects[delta]) continue
        const attribute = delta.split('_')[0]
        if (response.effects[delta] > 0) this.events.emit(`gain`, { attribute, amount: response.effects[delta] })
        else this.events.emit(`loss`, { attribute, amount: response.effects[delta] })
      }
    }
  }

  /**
   * Create images of various game objects
   * 
   * Call game.client.image to manually use any prompt
   */
  async images (
    { scene, player, character, item, ability }: { scene?: boolean, player?: boolean, character?: Character, item?: InventoryItem, ability?: Ability } = {},
    imageOptions?: GameClientImageOptions
  ) {
    const results: any = {}

    if (scene) {
      const prompt = `
        A highly detailed photo of the current scene in the ${this.options.universe} universe.
        Scene: ${this.data.scene}.
        Location: ${this.data.location}.
        Weather: ${this.data.weather}.
        Drawn in the style of ${this.options.universe}
      `

      results.scene = await this.client.image(prompt, imageOptions)
    }

    if (player) {
      const prompt = `
        A highly detailed photo of ${this.options.playerName}, a ${this.options.playerClass === '' ? 'character' : this.options.playerClass} in the ${this.options.universe} universe.
        Appearance: ${this.data.appearance}.
        Health: ${this.data.health}.
        Weather: ${this.data.weather}.
        Scene: ${this.data.scene}.
        Location: ${this.data.location}.
        Drawn in the style of ${this.options.universe}
      `

      results.player = await this.client.image(prompt, imageOptions)
    }

    if (character) {
      const prompt = `
        A highly detailed photo of ${character.name}, a character in the ${this.options.universe} universe.
        Appearance: ${character.appearance}.
        Health: ${character.health}.
        Weather: ${this.data.weather}.
        Location: ${this.data.location}.
        Drawn in the style of ${this.options.universe}
      `

      results.character = await this.client.image(prompt, imageOptions)
    }

    if (item) {
      const prompt = `
        A highly detailed photo of ${item.name}, an item in the ${this.options.universe} universe.
        It is a ${item.type} worth ${item.value} ${this.data.money_name}, weighing ${item.weight} ${this.data.weight_unit}.
        Drawn in the style of ${this.options.universe}
      `

      results.item = await this.client.image(prompt, imageOptions)
    }

    if (ability) {
      const prompt = `
        A highly detailed photo of ${this.options.playerName} using ${ability.name}, an ability in the ${this.options.universe} universe.
        Drawn in the style of ${this.options.universe}
      `

      results.ability = await this.client.image(prompt, imageOptions)
    }

    this.events.emit(GameEvent.images_created, { images: results, game: this })
    return results
  }

  /**
   * Inspect the game data
   */
  inspect () {
    const tokens = Intl.NumberFormat().format(this.client.tokens)
    return `Game([${this.id}]\n${JSON.stringify({ ...this.options, ...this.data }, null, 2)}): ${tokens} tokens used`
  }

  /**
   * Resolve a path in the game data
   */
  resolvePath (obj: any, path: string) {
    // Split the path into keys, handling both dot and bracket notation
    const keys = path.replace(/\[(\w+)\]/g, '.$1').split('.')

    let current = obj
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (current[key!] === undefined) throw new Error(`Path not found: ${keys.slice(0, i + 1).join('.')}`)
      current = current[key!]
    }

    const lastKey = keys[keys.length - 1]
    return {
        get value() {
          return current[lastKey!]
        },
        set value(newValue) {
          current[lastKey!] = newValue
        }
    }
  }

  /**
   * Manually set a value in the game data
   */
  set (key: string, value: any) {
    const reference = this.resolvePath(this.data, key)
    reference.value = value
  }

  /**
   * Listen for game events
   */
  on (event: GameEvent, listener: (...args: any[]) => void) {
    this.events.addListener(event, listener)
  }

  /**
   * Stop listening for game events
   */
  off (event: GameEvent, listener: (...args: any[]) => void) {
    this.events.removeListener(event, listener)
  }

  /**
   * Export the game data object
   */
  export () {
    return {
      id: this.id,
      tokens: this.client.tokens,
      options: this.options,
      data: this.data,
      chats: this.chats,
      history: this.history
    }
  }

  /**
   * Import a game data object
   */
  import (data: any) {
    this.id = data.id
    this.options = data.options
    this.data = data.data
    this.chats = data.chats
    this.history = data.history
    this.client.tokens = data.tokens
    this.events.emit(GameEvent.import, this)
  }
}
