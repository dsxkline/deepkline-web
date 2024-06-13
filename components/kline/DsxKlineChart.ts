import moment from "moment";
import { DsxConfig, DsxKline, type DsxKlineConfig, type DsxWindow } from "./DsxKlineChart.d";
import { ComposFetch } from "~/fetch";
import KlineTheme from "./DsxKlineChartTheme";
declare var window: DsxWindow;

class DsxKlineChart {
	kline!: DsxKline;
	config: DsxKlineConfig;
	symbol?: string;
	cycle?: string;
	after?: string;
	before?: string;
	limit: number = 300;
	theme?: string;
	sides: string[] = ["MACD"];
	main: string[] = ["MA"];
	datas: string[] = [];
	chartType: any;
	page:number = 1;
	// 主题配置
    themeConfig = new window.DsxConfig();
	constructor(symbol: string, config: DsxKlineConfig) {
		this.config = config;
		this.symbol = symbol;
	}

	/**
	 * 创建K线图
	 */
	create() {
		this.createTheme();
		this.kline = new window.DsxKline(this.config);
		this.kline.onLoading = this.onLoading.bind(this);
		this.kline.nextPage = this.onNextPage.bind(this);
		this.kline.finishLoading();
		this.kline.startLoading();
	}

	createTheme(){
		KlineTheme.createDarkTheme(this.themeConfig);
		KlineTheme.createWhiteTheme(this.themeConfig);
		KlineTheme.createNavyTheme(this.themeConfig);
	}

	update(config: DsxKlineConfig) {
		this.kline.update(config);
	}

	onLoading(kline: DsxKline) {
		this.page = 1;
		this.getKlineData();
	}

	onNextPage(data: any[], index: number) {
		this.getKlineData();
	}

	getKlineData() {
		ComposFetch.marketFetch.getKlines(this.symbol, this.cycle, this.after, this.before, this.limit).then(({ data, error }) => {
			const datas: string[] = data.value.data.map((item: string[]) => {
				const [d, o, h, l, c, v, a] = item;
				const [date, time] = moment
					.unix(parseInt(d) / 1000)
					.format("YYYYMMDD HHmmss")
					.split(" ");
				return [date, time, o, h, l, c, v, a].join(",");
			}).reverse();
			this.after = data.value.data[data.value.data.length - 1][0];
			if (this.page == 1) {
				this.datas = datas;
			}else{
				this.datas = datas.concat(this.datas);
			}
			
			this.kline.update({
				datas: this.datas,
				page: this.page
			});
			this.page++;
			this.kline.finishLoading();
			if(datas.length<this.limit){
				this.kline.scrollTheend();
			}
		});
	}

	finishLoading() {
		this.kline.finishLoading();
	}

	updateKline() {
		if (this.kline.datas.length <= 0) return;
		if (this.kline) this.kline.hideCrossLine = false;
		if (this.kline) this.kline.updateIndex(this.main, this.sides);
	}

	updateIndex(main: string[], sides: string[]) {
		this.main = main;
		this.sides = sides;
		if (this.kline) this.kline.updateIndex(this.main, this.sides);
	}

	/**
	 * 切换主图指标
	 * @param {string} index 指标名称代码
	 */
	selectMain(index: string[]) {
		if (this.datas.length <= 0) return;
		this.main = index;
		this.kline.updateIndex(this.main, this.sides);
	}

	/**
	 * 切换副图指标
	 * @param {string} index 指标名称代码
	 */
	selectSides(index: string[]) {
		if (this.datas.length <= 0) return;
		this.sides = index;
		this.kline.updateIndex(this.main, this.sides);
	}
	// 切换线型图 2=蜡烛图 3=线性图
	selectChartType(chartType: any) {
		if (this.datas.length <= 0) return;
		// 切换指标
		this.chartType = chartType;
		this.kline.updateChartType(chartType);
	}
	// 缩放
	zoom(n: number) {
		if (this.datas.length <= 0) return;
		n = n * this.kline.dpr;
		const x = this.kline.lockRightKlineX > 0 ? this.kline.lockRightKlineX : this.kline.width / 2;
		this.kline._setMiddleKlineLineIndex(x);
		this.kline._zoomAnimation(n, x);
	}

	updateCycle(cycle: string) {
		this.cycle = cycle;
		this.kline.startLoading();
	}

	updateTheme(theme: string) {
		this.theme = theme;
		console.log(this.themeConfig);
		this.kline.theme = this.themeConfig.theme[this.theme == "dark" ? "dark" : "white"];
		this.kline.updateIndex(this.main, this.sides);
	}
}

export default DsxKlineChart;
