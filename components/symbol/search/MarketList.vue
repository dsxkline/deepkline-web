<script setup lang="ts">
	import { InstanceType,type Instruments } from '~/fetch/okx/okx.type.d'
	import { type MenuModel } from '../../common/TabBar.vue'
	import TabBar from '../../common/TabBar.vue'
	import SymbolList from './SymbolList.vue'
	const props = defineProps<{
		height: number,
		start?:boolean,
		keyword?:string
		isSearchList?:boolean
		selectHandle?: (item: Instruments) => void
	}>()
	const emit = defineEmits<{
		(event: 'clickHandle', symbol?: Instruments): void
	}>()
	const tabbar = ref()
	const active = ref(0)
	const menus = ref<MenuModel[]>([
		{
			name: '现货',
			contentComp: markRaw(SymbolList),
			contentParams: {
				symbolCategory: InstanceType.SPOT,
				keyword:props.keyword,
				isSearchList:props.isSearchList,
				selectHandle:props.selectHandle,
				clickHandle: (item:Instruments) => {
					// console.log('现货', item)
					emit('clickHandle', item)
				}
			}
		},
		{
			name: '合约',
			contentComp: markRaw(SymbolList),
			contentParams: {
				symbolCategory: InstanceType.SWAP,
				keyword:props.keyword,
				isSearchList:props.isSearchList,
				selectHandle:props.selectHandle,
				clickHandle: (item:Instruments) => {
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
				if(menus.value[0].contentParams)menus.value[0].contentParams.keyword = n
				if(menus.value[1].contentParams)menus.value[1].contentParams.keyword = n
				update()
			}
		}
	)	

	function update() {
		// console.log('update',props.keyword)
		if(props.keyword){
			if(tabbar.value?.updateAll)tabbar.value.updateAll()
		}else{
			if(tabbar.value?.update)tabbar.value.update()
		}
	}
    function leave(){
        if(tabbar.value?.leave) tabbar.value.leave()
    }

	onMounted(() => {
		// 计算高度
		if (props.start) {
			nextTick(()=>{
				update()
			})
		}
	})
	onBeforeUnmount(()=>{
		tabbar.value = null
	})
	// 暴露给父组件的方法
	defineExpose({ update,leave })
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
