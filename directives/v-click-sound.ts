import type { Directive } from 'vue'

export const vClickSound: Directive<HTMLElement, number> = {
  mounted(el:any) {
    el.__soundHandler__ = () => {
      const audio = new Audio('/sounds/click.mov')
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
    el.addEventListener('click', el.__soundHandler__)
  },
  unmounted(el:any) {
    el.removeEventListener('click', el.__soundHandler__)
  }
}
