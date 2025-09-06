import { OrderState, type OrderDto } from '~/fetch/dtos/order.dto'
import type { PositionDto } from '~/fetch/dtos/position.dto'

export const useOrderStore = defineStore({
	id: 'order',
	state: () => ({
		orders: [] as OrderDto[],
		positions: [] as PositionDto[],
		assets: [] as PositionDto[],
		symbolPositions: {} as Record<string, PositionDto>
	}),
	actions: {
		addOrder(payload: OrderDto) {
			const exit = this.orders.findIndex(item => item.orderId == payload.orderId)
			// 挂单
			if (payload.state == OrderState.NEW || payload.state == OrderState.LIVE || payload.state == OrderState.PENDING_CANCEL) {
				if (exit < 0) {
					this.orders.unshift(payload)
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
			if (orderIndex >= 0) {
				this.orders[orderIndex] = payload
			}
		},
		addPosition(payload: PositionDto) {
			if (DecimalHelper.compare(payload.lotSize, '>', '0')) this.symbolPositions[payload.symbol] = payload
			// 合约杠杆
			if (parseFloat(payload.leverage)) {
				const exit = this.positions.findIndex(item => item.positionId == payload.positionId)
				if (exit < 0) {
					if (DecimalHelper.compare(payload.lotSize, '>', '0')) this.positions.unshift(payload)
					this.positions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				} else {
					this.positions[exit] = payload
					// 如果交易量为0，已平仓
					if (DecimalHelper.compare(payload.lotSize, '<=', '0')) {
						this.positions.splice(exit, 1)
						this.symbolPositions[payload.symbol] && delete this.symbolPositions[payload.symbol]
					}
				}
			} else {
				// 现货资产
				const exit = this.assets.findIndex(item => item.positionId == payload.positionId)
				if (exit < 0) {
					if (DecimalHelper.compare(payload.lotSize, '>', '0')) this.assets.unshift(payload)
				} else {
					this.assets[exit] = payload
					// 如果交易量为0，已平仓
					if (DecimalHelper.compare(payload.lotSize, '<=', '0')) {
						this.assets.splice(exit, 1)
						this.symbolPositions[payload.symbol] && delete this.symbolPositions[payload.symbol]
					}
				}
			}
		}
	},
	getters: {
		getSymbolPosition: state => (symbol: string) => {
			return state.symbolPositions[symbol]
		}
	}
})
