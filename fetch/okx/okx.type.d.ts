export enum InstanceType {
	SPOT = 'SPOT', // 币币 现货交易，即用户直接使用一种加密货币购买另一种加密货币，交易完成后资产立即到账，没有杠杆或合约机制
	MARGIN = 'MARGIN', // 币币杠杆 借贷资金进行杠杆交易
	FUTURES = 'FUTURES', // 交割合约 有到期日的合约交易
	SWAP = 'SWAP', // 永续合约 没有到期日的衍生品合约
	OPTION = 'OPTION' // 期权 赋予持有者在未来买入或卖出资产的权利，但无义务
}

export interface Instruments {
	/**
     *  this_week：本周
        next_week：次周
        this_month：本月
        next_month：次月
        quarter：季度
        next_quarter：次季度

        仅适用于交割
        不建议使用，用户应通过 expTime 字段获取合约的交割日期
     */
	alias: string
	// 交易货币币种，如 BTC-USDT中BTC，仅适用于币币/币币杠杆
	baseCcy: string
	// 币种类别（已废弃）
	category: number
	// 合约乘数
	ctMult: string
	// 合约类型
	ctType: string
	// 合约面值
	ctVal: string
	// 合约面值计价币种
	ctValCcy: string
	/**
	 * 产品下线日期 适用于币币/杠杆/交割/永续/期权，对于 交割/期权，为自然的交割/行权日期；如果币币/杠杆/交割/永续产品人工下线，为产品下线日期，有变动就会推送。
	 */
	expTime: string
	// 交易品种，如 BTC-USD，仅适用于交割/永续/期权
	instFamily: string
	// 产品ID，如 BTC-USDT
	instId: string
	// 产品类型
	instType: InstanceType
	// 该产品支持的最大杠杆倍数 不适用于币币/期权。可用来区分币币杠杆和币币
	lever: number
	// 上线日期，仅适用于 交割/永续/期权
	listTime: number
	// 下单数量精度 合约的数量单位是张，现货的数量单位是交易货币
	lotSz: number
	// 冰山委托的单笔最大委托数量 合约的数量单位是张，现货的数量单位是交易货币
	maxIcebergSz: number
	// 限价单的单笔最大美元价值
	maxLmtAmt: number
	// 限价单的单笔最大委托数量 合约的数量单位是张，现货的数量单位是交易货币
	maxLmtSz: number
	// 市价单的单笔最大美元价值 仅适用于币币/币币杠杆
	maxMktAmt: number
	// 时间加权单的单笔最大委托数量 合约的数量单位是张，现货的数量单位是交易货币
	maxMktSz: string
	// 止盈止损市价委托的单笔最大委托数量，合约的数量单位是张，现货的数量单位是USD
	maxStopSz: string
	// 计划委托委托的单笔最大委托数量 合约的数量单位是张，现货的数量单位是交易货币
	maxTriggerSz: number
	// 时间加权单的单笔最大委托数量 合约的数量单位是张，现货的数量单位是交易货币
	maxTwapSz: number
	// 最小下单数 合约的数量单位是张，现货的数量单位是交易货币
	minSz: number
	/**
     *  期权类型
        C：看涨期权
        P：看跌期权
        仅适用于期权
     */
	optType: string
	// 计价货币币种，如 BTC-USDT中USDT，仅适用于币币/币币杠杆
	quoteCcy: string
	// 盈亏结算和保证金币种，如 BTC，仅适用于 交割/永续/期权
	settleCcy: string
	/**
     *  产品状态
        live：交易中
        suspend：暂停中
        expired：已过期
        preopen：预上线，如：交割和期权的新合约在上线之前，会有 preopen 状态
        test：测试中（测试产品，不可交易）
     */
	state: string
	// 行权价格，仅适用于 期权
	stk: string
	// 下单价格精度，如 0.0001 对于期权来说，是梯度中的最小下单价格精度。
	tickSz: number
	// 标的指数，如 BTC-USD，仅适用于交割/永续/期权
	uly: string
	/**
     *  交易规则类型
        normal：普通交易
        pre_market：盘前交易
     */
	ruleType: string
	// 图标
	icon: string
}

export interface SubMsg {
	arg: SubArgs
	op: string
}

export interface SubArgs {
	instId: string
	channel: string
}

export interface SubData {
	event: string
	arg: SubArgs
	code: string
	msg: string
	connId: string
}

export interface SendData {
	arg: SubArgs
	data: any[]
}

export enum CandleCannel {
	candle3M = 'candle3M',
	candle1M = 'candle1M',
	candle1W = 'candle1W',
	candle1D = 'candle1D',
	candle2D = 'candle2D',
	candle3D = 'candle3D',
	candle5D = 'candle5D',
	candle12H = 'candle12H',
	candle6H = 'candle6H',
	candle4H = 'candle4H',
	candle2H = 'candle2H',
	candle1H = 'candle1H',
	candle30m = 'candle30m',
	candle15m = 'candle15m',
	candle5m = 'candle5m',
	candle3m = 'candle3m',
	candle1m = 'candle1m',
	candle1s = 'candle1s',
	candle3Mutc = 'candle3Mutc',
	candle1Mutc = 'candle1Mutc',
	candle1Wutc = 'candle1Wutc',
	candle1Dutc = 'candle1Dutc',
	candle2Dutc = 'candle2Dutc',
	candle3Dutc = 'candle3Dutc',
	candle5Dutc = 'candle5Dutc',
	candle12Hutc = 'candle12Hutc',
	candle6Hutc = 'candle6Hutc'
}

export enum WsChannel {
	public = 'public',
	private = 'private',
	business = 'business'
}

export interface Ticker {
	instType: string //产品类型
	instId: string //产品ID
	last: string //最新成交价
	lastSz: string //最新成交数量
	askPx: string //卖一价
	askSz: string //卖一数量
	bidPx: string //买一价
	bidSz: string //买一数量
	open24h: string //24小时开盘价
	high24h: string //24小时最高价
	low24h: string //24小时最低价
	volCcy24h: string //24小时成交量，以币为单位如果是衍生品合约，数值为交易货币的数量。如果是币币/币币杠杆，数值为计价货币的数量。
	vol24h: string //24小时成交量，以张为单位如果是衍生品合约，数值为合约的张数。如果是币币/币币杠杆，数值为交易货币的数量。
	ts: string //时间戳
	sodUtc0: string //UTC0开盘价
	sodUtc8: string //UTC8开盘价
}
export interface TickersMessage {
	arg: SubArgs
	data: Ticker[]
}

export type Candle = [ts, o, h, l, c, vol, volCcy, volCcyQuote, confirm]
export interface CandleMessage {
	arg: SubArgs
	data: Candle[]
}

export enum Period {
	M5 = '5m',
	H1 = '1H',
	D1 = '1D'
}

interface BookEntry {
	px: number // 价格 (USDT)
	sz: number // 数量 (BTC)
	total: number // 合计 (BTC)
	ratio: number // 占比
}
export interface Books {
	asks: BookEntry[]
	bids: BookEntry[]
	ts: string
}

interface BookResponse {
	asks: [string, string, string][]
	bids: [string, string, string][]
}
export interface BookMessage {
	arg: SubArgs
	action: string
	data: BookResponse[]
}

export interface tradesResponse {
	instId: string
	side: 'sell' | 'buy'
	sz: string
	px: string
	tradeId: string
	ts: string
}

export enum Sides {
	BUY = 'buy',
	SELL = 'sell'
}

export enum OrderType {
	// 订单类型
	MARKET = 'market', // 市价单
	LIMIT = 'limit', //"限价单
	POSTONLY = 'post_only', //只做maker单
	FOK = 'fok', //全部成交或立即取消
	IOC = 'ioc', //立即成交并取消剩余
	OPTIMALLIMITIOC = 'optimal_limit_ioc', //市价委托立即成交并取消剩余（仅适用交割、永续）
	MMP = 'mmp', //做市商保护(仅适用于组合保证金账户模式下的期权订单)
	MMPANDPOSTONLY = 'mmp_and_post_only' //做市商保护且只做maker单(仅适用于组合保证金账户模式下的期权订单)
}
