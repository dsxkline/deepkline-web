import type { Directive, DirectiveBinding } from 'vue'

export const vObserveVisible: Directive<HTMLElement, number> = {
	mounted(el, binding) {
		const callback = typeof binding.value === 'function' ? binding.value : (binding.value as any)?.callback
		// 当元素滚动进入视口（默认 10%）时，触发回调函数
		const options = (binding.value as any)?.options || { threshold: 0.05 }

		if (typeof callback !== 'function') {
			console.warn('[v-observe-visible] binding value must be a function or an object with callback')
			return
		}

		const observer = new IntersectionObserver(([entry]) => {
            // console.log('inview', entry)
			// 进入或离开视口都触发回调
			callback(entry.isIntersecting)
			if (entry.isIntersecting) {
				// 是否允许多次触发
				if (!binding.modifiers?.multi) {
					observer.unobserve(el)
				}
			}
		}, options)

		;(el as any).__observer__ = observer;
		observer.observe(el);

		// ⚠️ 初始化时主动触发一次（可能此时元素就在视口内）
		setTimeout(() => {
			const rect = el.getBoundingClientRect()
			const inView = rect.top < window.innerHeight && rect.bottom > 0
			// console.log('inview', inView, rect)
			if (inView) {
				callback(true)
				if (!binding.modifiers?.multi) {
					observer.unobserve(el)
				}
			}
		},100)
	},
	unmounted(el) {
		;(el as any).__observer__?.disconnect();
		delete (el as any).__observer__;
	}
}
