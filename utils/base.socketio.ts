import { io, Socket } from 'socket.io-client'
import { useSyncedCookie } from '~/composable/useSyncedCookie'

export class BaseSocketIo {
	private socket: Socket | null
	private url: string
	private namespace: string
	private path: string
	private reconnectTimer: NodeJS.Timeout | null = null
	private reconnectInterval: number = 10000
	private onConnectedCallback: (() => void) | null = null
	private subscribeEvents: Record<string, { event: string; symbol?: string }> = {}
	constructor(url: string, namespace: string = '/', path: string = '') {
		this.url = url
		this.namespace = namespace
		this.path = path
		this.socket = null
	}

	connect(accountId?: number): Socket {
		const fullUrl = `${this.url}${this.namespace}`
		//console.log('connect url', fullUrl, accountId)
		const socket = io(fullUrl, {
			transports: ['websocket'],
			path: this.path,
			timeout: 5000,
			auth: {
				token: useSyncedCookie('token').value,
				accountId
			}
		})

		socket.on('connect', () => {
			console.log(`[WS-CLIENT] Connected: ${socket.id}`)
			if (this.onConnectedCallback) this.onConnectedCallback()
			this.reSubscribes()
		})

		socket.on('connect_error', err => {
			console.error(err)
			console.error(`[WS-CLIENT] Connection error: ${err.message}`)
			// this.reconnectOnError()
		})

		socket.on('disconnect', reason => {
			console.warn(`[WS-CLIENT] Disconnected: ${reason}`)
		})
		this.socket = socket
		this.onAll()
		return socket
	}

	onConnected(cb: () => void) {
		this.onConnectedCallback = cb
	}

	onAll() {
		console.log('please implement the method onAll')
	}

	reconnectOnError() {
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
		this.reconnectTimer = setTimeout(() => {
			this.connect()
		}, this.reconnectInterval)
	}

	reconnect(accountId?: number) {
		this.disconnect()
		setTimeout(() => {
			this.connect(accountId)
		}, 300)
	}

	emit(event: string, data: any) {
		this.socket?.emit(event, data)
	}

	on(event: string, callback: (data: any) => void) {
		this.socket?.on(event, callback)
	}
	off(event: string) {
		this.socket?.off(event)
	}

	subscribe(event: string, symbol?: string) {
		this.emit('subscribe', {
			event,
			symbol
		})
		const room = event + (symbol || '')
		this.subscribeEvents[room] = {
			event,
			symbol
		}
	}
	unSubscribe(event: string, symbol?: string) {
		this.emit('unsubscribe', {
			event,
			symbol
		})
		const room = event + (symbol || '')
		if (this.subscribeEvents[room]) delete this.subscribeEvents[room]
	}

	reSubscribes() {
		for (const room of Object.values(this.subscribeEvents)) {
			this.subscribe(room.event, room.symbol)
		}
	}

	disconnect() {
		this.socket?.disconnect()
	}

	destroy() {
		this.disconnect()
		this.onConnectedCallback = null
	}
}
