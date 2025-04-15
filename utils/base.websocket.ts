import type { Instruments, Ticker } from "~/fetch/okx/okx.type";

export default class BaseWebSocket {
	private ws: WebSocket | null = null;
	private reconnectTimer: any = null;
	private reconnectCount = 0;
	private reconnectMax = 300;
	private reconnectInterval = 3000;
	private reconnectErrorCallback: (error: Event | null) => void;
	private reconnectSuccessCallback: any = null;
	private url: string = "";
	public subscribers: Record<string, any> = {};
	private waitSendDatas: any = [];
	private tickers: Record<string, Ticker> = {};
	private tickersHandler: Record<string, any[]>= {};
	constructor(url: string, reconnectErrorCallback: (error: Event | null) => void = () => { }, reconnectSuccessCallback: any | null = null) {
		this.url = url;
		this.reconnectErrorCallback = reconnectErrorCallback;
		this.reconnectSuccessCallback = reconnectSuccessCallback;
	}
	connect() {
		this.ws = new WebSocket(this.url);
		this.ws.onopen = () => {
			this.reconnectCount = 0;
			this.reconnectSuccessCallback && this.reconnectSuccessCallback();
			this.waitSendDatas.forEach((data: any) => {
				this.send(data);
			});
			this.waitSendDatas = [];
		};
		this.ws.onmessage = (event) => {
			this.notifySubscribers(event.data, null);
		};
		this.ws.onerror = (event) => {
			this.reconnectErrorCallback && this.reconnectErrorCallback(event);
			this.notifySubscribers(null, event);
		};
		this.ws.onclose = (event) => {
			this.notifySubscribers(null, event);
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
		if (!this.isConnected) {
			this.waitSendDatas.push(data);
			return;
		}
		this.ws && this.ws.send(JSON.stringify(data));
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

	subscribe(sendDatas: any, tag: Record<string, any>, callback?: (message: any, error: Event | null) => void): string {
		const subId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		this.subscribers[subId] = {
			subId: subId,
			tag: tag,
			sendDatas: sendDatas,
			callback: callback
		};
		this.send(sendDatas);
		return subId;
	}

	unsubscribe(subId: string,sendDatas: any) {
		if (this.subscribers[subId]) {
			delete this.subscribers[subId];
			this.send(sendDatas);
		}
	}

	unsubscribeWithCallBack(callback: (data: any, error: Event | null) => void,sendDatas: any) {
		Object.values(this.subscribers).forEach((subscriber: any) => {
			if (subscriber.callback === callback) {
				this.unsubscribe(subscriber.subId,sendDatas);
			}
		});
	}
	unsubscribeWithTag(tag: Record<string, any>,sendDatas: any) {
		Object.values(this.subscribers).forEach((subscriber: any) => {
			if (subscriber.tag === tag) {
				this.unsubscribe(subscriber.subId,sendDatas);
			}
		});
	}
	/**
	 * 取消订阅
	 * 由上层业务构造取消订阅数据
	 * @param getSendData 上层业务构造器
	 */
	unsubscribeAll(getSendData: (subscriber: any) => any) {
		Object.values(this.subscribers).forEach((subscriber: any) => {
			this.unsubscribe(subscriber.subId,getSendData(subscriber));
		});
		this.subscribers = {};
	}

	notifySubscribers(message: any, error: Event | null) {
		if(typeof message === 'string') message = JSON.parse(message);
		Object.values(this.subscribers).forEach(({ tag, callback }) => {
			const isMatch = this.routerWithTag(tag, message)
			if (!isMatch) return;
			callback && callback(message, error)
		});
	}

	routerWithTag(tag: Record<string, any>, message: any): boolean {
		if (!message) return false;
		if (Object.keys(tag).length === 0) {
			return true;
		}
		const isMatch = Object.keys(tag).every((key) => {
			if (typeof tag[key] === 'object') {
				return this.routerWithTag(tag[key], message[key])
			} else {
				return tag[key] === message[key];
			}
		});
		return isMatch;
	}

	setTickers(instId:string,ticker: Ticker) {
		this.tickers[instId] = ticker;
		this.tickersHandler[instId].forEach((item)=>{
			item.callback(ticker,null);
		})
	}
	getTickers(instId:string) {
		return this.tickers[instId];
	}
	addTickerHandler(instId:string,callback: (message: Ticker, error: Event | null) => void) {
		if(!this.tickersHandler[instId])this.tickersHandler[instId]=[]
		this.tickersHandler[instId] = this.tickersHandler[instId].filter(item=>item!=callback)
		this.tickersHandler[instId].push({instId,callback});
	}
	removeTickerHandler(instId:string,callback: (message: Ticker, error: Event | null) => void) {
		console.log('removeTickerHandler',instId,callback)
		if(!this.tickersHandler[instId]) return;
		this.tickersHandler[instId] = this.tickersHandler[instId].filter(item=>item!=callback)
		console.log('removeTickerHandler',this.tickersHandler)
	}
}
