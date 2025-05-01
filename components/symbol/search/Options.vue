<script setup lang="ts">
	import { InstanceType } from '~/fetch/okx/okx.type.d'
	import { type MenuModel } from '../../common/TabBar.vue'
	import TabBar from '../../common/TabBar.vue'
	import SymbolList from './SymbolList.vue'
import { useSymbolStore } from '~/store/symbol';

	const props = defineProps<{
		height: number
	}>()
	const tabbar = ref()
	const active = ref(0)

	const menus = ref<MenuModel[]>([
		{
			name: '现货',
			contentComp: markRaw(SymbolList),
			contentParams: {
				symbolCategory: InstanceType.SPOT,
                favorite: true
			}
		},
		{
			name: '合约',
			contentComp: markRaw(SymbolList),
			contentParams: {
				symbolCategory: InstanceType.SWAP,
                favorite: true
			}
		}
	])

	function update() {
		console.log('update',active.value)
		tabbar.value.update(active.value)
	}

	onMounted(() => {
		// 计算 TabBar 的高度
		useSymbolStore().loadFavoriteSymbols()
		let favoriteSymbols = useSymbolStore().favoriteSymbols || []
		let favoriteSymbolsSWAP = favoriteSymbols.filter(item => item.instType === InstanceType.SWAP) || []
		let favoriteSymbolsSPOT = favoriteSymbols.filter(item => item.instType === InstanceType.SPOT) || []
		// 有合约没有现货的自选，自动切过去
		if(favoriteSymbolsSWAP?.length>0 && !favoriteSymbolsSPOT?.length){
			active.value = 1
			update()
		}
	})

	// 暴露给父组件的方法
	defineExpose({ update })
</script>
<template>
	<div>
		<TabBar :menus="menus" ref="tabbar" :height="height" />
	</div>
</template>

<style lang="less" scoped>
	:deep(.tabbar-container) {
		.tabbar-header {
            border-bottom: none;
			ul {
				li {
					@apply text-sm;
				}
			}
		}
	}
</style>
