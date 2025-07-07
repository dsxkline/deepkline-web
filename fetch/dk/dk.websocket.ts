import { BaseSocketIo } from '~/utils/base.socketio'
export default class DKWebSocket extends BaseSocketIo {
	private orderCallbacks: any[] = []
	constructor(url:string, channel: string = 'public') {
		super(url, '/master', '/v1/' + channel)
	}

	onAll() {
		this.on('order', this.onOrderMessage)
		this.on('disconnect', this.removeAll)
	}

	private onOrderMessage = (data: any) => {
		this.orderCallbacks?.forEach(fn => fn(data))
	}

	onOrder(cb: (data: any) => void) {
		if (!this.orderCallbacks.find(fn => fn === cb)) {
			this.orderCallbacks.push(cb)
		}
		console.log('onOrder', cb, this.orderCallbacks)
	}
	removeOnOrder(cb: (data: any) => void) {
		this.orderCallbacks = this.orderCallbacks.filter(fn => fn != cb)
	}
	removeAll() {
		this.orderCallbacks = []
	}
}
