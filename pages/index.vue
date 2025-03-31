<script lang="ts" setup>
	import { useNuxtApp } from '#app'
	import OKXWebSocket from '@/fetch/okx/okx.websocket'
	import { CandleCannel } from '@/fetch/okx/okx.type.d'
	import MarketIndex from '@/pages/market/index.vue'
import type { MenuModel } from '~/components/common/TabBar.vue'
import { House, Monitor } from '@element-plus/icons-vue'
	// 使用默认布局
	definePageMeta({
		layout: 'main'
	})
	onMounted(async () => {
		console.log('server', process.server)
	})
	const active = ref(0)
	const activeMenu = computed(() => menus.value[active.value])
	// 定义菜单及对应的组件
	const menus = ref<MenuModel[]>([
		{
			name: '行情',
			icon: markRaw(House),
			contentComp: markRaw(MarketIndex),
			contentParams: {
				
			}
		},
		{
			name: '其他',
			icon: markRaw(Monitor),
			contentComp: markRaw(MarketIndex),
			contentParams: {
				
			}
		},
	])
	const menuHandler = (item:MenuModel, index: number) => {
		console.log('menuHandler', item, index)
	}
	const update = () => {
		console.log('update')
	}
</script>
<template>
	<div class="main-container flex justify-between flex-row">
		<LeftMenu @menuHandler="menuHandler" :menus="menus"></LeftMenu>
		<!-- 使用缓存 -->
		<KeepAlive>
			<component :is="activeMenu.contentComp" :height="500" />
		</KeepAlive>
	</div>
</template>

<style></style>
