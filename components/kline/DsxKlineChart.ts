import { DsxKline, type DsxKlineConfig } from "./DsxKlineChart.d";
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

    update(config:DsxKlineConfig){
        this.kline.update(config);
    }

	onLoading(kline:DsxKline) {
		console.log("开始加载数据....",kline);
	}

    finishLoading(){
        this.kline.finishLoading();
    }
}

export default DsxKlineChart;
