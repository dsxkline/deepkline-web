import type { Instruments, Ticker } from "~/fetch/okx/okx.type";

export default class BaseWebSocket {
	private ws: WebSocket | null = null;
	private reconnectTimer: any = null;
	private reconnectCount = 0;
	private reconnectMax = 30000;
	private reconnectInterval = 5000;
	private reconnectErrorCallback: ((error: Event | null) => void) | null = null;
	private reconnectSuccessCallback: any|null = null;
	private reconnectSuccessFns:(()=>void)[] = [];
	private url: string = "";
	public subscribers: Record<string, any> = {};
	private waitSendDatas: any = [];
	private tickers: Record<string, Ticker> = {};
	private tickersHandler: Record<string, any[]>= {};
	private _connectLevel = 0; // 连接速度等级 0-4 五格信号 10毫秒一个等级 -1 连接中  -2 无连接/连接失败
	// 监听属性set
	public set connectLevel(v : number) {
		this._connectLevel = v;
		// console.log('connectLevel',this.connectLevel)
		this.connectLevelFns.forEach(fn=>fn(this.connectLevel));
	}
	
	public get connectLevel() : number {
		return this._connectLevel;
	}
	
	private connectStateTime = 0; // 连接状态时间，超过多少秒超时主动触发重连
	private connectStateTimeout = 15000
	private connectLevelTime = 0; // 连接速度时间
	private connectLevelFns: ((stateLevel:number) => void)[] = [];
	private heatTimer:NodeJS.Timeout | null = null;
	private heatInterval = 5000; 
	private destroied = false
	constructor(url: string, reconnectErrorCallback?: ((error: Event | null) => void)|null, reconnectSuccessCallback?: any | null) {
		this.url = url;
		this.reconnectErrorCallback = reconnectErrorCallback||null;
		this.reconnectSuccessCallback = reconnectSuccessCallback;
	}
	onSignalState(fn:(stateLevel:number) => void) {
		if(!this.connectLevelFns.includes(fn))this.connectLevelFns.push(fn);
		return this.connectLevel;
	}
	
	// 重连成功执行一次hook
	onReconnectSuccess(fn:()=>void){
		if(!this.reconnectSuccessFns.includes(fn)){
			this.reconnectSuccessFns.push(fn)
		}
	}
	removeReconnectSuccess(fn:()=>void){
		const index = this.reconnectSuccessFns.indexOf(fn)
		if(index>=0){
			this.reconnectSuccessFns.splice(index,1)
		}
	}
	removeReconnectSuccessAll(){
		this.reconnectSuccessFns = []
	}
	

	connect(reset=false) {
		if(this.destroied) return;
		this.connectLevel = -1
		this.ws = new WebSocket(this.url);
		
		this.ws.onopen = () => {
			this.connectLevel = 0
			this.reconnectCount = 0;
			// 重连重新订阅
			if(reset) this.resubscribeAll()
			reset && this.reconnectSuccessFns.forEach(fn=>fn && fn());
			this.reconnectSuccessCallback && this.reconnectSuccessCallback();
			// 没连接成功之前发送的订阅请求
			!reset && this.waitSendDatas.forEach((data: any) => {
				this.send(data);
			});
			this.waitSendDatas = [];
			this.connectStateTime = new Date().getTime()
			this.heatTimer = setInterval(() => {
				this.heart();
				// 检查是否超时
				const now = new Date().getTime()
				const diff = now - this.connectStateTime;
				if(diff>=this.connectStateTimeout){
					console.log('主动触发重连...')
					this.close()
				}
			}, this.heatInterval);
		};
		this.ws.onmessage = (event) => {
			this.connectStateTime = new Date().getTime()
			this.notifySubscribers(event.data, null);
		};
		this.ws.onerror = (event) => {
			if (this.heatTimer) {
				clearInterval(this.heatTimer);
				this.heatTimer = null;
			}
			this.reconnectErrorCallback && this.reconnectErrorCallback(event);
			this.notifySubscribers(null, event);
			this.connectLevel = -2;
		};
		this.ws.onclose = (event) => {
			console.log('主动触发重连... onclose')
			this.connectLevel = -2;
			if (this.heatTimer) {
				clearInterval(this.heatTimer);
				this.heatTimer = null;
			}
			this.notifySubscribers(null, event);
			this.reconnect();
			
		};
	}
	reconnect() {
		if(this.reconnectTimer) clearTimeout(this.reconnectTimer)
		if(this.destroied) return;
		if (this.reconnectCount < this.reconnectMax) {
			this.reconnectCount++;
			this.reconnectTimer = setTimeout(() => {
				this.connectLevel = -1
				this.connect(true);
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
		this.connectLevelTime = new Date().getTime();
		this.ws && this.ws.send(typeof data=='string'?data:JSON.stringify(data));
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
			if(sendDatas)this.send(sendDatas);
		}
		console.log('取消订阅',subId,this.subscribers[subId],this.subscribers)
	}

	// 用于重连后重新订阅
	resubscribeAll(){
		Object.values(this.subscribers).forEach((subscriber: any) => {
			this.send(subscriber.sendDatas);
		});
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
	unsubscribeAll(getSendData?: (subscriber: any) => any) {
		Object.values(this.subscribers).forEach((subscriber: any) => {
			this.unsubscribe(subscriber.subId,getSendData && getSendData(subscriber));
		});
		this.subscribers = {};
	}

	notifySubscribers(message: any, error: Event | null) {
		// 这里判断信号等级
		if (this.connectLevelTime) {
			const now = new Date().getTime();
			const diff = now - this.connectLevelTime;
			if (diff < 20) {
				this.connectLevel = 4;
			} else if (diff < 80) {
				this.connectLevel = 3;
			} else if (diff < 120) {
				this.connectLevel = 2;
			} else if (diff < 200) {
				this.connectLevel = 1;
			} else {
				this.connectLevel = 0;
			}
			this.connectLevelFns.forEach(fn=>fn(this.connectLevel));
			this.connectLevelTime = 0;
			// console.log('this.connectLevel',this.connectLevel,diff)
		}
		if(typeof message === 'string' && message.startsWith('{')) message = JSON.parse(message);
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
			item(ticker,null);
		})
	}
	getTickers(instId:string) {
		return this.tickers[instId];
	}
	addTickerHandler(instId:string,callback: (message: Ticker, error: Event | null) => void) {
		if(!this.tickersHandler[instId])this.tickersHandler[instId]=[]
		this.tickersHandler[instId] = this.tickersHandler[instId].filter(item=>item!=callback)
		this.tickersHandler[instId].push(callback);
	}
	removeTickerHandler(instId:string,callback: (message: Ticker, error: Event | null) => void) {
		// console.log('removeTickerHandler',instId,callback)
		if(!this.tickersHandler[instId]) return;
		this.tickersHandler[instId] = this.tickersHandler[instId].filter(item=>item!=callback)
		// console.log('removeTickerHandler',this.tickersHandler)
	}
	removeAllTickerHandler(){
		this.tickersHandler = {};
	}
	
	heart(){

	}

	destroy() {
		this.destroied = true;
		this.connectLevelFns= []
		this.removeReconnectSuccessAll()
		this.unsubscribeAll()
		this.removeAllTickerHandler()
		this.reconnectErrorCallback = null
		this.reconnectSuccessCallback = null
		this.tickers = {}
		this.ws && this.ws.close();
		this.ws = null;
		this.reconnectTimer && clearTimeout(this.reconnectTimer);
	}
}
