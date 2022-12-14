<template>
    <div class="game screen">
        <div v-if="game.isGameOver.value" class="game-over">
            <el-result
                icon="error"
                :title="$services.lang.t('Game over')"
                :sub-title="`${$services.lang.t('Score')}: ${game.score.value}`"
            />
        </div>
        <div class="grid-header">
            {{ $services.lang.t('Score') }}: {{ game.score }},
            {{ $services.lang.t('Speed') }}:
            {{ game.speed }}
        </div>
        <CanvasView :grid="game.grid" :fps="10" />
        <KeyboardHint @pause="onPaused" />
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { WfTetris } from '~~/src/Tetris/Workflows/WfTetris'
import { useService } from '~~/src/Common/Helpers/HService'
import { SKeyboard } from '~~/src/Common/Services/SKeyboard'
import { HArray } from '~~/src/Common/Helpers/HArray'
import CanvasView from '~~/src/Common/Components/CanvasView/CanvasView.vue'
import KeyboardHint from '~~/src/Common/Components/KeyboardHint/KeyboardHint.vue'
import { EKeyCode } from '~~/src/Common/Types/GameTypes'

const keyboard = useService<SKeyboard>('keyboard')
const game = new WfTetris()
game.run()

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
        game.moveShapeByX(-1)
    }

    if (key === EKeyCode.D) {
        game.moveShapeByX(1)
    }
})

const emit = defineEmits(['grid'])
onMounted(() => {
    emit('grid', game.grid)
})

const onPaused = () => {
    game.pause()
}
</script>
