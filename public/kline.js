class DsxKlineChart {
	constructor(option) {
		this.el = option.el;
		this.theme = option.theme || "white";
		this.page = 1;
		this.pageSize = 300;
		this.cycle = "day";
		this.code = "sh000001";
		this.last_date = this.getDate(new Date());
		this.datas = [];
		// 模拟刷新时间
		this.refreshTime = 1000;
		this.sideHeight = 40;
		this.ld = "";
		this.ri = 0;
		this.kline = null;
		this.setTheme();
	}

	setTheme() {
		dsxConfig.theme.dark.timeSharingLineColor = "#ffffff";
		dsxConfig.theme.dark.timeSharingLineFillColor = "rgba(53,60,77,0.8)";
		dsxConfig.theme.dark.backgroundColor = "rgba(27, 33, 47, 1)";
		dsxConfig.theme.dark.gridLineColor = "rgba(61,67,82,1)"; // 网格线颜色
		dsxConfig.theme.dark.cricleColor = "rgba(76,175,80,1.0)";
		dsxConfig.theme.dark.crossLineColor = "rgba(255,255,255,1)"; // 十字线颜色
		dsxConfig.theme.dark.crossLineWidth = 1; // 十字线宽度
		dsxConfig.theme.dark.crossBorderColor = "rgba(255,255,255,1)"; // 十字线边框颜色
		dsxConfig.theme.dark.fontBgColor = "rgba(53,60,77,1)"; // 文字背景颜色
		dsxConfig.theme.dark.lineWidth = 1; // 线条
		dsxConfig.theme.dark.gridLineWidth = 1; // 网格线的宽度
		dsxConfig.theme.dark.gridPriceDirection = 1; // 网格价格提示器方向 0=左边 1=右边
		
		dsxConfig.theme.dark.gridPriceWidth = 0;
		dsxConfig.theme.dark.gridLineCount = 10; // 网格线数量
		dsxConfig.theme.dark.fontSize = 10; // 字体大小
		// dsxConfig.theme.white.gridPriceBgShow = false;
		//console.log(dsxConfig);

		dsxConfig.theme.white.gridPriceBackgroundColor = "rgba(0,0,0,0)";
	}

	create() {
		// let c=document.getElementById("kline");
		const _this = this;
		this.kline = new DsxKline({
			element: this.el,
			chartType: dsxConfig.chartType.candle,
			klineWidth: 1,
			theme: this.theme,
			candleType: dsxConfig.candleType.solid,
			zoomLockType: dsxConfig.zoomLockType.follow,
			crossModel: window.innerWidth<999?dsxConfig.crossModel.longPress:dsxConfig.crossModel.mouseOver,
			moveAnimationTime: this.refreshTime,
			transformers: true,
			isShowKlineTipPannel: true,
			// rightEmptyKlineAmount:30,
			lastClose: 2930.23,
			sideHeight: this.sideHeight,
			paddingBottom: 20,
			paddingMiddle: 0,
			paddingTop:0,
			autoSize: true,
			debug: true,
			main: ["EMA"], // 主图指标
			sides: ["VOL"], // 副图显示指标(两个副图，第一个显示MACD，第二个显示KDJ)
			isShowTips: true,
			allMin: false,
			showBorder:false,
			// 初始化并开始加载数据
			onLoading: function (k) {
				//console.log("o.chartType="+o.chartType);
				_this.page = 1;
				_this.datas = [];
				if (k.chartType >= dsxConfig.chartType.candle) _this.getDay();
				if (k.chartType == dsxConfig.chartType.timeSharing) _this.getQuote();
				if (k.chartType == dsxConfig.chartType.timeSharing5) _this.getQuote();
			},
			// 滚动到最左边的时候加载下一页数据
			nextPage: function (data, index) {
				// 加载完数据必须调用此方法
				// kline.finishLoading();
				//console.log("开始加载下一页数据.....");
				// 继续加载下一页数据
				if (_this.kline.chartType >= dsxConfig.chartType.candle) _this.getDay(_this.kline);
			}
		});
	}

	tab(i) {
		if (i <= 2) this.kline.chartType = i;
		if (i > 2) this.kline.chartType = 2;
		if (i == 0) this.cycle = "timeline";
		if (i == 1) this.cycle = "timeline5";
		if (i == 2) this.cycle = "day";
		if (i == 3) this.cycle = "week";
		if (i == 4) this.cycle = "month";
		if (i == 5) this.cycle = "m1";

		this.kline.startLoading();
	}

	getDate(date) {
		let year = date.getFullYear(); // 获取年份
		let month = date.getMonth() + 1; // 获取月份，月份从 0 开始计数，因此需要加 1
		let day = date.getDate(); // 获取日期
		if (month < 10) {
			// 如果月份是一位数，前面添加 0
			month = "0" + month;
		}
		if (day < 10) {
			// 如果日期是一位数，前面添加 0
			day = "0" + day;
		}
		let dateString = year + "-" + month + "-" + day; // 将年、月、日连接起来
		return dateString;
	}

	getDay() {
		// return this.getBinanceBTCKline();
		// return this.getOkeBTCKline();
		if (this.cycle.startsWith("m") && !this.cycle.startsWith("month")) {
			if (this.code.startsWith("hk") || this.code.startsWith("us")) {
				this.kline.finishLoading();
				return;
			}
			this.getMinutes();
			return;
		}

		const _this = this;
		if (this.page <= 1) {
			this.last_date = this.getDate(new Date());
		}
		// 按数量分页
		const pageSize = 220;
		const startDate = new Date(this.last_date);
		startDate.setDate(startDate.getDate() - pageSize);
		const endDate = new Date(this.last_date);
		endDate.setDate(endDate.getDate() - (this.page > 1 ? 1 : 0));
		const start = this.getDate(startDate);
		const end = this.getDate(endDate);
		qqhq.getLine(
			this.code,
			this.cycle,
			start,
			end,
			pageSize,
			"qfqday",
			function (data) {
				if (data.length > 0) {
					//d.data = [];
					if (_this.page <= 1) _this.datas = data;
					if (_this.page > 1) _this.datas = data.concat(_this.datas);
					// 按日期分页，得到最近一个日期
					const lastd = _this.datas[0];
					_this.last_date = lastd.split(",")[0];
					_this.last_date = _this.last_date.substring(0, 4) + "-" + _this.last_date.substring(4, 6) + "-" + _this.last_date.substring(6, 8);
					// 更新K线图
					const options = {
						main: ["BOLL"],
						// main: ["EMA"],
						// sides: ["VOL", "MACD", "KDJ", "RSI", "OBV", "BIAS", "WR", "CCI", "DMA", "MTM"],
						sides: ["VOL", "MACD", "KDJ"],
						sideHeight: 40,
						page: _this.page,
						datas: _this.datas
					};
					_this.kline.update(options);
					if (_this.datas.length <= pageSize + 1 && _this.page <= 1) {
						setInterval(() => {
							// _this.randomRefreshData(JSON.parse(JSON.stringify(_this.datas)))
						}, _this.refreshTime);
					}
					_this.page++;
				} else {
					_this.kline.scrollTheend();
				}
				_this.kline.finishLoading();
			},
			function (error) {
				_this.kline.finishLoading();
			}
		);
	}

	async updateKlineDatas(options) {
		return new Promise((resolve, reject) => {
			try {
				// 使用 Promise.resolve() 包装同步函数的执行
				Promise.resolve(this.kline.updateDatas(options))
					.then(() => {
						resolve(); // 异步操作成功时，resolve Promise
					})
					.catch((error) => {
						reject(error); // 异步操作失败时，reject Promise
					});
			} catch (error) {
				reject(error); // 同步操作出错时，reject Promise
			}
		});
	}

	getBinanceBTCKline() {
		qqhq.get("https://www.binance.com/api/v3/uiKlines?endTime=" + new Date().getTime() * 1000 + "&limit=100&symbol=BTCUSDT&interval=1d", (datas) => {
			datas = JSON.parse(datas);
			// console.log(datas);

			const data = [];
			datas.forEach((item) => {
				const [date, open, high, low, close, vol] = item;
				const d = this.getDate(new Date(date)).replaceAll("-", "");
				data.push([d, open, high, low, close, vol].join(","));
			});
			if(this.page<=1) this.datas = data
			else this.datas = this.datas.concat(data);
			this.kline.update({
				// main: ["BOLL"],
				main: ["EMA", "SAR"],
				sides: ["MACD","KDJ","BIAS"],
				// sides:kline.chartType<=1?["VOL"]:["VOL","MACD","KDJ","RSI"],
				sideHeight: 100,
				page: this.page,
				datas: this.datas
			});
			this.page++;
			this.kline.finishLoading();
		});
	}

	getOkeBTCKline() {
		qqhq.get("./src/day.json", (datas) => {
			datas = JSON.parse(datas);
			datas = datas.data;
			datas.reverse();
			// console.log(datas);
			const data = [];
			datas.forEach((item) => {
				const [date, open, high, low, close, vol] = item;
				const d = this.getDate(new Date(parseInt(date))).replaceAll("-", "");
				data.push([d, open, high, low, close, vol].join(","));
			});
			this.datas = data;
			this.kline.update({
				main: ["BOLL"],
				// main: ["EMA"],
				sides: ["BIAS", "WR", "DMA", "RSI", "MTM"],
				// sides:kline.chartType<=1?["VOL"]:["VOL","MACD","KDJ","RSI"],
				sideHeight: 100,
				page: this.page,
				datas: this.datas
			});
			this.kline.finishLoading();
		});
	}

	getMinutes() {
		qqhq.getMinLine(
			this.code,
			this.cycle,
			320,
			(data) => {
				// console.log(data);
				if (data.length > 0) {
					//d.data = [];
					if (this.page <= 1) this.datas = data;
					if (this.page > 1) this.datas = data.concat(this.datas);
					//console.log(datas);
					this.kline.update({
						sides: this.kline.chartType <= 1 ? ["VOL"] : ["VOL", "MACD", "KDJ", "RSI", "WR"],
						sideHeight: 40,
						page: this.page,
						datas: this.datas
					});
					this.page++;
				}
				this.kline.finishLoading();
				this.getLastOneData();
			},
			function (error) {
				this.kline.finishLoading();
			}
		);
	}

	refresh(data) {
		let d = data;
		// refreshQuote(d);
		// console.log(d)
		let item = d.date.replace("-", "").replace("-", "") + "," + d.time.replace(":", "").substr(0, 4) + "," + d.price + "," + (d.type == "1" ? parseFloat(d.vol) : d.vol) + "," + d.volAmount;
		if (this.kline.chartType == dsxConfig.chartType.candle || this.kline.chartType == dsxConfig.chartType.moveTime) {
			if (this.cycle.startsWith("min1")) {
				item =
					d.date.replace("-", "").replace("-", "") +
					"," +
					d.time.replace(":", "").substr(0, 4) +
					"," +
					d.price +
					"," +
					d.price +
					"," +
					d.price +
					"," +
					d.price +
					"," +
					parseFloat(d.vol) +
					"," +
					d.volAmount;
			} else {
				item = d.date.replace("-", "").replace("-", "") + "," + d.open + "," + d.high + "," + d.low + "," + d.price + "," + parseFloat(d.vol) + "," + d.volAmount;
			}
		}
		// console.log(item);
		let c = "t";
		if (this.cycle == "day") c = "d";
		if (this.cycle == "week") c = "w";
		if (this.cycle == "month") c = "m";
		if (this.cycle == "year") c = "y";
		if (this.cycle == "min1") c = "m1";
		if (this.cycle == "timeline") c = "t";
		if (this.cycle == "timeline5") c = "t5";
		//console.log(cycle+"_"+item);
		// if (this.kline) this.kline.refreshLastOneData(item, c);
	}

	randomRefreshData(datas) {
		if (this.kline.chartType < 2) return;
		if (this.ri <= 0) this.ri = 0;
		// console.log(datas)
		let i = Math.floor(Math.random() * this.datas.length);
		if (this.ri >= this.datas.length) this.ri = 0;
		let d = this.datas[this.ri];
		if (this.ld == "") {
			d = this.datas[this.datas.length - 1];
			// console.log(d)
		}
		d = d.split(",");

		// 日期加1
		let ndate = d[0].substr(0, 4) + "-" + d[0].substr(4, 2) + "-" + d[0].substr(6, 2);
		// console.log(ndate)
		if (this.ld == "") this.ld = ndate;
		else ndate = this.ld;
		let date = new Date(ndate);
		date.setDate(date.getDate() + 1);
		this.ld = this.getDate(date);

		let item = {
			date: this.ld,
			time: "",
			name: this.code,
			code: this.code,
			type: 0,
			open: d[1],
			high: d[2],
			low: d[3],
			price: d[4],
			vol: d[5],
			volAmount: d[6]
		};

		// console.log(item)

		this.refresh(item);

		this.ri++;
	}

	getTimeLine() {
		qqhq.getTimeLine(
			this.code,
			(data) => {
				//let d = JSON.parse(data);
				//console.log(data);
				//d.data = [];
				this.kline.update({
					chartType: dsxConfig.chartType.timeSharing,
					//theme:"dark",
					candleType: dsxConfig.candleType.hollow,
					// zoomLockType:dsxConfig.zoomLockType.right,
					isShowKlineTipPannel: false,
					sideHeight: 120,
					main: ["TMA"],
					sides: ["VOL"],
					datas: data
				});
				this.kline.finishLoading();
				this.getLastOneData();
			},
			function (error) {
				this.kline.finishLoading();
			}
		);
	}

	getTimeLine5() {
		qqhq.getFdayLine(
			this.code,
			(data) => {
				//let d = JSON.parse(data);
				// console.log(data);
				//d.data = [];
				this.kline.update({
					lastClose: parseFloat(data.lastClose),
					chartType: dsxConfig.chartType.timeSharing,
					//theme:"dark",
					// candleType:dsxConfig.candleType.hollow,
					// zoomLockType:dsxConfig.zoomLockType.right,
					sideHeight: 120,
					isShowKlineTipPannel: false,
					main: ["MA"],
					sides: ["VOL"],
					datas: data.data
				});
				this.kline.finishLoading();
				this.getLastOneData();
			},
			function (error) {
				this.kline.finishLoading();
			}
		);
	}

	getQuote() {
		qqhq.getQuote(
			this.code,
			(data) => {
				let d = data[0];
				this.kline.lastClose = d.lastClose;
				if (this.kline.chartType == dsxConfig.chartType.timeSharing) this.getTimeLine();
				if (this.kline.chartType == dsxConfig.chartType.timeSharing5) this.getTimeLine5();
			},
			function (error) {}
		);
	}

	getQuoteRefresh() {
		if (!this.kline) return;
		qqhq.getQuote(
			this.code,
			(data) => {
				let d = data[0];
				// 需要判断交易时间，非交易时间不能刷新
				const openTime = "9:30-11:30,13:00-15:00";

				this.refreshQuote(d);

				let item = d.date.replace("-", "").replace("-", "") + "," + d.time.replace(":", "").substr(0, 4) + "," + d.price + "," + (d.type == "1" ? parseFloat(d.vol) : d.vol) + "," + d.volAmount;
				if (this.kline.chartType == dsxConfig.chartType.candle) {
					if (this.cycle.startsWith("min1")) {
						item =
							d.date.replace("-", "").replace("-", "") +
							"," +
							d.time.replace(":", "").substr(0, 4) +
							"," +
							d.price +
							"," +
							d.price +
							"," +
							d.price +
							"," +
							d.price +
							"," +
							parseFloat(d.vol) +
							"," +
							d.volAmount;
					} else {
						item = d.date.replace("-", "").replace("-", "") + "," + d.open + "," + d.high + "," + d.low + "," + d.price + "," + parseFloat(d.vol) + "," + d.volAmount;
					}
				}
				// console.log(item);
				let c = "t";
				if (this.cycle == "day") c = "d";
				if (this.cycle == "week") c = "w";
				if (this.cycle == "month") c = "m";
				if (this.cycle == "year") c = "y";
				if (this.cycle == "min1") c = "m1";
				if (this.cycle == "timeline") c = "t";
				if (this.cycle == "timeline5") c = "t5";
				//console.log(cycle+"_"+item);
				this.kline.refreshLastOneData(item, c);
			},
			function (error) {}
		);
	}

	/**
     * "lastTime": "15:00:10",
        "code": "sh000001",
        "volumnPrice": "519833300000",
        "openPrice": "3303.71",
        "volumn": "46628560000",
        "circulationValue": "0",
        "type": "1",
        "peRatio": "0",
        "lowPrice": "3147.68",
        "price": "3256.39",
        "highPrice": "3321.48",
        "sell_5_s": "0",
        "sell_2_s": "0",
        "sell_1_s": "816520700",
        "sell_4_s": "0",
        "lastDate": "2022-03-09",
        "sell_3_s": "0",
        "buy_5": "0",
        "totalValue": "0",
        "buy_1": "0",
        "isStop": "0",
        "buy_2": "0",
        "buy_3": "0",
        "buy_4": "0",
        "buy_5_s": "0",
        "buy_3_s": "0",
        "buy_4_s": "0",
        "buy_1_s": "930290300",
        "swing": "0",
        "buy_2_s": "0",
        "sell_5": "0",
        "name": "上证指数",
        "sell_4": "0",
        "turnoverRate": "0",
        "sell_3": "0",
        "sell_2": "0",
        "closePrice": "3293.53",
        "cityNetRate": "0",
        "sell_1": "0"
    */
	refreshQuote(data) {
		Object.keys(data).forEach((key, index) => {
			let value = data[key];
			//console.log(key+"="+value);
			this.setDomValue(key, value, data.lastClose);
		});
		document.querySelector(".title .price").innerHTML = data.price;
		let d = data.price - data.lastClose;
		let r = (d / data.lastClose) * 100;
		document.querySelector(".title .changeRatio").innerHTML = d.toFixed(2) + " / " + r.toFixed(2) + "%";
		if (r > 0) {
			document.querySelector(".title").style.color = "red";
		}
		if (r == 0) {
			document.querySelector(".title").style.color = "#333";
		}
		if (r < 0) {
			document.querySelector(".title").style.color = "green";
		}

		// 标题
		document.querySelector(".navbar b").innerHTML = data.name;
		document.querySelector(".navbar span").innerHTML = data.code.toUpperCase() + " " + data.date + " " + data.time + " " + (data.time.replace(":", "").substr(0, 4) >= 1500 ? "已收盘" : "交易中");
	}

	setDomValue(key, value, close) {
		let dom = document.querySelector(".intro ." + key + " b");
		if (dom) {
			//console.log(dom);
			dom.innerHTML = value == 0 ? "-" : this.setNumber(value);
			if (key == "high" || key == "low" || key == "lastClose") {
				if (parseFloat(value) > parseFloat(close)) {
					dom.style.color = "red";
				}
				if (parseFloat(value) == parseFloat(close)) {
					dom.style.color = "#333";
				}
				if (parseFloat(value) < parseFloat(close)) {
					dom.style.color = "green";
				}
			}
		}
	}
	setNumber(number) {
		number = parseFloat(number);
		let r = number;
		if (number > 10000) r = (number / 10000).toFixed(2) + "万";
		if (number > 100000000) r = (number / 100000000).toFixed(0) + "亿";
		return r;
	}

	getLastOneData() {
		setInterval(() => {
			this.getQuoteRefresh();
		}, 5000);
		this.getQuoteRefresh();
	}
}
