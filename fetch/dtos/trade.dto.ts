import type { MarketType } from "./symbol.dto"

export interface TradeDto {
	id: number
	orderId: string
	userId: number
	accountId: number
	exchange: string
	symbol: string
	side: 'buy' | 'sell'
	marketType: MarketType
	price: string
	costPrice: string
	lotSize: string
	volume: string
	fee: string
	feeAsset: string
	createdAt: Date
	updatedAt: Date
}

export interface HistoryTradeListDto {
	list: TradeDto[]
	total: number
	page: number
	pageSize: number
}
