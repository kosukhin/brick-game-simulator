import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    mode: 'spa',
    ssr: false,
    css: ['~~/src/Common/Assets/styles/global.scss'],
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData:
                        '@import "~~/src/Common/Assets/styles/colors.scss";@import "~~/src/Common/Assets/styles/mixins.scss";',
                },
            },
        },
    },
})
