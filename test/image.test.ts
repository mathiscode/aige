import { Game } from '../src'

const TIMEOUT = 35000

describe('AIGE Image Generation', () => {
  let game: Game

  it('should create a new image', async () => {
    game = new Game()
    const response = await game.client.image('Nikola Tesla in a lab, inventing a new machine.')
    expect(response).toBeDefined()
    expect(response?.url).toBeDefined()
    console.log(response?.url)
  }, TIMEOUT)
})
