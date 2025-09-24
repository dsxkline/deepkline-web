import type { Directive } from 'vue'

export const vClickSound: Directive<HTMLElement, number> = {
	mounted(el: any) {
    if (window.innerWidth < 999) return
		// const audio = new Audio('/sounds/click.mov')
		// el.__soundHandler__ = () => {
		// 	audio.currentTime = 0
		// 	audio.play().catch(() => {})
		// }
		// el.addEventListener('click', el.__soundHandler__)
	},
	unmounted(el: any) {
    if (window.innerWidth < 999) return
		el.removeEventListener('click', el.__soundHandler__)
		el.__soundHandler__ = null
	}
}
