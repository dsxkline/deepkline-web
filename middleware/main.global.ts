import { FetchResultDto } from '~/fetch/dtos/common.d'
import { InstanceType } from '~/fetch/okx/okx.type.d'
import { publicFetch } from '~/fetch/public.fetch'
import { userFetch } from '~/fetch/user.fetch'
import { useStore } from '~/store'
import { useSymbolStore } from '~/store/symbol'
import { useUserStore } from '~/store/user'
import { ApiSource } from '~/types/types.d'

function getDefaultInstruments(InstanceType: InstanceType) {
	const symbolStore = useSymbolStore()
	publicFetch
		.getInstruments(InstanceType)
		.then(res => {
			if (res?.data) {
				symbolStore.setSymbols(res.data)
			} else {
				setTimeout(() => {
					getDefaultInstruments(InstanceType)
				}, 5000)
			}
		})
		.catch(err => {
			console.error(err)
			setTimeout(() => {
				getDefaultInstruments(InstanceType)
			}, 5000)
		})
}

export default defineNuxtRouteMiddleware(async (to, from) => {
	// 服务端渲染主题
	const colorMode = useCookie('nuxt-color-mode', { default: () => 'dark' })
	// console.log('colorMode', colorMode.value)
	useStore().setTheme(colorMode.value)
	useHead({
		htmlAttrs: {
			class: colorMode.value
		},
		meta: [{ name: 'theme-color', content: colorMode.value == 'dark' ? '#1e0b2c' : '#ffffff' }]
	})

	if (process.client) {
		const result = await userFetch.getUser()
		if (result?.code == FetchResultDto.OK) {
			console.log('获取用户信息', result.data)
			const user = result.data
			if (user) {
				user.token = user?.token || useCookie('token').value || ''
				useUserStore().setUser(user)
			}
		}
		const state = useStore()
		if (state.apiSource == ApiSource.OKX) {
			getDefaultInstruments(InstanceType.SPOT)
			getDefaultInstruments(InstanceType.SWAP)
		}
	}
})
