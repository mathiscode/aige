<!-- markdown-lint-disable MD014 -->

# AIGE: The AI Game Engine

AIGE is a Node.js library that utilizes the OpenAI API to generate text-based games in any universe.

Developers can integrate AIGE into their own projects to create games that are unique every time.

AI-based games can go off the rails sometimes, but that's part of the fun!

Made with ❤️ by [Jay Mathis](https://github.com/mathiscode)

Please consider [becoming a sponsor](https://github.com/sponsors/mathiscode) or buying tokens on [Imagined.Quest](https://imagined.quest) if you appreciate my work.

---

[![NPM](https://nodei.co/npm/@aige/core.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/@aige/core)

[![View Docs](https://img.shields.io/badge/view-docs-blue?style=for-the-badge)](https://aige.games)
[![Made with TypeScript](https://img.shields.io/badge/made_with-typescript-blue?style=for-the-badge)](https://www.typescriptlang.org)

[![Version](https://img.shields.io/github/package-json/v/mathiscode/aige?color=success)](https://www.npmjs.com/package/aige)
[![CircleCI](https://img.shields.io/circleci/build/github/mathiscode/aige/master)](https://app.circleci.com/pipelines/github/mathiscode/aige)
[![Last Commit](https://img.shields.io/github/last-commit/mathsicode/aige.svg)](https://github.com/mathiscode/aige/commit/master)
[![Open issues](https://img.shields.io/github/issues/mathiscode/aige.svg)](https://github.com/mathiscode/aige/issues)
[![Closed issues](https://img.shields.io/github/issues-closed/mathiscode/aige.svg)](https://github.com/mathiscode/aige/issues?q=is%3Aissue+is%3Aclosed)

[![Sponsors](https://img.shields.io/github/sponsors/mathiscode?color=red)](https://github.com/sponsors/mathiscode)
[![Contributors](https://img.shields.io/github/contributors/mathiscode/aige?color=yellow)](https://github.com/mathiscode/aige/graphs/contributors)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue)](https://github.com/mathiscode/aige/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blue.svg)](https://github.com/mathiscode/aige/compare)

[![Followers](https://img.shields.io/github/followers/mathiscode?style=social)](https://github.com/mathiscode)
[![Watchers](https://img.shields.io/github/watchers/mathiscode/aige?style=social)](https://github.com/mathiscode/aige)
[![Stars](https://img.shields.io/github/stars/mathiscode/aige?style=social)](https://github.com/mathiscode/aige)

---

## Features <!-- omit in toc -->

- 🎮 Create games in any universe
- 🗨️ Chat with any character
- 🎨 Generate images for various game elements using DALL-E
- 👨‍💻 An "action" in the game can be any prompt, allowing virtually infinite possibilities
- 📝 The game will suggest actions for the player to choose from
- 🧠 Manage game state with a simple API
- 📦 Export and import games as JSON
- 🚨 Track game events with event listeners
- 🧰 Track stats, scene, inventory, characters, abilities, quests, and more
- 🤖 Powered by [OpenAI API](https://platform.openai.com/docs/overview) (planned support for additional LLMs)

---

[![asciicast](https://asciinema.org/a/623977.svg)](https://asciinema.org/a/623977)

---

## Table of Contents <!-- omit in toc -->

- [AIGE: The AI Game Engine](#aige-the-ai-game-engine)
  - [CLI](#cli)
  - [Installation](#installation)
  - [Documentation](#documentation)
  - [Example](#example)
  - [Development](#development)
  - [Notes](#notes)

---

## CLI

Just want to play some games? Try the CLI!

```sh
OPENAI_API_KEY=sk-youropenaikey npx @aige/core@latest
```

```text
AIGE vX.Y.Z
https://aige.games
Type "help" for a list of commands
? 🎮 create
```

## Installation

```sh
npm install @aige/core # or your package manager's equivalent (pnpm recommended)
```

## Documentation

[View the docs on aige.games](https://aige.games)

## Example

```js
import fs from 'node:fs'
import { Game, GameEvent } from '@aige/core'

// If using the environment variable, you can omit the apiKey option entirely
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key'

// completely random game
const game1 = new Game({ clientOptions: { apiKey: OPENAI_API_KEY } }) 

// import a game from a JSON export
const game2 = new Game({ clientOptions: { apiKey: OPENAI_API_KEY } })
game2.import(fs.readFileSync('./game2.json', 'utf8'))

// specify game options
const game3 = new Game({
  clientOptions: { apiKey: OPENAI_API_KEY },
  universe: 'Warhammer 40K',
  playerName: 'Konrad Curze',
  playerClass: 'Primarch'
})

// This is only necessary for new games, not imported games
await game1.init()
await game3.init()

// Game states:
console.log(game1.inspect())
console.log(game2.inspect())
console.log(game3.inspect())

// Perform actions:
const action = game1.data.actions[Math.floor(Math.random() * game1.data.actions.length)]
await game1.action(action) // Use a suggested action
await game2.action('Explore the area')
await game3.action('Do Night Haunter things')

// Manually set a game value:
game1.set('health', 10000)
game2.set('abilities[0].name', 'Renamed Ability')
game3.set('characters[0].hostile', true)

// Add event listeners:
game1.on(GameEvent.gain, ({ attribute, amount }) => console.log(`Gained ${amount} ${attribute}`))
game2.on(GameEvent.loss, ({ attribute, amount }) => console.log(`Lost ${amount} ${attribute}`))
game3.on(GameEvent.chat, ({ character, dialog }) => console.log(`${character.name}: ${dialog}`))

// Chat with a character:
const character = game3.data.characters[Math.floor(Math.random() * game3.data.characters.length)]
await game3.chat(character, 'Stop doing crime!')

// Generate images:
const item = game3.data.inventory[Math.floor(Math.random() * game3.data.inventory.length)]
const ability = game3.data.abilities[Math.floor(Math.random() * game3.data.abilities.length)]

const images = await game3.images({
  player: true,
  scene: true, 
  character,
  ability,
  item
}, {
  response_format: 'url' // url (default) | b64_json
})

console.log(images) // { player: 'https://...', scene: 'https://...', character: 'https://...', ability: 'https://...', item: 'https://...' }

// Save the game state to a JSON file
fs.writeFileSync('./game1.json', JSON.stringify(game1.export(), null, 2))
fs.writeFileSync('./game2.json', JSON.stringify(game2.export(), null, 2))
fs.writeFileSync('./game3.json', JSON.stringify(game3.export(), null, 2))
```

See [tests](./test) and [cli.ts](./src/cli.ts) for more examples on how to interface with the library.

## Development

There is a `launch.json` file included for debugging in VSCode.

Run the following commands:

```sh
git clone https://github.com/mathiscode/aige.git
cd aige
echo "OPENAI_API_KEY=sk-youropenaikey" > .env
pnpm install
pnpm test
```

All scripts:

```sh
pnpm test # run tests one time
pnpm test:watch # run tests and watch for changes
pnpm test:coverage # run tests and generate a coverage report
pnpm build # build the library and docs
pnpm build:library # build the library
pnpm build:docs # build the docs
pnpm build:docs:watch # build the docs and watch for changes
pnpm dev:cli # run the CLI with the Node.js debugger attached
```

## Notes

OpenAI's API can sometimes be slow to respond with larger schemas, and the `create` and `action` tools have fairly heavy schemas. As time goes on, both OpenAI and AIGE will improve and become faster.

Optimizations Coming:

- Allow custom schemas to reduce token usage by pruning unused data, and allowing flexibility in game structure
- Chunk the creation and action calls into smaller pieces to reduce token usage per call, giving faster responses

The default models are `gpt-3.5-turbo-1106` and `dall-e-2`. You can change the models in the [GameClientOptions](https://aige.games/interfaces/Core.GameClientOptions.html) to use other models. Creating a game and performing an action uses ~2000-3000 tokens.
