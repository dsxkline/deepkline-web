import type { OrderDto } from '~/fetch/dtos/order.dto'
import type { PositionDto } from '~/fetch/dtos/position.dto'

export const useOrderStore = defineStore({
	id: 'order',
	state: () => ({
		orders: [] as OrderDto[],
		positions: [] as PositionDto[]
	}),
	actions: {
		addOrder(payload: OrderDto) {
			const exit = this.orders.findIndex(item => item.orderId == payload.orderId)
			if (!exit) this.orders.push(payload)
			else {
				this.orders[exit] = payload
			}
		},
		addPosition(payload: PositionDto) {
			const exit = this.positions.findIndex(item => item.positionId == payload.positionId)
			if (!exit) this.positions.push(payload)
			else {
				this.positions[exit] = payload
			}
		}
	},
	getters: {}
})
