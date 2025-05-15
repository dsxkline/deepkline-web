const isMobleHandle = (userAgent:string)=>{
    return /mobile|android|iphone|ipad|phone/i.test(userAgent.toLocaleLowerCase())
}
const updateMobileState = ()=>{
    useNuxtApp().$isMobile.value = isMobleHandle(window.navigator.userAgent)
    console.log('useNuxtApp().$isMobile',useNuxtApp().$isMobile.value)
}
export default defineNuxtPlugin(nuxtApp => {
		const userAgent = (process.server?nuxtApp.ssrContext?.event?.node?.req.headers['user-agent']:window.navigator.userAgent) || ''
		const isMobile = ref(isMobleHandle(userAgent))
		console.log('是否移动端', isMobile, userAgent)
        if(process.client){
            window.addEventListener('resize', updateMobileState)
            // 监听页面卸载事件
            window.addEventListener('beforeunload', () => {
                window.removeEventListener('resize', updateMobileState)
            })
        }
		// 提供全局可用值
		return {
			provide: {
				isMobile
			}
		}
	
})
