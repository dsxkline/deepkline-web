import { BaseSocketIo } from '~/utils/base.socketio'
export enum MessageEvents {
	SYSTEM = 'system',
	ORDER = 'order',
	NOTICE = 'notice',
	FUND = 'fund',
	POSITION = 'position',
	MARKET_UP_DOWN = 'market-up-down',
	MARKET_SECTOR = 'market-sector',
	MONEY_FLOW = 'money-flow'
}

export default class DKWebSocket extends BaseSocketIo {
	private callbacks: Record<MessageEvents, any[]> = {
		[MessageEvents.SYSTEM]: [],
		[MessageEvents.ORDER]: [],
		[MessageEvents.NOTICE]: [],
		[MessageEvents.FUND]: [],
		[MessageEvents.POSITION]: [],
		[MessageEvents.MARKET_UP_DOWN]: [],
		[MessageEvents.MARKET_SECTOR]: [],
		[MessageEvents.MONEY_FLOW]: []
	}
	constructor(url: string, channel: string = 'public') {
		super(url, '/master', '/v1/' + channel)
	}

	onAll() {
		this.on(MessageEvents.ORDER, this.onOrderMessage)
		this.on(MessageEvents.FUND, this.onFundMessage)
		this.on(MessageEvents.POSITION, this.onPositionMessage)
		this.on(MessageEvents.MARKET_UP_DOWN, this.onMarketUpDownMessage)
		this.on(MessageEvents.MARKET_SECTOR, this.onMarketSectorMessage)
		this.on(MessageEvents.MONEY_FLOW, this.onMoneyFlowMessage)
		this.on('disconnect', this.removeAll)
	}

	private onOrderMessage = (data: any) => {
		this.callbacks[MessageEvents.ORDER]?.forEach(fn => fn(data))
	}
	private onFundMessage = (data: any) => {
		this.callbacks[MessageEvents.FUND]?.forEach(fn => fn(data))
	}
	private onPositionMessage = (data: any) => {
		this.callbacks[MessageEvents.POSITION]?.forEach(fn => fn(data))
	}
	private onMarketUpDownMessage = (data: any) => {
		this.callbacks[MessageEvents.MARKET_UP_DOWN]?.forEach(fn => fn(data))
	}
	private onMarketSectorMessage = (data: any) => {
		this.callbacks[MessageEvents.MARKET_SECTOR]?.forEach(fn => fn(data))
	}
	private onMoneyFlowMessage = (data: any) => {
		this.callbacks[MessageEvents.MONEY_FLOW]?.forEach(fn => fn(data))
	}

	onEvent(event: MessageEvents, cb: (data: any) => void) {
		this.callbacks[event] = this.callbacks[event] || []
		if (!this.callbacks[event].find(fn => fn === cb)) {
			this.callbacks[event].push(cb)
		}
	}

	onOrder(cb: (data: any) => void) {
		this.onEvent(MessageEvents.ORDER, cb)
	}
	onFund(cb: (data: any) => void) {
		this.onEvent(MessageEvents.FUND, cb)
	}
	onPosition(cb: (data: any) => void) {
		this.onEvent(MessageEvents.POSITION, cb)
	}
	onMarketUpDown(cb: (data: any) => void) {
		this.onEvent(MessageEvents.MARKET_UP_DOWN, cb)
	}
	onMarketSectorDown(cb: (data: any) => void) {
		this.onEvent(MessageEvents.MARKET_SECTOR, cb)
	}
	onMoneyFlow(cb: (data: any) => void) {
		this.onEvent(MessageEvents.MONEY_FLOW, cb)
	}
	removeOnEvent(cb: (data: any) => void) {
		Object.keys(this.callbacks).forEach((value: string) => {
			const key = value as MessageEvents
			this.callbacks[key] = this.callbacks[key].filter(fn => fn !== cb)
		})
	}
	removeAll() {
		this.callbacks && Object.keys(this.callbacks).forEach(key => (this.callbacks[key as MessageEvents] = []))
	}
}
