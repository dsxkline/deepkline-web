import type { NuxtPlugin } from "nuxt/schema";
export default [
    {src: '~/plugins/push.ts', mode: 'client'},
    '~/plugins/element-plus.ts',
    {src: '~/plugins/websocket.ts', mode: 'client'},
    {src: '~/plugins/echart.ts', mode: 'client'},
    {src: '~/plugins/event-intercept.ts', mode: 'client'},
    {src: '~/plugins/auto-height.ts', mode: 'client'},
    '~/plugins/device.ts',
] as (NuxtPlugin | string)[]