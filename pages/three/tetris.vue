<template>
  <div>
    <h1>Тетрис 3д</h1>
    <div ref="canvasWrapper"></div>
    <KeyboardHint @pause="game.pause()" />
  </div>
</template>

<script lang="ts" setup>
import { MathUtils, Vector3 } from 'three'
import * as THREE from 'three'
import { useService } from '~/src/Common/Helpers/HService'
import { SKeyboard } from '~/src/Common/Services/SKeyboard'
import { WfTetris } from '~/src/Tetris/Workflows/WfTetris'
import { EKeyCode } from '~/src/Common/Types/GameTypes'
import { RenderService } from '~/src/Common/Library/ThreeD/Services/RenderService'
import KeyboardHint from '~/src/Common/Components/KeyboardHint/KeyboardHint.vue'

const baseSize = 10
const canvasWrapper = ref()
const keyboard = useService<SKeyboard>('keyboard')
const game = new WfTetris()
const rserv = new RenderService()

keyboard.clearSubscribers()
keyboard.registerSubscriber((key: EKeyCode) => {
  const shape = game.grid.getFirstShape()

  if (!shape) {
    return
  }

  if (key === EKeyCode.W) {
    game.rotateShape()
  }

  if (key === EKeyCode.S) {
    game.moveShapeDown()
  }

  if (key === EKeyCode.A) {
    game.moveShapeByX(1)
  }

  if (key === EKeyCode.D) {
    game.moveShapeByX(-1)
  }
})

const textureLoader = new THREE.TextureLoader()
let bricksTexture: any = null
textureLoader.load('/images/textures/bricks.png', (texture) => {
  bricksTexture = texture
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.offset.set(Math.random() * 100, Math.random() * 100)
  texture.repeat.set(0.1, 0.1)
})

game.afterNewShape(() => {
  bricksTexture = bricksTexture.clone()
  bricksTexture.offset.set(Math.random() * 100, Math.random() * 100)
})

rserv.afterScene(async () => {
  rserv.scene.background = new THREE.Color('skyblue')
  const textureLoader = new THREE.TextureLoader()
  const texture = await textureLoader.loadAsync('/images/textures/grass2.jpg')
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.offset.set(0, 0)
  texture.repeat.set(20, 20)
  const floorGeometry = new THREE.PlaneGeometry(2400, 2400, 100, 1)
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: texture,
  })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.position.set(100, -100, -4)
  rserv.scene.add(floor)
})

const newPosition = new Vector3()
game.afterNextFrame(() => {
  if (!bricksTexture) {
    return
  }
  rserv.setLastUpdateTime(new Date().getTime())
  rserv.setGameSpeed(game.speed.value)

  Object.entries(rserv.cubes).forEach(([id, cube]) => {
    if (id.indexOf('target_') === 0 || id.indexOf('bg_') === 0) {
      cube.visible = false
    }
  })

  const shape = game.grid.getFirstShape()
  if (shape) {
    newPosition.z = 80
    newPosition.x = shape.x * baseSize
    newPosition.y = -shape.y * baseSize + 70

    rserv.camera.rotation.x = MathUtils.degToRad(-45)
    rserv.camera.rotation.y = MathUtils.degToRad(0)
    rserv.camera.rotation.z = MathUtils.degToRad(180)

    shape.bitmap.forEach((row, rowIndex) => {
      row.forEach((isFilled, cellIndex) => {
        const id = `target_${cellIndex}_${rowIndex}`
        const cube = rserv.cubes?.[id]
        const cubeExists = rserv.hasCube(id)

        if (isFilled) {
          rserv.manageCube(
            id,
            (shape.x + cellIndex) * baseSize,
            (-shape.y - rowIndex) * baseSize,
            0xaa0000,
            bricksTexture
          )
          cubeExists && (cube.visible = true)
        } else if (cubeExists) {
          cube.visible = false
        }
      })
    })
  }

  game.grid.bgBitmap.forEach((row, rowIndex) => {
    row.forEach((isFilled, cellIndex) => {
      const id = `bg_${cellIndex}_${rowIndex}`
      const cube = rserv.cubes?.[id]
      const cubeExists = rserv.hasCube(id)

      if (isFilled) {
        rserv.manageCube(
          id,
          cellIndex * baseSize,
          -rowIndex * baseSize,
          0xaa0000,
          bricksTexture
        )
        cubeExists && (cube.visible = true)
      } else if (cubeExists) {
        cube.visible = false
      }
    })
  })
})

rserv.setAfterAnimate((additional: number) => {
  if (additional > 1) {
    additional = 1
  }

  const xsize = newPosition.x - rserv.camera.position.x
  const ysize = newPosition.y - rserv.camera.position.y

  rserv.camera.position.x += xsize * additional
  rserv.camera.position.y += ysize * additional
  rserv.camera.position.z = newPosition.z
})

const eatSound = () => rserv.sound('eated', '/sounds/eated.wav')

game.afterLineFired(async () => {
  const sound = await eatSound()
  sound.play()
  setTimeout(() => {
    sound.stop()
  }, 1500)
})

onMounted(() => {
  rserv.render(canvasWrapper.value)

  Promise.all([eatSound()]).then(() => {
    game.run()
  })

  setTimeout(() => {
    rserv.camera3()
  })

  const width = game.grid.width
  const height = game.grid.height
  const white = 0xffffff

  for (let i = 0; i < width; i++) {
    rserv.createCube('top' + i, i * baseSize, 1 * baseSize, white)
    rserv.createCube('bottom' + i, i * baseSize, -height * baseSize, white)
  }

  for (let i = 0; i < height; i++) {
    rserv.createCube('left' + i, -1 * baseSize, -i * baseSize, white)
    rserv.createCube('right' + i, width * baseSize, -i * baseSize, white)
  }
})
</script>