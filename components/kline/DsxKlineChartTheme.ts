import type { ThemeItem, DsxConfig } from "./DsxKlineChart.d";

function createTheme(config: DsxConfig, theme: string, options: ThemeItem) {
	if (!config.theme[theme]) config.theme[theme] = options;
	config.theme[theme] = options;
}
const fontStyle = "Roboto, sans-serif";
export default {
	// 黑色主题
	createDarkTheme(config: DsxConfig) {
		createTheme(config, "dark", {
			// "Sans-serif"是一个通用的字体族名称，浏览器会根据系统默认的无衬线字体来渲染文本。
			// 具体的字体样式和显示效果可能因浏览器和操作系统的不同而有所差异。
			fontStyle: fontStyle, // 字体
			backgroundColor: "rgba(13,16,23, 0.0)",
			color: "#c5cbce", // 字体颜色
			fontSize: (window.innerWidth < 999 ? 10 : 12) * window.devicePixelRatio, // 字体大小
			redColor: "#F5465C",
			greenColor: "#2DBD85",
			rectRedColor: "#F5465C", // 矩形红色 一般用作成交量
			rectGreenColor: "#2DBD85", // 矩形绿色
			crossLineColor: "rgba(255, 255, 255, 0.4)", // 十字线颜色
			crossLineWidth: 0.5 * window.devicePixelRatio, // 十字线宽度
			crossBorderColor: "rgba(255,255,255,0.05)", // 十字线边框颜色
			crossFontColor: "#c5cbce",
			crossBgColor: "rgba(43,52,69,1)|rgba(255, 255, 255, 0.05)",
			crossDash: [10, 5],// 虚线配置 例如 [5,5] 每隔五像素空五像素，达到虚线效果
			crossFontSize: 12,
			crossButtonHeight: 24,
			fontBgColor: "rgba(43,52,69,1)", // 文字背景颜色
			fontWeight: "", // bold
			gridLineColor: "rgba(61,67,82,1)", // 网格线颜色
			gridLineCount: 10, // 网格线数量
			gridLineWidth: 0.6, // 网格线的宽度
			lineWidth: 1.0, // 线条
			klineWidth: 10, // 一根k线的默认宽度
			klinePadding: 4, // k线之间的间隔
			timeSharingLineColor: "#ffffff",
			timeSharingLineFillColor: "rgba(255,255,255,0.15)",
			timeSharingLineEndFillColor: "rgba(255,255,255,0.02)",
			timeSharingLineWidth: 1.5, // 分时图价格线的宽度
			cricleColor: "rgba(25, 200, 59, 1)",
			cricleColorStart: "rgba(25, 200, 59, 0.5)",
			cricleColorStop: "rgba(13,16,23, 0.0)",
			dashedBoxBgColor: "rgba(255,255,225,0.06)", // 虚线框的背景颜色
			dashedBoxLineWidth: 20, // 虚线框每根虚线的宽度
			dashedBoxBorderLineWidth: 0.1, // 虚线框边框宽度
			dashedBoxBorderLineColor: "rgba(255,255,225,0.10)", // 虚线框边框颜色
			dashedBoxSpace: 20, // 虚线框虚线间的间隔
			gridPriceColor: "rgba(165,169,176,0.8)",
			gridPriceBackgroundColor: "rgba(13,16,23, 1.0)",
			gridPriceDirection: 1, // 网格价格提示器方向 0:左边 1:右边
			gridPriceWidth: 0, // 左右网格线价格提示区域的宽度
			gridPriceLineWidth: 0.0, // 网格分割线
			gridPricePadding: 10, // 价格提示器内容边距
			gridPriceFontSize: 13 * window.devicePixelRatio,
			gridPriceAutoWidth: true,
			gridPriceBgShow: true, // 是否显示右边价格提示区域背景颜色
			mainPaddingTop: 20, // 主图顶部内边距
			sidePaddingTop: 10, // 副图顶部内边距，因为要显示指标
			priceShadowStartRedColor: "rgba(199, 52, 76, 0.2)", // 实时价格线多空阴影颜色
			priceShadowEndRedColor: "rgba(199, 52, 76, 0)",
			priceShadowStartGreenColor: "rgba(46, 153, 135, 0.2)",
			priceShadowEndGreenColor: "rgba(46, 153, 135, 0)",
            priceShadowUpArrow: "",
			priceShadowDownArrow: "",
			realTimeLineColor: "#E66112",
			realTimeLineFontColor: "#ffffff",
			askBidLineTextColor: "#c5cbce", // 字体颜色
			askBidLineTextSize: 12 * window.devicePixelRatio, // 字体大小
			askBidLineColor: "rgba(255,255,255,1)", // 多空价格线颜色
			askBidLineWidth: 0.2, // 多空价格线宽度
			askBidLineBash: [5, 8],
			askBidLineBgColor: "rgba(0, 0, 0, 1)",
			tipPaddingLeft: 10, // 指标提示信息离左边的距离
			tipPaddingTop: 10 // 指标提示信息离顶部的距离
		});
	},

	// 白色主题
	createWhiteTheme(config: DsxConfig) {
		createTheme(config, "white", {
			// "Sans-serif"是一个通用的字体族名称，浏览器会根据系统默认的无衬线字体来渲染文本。
			// 具体的字体样式和显示效果可能因浏览器和操作系统的不同而有所差异。
			fontStyle: fontStyle, // 字体
			backgroundColor: "rgba(255,255,255, 0.0)",
			color: "rgba(163, 163, 163, 1)", // 字体颜色
			fontSize: (window.innerWidth < 999 ? 10 : 12) * window.devicePixelRatio, // 字体大小
			redColor: "#D04058",
			greenColor: "#3AAF9C",
			rectRedColor: "#D04058", // 矩形红色 一般用作成交量
			rectGreenColor: "#3AAF9C", // 矩形绿色
			crossLineColor: "rgba(0, 0, 0, 0.2)", // 十字线颜色
			crossLineWidth: 0.5 * window.devicePixelRatio, // 十字线宽度
			crossBorderColor: "rgba(0,0,0 ,0.05)", // 十字线边框颜色
			crossFontColor: "rgba(41, 41, 41, 1)",
			crossBgColor: "rgba(255, 255, 255, 1)|rgba(0, 0, 0, 0.05)",
			crossDash: [10, 5],// 虚线配置 例如 [5,5] 每隔五像素空五像素，达到虚线效果
			crossFontSize: 12,
			crossButtonHeight: 24,
			fontBgColor: "rgba(0, 0, 0, 0.05)", // 文字背景颜色
			fontWeight: "", // bold
			gridLineColor: "rgba(0, 0, 0, 0.1)", // 网格线颜色
			gridLineCount: 10, // 网格线数量
			gridLineWidth: 0.6, // 网格线的宽度
			lineWidth: 1.0, // 线条
			klineWidth: 10, // 一根k线的默认宽度
			klinePadding: 4, // k线之间的间隔
			timeSharingLineColor: "rgba(230, 97, 18, 1)",
			timeSharingLineFillColor: "rgba(230, 97, 18, 0.15)",
			timeSharingLineEndFillColor: "rgba(230, 97, 18, 0.02)",
			timeSharingLineWidth: 1.5, // 分时图价格线的宽度
			cricleColor: "rgba(76,175,80,1.0)",
			cricleColorStart: "rgba(76,175,80,0.5)",
			cricleColorStop: "rgba(255,255,255, 0.0)",
			dashedBoxBgColor: "rgba(0,0,0,0.06)", // 虚线框的背景颜色
			dashedBoxLineWidth: 20, // 虚线框每根虚线的宽度
			dashedBoxBorderLineWidth: 0.1, // 虚线框边框宽度
			dashedBoxBorderLineColor: "rgba(0,0,0,0.10)", // 虚线框边框颜色
			dashedBoxSpace: 20, // 虚线框虚线间的间隔
			gridPriceColor: "rgba(165,169,176,0.8)",
			gridPriceBackgroundColor: "rgba(255, 255, 255, 1)",
			gridPriceDirection: 1, // 网格价格提示器方向 0:左边 1:右边
			gridPriceWidth: 0, // 左右网格线价格提示区域的宽度
			gridPriceLineWidth: 0.0, // 网格分割线
			gridPricePadding: 10, // 价格提示器内容边距
			gridPriceFontSize: 13 * window.devicePixelRatio,
			gridPriceAutoWidth: true,
			gridPriceBgShow: true, // 是否显示右边价格提示区域背景颜色
			mainPaddingTop: 20, // 主图顶部内边距
			sidePaddingTop: 10, // 副图顶部内边距，因为要显示指标
			priceShadowStartRedColor: "rgba(199, 52, 76, 0.2)", // 实时价格线多空阴影颜色
			priceShadowEndRedColor: "rgba(199, 52, 76, 0)",
			priceShadowStartGreenColor: "rgba(46, 153, 135, 0.2)",
			priceShadowEndGreenColor: "rgba(46, 153, 135, 0)",
            priceShadowUpArrow: "",
			priceShadowDownArrow: "",
			realTimeLineColor: "#E66112",
			realTimeLineFontColor: "#ffffff",
			askBidLineTextColor: "#c5cbce", // 字体颜色
			askBidLineTextSize: 12, // 字体大小
			askBidLineColor: "rgba(0, 0, 0, 0.1)", // 多空价格线颜色
			askBidLineWidth: 0.5, // 多空价格线宽度
			askBidLineBash: [5, 8],
			askBidLineBgColor: "rgba(230, 97, 18, 0.1) ",
			tipPaddingLeft: 10, // 指标提示信息离左边的距离
			tipPaddingTop: 10 // 指标提示信息离顶部的距离
		});
	},

	// 主题
	createNavyTheme(config: DsxConfig) {
		createTheme(config, "navy", {
			// "Sans-serif"是一个通用的字体族名称，浏览器会根据系统默认的无衬线字体来渲染文本。
			// 具体的字体样式和显示效果可能因浏览器和操作系统的不同而有所差异。
			fontStyle: fontStyle, // 字体
			backgroundColor: "rgba(13,16,23, 0.0)",
			color: "#c5cbce", // 字体颜色
			fontSize: window.devicePixelRatio <= 1 ? 12 : 12 * window.devicePixelRatio, // 字体大小
			redColor: "#F5465C",
			greenColor: "#2DBD85",
			rectRedColor: "#F5465C", // 矩形红色 一般用作成交量
			rectGreenColor: "#2DBD85", // 矩形绿色
			crossLineColor: "rgba(255, 255, 255, 0.4)", // 十字线颜色
			crossLineWidth: 0.5 * window.devicePixelRatio, // 十字线宽度
			crossBorderColor: "rgba(255,255,255,0.05)", // 十字线边框颜色
			crossFontColor: "#c5cbce",
			crossBgColor: "rgba(43,52,69,1)|rgba(255, 255, 255, 0.05)",
			crossDash: [10, 5], // 虚线配置 例如 [5,5] 每隔五像素空五像素，达到虚线效果
			crossFontSize: 12,
			crossButtonHeight: 24,
			fontBgColor: "rgba(43,52,69,1)", // 文字背景颜色
			fontWeight: "", // bold
			gridLineColor: "rgba(61,67,82,1)", // 网格线颜色
			gridLineCount: 10, // 网格线数量
			gridLineWidth: 0.6, // 网格线的宽度
			lineWidth: 1.0, // 线条
			klineWidth: 10, // 一根k线的默认宽度
			klinePadding: 4, // k线之间的间隔
			timeSharingLineColor: "#ffffff",
			timeSharingLineFillColor: "rgba(255,255,255,0.15)",
			timeSharingLineEndFillColor: "rgba(255,255,255,0.02)",
			timeSharingLineWidth: 1.5, // 分时图价格线的宽度
			cricleColor: "rgba(76,175,80,1.0)",
			cricleColorStart: "rgba(76,175,80,0.5)",
			cricleColorStop: "rgba(13,16,23, 0.0)",
			dashedBoxBgColor: "rgba(255,255,225,0.06)", // 虚线框的背景颜色
			dashedBoxLineWidth: 20, // 虚线框每根虚线的宽度
			dashedBoxBorderLineWidth: 0.1, // 虚线框边框宽度
			dashedBoxBorderLineColor: "rgba(255,255,225,0.10)", // 虚线框边框颜色
			dashedBoxSpace: 20, // 虚线框虚线间的间隔
			gridPriceColor: "rgba(165,169,176,0.8)",
			gridPriceBackgroundColor: "rgba(21, 27, 40, 1)",
			gridPriceDirection: 1, // 网格价格提示器方向 0:左边 1:右边
			gridPriceWidth: 0, // 左右网格线价格提示区域的宽度
			gridPriceLineWidth: 0.0, // 网格分割线
			gridPricePadding: 10, // 价格提示器内容边距
			gridPriceFontSize: 13 * window.devicePixelRatio,
			gridPriceAutoWidth: true,
			gridPriceBgShow: true, // 是否显示右边价格提示区域背景颜色
			mainPaddingTop: 20, // 主图顶部内边距
			sidePaddingTop: 0, // 副图顶部内边距，因为要显示指标
			priceShadowStartRedColor: "rgba(199, 52, 76, 0.2)", // 实时价格线多空阴影颜色
			priceShadowEndRedColor: "rgba(199, 52, 76, 0)",
			priceShadowStartGreenColor: "rgba(46, 153, 135, 0.2)",
			priceShadowEndGreenColor: "rgba(46, 153, 135, 0)",
            priceShadowUpArrow: "",
			priceShadowDownArrow: "",
			realTimeLineColor: "#E66112",
			realTimeLineFontColor: "#ffffff",
			askBidLineTextColor: "#c5cbce", // 字体颜色
			askBidLineTextSize: 12, // 字体大小
			askBidLineColor: "rgba(255,255,255,1)", // 多空价格线颜色
			askBidLineWidth: 0.2, // 多空价格线宽度
			askBidLineBash: [5, 8],
			askBidLineBgColor: "rgba(13,16,23, .5)",
			tipPaddingLeft: 10, // 指标提示信息离左边的距离
			tipPaddingTop: 10 // 指标提示信息离顶部的距离
		});
	}
};
