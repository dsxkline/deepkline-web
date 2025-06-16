import pwaConfig from '../../config/pwa.config'
export default defineEventHandler(event => {
	const query = getQuery(event)
	const headers = getHeaders(event)
	const host = headers.host || ''
	const cookies = parseCookies(event)
	// console.log('cookies',cookies,headers)
	const theme = query['theme'] || cookies['nuxt-color-mode'] || 'dark'
	const languages = cookies.languages || 'en'
    pwaConfig.manifest.theme_color = theme=="dark"?'#1e0b2c':'#ffffff'
    pwaConfig.manifest.background_color = pwaConfig.manifest.theme_color
	return pwaConfig.manifest
})
