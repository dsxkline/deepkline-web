import type { NuxtPlugin } from "nuxt/schema";
export default [
    {src: '~/plugins/push.ts', mode: 'client'},
    '~/plugins/element-plus.ts',
    {src: '~/plugins/websocket.ts', mode: 'client'}
] as (NuxtPlugin | string)[]