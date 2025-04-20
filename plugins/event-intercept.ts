export default defineNuxtPlugin(({ vueApp }) => {
	if (process.client) {
		const audio = new Audio('/sounds/click.mov')

		document.addEventListener('click', event => {
			const path = event.composedPath?.() || [] // 获取事件传播路径
			for (const el of path) {
				if (!(el instanceof HTMLElement)) continue
				// 判断原生 onclick 或 Vue 绑定过的 click 事件
				if (
					typeof el.onclick === 'function' || // 原生 DOM
					el.getAttributeNames().some(attr => attr.startsWith('@click') || attr === 'v-on:click' || attr=="click-sound") // Vue 模板
				) {
					// 播放音效
					audio.currentTime = 0
					audio.play().catch(() => {})
					break
				}
			}
		})
	}
})
