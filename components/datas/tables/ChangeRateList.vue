<script lang="ts" setup>
	import { getMenuHeight, getNavHeight } from '~/composable/useCommon'
	import { usePush, useRefreshChildEvent, useWillAppear, useWillDisappear } from '~/composable/usePush'
	import type { MarketSectorDto } from '~/fetch/dtos/exchange.dto'
	import { useStore } from '~/store'
	import SymbolList from '~/components/symbol/search/SymbolList.vue'
	import { MarketType, type ChangeRateDto } from '~/fetch/dtos/symbol.dto'
	import HotSector from '~/components/sector/HotSector.vue'
	import { symbolsFetch } from '~/fetch/symbols.fetch'
	import { FetchResultDto } from '~/fetch/dtos/common.dto'
	import SymbolDetail from '~/components/symbol/SymbolDetail.vue'
	const { t } = useI18n()
	const props = defineProps<{
		push?: boolean
		pageSize?: number
		height?: number
		source?: string
	}>()
	const loading = ref(false)
	const error = ref('')
	const datas = ref<ChangeRateDto[]>([])
	let page = 1
	let pageSize = props.pageSize || 10
	const symbolList = ref()

	const contentHeight = computed(() => {
		// 获取当前组件的高度
		return props.height || 0
	})

	const symbols = computed(() => {
		return datas.value.map(item => item.symbol)
	})

	function getDatas() {
		if (loading.value) return
		if (!datas.value?.length) loading.value = true
		error.value = ''

		symbolsFetch
			.changeRateList(page, pageSize)
			.then(result => {
				loading.value = false
				if (result?.code == FetchResultDto.OK) {
					datas.value = result.data || []
					console.log('symbols',symbols)
				} else {
					if (!datas.value?.length) error.value = result?.msg
				}
			})
			.catch(err => {
				loading.value = false
				if (!datas.value?.length) error.value = t('网络异常，请稍后再试')
			})
	}

	const push = usePush()
	function clickSymbol(item?: ChangeRateDto) {
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
	function leave(){
		symbolList.value?.leave()
	}

	onMounted(() => {})

	defineExpose({
		update,
		leave
	})
</script>
<template>
	<div class="market-sectors w-full" :style="{ height: height ? +contentHeight + 'px' : 'max-content' }">
		<SymbolList ref="symbolList" :symbolCategory="MarketType.SPOT" :putSymbols="symbols" :start="true" :height="contentHeight" :source="source"/>
	</div>
</template>
<style lang="less" scoped>
	:deep(.symbol-list-header) {
		padding-left: 0;
		padding-right: 0;
	}
	:deep(.symbol-list-content) {
		ul {
			li {
				padding-left: 0;
				padding-right: 0;
			}
		}
	}
</style>
