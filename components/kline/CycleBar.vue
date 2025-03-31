
<script setup lang="ts">
import { useKlineStore } from '~/store/kline';

const cycleList = ref([
    { label: '1分', value: '1m' },
    { label: '5分', value: '5m' },
    { label: '15分', value: '15m' },
    { label: '30分', value: '30m' },
    { label: '1小时', value: '1H' },
    { label: '2小时', value: '2H' },
    { label: '4小时', value: '4H' },
    { label: '1日', value: '1D' },
    { label: '1周', value: '1W' },
    { label: '1月', value: '1M' }
])
const cycle = ref('1m')
const onCycleChange = async (value:string)=>{
    if(useKlineStore().loading) return;
    cycle.value = value
    useKlineStore().setCycle(value);
}
</script>
<template>
<div class="cycle-bar ml-4 w-max flex gap-1 *:py-[2px] *:px-2 *:rounded *:text-xs *:cursor-pointer">
    <div class="cycle-bar-item">周期</div>
    <div class="cycle-bar-item" v-for="(item, index) in cycleList" :key="index" :class="{active: item.value === cycle}" @click.stop="onCycleChange(item.value)">
        {{item.label}}
    </div>
</div>
</template>
<style scoped lang="less">
.cycle-bar{
    .cycle-bar-item:not(.active):hover{
        background-color: var(--transparent05);
    }
    .active{
        background-color: rgb(var(--color-green));
        color: rgb(var(--color-bg-base));
    }
}
</style>