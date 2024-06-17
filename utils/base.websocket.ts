export default class BaseWebSocket {
	private ws: WebSocket | null = null;
	private reconnectTimer: any = null;
	private reconnectCount = 0;
	private reconnectMax = 300;
	private reconnectInterval = 3000;
	private reconnectErrorCallback: (error:Event|null)=>void;
	private reconnectSuccessCallback: any = null;
	private url: string = "";
	private subscribers: any = [];
	constructor(url: string, reconnectErrorCallback: (error:Event|null)=>void = ()=>{}, reconnectSuccessCallback: any|null = null) {
		this.url = url;
        this.reconnectErrorCallback = reconnectErrorCallback;
        this.reconnectSuccessCallback = reconnectSuccessCallback;
	}
	connect() {
		this.ws = new WebSocket(this.url);
		this.ws.onopen = () => {
			this.reconnectCount = 0;
			this.reconnectSuccessCallback && this.reconnectSuccessCallback();
		};
		this.ws.onmessage = (event) => {
            this.notifySubscribers(event.data,null);
		};
		this.ws.onerror = (event) => {
            this.reconnectErrorCallback && this.reconnectErrorCallback(event);
            this.notifySubscribers(null,event);
        };
		this.ws.onclose = (event) => {
            this.notifySubscribers(null,event);
            this.reconnect();
        };
	}
	reconnect() {
		if (this.reconnectCount < this.reconnectMax) {
			this.reconnectCount++;
			this.reconnectTimer = setTimeout(() => {
				this.connect();
			}, this.reconnectInterval);
		} else {
			this.reconnectErrorCallback && this.reconnectErrorCallback(null);
		}
	}
	close() {
		this.ws && this.ws.close();
	}
	send(data: any) {
		this.ws && this.ws.send(data);
	}
	
	destroy() {
		this.ws && this.ws.close();
		this.ws = null;
		this.reconnectTimer && clearTimeout(this.reconnectTimer);
	}
	get isConnected() {
		return this.ws && this.ws.readyState === WebSocket.OPEN;
	}
	get isClosed() {
		return this.ws && this.ws.readyState === WebSocket.CLOSED;
	}
	get isClosing() {
		return this.ws && this.ws.readyState === WebSocket.CLOSING;
	}
	get isConnecting() {
		return this.ws && this.ws.readyState === WebSocket.CONNECTING;
	}
	get isOpen() {
		return this.ws && this.ws.readyState === WebSocket.OPEN;
	}

	subscribe(callback: (data: any,error: Event|null) => void) {
		this.subscribers.push(callback);
	}

	unsubscribe(callback: any) {
		this.subscribers = this.subscribers.filter((sub: any) => sub !== callback);
	}

	notifySubscribers(message: any,error:Event|null) {
		this.subscribers.forEach((callback: (data: any,error: Event|null) => any) => callback(message,error));
	}
}
