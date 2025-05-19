// plugins/directives.ts
import { vAutosize } from '@/directives/v-autosize'
import { vObserveVisible } from '@/directives/v-observe-visible'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('autosize', vAutosize)
  nuxtApp.vueApp.directive('observe-visible', vObserveVisible)
})