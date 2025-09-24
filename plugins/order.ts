import { defineNuxtPlugin } from '#app'
import type { FundDto } from '~/fetch/dtos/account.dto'
import type { OrderDto } from '~/fetch/dtos/order.dto'
import type { PositionDto } from '~/fetch/dtos/position.dto'
import { useAccountStore } from '~/store/account'
import { useOrderStore } from '~/store/order'
import { useSymbolStore } from '~/store/symbol'
import { useUserStore } from '~/store/user'
import type { WsResult } from '~/types/types'
const orderHandle = (data: WsResult<OrderDto>) => {
	const { $i18n } = useNuxtApp()
	//console.log('收到订单推送信息', data)
	if(!useUserStore().user) return
	if(!useAccountStore().currentAccount?.accountId) return
	const order = data.payload
	const symbolObj = useSymbolStore().getSymbol(order?.symbol)
	if (order.state == 'filled') {
		// 成交通知
		ElMessage.success($i18n.t('挂单已成交，成交价为') + formatPrice(order.matchPrice, symbolObj.tickSz))
	}
    data?.payload && useOrderStore().addOrder(data.payload)
}
const fundHandle = (data: WsResult<FundDto>) => {
	if(!useUserStore().user) return
	if(!useAccountStore().currentAccount?.accountId) return
	// console.log('收到资产推送信息', data)
	data?.payload && useAccountStore().setFund(data.payload)
}

const positionHandle = (data: WsResult<PositionDto>) => {
	if(!useUserStore().user) return
	if(!useAccountStore().currentAccount?.accountId) return
	//console.log('收到持仓推送信息', data)
	data?.payload && useOrderStore().addPosition(data.payload)
}

const beforeunload = () => {
	useNuxtApp().$dkws.removeOnEvent(orderHandle)
	useNuxtApp().$dkws.removeOnEvent(fundHandle)
	useNuxtApp().$dkws.removeOnEvent(positionHandle)
    useNuxtApp().$dkws.destroy()
}

export default defineNuxtPlugin(({ vueApp }) => {
	if (process.client) {
		useNuxtApp().$dkws.onOrder(orderHandle)
		useNuxtApp().$dkws.onFund(fundHandle)
		useNuxtApp().$dkws.onPosition(positionHandle)
		window.addEventListener('beforeunload', beforeunload)
	}
})
