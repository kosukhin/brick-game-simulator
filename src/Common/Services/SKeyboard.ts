import { useService } from '~~/src/Common/Helpers/HService'
import { Observable } from '~~/src/Common/Library/Observable'
import { SHooks } from '~~/src/Common/Services/SHooks'
import { SConnectors } from '~~/src/Common/Services/SConnectors'
import { TKeyboardSubscriber } from '~~/src/Common/Types/KeyboardTypes'
import { EKeyCode } from '~~/src/Common/Types/GameTypes'

export class SKeyboard extends Observable<TKeyboardSubscriber> {
  private lastKeyCode!: string | null
  private triggeringInterval!: NodeJS.Timer
  private triggeringFrequency = 150

  afterInit(hooks: SHooks) {
    hooks.init.registerSubscriber(() => {
      process.client && this.keyPressHandler()
    })
  }

  keyPressHandler() {
    useService<SConnectors>('connectors').browser.on(
      window,
      'keypress',
      (e) => {
        const key = e.code
        if (key === EKeyCode.SPC) {
          e.preventDefault()
        }
        this.runSubscribers(key)
      }
    )
  }

  triggerKeyPress(keyCode: string) {
    this.runSubscribers(keyCode)
  }

  beginTriggerKeyPress(keyCode: string) {
    this.triggerKeyPress(keyCode)
    this.lastKeyCode = keyCode
    this.clearTriggerInterval()
    this.triggeringInterval = setInterval(() => {
      this.runSubscribers(keyCode)
    }, this.triggeringFrequency)
  }

  stopTriggerKeyPress() {
    this.lastKeyCode = null
    this.clearTriggerInterval()
  }

  clearTriggerInterval() {
    if (this.triggeringInterval) {
      clearInterval(this.triggeringInterval)
    }
  }
}
