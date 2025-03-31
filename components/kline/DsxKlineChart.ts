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
	symbol?: string
	cycle?: string
	after?: string
	before?: string
	limit: number = 300
	theme?: string
	sides: string[] = ['MACD']
	main: string[] = ['MA']
	datas: string[] = []
	chartType: any
	page: number = 1
	lastItem: string = ''
	// 主题配置
	themeConfig = new window.DsxConfig()
	subCandleId: string = ''
	subTickerId: string = ''
	constructor(symbol: string, cycle: string, config: DsxKlineConfig) {
		this.config = config
		this.symbol = symbol
		this.cycle = cycle
	}

	/**
	 * 创建K线图
	 */
	create() {
		this.createTheme()
		this.kline = new window.DsxKline(this.config)
		this.kline.onLoading = this.onLoading.bind(this)
		this.kline.nextPage = this.onNextPage.bind(this)
		this.kline.finishLoading()
		this.kline.startLoading()
	}

	tapSymbol(symbol: string) {
		this.symbol = symbol
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
		useSymbolStore().setSubSymbols(this.symbol + '')
		this.subTickerId = $ws.subTickers([this.symbol + ''], (message, error) => {
			// console.log("subTickers", message.data, error);
			if (message.data)
				message.data.forEach(item => {
					if (item.last !== lastTikerClose) {
						lastTikerClose = item.last
						// console.log("subTickers", item, error);
						const amount = parseFloat(item.last) * parseFloat(item.lastSz)
						this.refresh([item.ts.toString(), item.last, item.last, item.last, item.last, item.lastSz, amount.toString()])
						// 同步到store
						useSymbolStore().setTickets(this.symbol + '', item)
					}
				})
		})
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
	}

	update(config: DsxKlineConfig) {
		this.kline.update(config)
		this.unsubscribe()
		this.subscribe()
	}

	onLoading(kline: DsxKline) {
		this.page = 1
		this.after = ''
		useKlineStore().setLoading(true)
		this.getKlineData()
		this.unsubscribe()
		this.subscribe()
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
				} else {
					this.datas = datas.concat(this.datas)
				}

				this.kline.update({
					datas: this.datas,
					page: this.page
				})
				this.page++
				this.finishLoading()
				if (datas.length < this.limit) {
					this.kline.scrollTheend()
				}
			})
			.catch(() => {
				this.finishLoading()
			})
	}

	finishLoading() {
		useKlineStore().setLoading(false)
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
		this.theme = theme
		// console.log(this.themeConfig);
		this.kline.theme = this.themeConfig.theme[this.theme == 'dark' ? 'dark' : 'white']
		this.kline.updateIndex(this.main, this.sides)
	}

	refresh(d: string[]) {
		const [ts, o, h, l, c, v, a] = d
		const t = moment(parseInt(ts)).format('YYYYMMDD HH:mm:ss')
		let date = t.split(' ')[0].replaceAll('/', '')
		let time = t.split(' ')[1].replaceAll(':', '')
		let item = [date, time, o, h, l, c, v, a].join(',')
		let cycle = 't'
		if (this.cycle == '1D') cycle = 'd'
		if (this.cycle == '1W') cycle = 'w'
		if (this.cycle == '1M') cycle = 'm'
		if (this.cycle == '1m') cycle = 'm1'
		if (this.cycle == '5m') cycle = 'm5'
		if (this.cycle == '15m') cycle = 'm15'
		if (this.cycle == '30m') cycle = 'm30'
		if (this.cycle == '60m') cycle = 'm60'
		// console.log(t, this.cycle, item);
		if (this.kline && this.lastItem != item) {
			this.kline.refreshLastOneData(item, cycle)
		}
		this.lastItem = item
	}

	destroy() {
		this.kline.destroy()
		this.unsubscribe()
	}
}

export default DsxKlineChart
