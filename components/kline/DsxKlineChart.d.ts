export enum ChartType {
	timeSharing = 0, // 分时图
	timeSharing5 = 1, // 五日分时图
	candle = 2, // K线图
	moveTime = 3
}
// 蜡烛图实心空心
export enum CandleType {
	hollow = 0, // 空心
	solid = 1 // 实心
}
// 缩放K线锁定类型
export enum ZoomLockType {
	left = 1, // 锁定左边进行缩放
	middle = 2, // 锁定中间进行缩放
	right = 3, // 锁定右边进行缩放
	follow = 4 // 跟随鼠标位置进行缩放，web版效果比较好
}
// 十字线模式
export enum CrossModel {
	longPress = 0, // 默认长按2秒才开始显示十字线
	mouseOver = 1 // 鼠标模式，鼠标落下即开使显示十字线
}
// 请求加载状态
export enum LoadStatus {
	default = 0,
	ready = 1,
	loading = 2,
	finished = 3,
	error = 4
}

export type OnLoading = (kline: DsxKline) => void;
export type NextPage = (data: any[], index: number) => void;

export interface DsxKlineConfig {
	element?: Element;
	chartType?: ChartType;
	klineWidth?: number;
	theme?: String;
	candleType?: CandleType;
	zoomLockType?: ZoomLockType;
	crossModel?: CrossModel;
	moveAnimationTime?: number;
	transformers?: Bollean;
	isShowKlineTipPannel?: true;
	lastClose?: number;
	sideHeight?: number;
	paddingBottom?: number;
	paddingMiddle?: number;
	autoSize?: Boolean;
	debug?: Boolean;
	main?: String[];
	sides?: String[];
	isShowTips?: Boolean;
	allMin?: Boolean;
	onLoading?: OnLoading;
	nextPage?: NextPage;
    datas?: string[];
    page?: number;
}
export declare class DsxKline {
	constructor(config: DsxKlineConfig);
	update(config: DsxKlineConfig): void;
    onLoading:OnLoading;
	startLoading(): void;
    finishLoading(): void;
}
