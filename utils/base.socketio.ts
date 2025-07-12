import { io, Socket } from 'socket.io-client'

export class BaseSocketIo {
	private socket: Socket | null
	private url: string
	private namespace: string
	private path: string
	private reconnectTimer: NodeJS.Timeout | null = null
	private reconnectInterval: number = 10000
	private onConnectedCallback: (() => void) | null = null

	constructor(url: string, namespace: string = '/', path: string = '') {
		this.url = url
		this.namespace = namespace
		this.path = path
		this.socket = null
	}

	connect(): Socket {
		const fullUrl = `${this.url}${this.namespace}`
        console.log('connect url',fullUrl)
		const socket = io(fullUrl, {
			path: this.path,
			reconnectionAttempts: 5,
			timeout: 5000,
			auth: {
				token: useCookie('token').value
			}
		})

		socket.on('connect', () => {
			console.log(`[WS-CLIENT] Connected: ${socket.id}`)
			if (this.onConnectedCallback) this.onConnectedCallback()
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

	reconnect() {
		this.disconnect()
		setTimeout(() => {
			this.connect()
		}, 300)
	}

	emit(event: string, data: any) {
		this.socket?.emit(event, data)
	}

	on(event: string, callback: (data: any) => void) {
		this.socket?.on(event, callback)
	}

	disconnect() {
		this.socket?.disconnect()
	}

	destroy() {
		this.disconnect()
		this.onConnectedCallback = null
	}
}
