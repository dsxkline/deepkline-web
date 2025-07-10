import { BaseSocketIo } from '~/utils/base.socketio'
export default class DKWebSocket extends BaseSocketIo {
	private orderCallbacks: any[] = []
    private fundCallbacks: any[] = []
	constructor(url:string, channel: string = 'public') {
		super(url, '/master', '/v1/' + channel)
	}

	onAll() {
		this.on('order', this.onOrderMessage)
        this.on('fund', this.onFundMessage)
		this.on('disconnect', this.removeAll)
	}

	private onOrderMessage = (data: any) => {
		this.orderCallbacks?.forEach(fn => fn(data))
	}
    private onFundMessage = (data: any) => {
		this.fundCallbacks?.forEach(fn => fn(data))
	}

	onOrder(cb: (data: any) => void) {
		if (!this.orderCallbacks.find(fn => fn === cb)) {
			this.orderCallbacks.push(cb)
		}
		console.log('onOrder', cb, this.orderCallbacks)
	}
    onFund(cb: (data: any) => void) {
		if (!this.fundCallbacks.find(fn => fn === cb)) {
			this.fundCallbacks.push(cb)
		}
		console.log('onFund', cb, this.fundCallbacks)
	}
	removeOnEvent(cb: (data: any) => void) {
		this.orderCallbacks = this.orderCallbacks.filter(fn => fn != cb)
        this.fundCallbacks = this.fundCallbacks.filter(fn => fn != cb)
	}
	removeAll() {
		this.orderCallbacks = []
	}
}
