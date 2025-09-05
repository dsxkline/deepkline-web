import { useStore } from '~/store'
import { SafeArea, initialize } from '@capacitor-community/safe-area'
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
	const designWidth = window.innerWidth > 999 ? window.innerWidth : 400 // 设计稿宽度

	const html = document.documentElement
	const width = html.clientWidth

	const rem = Math.max(baseSize, Math.min((width / designWidth) * baseSize, 20)) // 限制最大值为 20px
	html.style.fontSize = rem + 'px'
}

function setSafeAreaChange(data: any) {
	try {
		console.log('Safe area insets:', data)
		document.documentElement.style.setProperty('--safe-top', data.top + 'px')
		document.documentElement.style.setProperty('--safe-bottom', Math.min(data.bottom, 10 * devicePixelRatio) + 'px')
	} catch (e) {
		console.error('Failed to parse safe area data', e)
	}
	window.removeEventListener('safeAreaChange', setSafeAreaChange)
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
		initialize()
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

		window.addEventListener('safeAreaChange', setSafeAreaChange)
	}
})
