<script setup lang="ts">
	import { useStore } from '~/store'
	import { useKlineStore } from '~/store/kline'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		symbol: string
	}>()
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})
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
	const onCycleChange = async (value: string) => {
		if (useKlineStore().loading[symbolObj.value.instId]) return
		cycle.value = value
		useKlineStore().setCycle(symbolObj.value.instId, value)
	}
</script>
<template>
	<div class="cycle-bar w-max flex gap-1 *:py-[2px] *:px-2 *:rounded *:text-xs *:cursor-pointer">
		<!-- <div class="cycle-bar-item">周期</div> -->
		<template v-for="(item, index) in cycleList">
			<div class="cycle-bar-item" :key="index" :class="{ active: item.value === cycle }" click-sound @click="onCycleChange(item.value)" v-if="(useStore().isH5 && index < 4) || !useStore().isH5">
				{{ item.label }}
			</div>
		</template>
		<button class="flex items-center"><span>更多</span><el-icon class="mx-1"><CaretBottom /></el-icon></button>
	</div>
</template>
<style scoped lang="less">
	.cycle-bar {
		.cycle-bar-item:not(.active):hover {
			background-color: var(--transparent05);
		}
		.active {
			background-color: var(--transparent20);
		}
	}
	@media (max-width: 999px) {
		.cycle-bar {
			max-width: 100%;
			overflow-x: scroll;
			flex-wrap: nowrap;
			height: 28px;
			/* 隐藏滚动条 */
			scrollbar-width: none; /* Firefox */
			-ms-overflow-style: none; /* IE/Edge */
			&::-webkit-scrollbar {
				display: none; /* Chrome/Safari */
			}
			.cycle-bar-item {
				white-space: nowrap;
				font-size: 14px;
				padding: 0 12px;
				height: 28px;
				display: flex;
				align-items: center;
			}
		}
	}
</style>
