/**
 * 市场类型枚举
 * - SPOT: 现货
 * - MARGIN: 杠杆
 * - SWAP: 合约
 * - FUTURES：交割合约
 * - OPTION：期权
 */
// export type MarketType = 'SPOT' | 'MARGIN' | 'SWAP' | 'FUTURES' | 'OPTION'
export enum MarketType {
	SPOT = 'SPOT', // 币币 现货交易，即用户直接使用一种加密货币购买另一种加密货币，交易完成后资产立即到账，没有杠杆或合约机制
	MARGIN = 'MARGIN', // 币币杠杆 借贷资金进行杠杆交易
	FUTURES = 'FUTURES', // 交割合约 有到期日的合约交易
	SWAP = 'SWAP', // 永续合约 没有到期日的衍生品合约
	OPTION = 'OPTION' // 期权 赋予持有者在未来买入或卖出资产的权利，但无义务
}
export interface SymbolDto {
	id: number
	icon: string
	exchange: string

	/**
	 * 交易对标识，如 BTC-USDT
	 */

	symbol: string

	/**
	 * 市场类型：现货 / 杠杆 / 合约 / 交割合约 / 期权
	 */

	marketType: MarketType

	/**
	 * 基础币种（如 BTC）
	 */

	baseCoin: string

	/**
	 * 计价币种（如 USDT）
	 */

	quoteCoin: string

	/**
	 * 合约面值（仅合约用），如 1张 = 0.01 BTC
	 */

	contractSize: string

	/**
	 * 最大杠杆（合约/杠杆才用）
	 */

	maxLeverage: string

	/**
	 * 最小下单数量（张/币）
	 */

	minSz: string

	/**
	 * 价格精度
	 */

	tickSz: string

	/**
	 * 下单数量精度
	 */

	lotSz: string

	/**
	 * 保证金币种（仅合约用）
	 */

	marginCoin: string

	state: 'live' | 'suspend' | 'preopen' | 'test'

	ruleType: 'normal' | 'pre_market'

	swapType: 'linear' | 'inverse'

	swapAlias: 'this_week' | 'next_week' | 'this_month' | 'next_month' | 'quarter' | 'next_quarter' | 'third_quarter'

	swapVal: string

	swapMult: string

	openType: 'fix_price' | 'pre_quote' | 'call_auction'
	/**
	 * 状态是否启用
	 */

	enabled: boolean

	expTime: string

	launchTime: string

	createdAt: Date

	updatedAt: Date
}

export interface MoneyFlowItem {
	buyNum: number
	sellNum: number
	buyAmount: number
	sellAmount: number
	buyRate: number
	sellRate: number
}

export interface MoneyFlowDto {
	total: MoneyFlowItem
	small: MoneyFlowItem
	mid: MoneyFlowItem
	big: MoneyFlowItem
	ultra: MoneyFlowItem
}

export interface MainForceItem {
	absorption: number
	rally: number
	distribution: number
	trap: number
}

export interface MainForceDto {
	symbol: string
	scorer: MainForceItem
}
