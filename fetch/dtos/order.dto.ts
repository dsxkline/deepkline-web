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
	NEW = 'new',
	FILLED = 'filled',
	CANCEL = 'cancel',
	CANCELED = 'canceled',
	PARTIALLY_FILLED = 'partially_filled',
	EXPIRED = 'expired',
	LIVE = 'live',
	MMP_CANCELED = 'mmp_canceled',
	PENDING_CANCEL = 'pending_cancel',
	REJECTED = 'rejected',
	TRIGGERED = 'triggered',
	STOPPED = 'stopped',
	FAILED = 'failed'
}