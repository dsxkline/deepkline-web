<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import { _borderColor } from "#tailwind-config/theme";
const chart = ref(null);
let echart: echarts.ECharts;
const option = {
  
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    formatter: function (params: any[]) {
      let tar;
      if (params[1] && params[1].value !== '-') {
        tar = params[1];
      } else {
        tar = params[2];
      }
      return tar && tar.name + '<br/>' + tar.seriesName + ' : ' + tar.value;
    }
  },

  grid: {
	top:20,
    left: '0',
    right: '10',
    bottom: '3%',
    containLabel: true,
	borderColor:"#333"
  },
  xAxis: {
    type: 'category',
    data: (function () {
      let list = [];
      for (let i = 1; i <= 11; i++) {
        list.push('Nov ' + i);
      }
      return list;
    })()
  },
  yAxis: {
    type: 'value',
	left:0,
	splitLine:{
      lineStyle:{
        color:"#333"
      }
    }
  },
  series: [
    {
      name: 'Placeholder',
      type: 'bar',
      stack: 'Total',
      silent: true,
      itemStyle: {
        borderColor: 'transparent',
        color: 'transparent',
      },
      emphasis: {
        itemStyle: {
          borderColor: 'transparent',
          color: 'transparent'
        }
      },
      data: [0, 900, 1245, 1530, 1376, 1376, 1511, 1689, 1856, 1495, 1292]
    },
    {
      name: 'Income',
      type: 'bar',
      stack: 'Total',
      label: {
        show: true,
        position: 'top',
		textBorderColor:"transparent",
		color:"#fff"
      },
      data: [900, 345, 393, '-', '-', 135, 178, 286, '-', '-', '-']
    },
    {
      name: 'Expenses',
      type: 'bar',
      stack: 'Total',
      label: {
        show: true,
        position: 'bottom',
		textBorderColor:"transparent",
		color:"#fff"
      },
      data: ['-', '-', '-', 108, 154, '-', '-', '-', 119, 361, 203]
    }
  ]
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
	<div class="w-full h-full mt-3 border-b border-[--border-color] pb-3 ">
		<h3 class="py-2 text-sm mb-3 flex justify-between items-center">
			5日主力净流入:
		</h3>
		<div class="container">
			<div class="chart w-full h-[260px]" ref="chart"></div>
		</div>
	</div>
</template>
<style lang="less" scoped></style>
