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
    symbol?:string;
    cycle?:string;
    after?:string;
    before?:string;
    limit?:number = 300;
	constructor(symbol:string,config: DsxKlineConfig) {
		this.config = config;
        this.symbol = symbol;
	}

	/**
	 * 创建K线图
	 */
	create() {
		// this.config.onLoading = this.onLoading;
		this.kline = new window.DsxKline(this.config);
		this.kline.onLoading = this.onLoading.bind(this);
		this.kline.finishLoading();
		this.kline.startLoading();
	}

	update(config: DsxKlineConfig) {
		this.kline.update(config);
	}

	onLoading(kline: DsxKline) {
		console.log("开始加载数据....", kline);
		this.getKlineData();
	}

    getKlineData() {
        ComposFetch.marketFetch.getKlines(this.symbol,this.cycle,this.after,this.before,this.limit).then(({data,error}) => {
            const datas:string[] = data.value.data.map((item:string[]) => {
                const [d,o,h,l,c,v,a] = item;
                const [date,time] = moment.unix(parseInt(d)/1000).format('YYYYMMDD HHmmss').split(' ');
                return [date,time,o,h,l,c,v,a].join(',')
            });
            console.log("获取到合约信息", datas);
            this.kline.update({
                datas: datas.reverse(),
                page:1
            });
            this.kline.finishLoading();
		});
    }

	finishLoading() {
		this.kline.finishLoading();
	}

    updateCycle(cycle:string){
        this.cycle = cycle;
        this.kline.startLoading();
    }
}

export default DsxKlineChart;
