<script setup lang="ts">
	import SymbolDetail from '~/components/symbol/SymbolDetail.vue'
	import { getMenuHeight, getNavHeight } from '~/composable/useCommon'
	import { useAddPageSubSymbols } from '~/composable/usePageSubSymbols'
	import { usePush } from '~/composable/usePush'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import type { FundingRateDto, MainForceDto } from '~/fetch/dtos/symbol.dto'
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
	const datas = ref<FundingRateDto[]>([])
	let page = 1
	let pageSize = props.pageSize || 10

	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height || 0
	})

	function getDatas() {
		if (loading.value) return
		if (!datas.value?.length) loading.value = true
		error.value = ''

		symbolsFetch
			.fundingRateList(page, pageSize)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					datas.value = result.data || []
					setPosition()
				} else {
					if (!datas.value?.length) error.value = result?.msg
				}
			})
			.catch(err => {
				loading.value = false
				if (!datas.value?.length) error.value = '网络异常，请稍后再试'
			})
	}

	function setPosition() {
		datas.value.forEach(item => {
			const fundingRate = item.fundingRate
			if (fundingRate > 0) {
				// 在右边
				item.left = undefined
				item.right = 50 - fundingRate / item.maxFundingRate * 200
			}
			else {
				// 在左边
				item.right = undefined
				item.left = 50 - fundingRate / item.minFundingRate * 200
			}
			
		})
	}

	const push = usePush()
	function clickSymbol(item?: FundingRateDto) {
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
	<div :style="{ height: height ? +contentHeight + 'px' : 'max-content' }">
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
		<ScrollBar class="w-full h-full" :noScroll="!height" :style="{ height: height ? +contentHeight + 'px' : 'auto' }" :always="false" v-if="!loading && !error && datas.length">
			<ul class="*:py-2 *:grid *:grid-cols-5 *:justify-between *:min-h-10 py-2" v-if="!loading">
				<template v-for="item in datas">
					<li @click="clickSymbol(item)">
						<div class="col-span-2 flex items-center" v-autosize="16">
							<SymbolName :symbol="useSymbolStore().getSymbol(item.symbol)" v-if="useSymbolStore().getSymbol(item.symbol)" size="20px" />
							<span v-else> -- </span>
						</div>
						<div class="h-full col-span-3 w-full text-[10px] leading-normal *:rounded-sm items-center flex relative">
							<div class="h-4 absolute left-1/2 flex items-center text-grey">
								<div class="w-1 h-2 bg-[--transparent10] rounded-sm mr-1"></div>
								<span class="px-0 flex items-center h-full">0</span>
							</div>
							<div
								:class="['h-4 w-1/3 flex items-center absolute', item.left != undefined && 'funding-down', item.right != undefined && 'funding-up']"
								:style="[item.left != undefined ? 'left:' + Math.max(0, item.left) + '%' : '', item.right != undefined ? 'right:' + Math.max(0, item.right) + '%;justify-content:end;' : '']"
							>
								<span class="px-1 flex items-center h-full">{{ item.left != undefined ? '' : item.right != undefined ? '+' : '' }}{{numberToFixed(item.fundingRate,'5')}}%</span>
							</div>
							<div class="h-4 funding-bg w-full"></div>
						</div>
					</li>
				</template>
			</ul>
		</ScrollBar>
		<div class="*:py-2 *:grid *:grid-cols-5 *:justify-between"  v-else-if="loading && !error">
			<template v-for="item in pageSize">
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
