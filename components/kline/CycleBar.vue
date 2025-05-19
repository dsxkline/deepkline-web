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
		{ label: '1分', value: '1m', display: true },
		{ label: '5分', value: '5m', display: true },
		{ label: '15分', value: '15m', display: false },
		{ label: '30分', value: '30m', display: useStore().isH5 ? false : true },
		{ label: '1小时', value: '1H', display: true },
		{ label: '2小时', value: '2H', display: false },
		{ label: '4小时', value: '4H', display: false },
		{ label: '1日', value: '1D', display: true },
		{ label: '1周', value: '1W', display: useStore().isH5 ? false : true },
		{ label: '1月', value: '1M', display: useStore().isH5 ? false : true }
	])
	const cycle = ref('1m')
	const onCycleChange = async (value: string) => {
		if (useKlineStore().loading[symbolObj.value.instId]) return
		cycle.value = value
		useKlineStore().setCycle(symbolObj.value.instId, value)
	}
</script>
<template>
	<div class="cycle-bar w-full flex items-center gap-1">
		<div class="flex gap-1 *:py-[2px] *:px-2 *:rounded *:text-sm *:cursor-pointer *:text-grey">
			<template v-for="(item, index) in cycleList">
				<div class="cycle-bar-item" :key="index" :class="{ active: item.value === cycle }" click-sound @click="onCycleChange(item.value)" v-if="item.display">
					{{ item.label }}
				</div>
			</template>
			<button class="flex items-center !pr-0">
				<span>更多</span><el-icon class="mx-1"><CaretBottom /></el-icon>
			</button>
		</div>

		<el-divider direction="vertical" v-if="!useStore().isH5"></el-divider>

		<div class="flex items-center *:h-full *:flex *:items-center">
			<button class="pl-1"><IndicatorIcon class="w-4 h-4" /></button>
			<button class="pl-4">
				<el-icon class="!w-4 !h-4 !text-[var(--transparent70)] hover:!text-main"><Tools  class="!w-4 !h-4"/></el-icon>
			</button>
		</div>
		
	</div>
</template>
<style scoped lang="less">
	.cycle-bar {
		.cycle-bar-item:not(.active):hover {
			background-color: var(--transparent05);
		}
		.active {
			background-color: var(--transparent20);
			color: rgb(var(--color-text-main));
		}
	}
	@media (max-width: 999px) {
		.cycle-bar {
			justify-content: space-between;
			max-width: 100%;
			overflow-x: scroll;
			flex-wrap: nowrap;
			/* 隐藏滚动条 */
			scrollbar-width: none; /* Firefox */
			-ms-overflow-style: none; /* IE/Edge */
			&::-webkit-scrollbar {
				display: none; /* Chrome/Safari */
			}
			.cycle-bar-item {
				white-space: nowrap;
				@apply px-0 py-2 mr-4 rounded-none flex items-center;
				padding: 6px 0;
			}
			.cycle-bar-item:not(.active):hover {
				background-color: unset;
			}
			.active {
				background-color: unset;
				color: rgb(var(--color-text-main));
				border-bottom: 1px solid rgb(var(--color-text-main));
			}
		}
	}
</style>
