<!-- CryptoChangeChart.vue -->
<script setup lang="ts">
	import { useRequestAnimation } from '~/composable/useRequestAnimation'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import type { UpDownsDto } from '~/fetch/dtos/exchange.dto'
	import { exchangeFetch } from '~/fetch/exchange.fetch'
	import type { WsResult } from '~/types/types'

	const upValue = ref(0)
	const downValue = ref(0)
	const animation = useRequestAnimation()
	const loading = ref(false)
	function setValue(up: number, down: number) {
		animation.start({
			from: 0,
			to: up,
			duration: 600,
			onUpdate: (val: number) => {
				upValue.value = val
				downValue.value = (val * down) / up
			}
		})
	}

	function getMarketUpDowns() {
		if (loading.value) return
		loading.value = true

		exchangeFetch
			.updowns()
			.then(res => {
				loading.value = false
				if (res?.code === FetchResultDto.OK) {
					const data = res.data
					if (data && data.total) {
						setValue(data.up, data.down)
					} else {
						setValue(50, 50)
					}
				}
			})
			.catch(err => {
				loading.value = false
			})
	}

	const marketUpDownHandle = (data: WsResult<UpDownsDto>) => {
		const d = data.payload
		if (d && d.total) {
			setValue(d.up, d.down)
		}
	}

	onMounted(() => {
		getMarketUpDowns()
		useNuxtApp().$dkws.onMarketUpDown(marketUpDownHandle)
	})
	onBeforeUnmount(() => {
		animation.stop()
		useNuxtApp().$dkws.removeOnEvent(marketUpDownHandle)
	})
</script>
<template>
	<div ref="chartRef" class="w-full py-2">
		<div class="w-full h-4 text-[10px] text-white rounded-sm overflow-hidden flex justify-between items-center" v-if="!loading">
			<div
				class="bg-green/70 flex justify-center items-center h-full relative"
				:style="{
					width: `${upValue}%`,
					'clip-path': 'polygon(0px 0px, 0 100%, calc(100% - 5px) 100%, 100% 0%)'
				}"
			>
				<div class="absolute left-0 top-0 h-full flex items-center leading-none" v-autosize="10">
					<b class="px-1 pr-[2px]"
						><el-icon><SortUp /></el-icon></b
					><span v-if="upValue > 10">{{ parseFloat(upValue.toFixed(2)) }}%</span>
				</div>
			</div>
			<div
				class="bg-[--transparent20] flex justify-center items-center h-full relative"
				:style="{
					width: `${100 - upValue - downValue}%`,
					'clip-path': 'polygon(5px 0px, 0px 100%, calc(100% - 5px)100%, 100% 0%)'
				}"
			>
				<div class="absolute left-0 top-0 h-full flex items-center justify-center leading-none w-full" v-autosize="10">
					<span v-if="100 - upValue - downValue > 10">{{ parseFloat((100 - upValue - downValue).toFixed(2)) }}%</span>
				</div>
			</div>
			<div
				class="bg-red/70 flex justify-center items-center h-full relative"
				:style="{
					width: `${downValue}%`,
					'clip-path': 'polygon(5px 0px, 0px 100%, 100% 100%, 100% 0%)'
				}"
			>
				<div class="absolute right-0 top-0 h-full flex items-center leading-none" v-autosize="10">
					<span v-if="downValue > 10">{{ parseFloat(downValue.toFixed(2)) }}%</span
					><b class="px-1 pl-[2px]"
						><el-icon><SortDown /></el-icon
					></b>
				</div>
			</div>
		</div>

		<div class="w-full h-4 text-[10px] text-white rounded-sm overflow-hidden flex justify-between items-center" v-else>
			<el-skeleton :rows="0" animated>
				<template #template>
					<el-skeleton-item variant="p" style="width: 100%; height: 16px" />
				</template>
			</el-skeleton>
		</div>
	</div>
</template>

<style scoped>
	/* 保证图表容器有尺寸 */
</style>
