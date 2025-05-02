<script setup lang="ts">
const {$ws} = useNuxtApp()
const signalState = ref(0)
$ws?.getSignalState((stateLevel:number) => {
    // console.log('signalState',stateLevel)
    signalState.value = stateLevel
})

const signalStateText = computed(() => {
    switch (signalState.value) {
        case -2:
            return '连接失败'
        case -1:
            return '重连中...'
        case 0:
            return '无信号'
        case 1:
            return '弱信号'
        case 2:
            return '中信号'
        case 3:
            return '强信号'
        case 4:
            return '超强信号'
        default:
            return ''
    }
})

</script>
<template>
	<div class="signal-state flex items-center justify-center h-full w-fit relative px-3">
        <div class="absolute left-[10px] bottom-[-4px]" v-if="signalState<0"><el-icon class="!text-red !w-3 !h-3"><Close/></el-icon></div>
		<ul class="flex items-end justify-center *:w-[3px] h-[12px] *:bg-green *:opacity-20 *:rounded-2 *:mx-[1px]">
            <li :class="['h-[15%] ',signalState>=0?'!opacity-60':'',signalState<0?'!bg-[--transparent30] !opacity-100':'']"></li>
			<li :class="['h-[35%] ',signalState>=1?'!opacity-70':'',signalState<0?'!bg-[--transparent30] !opacity-100':'']"></li>
			<li :class="['h-[55%] ',signalState>=2?'!opacity-80':'',signalState<0?'!bg-[--transparent30] !opacity-100':'']"></li>
			<li :class="['h-[75%] ',signalState>=3?'!opacity-90':'',signalState<0?'!bg-[--transparent30] !opacity-100':'']"></li>
			<li :class="['h-[100%] ',signalState>=4?'!opacity-100':'',signalState<0?'!bg-[--transparent30] !opacity-100':'']"></li>
		</ul>
		<div class="px-1">
			<span :class="['text-green text-xs',signalState>=0?'opacity-'+(signalState*10 + 60)+'':'!text-grey']">{{signalStateText}}</span>
		</div>
	</div>
</template>
<style lang="less" scoped>

</style>
