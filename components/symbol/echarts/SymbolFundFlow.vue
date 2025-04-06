<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import { marketFetch } from "~/fetch/market.fetch";
const props = defineProps({
	symbol: {
		type: String,
		default: ''
	}
});
const loading = ref(true)
const error = ref('')
const chart = ref(null);
let echart: echarts.ECharts;
const timeVal = ref('15');
let xAxisData: string[] = [];
let seriesData: number[] = [];
// 在组件顶部声明 resizeObserver
let resizeObserver: ResizeObserver | null = null;
const containerRef = ref(null)
const width = ref<number>(0);
const disabled = ref(false);

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

const fetchData = ()=>{
	error.value = ''
	loading.value = true
	marketFetch.getTrades(props.symbol).then(res => {
		loading.value = false
		if (res?.code == 0 && res.data) {
			const data = res.data[0]
			// console.log('getTrades', data)
			// updateOrderBook(data)
			// 限制频率
			// subHandle = $ws.subBooks('books', [symbolObj.value?.instId || props.symbol], (message, error) => {
			// 	// console.log('subBooksL2Tbt', message.data[0])
			// 	updateBookList(message)
			// })
		} else {
			error.value = res?.msg
		}
	}).catch(err=>{
		console.log('err', err)
		loading.value = false
		error.value = '网络异常，请稍后再试'
	})
	
}

onMounted(() => {
	echart = echarts.init(chart.value);
	echart.setOption(option);
	fetchData()
	if (containerRef.value) {
        resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                // 获取父级的宽度和内边距paddingLeft
                const parentWidth = (parentElement.parentNode?.parentNode as HTMLElement).clientWidth;
                const parentPaddingLeft = (parentElement.parentNode as HTMLElement).getBoundingClientRect().left - parentElement.getBoundingClientRect().left;
                width.value = parentWidth - 2 * Math.abs(parentPaddingLeft);
                echart.resize();
            }
        })
        // 监听父级元素宽度变化
        const parentElement = containerRef.value as HTMLElement;
        if (parentElement) {
            resizeObserver.observe(parentElement.parentNode?.parentNode as HTMLElement);
        }
    }
});
onDeactivated(() => {
	echart.dispose();
});
</script>
<template>
	<div class="w-full h-full mt-3 border-t border-b border-[--border-color] pb-3 " ref="containerRef">
		<h3 class="py-2 text-sm mb-3 flex justify-between items-center">
			资金流向
			<el-select v-model="timeVal" style="width: 100px;">
				<el-option v-for="item in timeOptions" :key="item.value" :label="item.label" :value="item.value" />
			</el-select>
		</h3>
		<div class="container" v-show="!loading && !error">
			<div class="chart w-full h-[260px]" ref="chart"></div>
		</div>
		<el-skeleton :rows="5" animated v-if="loading && !error" />
        <el-result icon="error" title="错误提示" :sub-title="error" v-if="!loading && error">
            <template #extra>
                <el-button type="primary" @click.stop="fetchData()">点击刷新</el-button>
            </template>
        </el-result>
	</div>
</template>
<style lang="less" scoped></style>
