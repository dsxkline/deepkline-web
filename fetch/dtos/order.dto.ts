import type { MarketType } from './symbol.dto'

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
	marginMode: 'cross' | 'isolated'
	openStopLoss: boolean
	openTakeProfit: boolean
	orderId: string
	orderType: 'limit' | 'market' | 'stop_limit' | 'stop_market' | 'trailing_stop'
	price: string
	side: 'buy' | 'sell'
	state: OrderState
	stopLossPrice: string
	symbol: string
	takeProfitPrice: string
	updatedAt: string
	userId: number
	msg: string
	matchPrice: string
	matchSize: string
	marketType: MarketType
}

export enum OrderState {
	NEW = 'new', // 新订单挂单
	FILLED = 'filled', // 全部成交
	CANCELED = 'canceled', // 已撤销
	PARTIALLY_FILLED = 'partially_filled', // 部分成交
	EXPIRED = 'expired', // 过期
	LIVE = 'live', // 等待成交
	PENDING_CANCEL = 'pending_cancel', // 撤销中
	REJECTED = 'rejected', // 拒绝(下单失败)
	STOPPED = 'stopped', // 已停止
	FAILED = 'failed' // 下单失败
}