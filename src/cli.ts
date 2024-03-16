#!/usr/bin/env node

import { program } from 'commander'
import { checkbox, input, select } from '@inquirer/prompts'
import { emojify } from '@twuni/emojify'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'

import { Game } from './'
import { Chat, Character, GameEvent } from './types'

let chatMode: boolean | string = false

let pkg = { version: '?.?.?', description: 'AI Game Engine' }
try {
  pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'pkg.json')).toString())
} catch (err) {}

program
  .name('aige')
  .version(pkg.version)
  .description(pkg.description)
  .option('-i, --import <path>', 'Import a game')
  .option('-h, --help', 'Display help information')

program.parse()
const options = program.opts()

program.addHelpText('before', chalk.bgBlue.white('Run `aige` without arguments to start the CLI'))
if (options['help']) program.help()

const setupEventListeners = (game: Game) => {
  game.on(GameEvent.gain, ({ attribute, amount }) => console.log(chalk.green(`Gained ${amount} ${attribute}`)))
  game.on(GameEvent.loss, ({ attribute, amount }) => console.log(chalk.red(`Lost ${Math.abs(amount)} ${attribute === 'money' ? game.data.money_name : attribute}`)))
  game.on(GameEvent.quest_added, ({ quest }) => console.log(chalk.yellow(`New Quest: ${quest.name}`)))
  game.on(GameEvent.quest_removed, ({ quest }) => console.log(chalk.green(`Quest removed: ${quest.name}`)))
  game.on(GameEvent.character_added, ({ character }) => console.log(chalk.yellow(`New Character: ${character.name}`)))
  game.on(GameEvent.character_removed, ({ character }) => console.log(chalk.green(`Character removed: ${character.name}`)))
  game.on(GameEvent.inventory_added, ({ item }) => console.log(chalk.yellow(`New Item: ${item.name}`)))
  game.on(GameEvent.inventory_removed, ({ item }) => console.log(chalk.green(`Item removed: ${item.name}`)))
  game.on(GameEvent.ability_added, ({ ability }) => console.log(chalk.yellow(`New Ability: ${ability.name}`)))
  game.on(GameEvent.ability_removed, ({ ability }) => console.log(chalk.green(`Ability removed: ${ability.name}`)))

  game.on(GameEvent.inventory_added, ({ item }) => {
    if (game.weightCarried + item.weight > game.data.weight_capacity) console.log(chalk.red(`You are carrying too much weight!`))
  })

  const chatHandler = ({ chat, character, dialog }: { chat: Chat, character: Character, dialog: string, game: Game }) => {
    if (!chat || !character || !dialog || dialog === '') return
    console.log(`${emojify(character.emoji || '')}   ${chalk.green(character.name)}: ${chalk.yellow(dialog)}`)
    chatMode = character.name
  }

  game.on(GameEvent.chat, chatHandler)
}

const main = async () => {
  let game: Game = new Game()

  console.log(chalk.green(`AIGE v${pkg.version}`))
  console.log(chalk.red('https://aige.games'))
  console.log(chalk.blue('Type "help" for a list of commands'))

  const gameCommands = [
    {
      name: 'help',
      description: 'Display help information',
      execute: () => {
        console.log(chalk.green('Commands:'))
        for (const command of gameCommands.sort((a, b) => a.name.localeCompare(b.name))) {
          console.log(chalk.blue(`  ${command.name}: ${command.description}`))
        }
      }
    },
    {
      name: 'create',
      description: 'Create a new game',
      execute: async () => {
        let language: string | undefined = await input({ message: 'Language:', default: 'en' })
        let universe: string | undefined = await input({ message: 'Universe:', default: 'random' })
        let playerName: string | undefined = await input({ message: 'Name:', default: 'random' })
        let playerClass: string | undefined = await input({ message: 'Class:', default: 'random' })
        let tokenLimit: string | undefined = await input({ message: 'Token Limit:', default: 'None' })

        if (universe === 'random') universe = undefined
        if (playerName === 'random') playerName = undefined
        if (playerClass === 'random') playerClass = undefined
        if (tokenLimit === 'None') tokenLimit = undefined

        game = new Game({ language, universe, playerName, playerClass, clientOptions: { limit: tokenLimit ? parseInt(tokenLimit) : Infinity } })
        setupEventListeners(game)
        console.log(chalk.green(`Creating game ${game.id}`))
        await game.init()

        console.log(chalk.green(`\n${game?.options.universe}`))
        console.log(`${chalk.green(`${game?.options.playerName}, ${game?.options.playerClass}`)}`)
        console.log(`Location: ${game?.data.location} (${game?.data.location_description})`)
        console.log(`Weather: ${game?.data.weather} (${game?.data.weather_description})`)
        console.log('Inventory: ' + game?.data.inventory?.map(item => item.name).join(', '))
        console.log('Characters: ' + game?.data.characters?.map(character => character.name).join(', '))
        console.log('Quests: ' + game?.data.quests?.map(quest => quest.name).join(', '))
        console.log('Abilities: ' + game?.data.abilities?.map(ability => ability.name).join(', '))

        console.log(`\n${emojify(game?.data.scene_emoji || '')}\t${chalk.blue(game?.data.scene)}`)
        console.log(`\n${chalk.yellow(`Suggested actions: ${game?.data.actions?.join(', ')}`)}`)
      }
    },
    {
      name: 'stats',
      description: 'Display the player stats',
      execute: () => {
        console.log(`${chalk.green(`${game.options.playerName}, ${game.options.playerClass}`)}`)
        console.log(`⭐\tLevel: ${game.level} (${game.data.experience} XP)`)
        console.log(`❤️\tHealth: ${game.data.health} (${game.data.health_description})`)
        console.log(`🛡️\tArmor: ${game.data.armor}%`)
        console.log(`💰\tMoney: ${game.data.money} ${game.data.money_name}`)
        console.log(`👍\tReputation: ${game.data.reputation} (${game.data.reputation_description})`)
        console.log(`🪞\tAppearance: ${game.data.appearance}`)
        console.log(`🏋️\tWeight Carried: ${game.overburdened ? chalk.red(game.weightCarried) : chalk.green(game.weightCarried)} / ${game.data.weight_capacity} ${game.data.weight_unit}`)
        console.log(`🎒\tInventory: ${game.data.inventory?.map(item => item.name).join(', ')}`)
        console.log('👥\tCharacters: ' + game.data.characters?.map(character => character.name).join(', '))
        console.log('📜\tQuests: ' + game.data.quests?.map(quest => quest.name).join(', '))
        console.log('🧠\tAbilities: ' + game.data.abilities?.map(ability => ability.name).join(', '))
      }
    },
    {
      name: 'images',
      description: 'Generate images',
      execute: async () => {
        const types = await checkbox({
          message: 'Types:',
          choices: ['cover', 'player', 'scene', 'character', 'item', 'ability'].map(type => ({ title: type, value: type }))
        })

        const args: any = {}
        let imageOptions: any = {}

        for (const type of types) {
          switch (type) {
            case 'cover':
              args.cover = true
              imageOptions.cover = { model: 'dall-e-3', quality: 'hd', size: '1792x1024' }
              break
            case 'player':
              args.player = true
              break
            case 'scene':
              args.scene = true
              break
            case 'character':
              const character = await select({
                message: 'Character:',
                choices: game?.data.characters?.map(character => ({ title: character.name, value: character.name })) || []
              })

              if (character) args.character = game?.data.characters?.find(char => char.name === character)
              break
            case 'item':
              const item = await select({
                message: 'Item:',
                choices: game?.data.inventory?.map(item => ({ title: item.name, value: item.name })) || []
              })

              if (item) args.item = item
              break
            case 'ability':
              const ability = await select({
                message: 'Ability:',
                choices: game?.data.abilities?.map(ability => ({ title: ability.name, value: ability.name })) || []
              })

              if (ability) args.ability = ability
              break
          }
        }

        if (Object.keys(args).length > 0) {
          const results = await game?.images(args, imageOptions)
          console.log(chalk.green(`Generated ${Object.keys(results).length} images`))
          for (const [key, value] of Object.entries(results)) {
            console.log(`${chalk.yellow(key)}: ${chalk.blue((value as any).url)}`)
          }
        }
      }
    },
    {
      name: 'inspect',
      description: 'Inspect the current game (or a specific key/path)',
      execute: (args: string[]) => {
        const key = args?.[1]

        switch (key) {
          case 'inventory':
          case 'characters':
          case 'abilities':
          case 'quests':
            console.dir(game?.data[key], { depth: null })
            break
          case 'weather':
            console.log(`Weather: ${game?.data.weather} (${game?.data.weather_description})`)
            break
          case 'location':
            console.log(`Location: ${game?.data.location} (${game?.data.location_description})`)
            break
          case 'appearance':
            console.log(`Appearance: ${game?.data.appearance}`)
            break
          case 'rumor':
            console.log(`Rumor: ${game?.data.rumor}`)
            break
          case 'tokens':
            console.log(`Tokens Used: ${game?.client.tokens}`)
            break
          default:
            try {
              if (key) console.dir(game?.data[key] || game?.data, { depth: null })
              else console.log(game.inspect())
            } catch (err) {
              console.log(game.inspect())
            }
        }
      }
    },
    {
      name: 'tokens',
      description: 'Display the number of tokens used',
      execute: () => console.log(`Tokens Used: ${game?.client.tokens}`)
    },
    {
      name: 'action',
      description: 'Perform an action on the current game',
      execute: async (args?: string[]) => {
        const actions = game?.data.actions || ['Look around']
        let action = args?.join(' ')

        if (!action || action === 'action') {
          action = await select({
            message: 'Action:',
            choices: actions.map(action => ({ title: action, value: action, description: '' }))
              .concat([{ title: 'Other', value: 'Other', description: 'Specify a custom action' }, { title: 'Cancel', value: 'Cancel', description: 'Do not perform any action' }])
          })
        }

        if (action === 'Cancel') return
        if (action === 'Other') action = await input({ message: 'Action:' })

        await game?.action(action)
        console.log(`\n${emojify(game?.data.scene_emoji || '')}\t${chalk.blue(game?.data.scene)}`)
        console.log(`\n${chalk.green(`Suggested actions: ${chalk.yellow(game?.data.actions?.join(', '))}`)}`)
      }
    },
    {
      name: 'set',
      description: 'Set a game value',
      execute: async (args?: string[]) => {
        const key = args && args.length > 1 ? args[1] : await input({ message: 'Key:' })
        if (!key || key === '') return
        const value = args && args.length > 2 ? args[2] : await input({ message: 'Value:' })
        game?.set(key, value)
        console.log(chalk.green(`Set ${key} to ${value}`))
      }
    },
    {
      name: 'scene',
      description: 'Display the current scene',
      execute: () => {
        console.log(`${emojify(game?.data.scene_emoji || '')}\t${chalk.blue(game?.data.scene)}`)
        console.log(`Location: ${game?.data.location} (${game?.data.location_description})`)
        console.log(`Weather: ${game?.data.weather} (${game?.data.weather_description})`)
      }
    },
    {
      name: 'inventory',
      description: 'Use an inventory item',
      execute: async () => {
        const item = await select({
          message: 'Item:',
          choices: game?.data.inventory?.map(item => {
            const title = `${emojify(item.emoji || '')} ${item.name} (${item.type})`
            const value = item.name
            const description = `${item.description} (${item.value} ${game?.data.money_name}, ${item.weight} ${game?.data.weight_unit})`
            return { title, value, description }
          }).concat([{ title: 'Cancel', value: 'Cancel', description: 'Do not use an item' }])!
        })

        if (item === 'Cancel') return
        console.log(chalk.yellow(`Using ${item}`))
        await game?.action(`Use ${item}`)
        console.log(`\n${emojify(game?.data.scene_emoji || '')}\t${chalk.blue(game?.data.scene)}`)
        console.log(`\n${chalk.yellow(`Suggested actions: ${game?.data.actions?.join(', ')}`)}`)
      }
    },
    {
      name: 'quests',
      description: 'Display the current quests',
      execute: async () => {
        const quests = game?.data.quests?.map(quest => {
          const title = quest.name
          const value = quest.name
          const description = `${emojify(quest.emoji || '')}   ${quest.description}`
          return { title, value, description }
        }) || []

        if (quests.length === 0) return console.log(chalk.yellow('No quests'))

        const quest = await select({
          message: 'Quest:',
          choices: quests.concat([{ title: 'Cancel', value: 'Cancel', description: 'Do not choose a quest' }])
        })

        if (quest === 'Cancel') return
        console.log(chalk.yellow(`Continuing quest ${quest}`))
        await game?.action(`${game.options.prompts?.quest}: ${quest}`)
        console.log(`\n${emojify(game?.data.scene_emoji || '')}\t${chalk.blue(game?.data.scene)}`)
        console.log(`\n${chalk.yellow(`Suggested actions: ${game?.data.actions?.join(', ')}`)}`)
      }
    },
    {
      name: 'talk',
      description: 'Talk to a character',
      execute: async () => {
        const characters = game?.data.characters?.map(character => {
          const title = character.name
          const value = character.name
          const description = `${emojify(character.emoji || '')}   ${character.description}`
          return { title, value, description }
        }) || []

        if (characters.length === 0) return console.log(chalk.yellow('No characters'))

        const name = await select({
          message: 'Character:',
          choices: characters.concat([{ title: 'Cancel', value: 'Cancel', description: 'Do not choose a character' }])
        })

        if (name === 'Cancel') return
        console.log(chalk.yellow(`Talking to ${name}; enter an empty message to stop`))
        const character = game?.data.characters?.find(character => character.name === name)
        if (!character) return console.log(chalk.red('Invalid character'))
        await game?.chat({ character, dialog: '*start new conversation*' })
        chatMode = character.name
      }
    },
    {
      name: 'abilities',
      description: 'Display the current abilities of the player',
      execute: async () => {
        const abilities = game?.data.abilities?.map(ability => {
          const title = ability.name
          const value = ability.name
          const description = `${emojify(ability.emoji || '')}   ${ability.description}`
          return { title, value, description }
        }) || []

        if (abilities.length === 0) return console.log(chalk.yellow('No abilities'))

        const ability = await select({
          message: 'Ability:',
          choices: abilities.concat([{ title: 'Cancel', value: 'Cancel', description: 'Do not choose an ability' }])
        })

        if (ability === 'Cancel') return
        console.log(chalk.yellow(`Using ability ${ability}`))
        await game?.action(`Use ability: ${ability}`)
        console.log(`\n${emojify(game?.data.scene_emoji || '')}\t${chalk.blue(game?.data.scene)}`)
        console.log(`\n${chalk.yellow(`Suggested actions: ${game?.data.actions?.join(', ')}`)}`)
      }
    },
    {
      name: 'export',
      description: 'Export the current game',
      execute: async () => {
        const savePath = await input({ message: 'Export to file:' })
        if (!savePath || savePath === '') return console.log(chalk.red('Invalid path'))
        fs.writeFileSync(savePath, JSON.stringify(game?.export(), null, 2))
        console.log(chalk.green(`Game ${game?.id} exported`))
      }
    },
    {
      name: 'import',
      description: 'Import a game',
      execute: async () => {
        const loadPath = await input({ message: 'Import from path:' })
        const data = JSON.parse(fs.readFileSync(loadPath).toString())
        game = new Game()
        game.import(data)
        setupEventListeners(game)

        console.log(chalk.green(`Game ${game.id} imported`))
        console.log(chalk.green(`\n${game?.options.universe}`))
        console.log(`${chalk.green(`${game?.options.playerName}, ${game?.options.playerClass}`)}`)
        console.log(`${emojify(game?.data.scene_emoji || '')}\t${chalk.blue(game?.data.scene)}`)
        console.log(`\n${chalk.yellow(`Suggested actions: ${game?.data.actions?.join(', ')}`)}`)
      }
    }
  ]

  if (options['import']) {
    const data = JSON.parse(fs.readFileSync(options['import']).toString())
    game = new Game()
    game.import(data)
    setupEventListeners(game)

    console.log(chalk.green(`Game ${game.id} imported`))
    console.log(chalk.green(`\n${game?.options.universe}`))
    console.log(`${chalk.green(`${game?.options.playerName}, ${game?.options.playerClass}`)}`)
    console.log(`${emojify(game?.data.scene_emoji || '')}\t${chalk.blue(game?.data.scene)}`)
    console.log(`\n${chalk.yellow(`Suggested actions: ${game?.data.actions?.join(', ')}`)}`)
  }

  while (true) {
    if (chatMode) {
      const character = game.data.characters?.find(character => character.name === chatMode)
      if (!character) {
        chatMode = false
        continue
      }

      const response = await input({ message: '💬' })
      if (response !== '') await game.chat({ character, dialog: response })
      else chatMode = false
      continue
    }

    let command = await input({ message: '🎮' })
    if (['quit', 'exit', 'break'].includes(command)) break
    if (command === '' && game.data.actions) command = 'action'
    if (command === '' && !game.data.actions) command = 'create'

    try {
      const args = command.split(' ')
      let cmd = gameCommands.find(cmd => cmd.name === args?.[0]?.trim())
      if (args.length > 1 && !['inspect', 'set'].includes(args?.[0] || '')) cmd = undefined

      if (cmd) await cmd.execute(args)
      else {
        const cmd = gameCommands.find(cmd => cmd.name === 'action')
        const args = command.split(' ')
        if (cmd) await cmd.execute(args)
      }
    } catch (err) {
      console.log(chalk.red(err))
    }
  }
}

main()
