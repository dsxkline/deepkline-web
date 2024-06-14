<script setup lang="ts">
	import { onMounted, ref } from "vue";
	const chart = ref(null);
	let echart: echarts.ECharts;
	import * as echarts from "echarts";

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
			text: "15分钟",
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
        legend: {
            bottom: '5%',
            left: '0',
            right:'0',
            itemWidth: 10,
            itemHeight: 10,
            itemStyle:{
                borderWidth:0,
            },
            textStyle:{
                color: "rgb(var(--text-color))",
                fontSize:12,
            }
        },
		series: datas.map(function (data, idx) {
			var top = 0;
			return {
				type: "pie",
				radius: [20, 60],
                center: ['50%', '30%'],
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
			<div
				class="chart w-full h-[300px]"
				ref="chart"></div>
		</div>
	</div>
</template>
<style lang="less" scoped></style>
