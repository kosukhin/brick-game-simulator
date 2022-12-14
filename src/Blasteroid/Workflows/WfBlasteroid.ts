import { Ref } from 'nuxt/dist/app/compat/capi'
import { ref } from 'vue'
import { MGrid } from '~~/src/Common/Models/MGrid'
import { EMoveDirection, IGameWorkflow } from '~~/src/Common/Types/GameTypes'
import { MShape } from '~~/src/Common/Models/MShape'
import { Shapes } from '~~/src/Blasteroid/Data/Shapes'
import { Shoot } from '~~/src/Common/Library/Shoot'
import { HMath } from '~~/src/Common/Helpers/HMath'
import { TGrid } from '~~/src/Common/Types/GridTypes'
import { HApp } from '~~/src/Common/Helpers/HApp'
import { useService } from '~~/src/Common/Helpers/HService'
import { SConnectors } from '~~/src/Common/Services/SConnectors'
import { HObjects } from '~~/src/Common/Helpers/HObjects'

/**
 * Класс игры Арканоид
 */
export class WfBlasteroid implements IGameWorkflow {
    /** Основная сетка игры */
    #grid: MGrid
    /** Фигура игрока */
    #blasteroid: MShape
    /** Спускающаяся фигура */
    #target: MShape
    /** Флаг что игра закончена */
    #isGameOver: Ref<boolean>
    /** Счет игры */
    #score: Ref<number>
    /** Скорость движения змейки */
    #speed: Ref<number>
    /** Флаг остановлена игра или нет */
    #isPaused: boolean

    constructor() {
        this.#grid = new MGrid({
            height: 20,
            width: 15,
        })
        this.#grid.createEmptyGrid()
        this.#blasteroid = new MShape({
            bitmap: Shapes.get('blasteroid') as TGrid,
            x: 0,
            y: this.#grid.maxY - 1,
        })
        this.#blasteroid.setX(
            HMath.round(this.#grid.width / 2) -
                HMath.round(this.#blasteroid.width / 2)
        )
        this.#grid.addShape(this.#blasteroid)
        this.#isGameOver = ref(false)
        this.#speed = ref(400)
        this.#score = ref(0)
        this.#isPaused = false
    }

    get grid(): MGrid {
        return this.#grid
    }

    get score() {
        return this.#score
    }

    get speed() {
        return this.#speed
    }

    get isGameOver() {
        return this.#isGameOver
    }

    get blasteroid() {
        return this.#blasteroid
    }

    async run() {
        if (this.#isPaused) {
            return
        }

        await HApp.wait(this.#speed.value)
        useService<SConnectors>('connectors').browser.requestAnimationFrame(
            () => {
                if (
                    !this.#target ||
                    this.#target.isShapeEmpty() ||
                    !this.#grid.hasShape(this.#target)
                ) {
                    if (this.#target) {
                        this.#grid.removeShape(this.#target)
                    }

                    const randomShape = HObjects.clone(
                        Shapes.get('shapes')[
                            HMath.random(0, Shapes.get('shapes').length - 1)
                        ]
                    )
                    this.#target = new MShape({
                        bitmap: randomShape as TGrid,
                    })
                    this.#target.setX(
                        HMath.round(this.#grid.width / 2) -
                            HMath.round(this.#target.width / 2) +
                            HMath.random(1, 3) *
                                (HMath.random(0, 1) === 0 ? -1 : 1)
                    )

                    this.#grid.addShape(this.#target)
                }

                this.#target.moveY(1)

                if (this.#target.maxY >= this.#grid.maxY) {
                    this.#isGameOver.value = true
                }

                !this.#isGameOver.value && this.run()
            }
        )
    }

    /**
     * {@inheritDoc IGameWorkflow}
     */
    pause() {
        this.#isPaused = !this.#isPaused

        if (!this.#isPaused) {
            this.run()
        }
    }

    /**
     * Передвигает арканоид
     * @param direction
     */
    move(direction: EMoveDirection) {
        if (this.#isPaused) {
            return
        }

        if (direction === EMoveDirection.right) {
            this.#blasteroid.moveX(1)
        }

        if (direction === EMoveDirection.left) {
            this.#blasteroid.moveX(-1)
        }
    }

    /**
     * Делает выстрел от арканоида вверх
     */
    shoot() {
        if (this.#isPaused) {
            return
        }

        const shoot1 = new Shoot({
            direction: EMoveDirection.up,
            fromShape: this.#blasteroid,
            grid: this.#grid,
            position: [this.#blasteroid.x, this.#blasteroid.midY],
            byPixel: true,
        })
        shoot1.hitTheTarget.registerSubscriber(this.targetShooted.bind(this))

        const shoot2 = new Shoot({
            direction: EMoveDirection.up,
            fromShape: this.#blasteroid,
            grid: this.#grid,
            position: [this.#blasteroid.maxX, this.#blasteroid.midY],
            byPixel: true,
        })
        shoot2.hitTheTarget.registerSubscriber(this.targetShooted.bind(this))
    }

    targetShooted() {
        this.#score.value++

        if (this.#score.value % 10 === 0) {
            this.#speed.value -= 10
        }
    }
}
