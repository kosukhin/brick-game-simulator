<template>
    <div class="tetris">
        <component :is="gamesList[action] ?? gamesList.nogame" />
    </div>
</template>

<script lang="ts" setup>
import { useService } from '~~/src/Common/Helpers/HService'
import { SHooks } from '~~/src/Common/Services/SHooks'
import { HLog } from '~~/src/Common/Helpers/HLog'
import NoGame from '~~/src/Common/Components/Simulator/NoGame.vue'

const gamesList = {
    nogame: NoGame,
}
// Заполняем список игр через хук
useService<SHooks>('hooks').gamesResolving.runSubscribers(gamesList)
HLog.log('game_resolving', gamesList)

defineProps({
    action: {
        type: String,
        default: '',
    },
})
</script>

<style lang="scss" scoped>
.tetris {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: solid 1px $c_black;
    background: $c_white;
}
</style>