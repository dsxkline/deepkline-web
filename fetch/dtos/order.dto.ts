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
