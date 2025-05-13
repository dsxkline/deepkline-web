import { useStore } from "~/store"

function setBodyHeight() {
	const doc = document.documentElement
    const height = window.innerHeight
    const width = window.innerWidth
	doc.style.setProperty('--body-height', `${height}px`)
    useStore().setBodyHeight(height)
    doc.style.setProperty('--body-width', `${width}px`)
    useStore().setBodyWidth(width)
    
}

export default defineNuxtPlugin(({ vueApp }) => {
	if (process.client) {
		// 设置body高度
		setBodyHeight()
		window.addEventListener('resize', setBodyHeight)
		// 监听页面加载完成事件
		window.addEventListener('load', setBodyHeight)
		// 监听页面卸载事件
		window.addEventListener('beforeunload', () => {
			window.removeEventListener('resize', setBodyHeight)
			window.removeEventListener('load', setBodyHeight)
		})
	}
})
