<script setup lang="ts">
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import { OrderState, type OrderDto } from '~/fetch/dtos/order.dto'
	import { MarketType } from '~/fetch/dtos/symbol.dto'
	import { MarginMode, OrderType, Sides } from '~/fetch/okx/okx.type.d'
	import { orderFetch } from '~/fetch/order.fetch'
	import { useAccountStore } from '~/store/account'
	import { useOrderStore } from '~/store/order'
	import { useSymbolStore } from '~/store/symbol'
	import { useUserStore } from '~/store/user'

	const loading = ref(true)
	const error = ref('')
	const assets = computed(() => useOrderStore().assets)

	watch(
		() => useAccountStore().currentAccount,
		() => {
			getAssets()
		}
	)

	const getAssets = () => {
		if (!useAccountStore().currentAccount?.accountId) {
			loading.value = false
			return
		}
		if (assets.value?.length) {
			loading.value = false
			return
		}
		loading.value = true
		error.value = ''
		orderFetch
			.crypeAssets(useAccountStore().currentAccount?.accountId)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					result.data?.forEach(item => useOrderStore().addPosition(item))
				} else {
					error.value = result?.msg
				}
			})
			.catch(err => {
				loading.value = false
				error.value = '网络异常，请稍后再试'
			})
	}


	onMounted(() => {
		getAssets()
	})
</script>

<template>
	<div class="px-4 min-h-[500px]">
		<h3 class="pb-3">资产</h3>
		<Empty :content="'暂无委托'" v-if="!loading && !error && !assets?.length" class="pt-20"> </Empty>
		<Error :content="error" v-if="!loading && error" class="pt-20">
			<template #default>
				<el-button @click.stop="getAssets">点击刷新</el-button>
			</template>
		</Error>
		<ul v-if="loading && !error">
			<li class="border-b border-[--transparent05] py-3" v-for="item in 5">
				<div class="flex justify-between">
					<div class="flex items-center w-full">
						<el-skeleton :rows="0" animated>
							<template #template>
								<el-skeleton-item variant="p" style="width: 50%; height: 18px" />
							</template>
						</el-skeleton>
					</div>
					<div class="flex justify-between items-center gap-4"></div>
				</div>
				<div class="py-0 flex items-center">
					<el-skeleton :rows="0" animated class="flex items-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 30%; height: 10px" />
						</template>
					</el-skeleton>
				</div>
				
			</li>
		</ul>
		<ul class="*:grid *:grid-cols-3 *:w-full *:py-2 *:items-center *:my-1 *:border-b *:border-[--transparent05]" v-if="!loading && !error && assets?.length">
			<li>
				<div class="text-xs text-grey">名称</div>
				<div class="text-xs text-right text-grey">数量/余额</div>
				<div class="text-xs text-right text-grey">收益</div>
			</li>
			<template v-for="item in assets">
				<li>
					<b class="col-span-1 text-base">
						<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" :onlyCoin="true" size="30px" />
					</b>
					<div class="flex flex-col col-span-1 text-xs items-end">
						<span class="text-sm">{{ formatNumber(parseFloat(item.lotSize), useSymbolStore().getSymbol(item.symbol).lotSz) }}</span>
						<span class="text-grey">{{ formatNumber(parseFloat(item.lotBalance || '0'), useSymbolStore().getSymbol(item.symbol).lotSz) }}</span>
					</div>
					<div class="flex flex-col col-span-1 text-xs items-end" v-if="parseFloat(item.profit)">
						<span :class="['text-sm', parseFloat(item.profit) > 0 ? 'text-green' : 'text-red']">
							{{ parseFloat(item.profit) > 0 ? '+' : '' }}{{ formatNumber(parseFloat(item.profit), '2') }}
						</span>
						<span :class="parseFloat(item.profitRate) > 0 ? 'text-green' : 'text-red'">
							{{ parseFloat(item.profitRate) > 0 ? '+' : '' }}{{ formatNumber(parseFloat(item.profitRate || '0') * 100, '2') }}%</span
						>
					</div>
					<div class="flex flex-col col-span-1 text-xs items-end" v-else>
						<span :class="['text-sm']">0.00</span>
						<span>0.00%</span>
					</div>
				</li>
			</template>
		</ul>
	</div>
</template>
