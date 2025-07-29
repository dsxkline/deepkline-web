<script setup lang="ts">
	import type { MarketSectorDto } from '~/fetch/dtos/exchange.dto'
	import LineChart from '../common/LineChart.vue'
	import { exchangeFetch } from '~/fetch/exchange.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'

	const loading = ref(false)
	const error = ref('')
	const sectors = ref<MarketSectorDto[]>([])

	function getMarketSectors() {
		if (loading.value) return
		loading.value = true
		error.value = ''
		exchangeFetch
			.marketSectors()
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					sectors.value = result.data || []
				} else {
					error.value = result?.msg
				}
			})
			.catch(err => {
				error.value = '网络异常，请稍后再试'
			})
	}

	onMounted(() => {
		getMarketSectors()
	})
</script>
<template>
	<div class="market-category px-4 py-2">
		<h3 class="pb-3 flex justify-between items-center font-bold">
			热门板块 <el-icon><ElIconArrowRight /></el-icon>
		</h3>
		<div class="w-full overflow-x-scroll scrollbar-hide">
			<Error :content="error" v-if="!loading && error">
				<template #default>
					<el-button @click.stop="getMarketSectors">点击刷新</el-button>
				</template>
			</Error>
			<ul class="flex w-max" v-if="!loading && !error">
				<template v-for="item in sectors">
					<li class="p-3 rounded-md overflow-hidden bg-[--transparent02] glass-1 w-[calc(var(--body-width)/2)] mr-2 relative">
						<h4 class="text-sm font-bold">{{ item.name }}</h4>
						<div class="text-sm flex flex-col py-3">
							<b class="text-green text-base font-bold">{{ item.rate > 0 ? '+' : '' }}{{ numberToFixed(item.rate * 100, '2') }}%</b>
							<span class="text-xs text-grey">24小时涨跌</span>
						</div>
						<div class="text-xs flex">
							<span>{{ item.topCoins?.split(',')[0] }}</span
							><span class="text-green px-1">+8.68%</span>
						</div>
						<LineChart symbol="BTC-USDT" class="absolute right-0 top-0 w-2/5 h-1/2 translate-y-2/3 mx-3" />
					</li>
				</template>
			</ul>
			<ul class="flex w-max" v-else-if="!error">
				<template v-for="item in [{}, {}]">
					<li class="p-3 rounded-md overflow-hidden bg-[--transparent02] w-[calc(var(--body-width)/2)] mr-2 relative">
						<el-skeleton :rows="0" animated>
							<template #template>
								<el-skeleton-item variant="p" style="width: 60%; height: 12px" />
							</template>
						</el-skeleton>
						<div class="text-sm flex flex-col py-3">
							<el-skeleton :rows="0" animated class="flex flex-col justify-center gap-2">
								<template #template>
									<el-skeleton-item variant="p" style="width: 40%; height: 8px" />
									<el-skeleton-item variant="p" style="width: 30%; height: 8px" />
								</template>
							</el-skeleton>
						</div>
						<el-skeleton :rows="0" animated>
							<template #template>
								<el-skeleton-item variant="p" style="width: 50%; height: 8px" />
							</template>
						</el-skeleton>
					</li>
				</template>
			</ul>
		</div>
	</div>
</template>
