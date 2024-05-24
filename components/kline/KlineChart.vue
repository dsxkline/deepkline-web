<script setup>
import DsxKlineChart from './DsxKlineChart'
const klineDom = ref(null);
onMounted(()=>{
    const chart = new DsxKlineChart({
        element:klineDom.value,
        autoSize:true,
    });
    chart.create();
})
</script>
<template>
    <div class="kline-chart-container w-full h-full">
        <div class="kline w-full h-full" ref="klineDom"></div>
    </div>
</template>