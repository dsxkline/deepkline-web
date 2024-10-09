<script setup lang="ts">
import { useKlineStore } from "~/store/kline";
import DsxKlineChart from "./DsxKlineChart";
import { ChartType, CandleType, ZoomLockType, CrossModel, type DsxWindow } from "./DsxKlineChart.d";
declare var window: DsxWindow;
const klineDom = ref(null);
onMounted(() => {
	const symbol = "BTC-USDT-SWAP";
	const chart = new DsxKlineChart(symbol, useKlineStore().cycle, {
		element: klineDom.value || '',
		autoSize: true,
		chartType: ChartType.candle,
		// klineWidth: 1,
		// theme: 'dark',
		candleType: CandleType.solid,
		zoomLockType: ZoomLockType.follow,
		crossModel: CrossModel.mouseOver,
		// transformers: true,
		// isShowKlineTipPannel: true,
		// sideHeight: 80,
		// paddingBottom: 20,
		// paddingMiddle: 0,
		// main: ["EMA"], // 主图指标
		// sides: ["VOL"], // 副图显示指标(两个副图，第一个显示MACD，第二个显示KDJ)
		isShowTips: true,
		allMin: false,
	});
	nextTick(() => {
		chart.create();
	});

	watch(
		() => useKlineStore().cycle,
		(newVal, oldVal) => {
			chart.updateCycle(newVal);
		}
	);
	watch(
		() => useColorMode().preference,
		(newVal) => {
			chart.updateTheme(newVal);
		}
	);
	watch(
		() => useKlineStore().main,
		(newVal) => {
			console.log('newVal useKlineStore().main=', newVal)
			chart.selectMain(newVal);
		}
	);
	watch(
		() => useKlineStore().sides,
		(newVal) => {
			chart.selectSides(newVal);
		}
	);

});
</script>
<template>
	<div class="kline-chart-container w-full h-full">
		<div class="kline w-full h-full" ref="klineDom"></div>
		
	</div>
</template>
