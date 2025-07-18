import { defineNuxtPlugin } from '#app'
import type { FundDto } from '~/fetch/dtos/account.dto'
import type { OrderDto } from '~/fetch/dtos/order.dto'
import { useAccountStore } from '~/store/account'
import type { WsResult } from '~/types/types'
const orderHandle = (data: WsResult<OrderDto>) => {
	console.log('收到订单推送信息', data)
}
const fundHandle = (data: WsResult<FundDto>) => {
	console.log('收到资产推送信息', data)
	data?.payload && useAccountStore().setFund(data.payload)
}

const beforeunload = () => {
	useNuxtApp().$dkws.removeOnEvent(orderHandle)
	useNuxtApp().$dkws.removeOnEvent(fundHandle)
}

export default defineNuxtPlugin(({ vueApp }) => {
	if (process.client) {
		useNuxtApp().$dkws.onOrder(orderHandle)
		useNuxtApp().$dkws.onFund(fundHandle)
		window.addEventListener('beforeunload', beforeunload)
	}
})
