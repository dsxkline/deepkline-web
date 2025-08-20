<script setup lang="ts">
	import SymbolDetail from '~/components/symbol/SymbolDetail.vue'
	import { getMenuHeight, getNavHeight } from '~/composable/useCommon'
	import { useAddPageSubSymbols } from '~/composable/usePageSubSymbols'
	import { usePush } from '~/composable/usePush'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import type { BigOrderDto, FundingRateDto, MainForceDto } from '~/fetch/dtos/symbol.dto'
	import { symbolsFetch } from '~/fetch/symbols.fetch'
	import { useStore } from '~/store'
	import { useSymbolStore } from '~/store/symbol'

	const props = defineProps<{
		push?: boolean
		pageSize?: number
		height?: number
		source?: string
	}>()
	const loading = ref(false)
	const error = ref('')
	const datas = ref<BigOrderDto[]>([])
	let page = 1
	let pageSize = props.pageSize || 10
	const lheader = ref()

	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height || 0 - (lheader.value?.clientHeight || 0)
	})

	function getDatas() {
		if (loading.value) return
		if (!datas.value?.length) loading.value = true
		error.value = ''

		symbolsFetch
			.bigOrderList(page, pageSize)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					datas.value = result.data || []
				} else {
					if (!datas.value?.length) error.value = result?.msg
				}
			})
			.catch(err => {
				loading.value = false
				if (!datas.value?.length) error.value = '网络异常，请稍后再试'
			})
	}

	const push = usePush()
	function clickSymbol(item?: BigOrderDto) {
		if (useStore().isH5) {
			const params = {
				symbol: item?.symbol
			}
			push(SymbolDetail, params)
			return
		}
	}

	function update() {
		getDatas()
	}

	onMounted(() => {})

	defineExpose({
		update
	})
</script>
<template>
	<div class="py-2">
		<Error :content="error" v-if="!loading && error">
			<template #default>
				<el-button @click.stop="getDatas">点击重新加载</el-button>
			</template>
		</Error>
		<Empty :msg="error" v-if="!loading && !error && !datas.length">
			<template #default>
				<el-button @click.stop="getDatas">点击重新加载</el-button>
			</template>
		</Empty>
		<div ref="lheader" class="symbol-list-header w-full py-2" v-else-if="!loading && !error">
			<ul :class="'grid grid-cols-5 *:flex *:items-center text-xs text-grey'">
				<li class="col-span-2"><span>名称</span></li>
				<li class="justify-start"><span>买卖</span></li>
				<li class="justify-center"><span>成交价</span></li>
				<li class="justify-end"><span>成交额</span></li>
			</ul>
		</div>
		<ScrollBar class="w-full h-full" :noScroll="!height" :style="{ height: height ? +contentHeight + 'px' : 'auto' }" :always="false" v-if="!loading && !error && datas.length">
			<ul class="*:py-2 *:grid *:grid-cols-5 *:justify-between *:min-h-10" v-if="!loading">
				<template v-for="item in datas">
					<li @click="clickSymbol(item)" class="items-center">
						<div class="col-span-2 flex flex-col items-start justify-start" v-autosize="16">
							<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" v-if="useSymbolStore().getSymbol(item.symbol)" size="20px" />
							<span v-else> -- </span>
							<span class="text-xs text-grey">{{ formatDate(parseInt(item.ts),'MM/DD HH:mm:ss') }}</span>
						</div>
						<div class="text-center text-xs">
							<span class="tag-green w-max" v-if="item.side=='buy'">买入</span>
							<span class="tag-red w-max" v-if="item.side=='sell'">卖出</span>
						</div>
						<div class="text-center text-xs">
							{{ formatPrice(item.px,'', useSymbolStore().getSymbol(item.symbol).tickSz) }}
						</div>
						<div class="text-end text-xs">
							{{ moneyFormat(parseFloat(item.px)*parseFloat(item.sz)*parseFloat(useSymbolStore().getSymbol(item.symbol).contractSize||'1'), '2') }}
						</div>
					</li>
				</template>
			</ul>
		</ScrollBar>
		<div class="*:py-2 *:grid *:grid-cols-5 *:justify-between" v-else-if="loading && !error">
			<template v-for="item in 10">
				<div class="h-10 flex items-center">
					<el-skeleton :rows="0" animated class="col-span-2 flex flex-col justify-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 70%; height: 10px" />
						</template>
					</el-skeleton>
					<el-skeleton :rows="0" animated class="col-span-3 flex flex-col justify-center">
						<template #template>
							<el-skeleton-item variant="p" style="width: 100%; height: 10px" />
						</template>
					</el-skeleton>
				</div>
			</template>
		</div>
	</div>
</template>
<style lang="less" scoped>
	.funding-down {
		background: linear-gradient(to right, rgb(var(--color-red) / 0.5), rgb(var(--color-red) / 0));
	}
	.funding-up {
		background: linear-gradient(to left, rgb(var(--color-green) / 0.5), rgb(var(--color-green) / 0));
	}
	.funding-bg {
		background: linear-gradient(to left, var(--transparent00), var(--transparent10), var(--transparent00));
	}
</style>
