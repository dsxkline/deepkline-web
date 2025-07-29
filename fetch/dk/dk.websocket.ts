import { BaseSocketIo } from '~/utils/base.socketio'
export enum MessageType {
	SYSTEM = 'system',
	ORDER = 'order',
	NOTICE = 'notice',
	FUND = 'fund',
	POSITION = 'position',
	MARKET_UP_DOWN = 'market-up-down'
}

export default class DKWebSocket extends BaseSocketIo {
	private callbacks: Record<MessageType, any[]> = {
		[MessageType.SYSTEM]: [],
		[MessageType.ORDER]: [],
		[MessageType.NOTICE]: [],
		[MessageType.FUND]: [],
		[MessageType.POSITION]: [],
		[MessageType.MARKET_UP_DOWN]: []
	}
	constructor(url: string, channel: string = 'public') {
		super(url, '/master', '/v1/' + channel)
	}

	onAll() {
		this.on(MessageType.ORDER, this.onOrderMessage)
		this.on(MessageType.FUND, this.onFundMessage)
		this.on(MessageType.POSITION, this.onPositionMessage)
		this.on(MessageType.MARKET_UP_DOWN, this.onMarketUpDownMessage)
		this.on('disconnect', this.removeAll)
	}

	private onOrderMessage = (data: any) => {
		this.callbacks[MessageType.ORDER]?.forEach(fn => fn(data))
	}
	private onFundMessage = (data: any) => {
		this.callbacks[MessageType.FUND]?.forEach(fn => fn(data))
	}
	private onPositionMessage = (data: any) => {
		this.callbacks[MessageType.POSITION]?.forEach(fn => fn(data))
	}
	private onMarketUpDownMessage = (data: any) => {
		this.callbacks[MessageType.MARKET_UP_DOWN]?.forEach(fn => fn(data))
	}

	onEvent(event: MessageType, cb: (data: any) => void) {
		this.callbacks[event] = this.callbacks[event] || []
		if (!this.callbacks[event].find(fn => fn === cb)) {
			this.callbacks[event].push(cb)
		}
	}

	onOrder(cb: (data: any) => void) {
		this.onEvent(MessageType.ORDER, cb)
	}
	onFund(cb: (data: any) => void) {
		this.onEvent(MessageType.FUND, cb)
	}
	onPosition(cb: (data: any) => void) {
		this.onEvent(MessageType.POSITION, cb)
	}
	onMarketUpDown(cb: (data: any) => void) {
		this.onEvent(MessageType.MARKET_UP_DOWN, cb)
	}
	removeOnEvent(cb: (data: any) => void) {
		Object.keys(this.callbacks).forEach((value: string) => {
			const key = value as MessageType
			this.callbacks[key] = this.callbacks[key].filter(fn => fn !== cb)
		})
	}
	removeAll() {
		Object.keys(this.callbacks).forEach(key => (this.callbacks[key as MessageType] = []))
	}
}
