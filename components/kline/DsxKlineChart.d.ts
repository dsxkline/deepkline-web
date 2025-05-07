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
export enum Candle{
    DATE="DATE",
    TIME="TIME",
    OPEN="OPEN", 
    HIGH="HIGH", 
    LOW="LOW", 
    CLOSE="CLOSE", 
    VOL="VOL", 
    AMOUNT="AMOUNT"
}
export interface CandleModel{
    DATE:string,
    TIME:string,
    OPEN:number, 
    HIGH:number, 
    LOW:number, 
    CLOSE:number, 
    VOL:number, 
    AMOUNT:number
}
export enum TimeSharing{
    DATE="DATE",
    TIME="TIME",
    CLOSE="CLOSE", 
    VOL="VOL", 
    AMOUNT="AMOUNT"
}
export interface ThemeItem {
	fontStyle: string; // 字体
	backgroundColor: string; // 背景颜色
	color: string; // 字体颜色
	grey: string;
	fontSize: number; // 字体大小
	fontWeight: string;
	redColor: string; // 蜡烛图红色
	greenColor: string; // 蜡烛图绿色
	rectRedColor: string; // 矩形红色 一般用作成交量
	rectGreenColor: string; // 矩形绿色
	crossLineColor: string; // 十字线颜色
	crossLineWidth: number; // 十字线宽度
	crossBorderColor: string; // 十字线颜色
	crossFontSize: number;
	crossFontColor: string;
	crossBgColor: string;
	crossDash: number[]; // 虚线配置 例如 [5;5] 每隔五像素空五像素，达到虚线效果
	crossLineMarginRight:number;
	crossButtonHeight: number;
	fontBgColor: string; // 文字背景颜色 十字线提示的文字背景颜色
	gridLineColor: string; // 网格线颜色
	gridLineCount: number; // 网格线数量
	gridLineWidth: number; // 网格线的宽度
	lineWidth: number; // 线条的大小 指标线条的大小
	klineWidth: number; // 一根k线的默认宽度
	klinePadding: number; // k线之间的间隔
	timeSharingLineColor: string; // 分时图价格线的颜色
	timeSharingLineFillColor: string; // 分时图价格线区域填充颜色
	timeSharingLineEndFillColor: string;
	timeSharingLineWidth: number; // 分时图价格线的宽度
	cricleColor: string;
	cricleColorStart: string;
	cricleColorStop: string;
	dashedBoxBgColor: string; // 虚线框的背景颜色
	dashedBoxLineWidth: number;
	dashedBoxBorderLineWidth: number;
	dashedBoxBorderLineColor: string;
	dashedBoxSpace: number;
	gridPriceColor: string;
	gridPriceBackgroundColor: string;
	gridPriceDirection: number; // 网格价格提示器方向 0=左边 1=右边
	gridPriceWidth: number; // 网格价格提示器宽度 0=自动伸缩
	gridPriceLineWidth: number; // 网格分割线
	gridPricePadding: number; // 价格提示器内容边距
	gridPriceFontSize: number;
	gridPriceAutoWidth: boolean;
	gridPriceBgShow: boolean; // 隐藏价格标签线的背景，默认是显示的;H5的时候需要显示更大的空间
	mainPaddingTop: number; // 主图顶部内边距
	sidePaddingTop: number; // 副图顶部内边距，因为要显示指标
	priceShadowStartRedColor: string; // 实时价格线多空阴影颜色
	priceShadowEndRedColor: string;
	priceShadowStartGreenColor: string;
	priceShadowEndGreenColor: string;
	priceShadowUpArrow?: string;
	priceShadowDownArrow?: string;
	realTimeLineColor: string;
	realTimeLineFontColor: string;
	realTimeBgColor: string;
	askBidLineWidth: number;
	askBidLineBash: number[];
	askBidLineColor: string;
	askBidLineTextColor: string;
	askBidLineTextSize: number;
	askBidLineBgColor: string;
	tipPaddingLeft: number; // 指标提示信息离左边的距离
	tipPaddingTop: number; // 指标提示信息离顶部的距离
	tipBorderColor: string;
	maxMinBgColor: string;
	maxMinLineColor: string;
}
export interface Theme {
    [key: string]: ThemeItem;
} ;

export declare class DsxConfig {
    constructor();
    chartType:ChartType;
    candleType:CandleType;
	// 缩放K线锁定类型
	zoomLockType:ZoomLockType;
	// 十字线模式
	crossModel:CrossModel;
	// 请求加载状态
	loadStatus:LoadStatus;
	// K线实体
	entity:{
		candle: [...Candle],
		timeSharing: [...TimeSharing]
	};
	// 指标配置
	index:any;
	theme: Theme;
}

export type OnLoading = (kline: DsxKline) => void;
export type NextPage = (data: any[], index: number) => void;

export interface DsxKlineConfig {
	element?: Element | string;
	chartType?: ChartType;
	klineWidth?: number;
	theme?: DsxConfig.theme;
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
	main?: string[];
	sides?: string[];
	isShowTips?: Boolean;
	allMin?: Boolean;
	onLoading?: OnLoading;
	nextPage?: NextPage;
	datas?: string[];
	page?: number;
	decimalPoint?:number;
	worker?:Worker;
	workerPath?:string,
	loadMain?: string[];
	loadSides?: string[];
	
}
export declare class DsxKline {
	constructor(config: DsxKlineConfig);
	dpr: number;
	lockRightKlineX: number;
	lockRightKlineX: any;
	width: number;
	config: DsxConfig;
	theme: ThemeItem;
	hideCrossLine: boolean;
	datas: any[];
	showDatas:CandleModel[]
	decimalPoint?:number;
	update(config: DsxKlineConfig): void;
	onLoading: OnLoading;
	nextPage: NextPage;
	startLoading(): void;
	finishLoading(): void;
	scrollTheend():void;
	updateIndex(main: string[] = [], sides: string[] = []): void;
	updateChartType(chartType: any);
	_zoomAnimation(n: number, x: number): void;
	_setMiddleKlineLineIndex(x: number): void;
	refreshLastOneData: (item:string,cycle:string) => void;
	loadingError:()=>void;
	destroy: () => void;
}

export interface DsxWindow extends Window {
	DsxKline: typeof DsxKline;
    DsxConfig: typeof DsxConfig;
}