import { accountFetch } from '~/fetch/account.fetch'
import { FetchResultDto } from '~/fetch/dtos/common.dto'
import { MarketType } from '~/fetch/dtos/symbol.dto'
import { exchangeFetch } from '~/fetch/exchange.fetch'
import { InstanceType } from '~/fetch/okx/okx.type.d'
import { symbolsFetch } from '~/fetch/symbols.fetch'
import { userFetch } from '~/fetch/user.fetch'
import { useStore } from '~/store'
import { useAccountStore } from '~/store/account'
import { useSymbolStore } from '~/store/symbol'
import { useUserStore } from '~/store/user'
import { ApiSource } from '~/types/types.d'

function getDefaultSymbols(marketType: MarketType) {
	const symbolStore = useSymbolStore()
	return symbolsFetch
		.list(marketType)
		.then(res => {
			if (res?.data) {
				symbolStore.setSymbols(res.data)
			} else {
				setTimeout(() => {
					getDefaultSymbols(marketType)
				}, 5000)
			}
		})
		.catch(err => {
			console.error(err)
			setTimeout(() => {
				getDefaultSymbols(marketType)
			}, 5000)
		})
}

async function getUser() {
	if (!useCookie('token').value) return
	const result = await userFetch.getUser()
	if (result?.code == FetchResultDto.OK) {
		//console.log('获取用户信息', result.data)
		const user = result.data
		if (user) {
			useUserStore().setUser(user)
		}
	}
}

async function getUserAccounts() {
	if (!useUserStore().user) return
	const result = await accountFetch.list()
	if (result?.code == FetchResultDto.OK) {
		//console.log('获取账户信息', result.data)
		const accounts = result.data
		if (accounts) {
			useAccountStore().setAccounts(accounts)
		}
	}
}

async function getUserFund() {
	if (!useUserStore().user) return
	if (!useAccountStore().accounts?.length) return
	const result = await accountFetch.fund(useAccountStore().currentAccount?.accountId)
	if (result?.code == FetchResultDto.OK) {
		//console.log('获取账户余额', result.data)
		const fund = result.data
		if (fund) {
			useAccountStore().setFund(fund)
		}
	}
}

async function getExchanges() {
	const result = await exchangeFetch.list()
	if (result?.code == FetchResultDto.OK) {
		//console.log('获取交易所信息', result.data)
		const exchanges = result.data
		if (exchanges) {
			useAccountStore().setExchanges(exchanges)
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
				href: '/api/manifest.webmanifest?theme=' + colorMode.value
			}
		]
	})

	if (process.server) {
		await getUser()
		await getExchanges()
		await getUserAccounts()
		await getUserFund()
	}
	if (process.client) {
		const state = useStore()
		if (state.apiSource == ApiSource.OKX) {
			await getDefaultSymbols(MarketType.SPOT)
			await getDefaultSymbols(MarketType.SWAP)
		}
		if(!useUserStore().user) useUserStore().logout()
	}
})
