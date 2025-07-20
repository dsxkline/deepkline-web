import { BaseSocketIo } from '~/utils/base.socketio'
export default class DKWebSocket extends BaseSocketIo {
	private orderCallbacks: any[] = []
    private fundCallbacks: any[] = []
	private positionCallbacks : any[] = []
	constructor(url:string, channel: string = 'public') {
		super(url, '/master', '/v1/' + channel)
	}

	onAll() {
		this.on('order', this.onOrderMessage)
        this.on('fund', this.onFundMessage)
		this.on('position',this.onPositionMessage)
		this.on('disconnect', this.removeAll)
	}

	private onOrderMessage = (data: any) => {
		this.orderCallbacks?.forEach(fn => fn(data))
	}
    private onFundMessage = (data: any) => {
		this.fundCallbacks?.forEach(fn => fn(data))
	}
	private onPositionMessage = (data: any) => {
		this.positionCallbacks?.forEach(fn => fn(data))
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
	onPosition(cb: (data: any) => void) {
		if (!this.positionCallbacks.find(fn => fn === cb)) {
			this.positionCallbacks.push(cb)
		}
		console.log('onPosition', cb, this.positionCallbacks)
	}
	removeOnEvent(cb: (data: any) => void) {
		this.orderCallbacks = this.orderCallbacks.filter(fn => fn != cb)
        this.fundCallbacks = this.fundCallbacks.filter(fn => fn != cb)
		this.positionCallbacks = this.positionCallbacks.filter(fn => fn != cb)
	}
	removeAll() {
		this.orderCallbacks = []
	}
}
