<script setup lang="ts">
	import LineChart from '../common/LineChart.vue'

	const categories = ref([{}, {}, {}, {}, {}, {}, {}, {}])
	const loading = ref(true)

	onMounted(() => {
		setTimeout(() => {
			loading.value = false
		}, 0)
	})
</script>
<template>
	<div class="market-category px-4 py-2">
		<h3 class="pb-3 flex justify-between items-center">
			热门板块 <el-icon><ElIconArrowRight /></el-icon>
		</h3>
		<div class="w-full overflow-x-scroll scrollbar-hide">
			<ul class="flex w-max" v-if="!loading">
				<template v-for="item in categories">
					<li class="p-3 rounded-md overflow-hidden bg-[--transparent02] glass-1 w-[calc(var(--body-width)/2)] mr-2 relative">
						<h4 class="text-sm font-bold">Liquid Staking</h4>
						<div class="text-sm flex flex-col py-3">
							<b class="text-green text-base font-bold">+1.70%</b>
							<span class="text-xs text-grey">24小时涨跌</span>
						</div>
						<div class="text-xs flex"><span>RPL</span><span class="text-green px-1">+8.68%</span></div>
						<LineChart symbol="BTC-USDT" class="absolute right-0 top-0 w-2/5 h-1/2 translate-y-2/3 mx-3" />
					</li>
				</template>
			</ul>
			<ul class="flex w-max" v-else>
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
									<el-skeleton-item variant="p" style="width: 40%; height: 5px" />
									<el-skeleton-item variant="p" style="width: 30%; height: 5px" />
								</template>
							</el-skeleton>
						</div>
						<el-skeleton :rows="0" animated>
							<template #template>
								<el-skeleton-item variant="p" style="width: 50%; height: 5px" />
							</template>
						</el-skeleton>
					</li>
				</template>
			</ul>
		</div>
	</div>
</template>
