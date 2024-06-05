import moment from "moment";
import { DsxKline, type DsxKlineConfig } from "./DsxKlineChart.d";
import { ComposFetch } from "~/fetch";
interface DsxWindow extends Window {
	DsxKline: typeof DsxKline;
}
declare var window: DsxWindow;

class DsxKlineChart {
	kline!: DsxKline;
	config: DsxKlineConfig;
	constructor(config: DsxKlineConfig) {
		this.config = config;
	}

	/**
	 * 创建K线图
	 */
	create() {
		// this.config.onLoading = this.onLoading;
		this.kline = new window.DsxKline(this.config);
		this.kline.onLoading = this.onLoading;
		this.kline.finishLoading();
		this.kline.startLoading();
	}

	update(config: DsxKlineConfig) {
		this.kline.update(config);
	}

	onLoading(kline: DsxKline) {
		console.log("开始加载数据....", kline);
		ComposFetch.marketFetch.getKlines('BTC-USDT').then(({data,error}) => {
            const datas:string[] = data.value.data.map((item:string[]) => {
                const [d,o,h,l,c,v,a] = item;
                const [date,time] = moment.unix(parseInt(d)/1000).format('YYYYMMDD HHmmss').split(' ');
                return [date,time,o,h,l,c,v,a].join(',')
            });
            console.log("获取到合约信息", datas);
            kline.update({
                datas: datas,
                page:1
            });
            kline.finishLoading();
		});
	}

	finishLoading() {
		this.kline.finishLoading();
	}
}

export default DsxKlineChart;
