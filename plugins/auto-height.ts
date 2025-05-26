import { useStore } from '~/store'

function setBodyHeight() {
	const doc = document.documentElement
	const height = window.innerHeight
	const width = window.innerWidth
	doc.style.setProperty('--body-height', `${height}px`)
	useStore().setBodyHeight(height)
	doc.style.setProperty('--body-width', `${width}px`)
	useStore().setBodyWidth(width)
}

function setRemUnit() {
	const baseSize = 16 // 通常设置 1rem = 100px 设计稿（方便计算）
	const designWidth = window.innerWidth > 999 ? window.innerWidth : 375 // 设计稿宽度

	const html = document.documentElement
	const width = html.clientWidth

	const rem = Math.min((width / designWidth) * baseSize,20) // 限制最大值为 20px
	html.style.fontSize = rem + 'px'
}

export default defineNuxtPlugin(({ vueApp }) => {
	const router = useRouter()
	router.beforeEach((to, from, next) => {
		if (process.client) {
			// 设置body高度
			setBodyHeight()
		}
		next()
	})
	if (process.client) {
		window.addEventListener('resize', setRemUnit)
		setRemUnit()
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
