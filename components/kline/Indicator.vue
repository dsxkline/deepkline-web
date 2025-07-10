<script setup lang="ts">
	import { useKlineStore } from '~/store/kline'
	import { useSymbolStore } from '~/store/symbol'
	const props = defineProps<{
		symbol: string
	}>()
	const symbolObj = computed(() => {
		return useSymbolStore().symbols[props.symbol]
	})
	const mainIndicatorList = ref(['MA', 'EMA', 'BOLL', 'SAR', 'ZIG'])
	const sideIndicatorList = ref(['VOL', 'MACD', 'KDJ', 'RSI', 'BIAS', 'WR', 'DMA', 'MTM', 'CCI', 'PSY'])
	function onMainIndicatorChange(value: string) {
		useKlineStore().setMain(symbolObj.value?.symbol,value)
	}
	function onSidesIndicatorChange(value: string) {
		useKlineStore().setSides(symbolObj.value?.symbol,value)
	}
</script>
<template>
	<div class="indicator w-max flex gap-1 *:pr-2 *:rounded *:text-xs *:cursor-pointer">
		<!-- <div class="indicator-item">指标</div> -->
		<div class="indicator-item" v-click-sound v-for="(item, index) in mainIndicatorList" :key="index" :class="{ active: useKlineStore().main[symbolObj?.symbol]?.includes(item) }" @click="onMainIndicatorChange(item)">
			{{ item }}
		</div>
		<div class="indicator-item">|</div>
		<div class="indicator-item" v-click-sound v-for="(item, index) in sideIndicatorList" :key="index" :class="{ active: useKlineStore().sides[symbolObj?.symbol]?.includes(item) }" @click="onSidesIndicatorChange(item)">
			{{ item }}
		</div>
	</div>
</template>
<style scoped lang="less">
	.indicator {
		.indicator-item:not(.active):hover {
			background-color: var(--transparent05);
		}
		.active {
			// border:1px solid var(--el-menu-active-color);
			color: rgb(var(--color-green));
		}
	}
	@media (max-width: 999px) {
		.indicator {
			max-width: 100%;
			overflow-x: scroll;
			flex-wrap: nowrap;
			/* 隐藏滚动条 */
			scrollbar-width: none; /* Firefox */
			-ms-overflow-style: none; /* IE/Edge */
			&::-webkit-scrollbar {
				display: none; /* Chrome/Safari */
			}
			.indicator-item {
				white-space: nowrap;
			}
		}
	}
</style>
