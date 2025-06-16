import { accountFetch } from '~/fetch/account.fetch'
import { FetchResultDto } from '~/fetch/dtos/common.d'
import { exchangeFetch } from '~/fetch/exchange.fetch'
import { InstanceType } from '~/fetch/okx/okx.type.d'
import { publicFetch } from '~/fetch/public.fetch'
import { userFetch } from '~/fetch/user.fetch'
import { useStore } from '~/store'
import { useSymbolStore } from '~/store/symbol'
import { useUserStore } from '~/store/user'
import { ApiSource } from '~/types/types.d'

function getDefaultInstruments(InstanceType: InstanceType) {
	const symbolStore = useSymbolStore()
	return publicFetch
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

async function getUser() {
	if (!useCookie('token').value) return
	const result = await userFetch.getUser()
	if (result?.code == FetchResultDto.OK) {
		console.log('获取用户信息', result.data)
		const user = result.data
		if (user) {
			user.token = user?.token || useCookie('token').value || ''
			useUserStore().setUser(user)
		}
	}
}

async function getUserAccounts() {
	if (!useUserStore().user) return
	const result = await accountFetch.list()
	if (result?.code == FetchResultDto.OK) {
		console.log('获取账户信息', result.data)
		const accounts = result.data
		if (accounts) {
			useUserStore().setAccounts(accounts)
		}
	}
}

async function getExchanges() {
	const result = await exchangeFetch.list()
	if (result?.code == FetchResultDto.OK) {
		console.log('获取交易所信息', result.data)
		const exchanges = result.data
		if (exchanges) {
			useUserStore().setExchanges(exchanges)
		}
	}
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
		meta: [{ name: 'theme-color', content: colorMode.value == 'dark' ? '#1e0b2c' : '#ffffff' }],
		link: [
			{
				rel: 'manifest',
				href: '/api/manifest.webmanifest?theme='+colorMode.value
			}
		]
	})

	if (process.client) {
		await getUser()
		await getExchanges()
		await getUserAccounts()
		const state = useStore()
		if (state.apiSource == ApiSource.OKX) {
			await getDefaultInstruments(InstanceType.SPOT)
			await getDefaultInstruments(InstanceType.SWAP)
		}
	}
})
