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
}

export interface AccountDetailDto {
	ccy: string
	availBal: string
	availEq: string
	borrowFroz: string
	cashBal: string
	crossLiab: string
	collateralEnabled: boolean
	collateralRestrict: boolean
	colBorrAutoConversion: string
	disEq: string
	eq: string
	eqUsd: string
	smtSyncEq: string
	spotCopyTradingEq: string
	fixedBal: string
	frozenBal: string
	imr: string
	interest: string
	isoEq: string
	isoLiab: string
	isoUpl: string
	liab: string
	maxLoan: string
	mgnRatio: string
	mmr: string
	notionalLever: string
	ordFrozen: string
	rewardBal: string
	spotInUseAmt: string
	clSpotInUseAmt: string
	maxSpotInUse: string
	spotIsoBal: string
	stgyEq: string
	twap: string
	uTime: string
	upl: string
	uplLiab: string
	spotBal: string
	openAvgPx: string
	accAvgPx: string
	spotUpl: string
	spotUplRatio: string
	totalPnl: string
	totalPnlRatio: string
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
	profit: number
	profitRate: number
}
