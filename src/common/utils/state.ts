import { Ref } from 'vue'
import { State } from '~~/src/common/utils/system'

export const refState = <T>(ref: Ref<T>): State<T> => {
  return {
    get() {
      return ref.value
    },
    set(value) {
      ref.value = value
    },
  }
}

export const refValue = <T>(ref: Ref<T>): T => ref.value
