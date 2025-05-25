// plugins/directives.ts
import { vAutosize } from '@/directives/v-autosize'
import { vObserveVisible } from '@/directives/v-observe-visible'
import { vSwipeDown } from '@/directives/v-swipe-down'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('autosize', vAutosize)
  nuxtApp.vueApp.directive('observe-visible', vObserveVisible)
  nuxtApp.vueApp.directive('swipe-down', vSwipeDown)
})