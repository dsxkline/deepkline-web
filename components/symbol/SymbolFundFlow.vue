<script setup lang="ts">
	import { onMounted, ref } from "vue";
	const chart = ref(null);
	let echart: echarts.ECharts;
	import * as echarts from "echarts";

	const datas = [
		////////////////////////////////////////
		[
			{ name: "圣彼得堡来客", value: 5.6 },
			{ name: "陀思妥耶夫斯基全集", value: 1 },
			{ name: "史记精注全译（全6册）", value: 0.8 },
			{ name: "加德纳艺术通史", value: 0.5 },
			{ name: "表象与本质", value: 0.5 },
			{ name: "其它", value: 3.8 }
		]
	];
	const option = {
		title: {
			text: "阅读书籍分布",
			left: "center",
			textStyle: {
				color: "rgb(var(--text-color))",
				fontWeight: "normal",
				fontSize: 14
			}
		},
		grid: {
			top: "0", // 图表容器的上边距
			bottom: "0", // 图表容器的下边距
			left: "0", // 图表容器的左边距
			right: "0" // 图表容器的右边距
		},
		series: datas.map(function (data, idx) {
			var top = 0;
			return {
				type: "pie",
				radius: [20, 60],
				top: "0",
				height: "100%",
				left: "0",
				width: "100%",
				itemStyle: {
					borderColor: "rgb(249 250 251)",
					borderWidth: 1
				},
				label: {
					alignTo: "edge",
					formatter: "{name|{b}}\n{time|{c} 小时}",
					minMargin: 5,
					edgeDistance: 10,
					lineHeight: 15,
					rich: {
						name: {
							fontSize: 12,
							color: "rgb(249 250 251)"
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
	<div class="w-full h-full">
		<h3>资金流向</h3>
		<div class="container">
			<h4>15分钟</h4>
			<div
				class="chart w-full h-[300px]"
				ref="chart"></div>
		</div>
	</div>
</template>
<style lang="less" scoped></style>
