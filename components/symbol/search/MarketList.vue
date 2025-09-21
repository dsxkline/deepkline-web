<script setup lang="ts">
	import { useStore } from '~/store'
	import { type MenuModel } from '../../common/TabBar.vue'
	import TabBar from '../../common/TabBar.vue'
	import SymbolList from './SymbolList.vue'
	import { MarketType, type SymbolDto } from '~/fetch/dtos/symbol.dto'
	const { t } = useI18n()
	const props = defineProps<{
		height: number
		start?: boolean
		keyword?: string
		isSearchList?: boolean
		selectHandle?: (item: SymbolDto) => void
	}>()
	const emit = defineEmits<{
		(event: 'clickHandle', symbol?: SymbolDto): void
	}>()
	const tabbar = ref()
	const active = ref(0)
	const menus = computed<MenuModel[]>(() => [
		{
			name: t('现货'),
			contentComp: markRaw(SymbolList),
			contentParams: {
				symbolCategory: MarketType.SPOT,
				keyword: props.keyword,
				isSearchList: props.isSearchList,
				selectHandle: props.selectHandle,
				clickHandle: (item: SymbolDto) => {
					// console.log('现货', item)
					emit('clickHandle', item)
				}
			}
		},
		{
			name: t('合约'),
			contentComp: markRaw(SymbolList),
			contentParams: {
				symbolCategory: MarketType.SWAP,
				keyword: props.keyword,
				isSearchList: props.isSearchList,
				selectHandle: props.selectHandle,
				clickHandle: (item: SymbolDto) => {
					// console.log('现货', item)
					emit('clickHandle', item)
				}
			}
		}
	])

	watch(
		() => props.keyword,
		(n, o) => {
			if (n !== o) {
				// console.log('props.keyword active',active.value,tabbar.value)
				if (menus.value[0].contentParams) menus.value[0].contentParams.keyword = n
				if (menus.value[1].contentParams) menus.value[1].contentParams.keyword = n
				update()
			}
		}
	)

	

	function update() {
		// console.log('update',props.keyword)
		if (props.keyword) {
			if (tabbar.value?.updateAll) tabbar.value.updateAll()
		} else {
			if (tabbar.value?.update) tabbar.value.update()
		}
	}
	function leave() {
		if (tabbar.value?.leave) tabbar.value.leave()
	}

	onMounted(() => {
		// 计算高度
		if (props.start) {
			nextTick(() => {
				update()
			})
		}
	})
	onBeforeUnmount(() => {
		tabbar.value = null
	})
	// 暴露给父组件的方法
	defineExpose({ update, leave })
</script>
<template>
	<div>
		<TabBar :menus="menus" ref="tabbar" :height="height" />
	</div>
</template>

<style lang="less" scoped>
	:deep(.tabbar-container) {
		.tabbar-header {
			padding: 0 16px;
			border-bottom: none;
			ul {
				li {
					@apply text-sm;
				}
			}
		}
	}
</style>
