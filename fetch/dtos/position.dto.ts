import type { MarketType } from './symbol.dto'

export enum PositionStatus {
	OPEN = 'open', // 持仓中
	CLOSED = 'closed', // 已平仓
	LIQUIDATING = 'liquidating', // 强制平仓中
	LIQUIDATED = 'liquidated', // 已爆仓/强平完成
	PARTIALLY_CLOSED = 'partially_closed', // 部分平仓
	FROZEN = 'frozen' // 冻结（因挂单占用或风控）
}
export interface PositionDto {
	id: number
	positionId: string
	userId: number // 用户ID，关联用户表
	exchange: string // 交易所标识，如 okx, binance
	accountId: number // 账户ID，关联用户的账户
	symbol: string // BTC-USDT...
	side: 'buy' | 'sell' // 交易方向
	marginMode: 'cross' | 'isolated' // 保证金模式（逐仓/全仓）
	leverage: string // 杠杆倍数（数据库 decimal 类型，转为 string）
	margin: string // 占用保证金
	profit: string // 浮动收益（如有保证金）
	profitRate: string
	costPrice: string // 成本价
	lastPrice: string // 最新价
	closePrice: string // 平仓均价
	lotSize: string // 仓位数量/持仓量
	lotForce: string // 强平数量
	lotTotal: string // 最大持仓量
	lotBalance: string
	lotAvailable: string // 可用
	lotTakeSize: string
	lotLossSize: string
	openTakeProfit: boolean // 是否开启止盈
	openStopLoss: boolean // 是否开启止损
	takeProfitPrice: string | null // 止盈触发价格
	stopLossPrice: string | null // 止损触发价格
	lastSyncTime: Date | null // 最后同步时间
	createdAt: Date // 创建时间
	updatedAt: Date // 更新时间
	closeAt: Date
	marketType: MarketType
	status:PositionStatus
}

export interface HistoryPositionDto {
	list: PositionDto[]
	total: number
	page: number
	pageSize: number
}
