<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
const chart = ref(null);
let echart: echarts.ECharts;
let base = +new Date(1968, 9, 3);
let oneDay = 24 * 3600 * 1000;
let date = [];
let data = [Math.random() * 300];
for (let i = 1; i < 200; i++) {
	var now = new Date((base += oneDay));
	date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
	data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
}
const option = {
	tooltip: {
		trigger: 'axis',
	},
	grid: {
		top: "5", // 图表容器的上边距
		bottom: "30", // 图表容器的下边距
		// left: "50", // 图表容器的左边距
		right: "10" // 图表容器的右边距
	},
	xAxis: {
		type: 'category',
		boundaryGap: true,
		data: date
	},
	yAxis: {
		type: 'value',
		boundaryGap: [0, '100%'],
	
	},
	series: [
		{
			name: 'Fake Data',
			type: 'line',
			showSymbol: false,
			sampling: 'lttb',
			itemStyle: {
				color: 'rgb(255, 70, 131)'
			},
			areaStyle: {
				color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					{
						offset: 0,
						color: 'rgb(255, 158, 68)'
					},
					{
						offset: 1,
						color: 'rgb(255, 70, 131)'
					}
				])
			},
			data: data
		}
	]
};

onMounted(() => {
	echart = echarts.init(chart.value, useColorMode().value == 'dark' ? 'dark' : 'light');
	echart.setOption(option);
});
onDeactivated(() => {
	echart.dispose();
});
</script>
<template>
	<div class="w-full h-full mt-2 border-b border-[--border-color] pb-3 ">
		<h3 class="py-2 text-sm mb-3 flex justify-between items-center">
			24小时资金净流入

		</h3>
		<div class="container">
			<div class="chart w-full h-[150px]" ref="chart"></div>
		</div>
	</div>
</template>
<style lang="less" scoped></style>
