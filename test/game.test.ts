import { Game } from '../src'

const TIMEOUT = 35000

describe('AIGE', () => {
  let game: Game

  it('should create a new game', async () => {
    game = new Game()
    await game.init()
    expect(game).toBeInstanceOf(Game)
    expect(game.options.universe).toBeDefined()
    expect(game.options.playerName).toBeDefined()
    expect(game.options.playerClass).toBeDefined()
    expect(game.data.scene).toBeDefined()
    expect(game.data.health).toBeGreaterThan(0)
  }, TIMEOUT)

  it('should export and import a game', () => {
    const exported = game.export()
    const imported = new Game()
    imported.import(exported)
    expect(imported).toBeInstanceOf(Game)
    expect(imported.options.universe).toBe(game.options.universe)
    expect(imported.options.playerName).toBe(game.options.playerName)
    expect(imported.options.playerClass).toBe(game.options.playerClass)
  })

  it('should commit an action on the game', async () => {
    const lastScene = game.data.scene
    const action = game.data.actions?.[Math.floor(Math.random() * game.data.actions?.length)]
    if (!action) throw new Error('No action')
    await game.action(action)
    expect(game.data.scene).not.toBe(lastScene)
  }, TIMEOUT)

  it('should complete a quest', async () => {
    const quest = game.data.quests?.find(quest => !quest.completed)
    if (!quest) throw new Error('No quest')
    await game.action(`Complete quest: ${quest.name}`)
    expect(game.data.quests).not.toContain(quest)
  }, TIMEOUT)
})
