import Aegis from 'aegis-web-sdk'
import { useSyncedCookie } from '~/composable/useSyncedCookie'
import { useStore } from '~/store'
import { useUserStore } from '~/store/user'
import { getDeviceId } from '~/utils/device.id'

export default defineNuxtPlugin(async ({ vueApp }) => {
    console.log('Aegis.version', Aegis.version)
	const aegis = new Aegis({
		id: 'O5eKzFQnqkWoLkmE9P', // 上报 id
		uin: useUserStore().user?.id, // 用户唯一 ID（可选）
		reportApiSpeed: true, // 接口测速
		reportAssetSpeed: true, // 静态资源测速
		spa: true, // spa 应用页面跳转的时候开启 pv 计算
		hostUrl: 'https://rumt-sg.com'
	})

    

	const nuxtApp = useNuxtApp()
	nuxtApp.provide('aegis', aegis)
})
