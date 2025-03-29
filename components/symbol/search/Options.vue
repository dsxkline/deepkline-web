<script setup lang="ts">
	import { InstanceType } from '~/fetch/okx/okx.type.d'
	import { type MenuModel } from '../../common/TabBar.vue'
	import TabBar from '../../common/TabBar.vue'
	import SymbolList from './SymbolList.vue'

	const props = defineProps<{
		height: number
	}>()
	const tabbar = ref()

	const menus = ref<MenuModel[]>([
		{
			name: '现货',
			contentComp: markRaw(SymbolList),
			contentParams: {
				symbolCategory: InstanceType.SPOT
			}
		},
		{
			name: '合约',
			contentComp: markRaw(SymbolList),
			contentParams: {
				symbolCategory: InstanceType.SWAP
			}
		}
	])

	function update() {
		console.log('update')
		tabbar.value.update()
	}
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
			ul {
				li {
					@apply text-sm;
				}
			}
		}
	}
</style>
