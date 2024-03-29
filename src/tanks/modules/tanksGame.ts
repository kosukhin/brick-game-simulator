import { pick, throttle, uniqueId } from 'lodash'
import { Intention } from '~~/src/common/library/Intention'
import { Block, Shape } from '~~/src/common/types/Block'
import { FType, State } from '~~/src/common/utils/system'
import { HMath } from '~~/src/common/utils/HMath'
import { EMoveDirection } from '~~/src/common/types/GameTypes'
import { GameGrid, GameSettings } from '~~/src/common/types/Game'

export const useTanks = (
  getGameSettings: FType<State<GameSettings>>,
  getGameGrid: FType<State<GameGrid>>,
  doTimer: FType<void, [number, () => void]>
) => {
  const gameSettings = getGameSettings()
  const gameGrid = getGameGrid()

  gameGrid.get().blocks.push(...tank.blocks)
  rotateTank(EMoveDirection.right, gameGrid.get(), tank)

  const nextFrame = () => {
    doTimer(gameSettings.get().speed, () => {
      gameSettings.get().frameCounter += 1
      tanksMainCycle(gameGrid.get(), gameSettings.get())
      !gameSettings.get().isGameOver &&
        !gameSettings.get().isPaused &&
        nextFrame()
    })
  }

  return {
    start: nextFrame,
    shoot: throttle(() => {
      shoot(tank, gameGrid.get(), gameSettings.get())
    }, 100),
    pause() {
      gameSettings.get().isPaused = !gameSettings.get().isPaused
      gameSettings.get().isPaused && nextFrame()
    },
    direction: throttle((newDirection: EMoveDirection) => {
      if (gameSettings.get().isGameOver) {
        return
      }
      rotateTank(newDirection, gameGrid.get(), tank)
      tank.direction === newDirection &&
        moveTank(tank, newDirection, gameGrid.get())
      tank.direction = newDirection
    }, 50),
  }
}

const tanksMainCycle = (gameGrid: GameGrid, gameSettings: GameSettings) => {
  if (!bots.size) {
    bots.add(createBot(gameGrid, gameSettings))

    if (gameSettings.score >= 5) {
      bots.add(
        createBot(
          gameGrid,
          gameSettings,
          gameGrid.gameSize.width / 2 - TANK_SIZE,
          'bot2'
        )
      )
    }

    if (gameSettings.score >= 10) {
      bots.add(
        createBot(
          gameGrid,
          gameSettings,
          gameGrid.gameSize.width - TANK_SIZE,
          'bot3'
        )
      )
    }

    if (gameSettings.score >= 15) {
      bots.add(
        createBot(
          gameGrid,
          gameSettings,
          gameGrid.gameSize.width - TANK_SIZE,
          'bot3',
          gameGrid.gameSize.height / 2 - TANK_SIZE
        )
      )
    }
  }
}

const bots: Set<Shape> = new Set()
const tank: Shape = {
  x: 0,
  y: 0,
  direction: EMoveDirection.right,
  blocks: [
    { x: 0, y: 0, id: uniqueId('tank_'), group: 'tank', localId: '0' },
    { x: 0, y: 0, id: uniqueId('tank_'), group: 'tank', localId: '1' },
    { x: 0, y: 0, id: uniqueId('tank_'), group: 'tank', localId: '2' },
    { x: 0, y: 0, id: uniqueId('tank_'), group: 'tank', localId: '3' },
    { x: 0, y: 0, id: uniqueId('tank_'), group: 'tank', localId: '4' },
    { x: 0, y: 0, id: uniqueId('tank_'), group: 'tank', localId: '5' },
    { x: 0, y: 0, id: uniqueId('tank_'), group: 'tank', localId: '6' },
  ],
}

const createBot = (
  gameGrid: GameGrid,
  gameSettings: GameSettings,
  xShift = 0,
  group: string = 'bot',
  yShift = 0
): Shape => {
  const localGroup = uniqueId('bot_')
  const bot = {
    x: gameGrid.gameSize.width - TANK_SIZE - xShift,
    y: gameGrid.gameSize.height - TANK_SIZE - yShift,
    direction: EMoveDirection.right,
    blocks: [
      { x: 0, y: 0, id: uniqueId('bot_'), group, localId: '0', localGroup },
      { x: 0, y: 0, id: uniqueId('bot_'), group, localId: '1', localGroup },
      { x: 0, y: 0, id: uniqueId('bot_'), group, localId: '2', localGroup },
      { x: 0, y: 0, id: uniqueId('bot_'), group, localId: '3', localGroup },
      { x: 0, y: 0, id: uniqueId('bot_'), group, localId: '4', localGroup },
      { x: 0, y: 0, id: uniqueId('bot_'), group, localId: '5', localGroup },
      { x: 0, y: 0, id: uniqueId('bot_'), group, localId: '6', localGroup },
    ],
  }
  bots.add(bot)
  gameGrid.blocks.push(...bot.blocks)
  rotateTank(EMoveDirection.up, gameGrid, bot)

  const nextBotFrame = () => {
    if (gameSettings.isGameOver) {
      return
    }

    const tankMidX = midX(tank, TANK_SIZE)
    const tankMidY = midY(tank, TANK_SIZE)
    const botMidX = midX(bot, TANK_SIZE)
    const botMidY = midY(bot, TANK_SIZE)

    const isSameX = bot.x <= tankMidX && tankMidX <= maxX(bot, TANK_SIZE)
    const isSameY = bot.y <= tankMidY && tankMidY <= maxY(bot, TANK_SIZE)

    if (isSameX || isSameY) {
      let shootDirection = EMoveDirection.up

      if (isSameX && botMidY < tankMidY) {
        shootDirection = EMoveDirection.down
      }

      if (isSameX && botMidY > tankMidY) {
        shootDirection = EMoveDirection.up
      }

      if (isSameY && botMidX > tankMidX) {
        shootDirection = EMoveDirection.left
      }

      if (isSameY && botMidY < tankMidY) {
        shootDirection = EMoveDirection.right
      }

      bot.direction = shootDirection
      rotateTank(bot.direction, gameGrid, bot)
      shoot(bot, gameGrid, gameSettings)
    } else {
      const xDistance = tankMidX - botMidX + HMath.random(0, 4)
      const yDistance = tankMidY - botMidY + HMath.random(0, 4)

      if (Math.abs(yDistance) < Math.abs(xDistance)) {
        bot.direction = yDistance >= 0 ? EMoveDirection.down : EMoveDirection.up
      } else {
        bot.direction =
          xDistance >= 0 ? EMoveDirection.right : EMoveDirection.left
      }
      rotateTank(bot.direction, gameGrid, bot)
      moveTank(bot, bot.direction, gameGrid)
    }

    if (bots.has(bot)) {
      setTimeout(() => {
        nextBotFrame()
      }, 200)
    }
  }
  nextBotFrame()

  return bot
}

const rotateTank = (
  direction: EMoveDirection,
  gameGrid: GameGrid,
  shape: Shape
) => {
  const rotationRule = tankRotations[direction]

  gameGrid.blocks.forEach((block) => {
    if (!isBlockInShape(block, shape)) return
    const position = rotationRule[block.localId as string]

    block.x = position.x + shape.x
    block.y = position.y + shape.y
  })
}

const isBlockInShape = (block: Block, shape: Shape) => {
  return shape.blocks.findIndex((currBlock) => currBlock.id === block.id) > -1
}

const TANK_SIZE = 3

const isStuckToShape = (
  shape: Shape,
  gameGrid: GameGrid,
  direction: EMoveDirection
) => {
  const shiftPoint = shiftByDirection(direction)
  return gameGrid.blocks.some((block) => {
    return shape.blocks.some((shapeBlock) => {
      return (
        shapeBlock.group !== block.group &&
        ['tank', 'bot', 'bot2', 'bot3'].includes(block.group) &&
        shapeBlock.x + shiftPoint.x === block.x &&
        shapeBlock.y + shiftPoint.y === block.y
      )
    })
  })
}

const isStuckToBounds = (
  direction: EMoveDirection,
  point: { x: number; y: number },
  gameGrid: GameGrid,
  size: number
) => {
  const isStuckToTop = direction === EMoveDirection.up && point.y <= 0
  const isStuckToLeft = direction === EMoveDirection.left && point.x <= 0
  const isStuckToRight =
    direction === EMoveDirection.right &&
    point.x >= gameGrid.gameSize.width - size
  const isStuckToBottom =
    direction === EMoveDirection.down &&
    point.y >= gameGrid.gameSize.height - size

  return isStuckToTop || isStuckToLeft || isStuckToRight || isStuckToBottom
}

const moveTank = (
  shape: Shape,
  direction: EMoveDirection,
  gameGrid: GameGrid
) => {
  new Intention(gameGrid)
    .predicate(() => {
      return (
        !isStuckToBounds(direction, shape, gameGrid, TANK_SIZE) &&
        !isStuckToShape(shape, gameGrid, direction)
      )
    })
    .map((gameGrid: GameGrid) => {
      const prevTankPoint = pick(shape, ['x', 'y'])
      direction === EMoveDirection.up && (shape.y -= 1)
      direction === EMoveDirection.right && (shape.x += 1)
      direction === EMoveDirection.down && (shape.y += 1)
      direction === EMoveDirection.left && (shape.x -= 1)

      const shapeIds = shape.blocks.map((b) => b.id)
      const shapeBlocks = gameGrid.blocks.filter((b) => shapeIds.includes(b.id))
      shapeBlocks.forEach((block) => {
        block.x += shape.x - prevTankPoint.x
        block.y += shape.y - prevTankPoint.y
      })

      return gameGrid
    })
}

const tankRotations: Record<string, any> = {
  [EMoveDirection.right]: {
    '0': { x: 0, y: 0 },
    '1': { x: 1, y: 0 },
    '2': { x: 0, y: 1 },
    '3': { x: 1, y: 1 },
    '4': { x: 2, y: 1 },
    '5': { x: 0, y: 2 },
    '6': { x: 1, y: 2 },
  },
  [EMoveDirection.down]: {
    '0': { x: 0, y: 0 },
    '1': { x: 1, y: 0 },
    '2': { x: 2, y: 0 },
    '3': { x: 0, y: 1 },
    '4': { x: 1, y: 1 },
    '5': { x: 2, y: 1 },
    '6': { x: 1, y: 2 },
  },
  [EMoveDirection.left]: {
    '0': { x: 0, y: 1 },
    '1': { x: 1, y: 0 },
    '2': { x: 1, y: 1 },
    '3': { x: 1, y: 2 },
    '4': { x: 2, y: 0 },
    '5': { x: 2, y: 1 },
    '6': { x: 2, y: 2 },
  },
  [EMoveDirection.up]: {
    '0': { x: 1, y: 0 },
    '1': { x: 0, y: 1 },
    '2': { x: 1, y: 1 },
    '3': { x: 2, y: 1 },
    '4': { x: 0, y: 2 },
    '5': { x: 1, y: 2 },
    '6': { x: 2, y: 2 },
  },
}

const isIntersected = (
  shoot: Block,
  excludeBlocks: Block[],
  gameGrid: GameGrid
) => {
  const isExcluded = excludeBlocks.some((block) => {
    return block.x === shoot.x && block.y === shoot.y
  })

  if (isExcluded) {
    return false
  }

  const intersectedWith = gameGrid.blocks.find((block) => {
    return block.x === shoot.x && block.y === shoot.y && block.id !== shoot.id
  })

  return intersectedWith
}

const shiftByDirection = (direction: EMoveDirection) => {
  const shiftPoint = { x: 0, y: 0 }
  direction === EMoveDirection.up && (shiftPoint.y -= 1)
  direction === EMoveDirection.right && (shiftPoint.x += 1)
  direction === EMoveDirection.down && (shiftPoint.y += 1)
  direction === EMoveDirection.left && (shiftPoint.x -= 1)

  return shiftPoint
}

const SHOOT_SPEED = 50

const isTopOrLeft = (direction: EMoveDirection) => {
  return direction === EMoveDirection.up || direction === EMoveDirection.left
}

const shoot = (
  fromShape: Shape,
  gameGrid: GameGrid,
  gameSettings: GameSettings
) => {
  const savedDirection = fromShape.direction
  const shiftPoint = shiftByDirection(savedDirection)
  const shootBlock: Block = {
    x: fromShape.x + shiftPoint.y * (isTopOrLeft(fromShape.direction) ? -1 : 1),
    y: fromShape.y + shiftPoint.x * (isTopOrLeft(fromShape.direction) ? -1 : 1),
    id: uniqueId('shoot_'),
    group: 'shoot',
  }
  gameGrid.blocks.push(shootBlock)
  const shootInGrid = gameGrid.blocks.at(-1)
  const nextShootFrame = () => {
    setTimeout(() => {
      const intersectedBlock = isIntersected(
        shootBlock,
        fromShape.blocks,
        gameGrid
      )
      if (intersectedBlock) {
        if (intersectedBlock.group === 'tank') {
          gameSettings.isGameOver = true
        }

        if (intersectedBlock.group.indexOf('bot') === 0) {
          gameSettings.score += 1
          gameSettings.speed -= 10
          bots.forEach((bot) => {
            if (
              bot.blocks.some((botBlock) => botBlock.id === intersectedBlock.id)
            ) {
              gameGrid.blocks = gameGrid.blocks.filter(
                (block) => block.localGroup !== intersectedBlock.localGroup
              )
              bots.delete(bot)
            }
          })
        }

        const blockIndex = gameGrid.blocks.findIndex(
          (block) => block.id === shootBlock.id
        )
        gameGrid.blocks.splice(blockIndex, 1)

        return
      }
      const shiftPoint = shiftByDirection(savedDirection)
      shootInGrid && (shootInGrid.x += shiftPoint.x)
      shootInGrid && (shootInGrid.y += shiftPoint.y)
      if (
        shootInGrid &&
        !isStuckToBounds(savedDirection, shootInGrid, gameGrid, 1)
      ) {
        nextShootFrame()
      } else {
        const blockIndex = gameGrid.blocks.findIndex(
          (block) => block.id === shootBlock.id
        )
        gameGrid.blocks.splice(blockIndex, 1)
      }
    }, SHOOT_SPEED)
  }
  nextShootFrame()
}

const midX = (tank: Shape, size: number): number => {
  return tank.x + HMath.roundMin((size - 1) / 2)
}

const midY = (tank: Shape, size: number): number => {
  return tank.y + HMath.roundMin((size - 1) / 2)
}

const maxX = (tank: Shape, size: number): number => {
  return tank.x + size - 1
}

const maxY = (tank: Shape, size: number): number => {
  return tank.y + size - 1
}
