import VConsole from 'vconsole'

export default defineNuxtPlugin(({ vueApp }) => {
	if (process.client) new VConsole()
	if (process.env.NODE_ENV === 'development') {
		if (process.client) {
			new VConsole()
		}
	}
})
