// plugins/directives.ts
import { vAutosize } from '@/directives/v-autosize'
import { vObserveVisible } from '@/directives/v-observe-visible'
import { vSwipeDown } from '@/directives/v-swipe-down'
import { vClickSound } from '~/directives/v-click-sound'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('autosize', vAutosize)
  nuxtApp.vueApp.directive('observe-visible', vObserveVisible)
  nuxtApp.vueApp.directive('swipe-down', vSwipeDown)
  nuxtApp.vueApp.directive('click-sound', vClickSound)
})