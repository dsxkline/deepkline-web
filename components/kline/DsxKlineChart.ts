import moment from 'moment'
import { DsxConfig, DsxKline, type DsxKlineConfig, type DsxWindow } from './DsxKlineChart.d'
import { ComposFetch } from '~/fetch'
import KlineTheme from './DsxKlineChartTheme'
import { CandleCannel } from '~/fetch/okx/okx.type.d'
import { useSymbolStore } from '~/store/symbol'
import { useKlineStore } from '~/store/kline'
declare var window: DsxWindow

class DsxKlineChart {
	kline!: DsxKline
	config: DsxKlineConfig
	symbol: string
	cycle?: string
	after?: string
	before?: string
	limit: number = 300
	theme?: string
	sides: string[] = ['MACD','KDJ','RSI']
	main: string[] = ['MA']
	datas: Array<string> = []
	chartType: any
	page: number = 1
	lastItem: string = ''
	// 主题配置
	themeConfig = new window.DsxConfig()
	subCandleId: string = ''
	subTickerId: string = ''
	lastVol:number = 0
	lastAmount:number = 0
	onError?:(err:any)=>void;
	onLoading?:()=>void;
	constructor(symbol: string, cycle: string,theme:string, config: DsxKlineConfig) {
		this.theme = theme;
		this.config = config
		this.symbol = symbol
		this.cycle = cycle||'1m'
	}

	whenBrowserActive=()=>{
		console.log('浏览器重新激活')
		this.reload()
	}

	// ws 重连后重新请求k线和订阅k线
	wsReconnect=()=>{
		this.reload()
	}

	/**
	 * 创建K线图
	 */
	create() {
		this.createTheme()
		this.config.onLoading = this.startLoading.bind(this)
		this.config.nextPage = this.onNextPage.bind(this)
		this.kline = new window.DsxKline(this.config)
		useKlineStore().main[this.symbol] = this.config.main|| this.main
		useKlineStore().sides[this.symbol] = this.config.sides|| this.sides
		console.log('kline create....',new Date().getTime())
		const {$windowEvent,$wsb} = useNuxtApp()
		$windowEvent.addEvent(this.whenBrowserActive)
		// $wsb.onReconnectSuccess(this.wsReconnect)
	}

	tapSymbol(symbol: string,cycle?:string) {
		this.symbol = symbol
		if(!useKlineStore().main[this.symbol])useKlineStore().main[this.symbol] = this.config.main|| this.main
		if(!useKlineStore().sides[this.symbol])useKlineStore().sides[this.symbol] = this.config.sides|| this.sides
		this.unsubscribe()
		if(cycle) this.cycle = cycle
		this.kline.startLoading()
	}
	reload(){
		this.unsubscribe()
		this.kline.startLoading()
	}

	subscribe() {
		const { $wsb, $ws } = useNuxtApp()
		const candleCycle: Record<string, CandleCannel> = {
			'1m': CandleCannel.candle1m,
			'5m': CandleCannel.candle5m,
			'15m': CandleCannel.candle15m,
			'30m': CandleCannel.candle30m,
			'1h': CandleCannel.candle1H,
			'2h': CandleCannel.candle2H,
			'4h': CandleCannel.candle4H,
			'1D': CandleCannel.candle1D,
			'1W': CandleCannel.candle1W,
			'1M': CandleCannel.candle1M
		}

		this.subCandleId = $wsb.subCandle(candleCycle[this.cycle + ''], [this.symbol + ''], (message, error) => {
			// console.log(candleCycle[this.cycle + ""], message.data, error);
			if (message.data)
				message.data.forEach(item => {
					// console.log(candleCycle[this.cycle+""],item, error);
					this.refresh(item)
				})
		})
		let lastTikerClose = ''
		// useSymbolStore().setSubSymbols(this.symbol + '')
		// this.subTickerId = $ws.subTickers([this.symbol + ''], (message, error) => {
		// 	console.log("subTickers", message.data, error);
		// 	if (message.data)
		// 		message.data.forEach(item => {
		// 			if (item.last !== lastTikerClose && item.instId==this.symbol) {
		// 				lastTikerClose = item.last
		// 				// console.log("subTickers", item, error);
		// 				const amount = parseFloat(item.last) * parseFloat(item.lastSz)
		// 				this.refresh([item.ts.toString(), item.last, item.last, item.last, item.last, item.lastSz, amount.toString()])
		// 				// 同步到store
		// 				useSymbolStore().setTickets(this.symbol + '', item)
		// 			}
		// 		})
		// })
	}

	unsubscribe() {
		const { $wsb, $ws } = useNuxtApp()
		$wsb.unsubscribe(this.subCandleId)
		$ws.unsubscribe(this.subTickerId)
	}

	createTheme() {
		KlineTheme.createDarkTheme(this.themeConfig)
		KlineTheme.createWhiteTheme(this.themeConfig)
		KlineTheme.createNavyTheme(this.themeConfig)
		this.config.theme = this.themeConfig.theme[this.theme == 'dark' ? 'dark' : 'white']
	}

	updateDecimal(decimal:number){
		this.kline.decimalPoint = decimal;
	}

	update(config: DsxKlineConfig) {
		this.kline.update(config)
		this.unsubscribe()
		this.subscribe()
	}

	startLoading(kline?: DsxKline) {
		this.lastVol = 0
		this.lastAmount = 0
		this.lastItem = ''
		this.onLoading && this.onLoading()
		this.page = 1
		this.after = ''
		useKlineStore().setLoading(this.symbol,true)
		this.unsubscribe()
		this.getKlineData()
	}

	onNextPage(data: any[], index: number) {
		this.getKlineData()
	}

	getKlineData() {
		const symbol = this.symbol
		const cycle = this.cycle
		ComposFetch.marketFetch
			.getKlines(this.symbol, this.cycle, this.after, this.before, this.limit)
			.then(res => {
				// 丢弃
				if (symbol != this.symbol || cycle != this.cycle) {
					this.finishLoading()
					return
				}
				const datas: string[] = res?.data
					.map((item: string[]) => {
						const [d, o, h, l, c, v, a] = item
						const [date, time] = moment
							.unix(parseInt(d) / 1000)
							.format('YYYYMMDD HHmmss')
							.split(' ')
						return [date, time, o, h, l, c, v, a].join(',')
					})
					.reverse()
				// 下一页的开始时间
				if (datas.length > 0) this.after = res?.data[res?.data.length - 1][0]
				if (this.page == 1) {
					this.datas = datas
					this.subscribe()
				} else {
					this.datas = datas.concat(this.datas)
				}
				
				this.kline.update({
					datas: this.datas,
					page: this.page,
				})
				this.heartFollowKline()
				this.page++
				this.finishLoading()
				if (datas.length < this.limit) {
					this.kline.scrollTheend()
				}
			})
			.catch((err) => {
				this.finishLoading()
				this.kline.loadingError()
				this.onError && this.onError(err)
			})
	}

	finishLoading() {
		useKlineStore().setLoading(this.symbol,false)
		this.kline.finishLoading()
	}

	updateKline() {
		if (this.kline.datas.length <= 0) return
		if (this.kline) this.kline.hideCrossLine = false
		if (this.kline) this.kline.updateIndex(this.main, this.sides)
	}

	updateIndex(main: string[], sides: string[]) {
		this.main = main
		this.sides = sides
		if (this.kline) this.kline.updateIndex(this.main, this.sides)
	}

	/**
	 * 切换主图指标
	 * @param {string} index 指标名称代码
	 */
	selectMain(index: string[]) {
		if (this.datas.length <= 0) return
		this.main = index
		this.kline.updateIndex(this.main, this.sides)
	}

	/**
	 * 切换副图指标
	 * @param {string} index 指标名称代码
	 */
	selectSides(index: string[]) {
		if (this.datas.length <= 0) return
		this.sides = index
		this.kline.updateIndex(this.main, this.sides)
	}
	// 切换线型图 2=蜡烛图 3=线性图
	selectChartType(chartType: any) {
		if (this.datas.length <= 0) return
		// 切换指标
		this.chartType = chartType
		this.kline.updateChartType(chartType)
	}
	// 缩放
	zoom(n: number) {
		if (this.datas.length <= 0) return
		n = n * this.kline.dpr
		const x = this.kline.lockRightKlineX > 0 ? this.kline.lockRightKlineX : this.kline.width / 2
		this.kline._setMiddleKlineLineIndex(x)
		this.kline._zoomAnimation(n, x)
	}

	updateCycle(cycle: string) {
		this.cycle = cycle
		this.kline.startLoading()
	}

	updateTheme(theme: string) {
		if(!this.kline) return;
		this.theme = theme
		// console.log(this.themeConfig);
		this.kline.theme = this.themeConfig.theme[this.theme == 'dark' ? 'dark' : 'white']
		this.kline.updateIndex(this.main, this.sides)
	}

	// 呼吸灯跟随K线颜色
	heartFollowKline(){
		if(!this.kline.showDatas.length) return;
		const lastKline = this.kline.showDatas[this.kline.showDatas.length-1];
		if(lastKline){
			// 绿色呼吸灯
			let cricleColor = 'rgba(25, 200, 59, 1)'
			let cricleColorStart = 'rgba(25, 200, 59, 0.5)'
			let cricleColorStop = this.theme == 'white' ? 'rgba(255,255,255, 0.0)' : 'rgba(13,16,23, 0.0)'
			// 红色呼吸灯
			let cricleColorRed = 'rgba(255, 55, 55, 1)'
			let cricleColorStartRed = 'rgba(254, 53, 53, 0.5)'
			let cricleColorStopRed = this.theme == 'white' ? 'rgba(255,255,255, 0.0)' : 'rgba(13,16,23, 0.0)'
			// 空 红色
			if(lastKline.OPEN>lastKline.CLOSE){
				this.kline.theme.cricleColor = cricleColorRed
				this.kline.theme.cricleColorStart = cricleColorStartRed
				this.kline.theme.cricleColorStop = cricleColorStopRed
			}else{
				this.kline.theme.cricleColor = cricleColor
				this.kline.theme.cricleColorStart = cricleColorStart
				this.kline.theme.cricleColorStop = cricleColorStop
			}
		}
	}

	refresh(d: string[]) {
		if(!this.kline.datas?.length) return;
		const [ts, o, h, l, c, v, a,ac,confirm] = d
		const t = moment(parseInt(ts)).format('YYYYMMDD HH:mm:ss')
		let date = t.split(' ')[0].replaceAll('/', '')
		let time = t.split(' ')[1].replaceAll(':', '')
		let vol = confirm!=undefined? parseFloat(v) : this.lastVol
		let amount = confirm!=undefined? parseFloat(a): this.lastAmount
		let item = [date, time, o, h, l, c, vol, amount].join(',')
		let cycle = 'm1'
		if (this.cycle == '1D') cycle = 'd'
		if (this.cycle == '1W') cycle = 'w'
		if (this.cycle == '1M') cycle = 'm'
		if (this.cycle == '1m') cycle = 'm1'
		if (this.cycle == '5m') cycle = 'm5'
		if (this.cycle == '15m') cycle = 'm15'
		if (this.cycle == '30m') cycle = 'm30'
		if (this.cycle == '60m') cycle = 'm60'
		if (this.kline && this.lastItem != item) {
			this.kline.refreshLastOneData(item, cycle)
		}
		this.heartFollowKline()
		this.lastItem = item
		if(confirm!=undefined){
			this.lastVol = parseFloat(v)
			this.lastAmount = parseFloat(a)
		}
	}

	destroy() {
		this.kline.destroy()
		this.unsubscribe()
		const {$windowEvent,$wsb} = useNuxtApp()
		$windowEvent.removeEvent(this.whenBrowserActive)
		$wsb.removeReconnectSuccess(this.wsReconnect)
	}
}

export default DsxKlineChart
