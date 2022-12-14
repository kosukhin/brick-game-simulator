import { SHooks } from '~~/src/Common/Services/SHooks'
import SnakeGame from '~~/src/Snake/Components/SnakeGame/SnakeGame.vue'

/**
 * Позволяет подключить игру Змейка в проект
 */
export class SSnake {
    afterInit(hooks: SHooks) {
        hooks.gamesResolving.registerSubscriber((gamesList) => {
            gamesList.snake = SnakeGame
        })
    }
}
