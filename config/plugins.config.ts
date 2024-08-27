import type { NuxtPlugin } from "nuxt/schema";
export default [
    '~/plugins/qiankun.client.ts',
    '~/plugins/element-plus.ts',
    {src: '~/plugins/websocket.ts', mode: 'client'}
] as (NuxtPlugin | string)[]