<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
const chart = ref(null);
let echart: echarts.ECharts;
const timeVal = ref('15');
const timeOptions = [
	{
		value: '15',
		label: '15分钟',
	},
	{
		value: '30',
		label: '30分钟',
	},
	{
		value: '60',
		label: '1小时',
	},
	{
		value: '240',
		label: '4小时',
	},
	{
		value: '1440',
		label: '一天',
	},
]
const datas = [
	////////////////////////////////////////
	[
		{ name: "大单卖出", value: 5.6 },
		{ name: "中单卖出", value: 1 },
		{ name: "小单卖出", value: 0.8 },
		{ name: "大单买入", value: 0.5 },
		{ name: "中单买入", value: 0.5 },
		{ name: "小单买入", value: 3.8 }
	]
];
const option = {
	title: {
		text: "资金流向",
		subtext: "15分钟",
		left: 'center',
		top: '25%',
		itemGap: 3,
		textStyle: {
			color: "rgb(249 250 251)",
			fontWeight: "normal",
			fontSize: 12
		},
		subtextStyle: {
			color: "rgb(249 250 251)",
			fontSize: 12
		}
	},
	grid: {
		top: "0", // 图表容器的上边距
		bottom: "0", // 图表容器的下边距
		left: "0", // 图表容器的左边距
		right: "0" // 图表容器的右边距
	},
	legend: {
		bottom: '0',
		left: '0',
		right: '0',
		itemWidth: 10,
		itemHeight: 10,
		padding: 0,
		itemStyle: {
			borderWidth: 0,
			left: 0
		},
		textStyle: {
			color: "rgb(143 144 154)",
			fontSize: 12,
		}
	},
	series: datas.map(function (data, idx) {
		var top = 0;
		return {
			type: "pie",
			radius: [40, 70],
			center: ['50%', '30%'],
			top: "0",
			height: "100%",
			left: "0",
			width: "100%",
			itemStyle: {
				borderColor: "rgb(0 0 0)",
				borderWidth: 1
			},
			label: {
				alignTo: "edge",
				formatter: "{name|{b}}\n{time|{c} 小时}",
				minMargin: 5,
				edgeDistance: 0,
				lineHeight: 15,
				rich: {
					name: {
						fontSize: 12,
						color: "rgb(143 144 154)"
					},
					time: {
						fontSize: 10,
						color: "rgb(249 250 251)"
					}
				}
			},
			labelLine: {
				length: 15,
				length2: 0,
				maxSurfaceAngle: 80
			},
			labelLayout: function (params: { labelRect: { x: number; width: any }; labelLinePoints: any }) {
				const isLeft = params.labelRect.x < echart.getWidth() / 2;
				const points = params.labelLinePoints;
				// Update the end point.
				points[2][0] = isLeft ? params.labelRect.x : params.labelRect.x + params.labelRect.width;
				return {
					labelLinePoints: points
				};
			},
			data: data
		};
	})
};

onMounted(() => {
	echart = echarts.init(chart.value);
	echart.setOption(option);
});
onDeactivated(() => {
	echart.dispose();
});
</script>
<template>
	<div class="w-full h-full mt-3 border-t border-b border-[--border-color] pb-3 ">
		<h3 class="py-2 text-sm mb-3 flex justify-between items-center">
			资金流向
			<el-select v-model="timeVal" style="width: 100px;">
				<el-option v-for="item in timeOptions" :key="item.value" :label="item.label" :value="item.value" />
			</el-select>
		</h3>
		<div class="container">
			<div class="chart w-full h-[260px]" ref="chart"></div>
		</div>
	</div>
</template>
<style lang="less" scoped></style>
