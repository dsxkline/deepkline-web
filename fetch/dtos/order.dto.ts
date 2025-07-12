export interface AddOrderDto {
	accountId: number
	symbol: string
	side: 'buy' | 'sell'
	orderType: 'limit' | 'market' | 'stop_limit' | 'stop_market' | 'trailing_stop'
	price: string
	marginMode: 'crossed' | 'isolated'
	leverage: string
	// 数量
	lotSize: string
	// 金额
	margin: string
	openTakeProfit: boolean
	openStopLoss: boolean
	takeProfitPrice: string | null
	stopLossPrice: string | null
}

export interface AddOrderRespDto {
	orderId: string
	ts: string
}

export interface OrderDto {
	accountId: number
	createdAt: string
	endAt: string
	exchange: string
	leverage: string
	lotSize: string
	margin: string
	marginMode: 'crossed' | 'isolated'
	openStopLoss: boolean
	openTakeProfit: boolean
	orderId: string
	orderType: 'limit' | 'market' | 'stop_limit' | 'stop_market' | 'trailing_stop'
	price: string
	side: 'buy' | 'sell'
	state: 'new' | 'filled' | 'canceled' | 'partially_filled' | 'expired' | 'live' | 'mmp_canceled' | 'pending_cancel' | 'rejected' | 'triggered' | 'stopped' | 'failed'
	stopLossPrice: string
	symbol: string
	takeProfitPrice: string
	updatedAt: string
	userId: number,
	msg:string
}
