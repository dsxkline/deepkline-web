export enum AccountEnvType {
	REAL = 1,
	DEMO = 0
}
export interface AccountDto {
	id: number // 主键
	accountId: number // 账户ID
	userId: number // 用户 ID
	exchange: string // 交易所标识，如 'okx'
	accountName?: string // 账号备注名（可选）
	apiKey: string // API Key（通常加密存储，不应在前端返回）
	apiSecret: string // API Secret（通常加密存储）
	apiPassphrase?: string // API passphrase（如 OKX 必须）
	status: 0 | 1 | 2 // 状态：0=禁用，1=启用，2=异常
	isCurrent: boolean // 是否为当前使用账号
	bindTime: string // 绑定时间（ISO 格式）
	lastSyncTime?: string // 最后同步时间
	createdAt: string // 创建时间
	updatedAt: string // 更新时间
	currency: string // 账户货币（如 'USD', 'USDT' 等）
	initialAmount: string // 初始金额（可选）
	envType: AccountEnvType
	total: number
	profit: number
	profitRate: number
	config: AccountConfigDto
}

export interface AccountConfigDto {
	mode: number
	safeMode: 'cancel_maker' | 'cancel_taker' | 'cancel_both'
	posMode: 'long_short_mode' | 'net_mode'
	ctIsoMode: 'automatic' | 'autonomy'
	roleType: number
	autoLoan: boolean
	level: string
	spotTakerFee: number
	spotMakerFee: number
	swapTakerFee: number
	swapMakerFee: number
}

export interface FundDto {
	currency: string
	balance: string
	frozen: string
	available: string
	total: string
	margin: string
	marginAvailable: string
	unrealizedPnl: string
	realizedPnl: string
	lastSyncTime: Date | null
	profit: string
	profitRate: string
}

export enum FundLogType {
	INITIAL_FUND = 'initial_fund', // 初始资金
	ORDER_FROZEN = 'order_frozen', // 挂单冻结
	DEPOSIT = 'deposit', // 充值
	WITHDRAW = 'withdraw', // 提现
	TRANSFER_IN = 'transfer_in', // 转入
	TRANSFER_OUT = 'transfer_out', // 转出
	TRADE_OPEN = 'trade_open', // 开仓
	TRADE_CLOSE = 'trade_close', // 平仓
	FEE = 'fee', // 手续费
	ADJUST = 'adjust', // 人工调账
	FREEZE = 'freeze', // 冻结
	UNFREEZE = 'unfreeze', // 解冻
	REBATE = 'rebate', // 返佣
	LIQUIDATION = 'liquidation' // 强平
}
export interface FundLogsDto {
	id: number
	userId: number
	accountId: number | null
	exchange: string
	symbol: string
	changeType: FundLogType
	side: string
	amount: string
	balanceBefore: string
	balanceAfter: string
	remark?: string
	createdAt: Date
	updatedAt: Date
}

export interface FundLogsListDto {
	list: FundLogsDto[]
	total: number
	page: number
	pageSize: number
}
