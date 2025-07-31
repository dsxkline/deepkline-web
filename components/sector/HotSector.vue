<script setup lang="ts">
	import type { MarketSectorDto } from '~/fetch/dtos/exchange.dto'
	import LineChart from '../common/LineChart.vue'
	import { exchangeFetch } from '~/fetch/exchange.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import { usePush, useWillAppear } from '~/composable/usePush'
	import Sectors from '~/pages/market/sectors.vue'
	import SectorDetail from '~/pages/market/sector-detail.vue'
	import { useAddPageSubSymbols } from '~/composable/usePageSubSymbols'
	import type { Ticker } from '~/fetch/okx/okx.type'
	import type { WsResult } from '~/types/types'

	const props = defineProps<{
		full?: boolean
		sector?: MarketSectorDto
	}>()

	const pushLeft = usePush()
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
					if (props.sector) {
						sectors.value = sectors.value.filter(item => item.sectorId == props.sector?.sectorId)
					}
					sectors.value = sectors.value.slice(0, props.full ? -1 : 6)
					pageSubSymbols.addSubSymbols(sectors.value.map(item => item.topCoins?.split(',')[0] + '-USDT'))
				} else {
					error.value = result?.msg
				}
			})
			.catch(err => {
				error.value = '网络异常，请稍后再试'
			})
	}

	const pushSectors = () => {
		pushLeft(Sectors)
	}

	// 使用页面订阅收集器
	const pageSubSymbols = useAddPageSubSymbols()

	const marketSectorDownHandle = (data: WsResult<MarketSectorDto>) => {
		const d = data.payload
		if (d) {
            const sector = sectors.value.find(item=>item.sectorId==d.sectorId)
			if(sector){
                sector.rate = d.rate
                sector.topCoins = d.topCoins

            }
		}
	}

    useWillAppear(()=>{
        getMarketSectors()
    })

	onMounted(() => {
		useNuxtApp().$dkws.onMarketSectorDown(marketSectorDownHandle)
		getMarketSectors()
	})

	onBeforeUnmount(() => {
		useNuxtApp().$dkws.removeOnEvent(marketSectorDownHandle)
	})
</script>
<template>
	<div class="market-category px-4 py-2">
		<h3 class="pb-3 flex justify-between items-center font-bold" @click="pushSectors" v-if="!full && !sector">
			热门板块 <el-icon><ElIconArrowRight /></el-icon>
		</h3>
		<div :class="['w-full', !full ? 'overflow-x-scroll scrollbar-hide' : '']">
			<Error :content="error" v-if="!loading && error">
				<template #default>
					<el-button @click.stop="getMarketSectors">点击刷新</el-button>
				</template>
			</Error>
			<ul :class="[full && !sector ? 'grid grid-cols-2 gap-4 pb-4' : 'flex w-max', sector ? '!w-full' : '']" v-if="!loading && !error">
				<template v-for="item in sectors">
					<SectorItem :full="full" :onlyOne="!!sector" :sector="item" />
				</template>
			</ul>
			<ul :class="[full ? 'grid grid-cols-2 gap-4 pb-4' : 'flex w-max']" v-else-if="!error">
				<template v-for="item in 10">
					<li :class="['p-3 rounded-md overflow-hidden bg-[--transparent02] glass-1 relative', !full ? 'w-[calc(var(--body-width)/2)] mr-2' : '']">
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
