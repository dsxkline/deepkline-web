import { defineNuxtPlugin } from '#app'
import DKWebSocket from '~/fetch/dk/dk.websocket'
import OKXWebSocket from '~/fetch/okx/okx.websocket'
import { useAccountStore } from '~/store/account'
export default defineNuxtPlugin(({ vueApp }) => {
	const nuxtApp = useNuxtApp()
	const ws = new OKXWebSocket()
	ws.connect()
	const wsb = OKXWebSocket.createBusiness()
	wsb.connect()
	const dkws = new DKWebSocket(nuxtApp.$config.public.BASE_WS_URL)
	dkws.connect(useAccountStore().currentAccount?.accountId)
	// console.log('ws连接',wsb.isConnected);
	nuxtApp.provide('ws', ws)
	nuxtApp.provide('wsb', wsb)
	nuxtApp.provide('dkws', dkws)
})
