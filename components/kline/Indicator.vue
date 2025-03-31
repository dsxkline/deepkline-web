<script setup lang="ts">
	import { useKlineStore } from "~/store/kline";
	const mainIndicatorList = ref(["MA", "EMA", "BOLL", "SAR", "ZIG"]);
	const sideIndicatorList = ref(["VOL", "OBV", "MACD", "KDJ", "RSI", "BIAS", "WR", "DMA", "MTM", "CCI", "PSY"]);
	function onMainIndicatorChange(value: string) {
		useKlineStore().setMain(value);
	}
	function onSidesIndicatorChange(value: string) {
		useKlineStore().setSides(value);
	}
</script>
<template>
	<div class="indicator ml-4 w-max flex gap-1 *:p-1 *:rounded *:text-xs *:cursor-pointer">
		<div class="indicator-item">指标</div>
		<div
			class="indicator-item"
			v-for="(item, index) in mainIndicatorList"
			:key="index"
			:class="{ active: useKlineStore().main.includes(item) }"
			@click="onMainIndicatorChange(item)">
			{{ item }}
		</div>
		<div class="indicator-item">|</div>
		<div
			class="indicator-item"
			v-for="(item, index) in sideIndicatorList"
			:key="index"
			:class="{ active: useKlineStore().sides.includes(item) }"
			@click="onSidesIndicatorChange(item)">
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
</style>
