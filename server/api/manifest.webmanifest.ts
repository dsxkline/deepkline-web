import pwaConfig from '../../config/pwa.config'
export default defineEventHandler(event => {
	const headers = getHeaders(event)
	const host = headers.host || ''
	const cookies = parseCookies(event)
	const theme = cookies['nuxt-color-mode'] || 'dark'
	const languages = cookies.languages || 'en'
    pwaConfig.manifest.theme_color = theme=="dark"?'rgb(2 6 23)':'#ffffff'
    pwaConfig.manifest.background_color = pwaConfig.manifest.theme_color
	return pwaConfig.manifest
})
