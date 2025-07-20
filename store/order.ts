import { OrderState, type OrderDto } from '~/fetch/dtos/order.dto'
import type { PositionDto } from '~/fetch/dtos/position.dto'

export const useOrderStore = defineStore({
	id: 'order',
	state: () => ({
		orders: [] as OrderDto[],
		positions: [] as PositionDto[],
		assets: [] as PositionDto[]
	}),
	actions: {
		addOrder(payload: OrderDto) {
			const exit = this.orders.findIndex(item => item.orderId == payload.orderId)
			// 挂单
			if (payload.state == OrderState.NEW || payload.state == OrderState.LIVE || payload.state == OrderState.PENDING_CANCEL) {
				if (exit < 0) {
					this.orders.push(payload)
					this.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				} else {
					this.orders[exit] = payload
				}
			} else {
				if (exit >= 0) this.orders = this.orders.filter(item => item.orderId != payload.orderId)
			}
		},
		updateOrder(payload: OrderDto) {
			const orderIndex = this.orders.findIndex(item => item.orderId == payload.orderId)
            if(orderIndex>=0){
                this.orders[orderIndex] = payload
            }
		},
		addPosition(payload: PositionDto) {
			// 合约杠杆
			if (parseFloat(payload.leverage)) {
				const exit = this.positions.findIndex(item => item.positionId == payload.positionId)
				if (exit < 0) this.positions.push(payload)
				else {
					this.positions[exit] = payload
				}
			} else {
				// 现货资产
				const exit = this.assets.findIndex(item => item.positionId == payload.positionId)
				if (exit < 0) this.assets.push(payload)
				else {
					this.assets[exit] = payload
				}
			}
		}
	},
	getters: {}
})
