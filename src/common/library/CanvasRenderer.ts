import { HLog } from '~~/src/common/utils/HLog'
import { MGrid } from '~~/src/common/models/MGrid'

const DOT_SIZE = 12

export class CanvasRenderer {
  #grid: MGrid
  #fps: number
  #canvas!: HTMLCanvasElement
  #renderingIntervalPointer: any = null
  #ctx!: CanvasRenderingContext2D

  constructor(grid: MGrid, fps: number) {
    this.#grid = grid
    this.#fps = fps
  }

  get canvas() {
    return this.#canvas
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.#canvas = canvas
  }

  run() {
    try {
      this.#canvas.width = Number(
        this.#grid.width * DOT_SIZE + this.#grid.width
      )
      this.#canvas.height = Number(
        this.#grid.height * DOT_SIZE + this.#grid.height
      )
      const context = this.#canvas.getContext('2d')
      context && (this.#ctx = context)

      const delay = Math.round(1000 / this.#fps)
      const renderCycle = () => {
        this.#renderingIntervalPointer = setTimeout(() => {
          requestAnimationFrame(() => {
            this.renderFrame()
            renderCycle()
          })
        }, delay)
      }
      renderCycle()
    } catch (e) {
      HLog.log('canvas', 'rendering error')
    }
  }

  renderFrame() {
    const ctx = this.#ctx
    const grid = this.#grid.render()
    let topOffset = 0
    let leftOffset = 0
    ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height)

    for (const row of grid) {
      for (const cell of row) {
        ctx.fillStyle = cell ? '#000200' : '#99a78c'
        ctx.fillRect(leftOffset, topOffset, DOT_SIZE, DOT_SIZE)
        ctx.clearRect(leftOffset + 1, topOffset + 1, DOT_SIZE - 2, DOT_SIZE - 2)
        ctx.fillRect(leftOffset + 3, topOffset + 3, DOT_SIZE - 6, DOT_SIZE - 6)
        leftOffset += DOT_SIZE + 1
      }

      topOffset += DOT_SIZE + 1
      leftOffset = 0
    }
  }

  destroy() {
    this.#renderingIntervalPointer &&
      clearInterval(this.#renderingIntervalPointer)
  }
}
