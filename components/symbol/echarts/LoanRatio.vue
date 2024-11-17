<!-- 杠杆多空比 -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import { ComposFetch } from "@/fetch";
import { Period } from "@/fetch/okx/okx.type.d";
const chart = ref(null);
const period = ref('5m');
const loading = ref(true);
const error = ref('');
const props = defineProps<{
    symbol: string | null
}>();
let echart: echarts.ECharts;
let xAxisData: string[] = [];
let seriesData: number[] = [];
// 在组件顶部声明 resizeObserver
let resizeObserver: ResizeObserver | null = null;
const containerRef = ref(null)
const width = ref<number>(0);
const disabled = ref(false);
const option = {
    // title: {
    // 	text: 'BTC杠杆多空比',
    // 	textStyle: {
    // 		fontSize: 10,
    // 		color: "#999"
    // 	}
    // },
    legend: {
        // data: ['BTC多空账户比'],
        icon: 'circle',// 可选值：'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'
        itemWidth: 6,
        itemHeight: 6,
        left: 0,
        textStyle: {
            fontSize: 12
        }
    },
    tooltip: {
        trigger: 'axis',
    },
    grid: {
        containLabel: true,
		top: "30", // 图表容器的上边距
		bottom: "30", // 图表容器的下边距
		left: "0", // 图表容器的左边距
		right: "0" // 图表容器的右边距
    },
    xAxis: {
        type: 'category',
        boundaryGap: true,
        data: xAxisData
    },
    yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        splitLine: {
            lineStyle: {
                color: "#eee"
            }
        }
    },
    series: [
        {
            name: 'BTC杠杆多空比',
            type: 'line',
            smooth: true,
            showSymbol: true,
            sampling: 'lttb',
            itemStyle: {
                color: 'rgb(255, 70, 131)'
            },
            data: seriesData
        }
    ]
};
function fetchData(p: Period) {
    if (disabled.value) return;
    disabled.value = true;
    period.value = p;
    error.value = '';
    // loading.value = true;
    ComposFetch.tradingDataFetch.loanRatio('BTC', p).then((res) => {
        // console.log(res?.data);
        loading.value = false;
        disabled.value = false;
        if (res?.code == 0) {
            xAxisData = [];
            seriesData = [];
            option.xAxis.data = xAxisData;
            option.series[0].data = seriesData;
            echart.setOption(option);
            res.data.forEach(([ts, longShortAccountRatio]: any) => {
                xAxisData.push(ts);
                seriesData.push(longShortAccountRatio);
            });
            option.xAxis.data = xAxisData;
            option.series[0].data = seriesData;
            echart.setOption(option);
            // console.log(xAxisData,seriesData);
        } else {
            error.value = res?.msg || '获取数据失败';
        }
    }).catch(() => {
        loading.value = false;
        disabled.value = false;
        error.value = '网络不给力';
    });
}
watch(() => period.value, (newVal) => {
    fetchData(newVal as Period);
})
onMounted(() => {
    nextTick(() => {
        fetchData(period.value as Period);
        echart = echarts.init(chart.value, 'light');
        echart.setOption(option);
    })
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
    if (echart) {
        echart.dispose();
    }
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
});
</script>
<template>
    <div class="w-full h-full mt-2 border-b border-[--border-color] pb-3  mb-3" ref="containerRef"
        :style="{ width: width > 0 ? width + 'px' : 'auto' }">
        <h3 class="py-1 text-sm mb-1 flex items-center">
            <b class="text-base">杠杆多空比</b>
            <button class="text-xs ml-1 bg-[--transparent10] p-1 rounded">现货</button>
        </h3>
        <el-radio-group v-model="period" class="mb-2" v-show="!loading && !error" :disabled="disabled">
            <el-radio-button value="5m">5分钟</el-radio-button>
            <el-radio-button value="1H">1小时</el-radio-button>
            <el-radio-button value="1D">1天</el-radio-button>
        </el-radio-group>
        <div class="container" v-show="!loading && !error">
            <div class="chart w-full h-[200px]" ref="chart"></div>
        </div>
        <el-skeleton :rows="5" animated v-if="loading && !error" />
        <el-result icon="error" title="错误提示" :sub-title="error" v-if="!loading && error">
            <template #extra>
                <el-button type="primary" @click.stop="loading=true;fetchData(Period.M5)">点击刷新</el-button>
            </template>
        </el-result>
    </div>
</template>
<style lang="less" scoped></style>
