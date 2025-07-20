import type { MarketType } from './symbol.dto'

export interface PositionDto {
	id: number

	positionId: number

	userId: number // 用户ID，关联用户表

	exchange: string // 交易所标识，如 okx, binance

	accountId: number // 账户ID，关联用户的账户

	symbol: string // BTC-USDT...

	side: 'buy' | 'sell' // 交易方向

	marginMode: 'crossed' | 'isolated' // 保证金模式（逐仓/全仓）

	leverage: string // 杠杆倍数（数据库 decimal 类型，转为 string）

	available: string // 可用资产/持仓量

	frozen: string // 冻结资产/持仓量（委托未成交时冻结）

	margin: string // 占用保证金

	balance: string // 余额（含浮动）

	profit: string // 浮动收益（如有保证金）

	costPrice: string // 成本价

	openPrice: string // 开仓均价

	lotSize: string // 仓位数量/持仓量

	openTakeProfit: boolean // 是否开启止盈

	openStopLoss: boolean // 是否开启止损

	takeProfitPrice: string | null // 止盈触发价格

	stopLossPrice: string | null // 止损触发价格

	lastSyncTime: Date | null // 最后同步时间

	createdAt: Date // 创建时间

	updatedAt: Date | null // 更新时间

	marketType: MarketType
}
