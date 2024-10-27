<!-- 合约持仓量及交易量 -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
const chart = ref(null);
const period = ref('5m');
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
// 在组件顶部声明 resizeObserver
let resizeObserver: ResizeObserver | null = null;
const containerRef = ref(null)
const width = ref<number>(0);
const option = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            crossStyle: {
                color: '#999'
            }
        }
    },
    legend: {
        data: ['交易量', '持仓量'],

        // data: ['BTC多空账户比'],
        icon: 'circle',// 可选值：'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'
        itemWidth: 6,
        itemHeight: 6,
        left: 0,
        textStyle: {
            fontSize: 12
        }

    },
    grid: {
		top: "30", // 图表容器的上边距
		bottom: "30", // 图表容器的下边距
		// left: "50", // 图表容器的左边距
		// right: "10" // 图表容器的右边距
	},
    xAxis: [
        {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisPointer: {
                type: 'shadow'
            }
        }
    ],
    yAxis: [
        {
            type: 'value',
            boundaryGap: [0, '100%'],
            splitLine: {
                lineStyle: {
                    color: "#eee"
                }
            }
        },
        {
            type: 'value',
            boundaryGap: [0, '100%'],
            splitLine: {
                lineStyle: {
                    color: "#eee"
                }
            }
        }
    ],
    series: [
        {
            name: '交易量',
            type: 'bar',
            smooth: true,
            tooltip: {
                valueFormatter: function (value: any) {
                    return value + ' ml';
                }
            },
            data: [
                2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
            ]
        },
        {
            name: '持仓量',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            tooltip: {
                valueFormatter: function (value: any) {
                    return value + ' °C';
                }
            },
            data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
        }
    ]
};;

onMounted(() => {
    echart = echarts.init(chart.value);
    echart.setOption(option);
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
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
});
</script>
<template>
    <div class="w-full h-full mt-2 border-b border-[--border-color] pb-3 mb-3" ref="containerRef" :style="{width: width>0?width + 'px':'auto'}">
        <h3 class="py-1 text-sm mb-1 flex items-center">
            <b class="text-base">持仓量及成交量</b>
            <button class="text-xs ml-1 bg-[--transparent10] p-1 rounded">合约</button>
        </h3>
        <el-radio-group v-model="period" class="mb-2">
            <el-radio-button value="5m">5分钟</el-radio-button>
            <el-radio-button value="1h">1小时</el-radio-button>
            <el-radio-button value="1d">1天</el-radio-button>
        </el-radio-group>
        <div class="container">
            <div class="chart w-full h-[200px]" ref="chart"></div>
        </div>
    </div>
</template>
<style lang="less" scoped></style>
