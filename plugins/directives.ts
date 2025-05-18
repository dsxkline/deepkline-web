// plugins/directives.ts
import { vAutosize } from '@/directives/v-autosize'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('autosize', vAutosize)
})