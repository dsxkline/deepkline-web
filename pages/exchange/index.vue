<script setup lang="ts">
	import type { MenuModel } from '~/components/common/TabBar.vue'
	import { useStore } from '~/store'
	import ExchangeList from './exchange-list.vue'
	import { usePush } from '~/composable/usePush'
    import AccountHelp from '../account/account-help.vue'
	const pushLeft = usePush()
	const tabbarHeight = ref(0)
	const navbar = ref()
	const exchangeHeader = ref()
	const menus = ref<MenuModel[]>([
		{
			name: '所有经纪商',
			contentComp: markRaw(ExchangeList)
		},
		{
			name: '加密',
			contentComp: markRaw(ExchangeList)
		},
		// {
		// 	name: '外汇',
		// 	contentComp: markRaw(ExchangeList)
		// }
	])

	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			tabbarHeight.value = window?.innerHeight - (navbar.value?.clientHeight || 55) - (exchangeHeader.value?.clientHeight || 92)
		}
	)

	function pushHelp() {
		pushLeft(AccountHelp)
	}

	onMounted(() => {
		tabbarHeight.value = window?.innerHeight - (navbar.value?.clientHeight || 55) - (exchangeHeader.value?.clientHeight || 92)
	})
	onUnmounted(() => {
		menus.value = []
		navbar.value = null
	})
</script>
<template>
	<div class="exchange-index-container">
		<NavigationBar ref="navbar" title="开设账户">
			<template #right>
				<button class="flex items-center p-2" @click="pushHelp">
					<HelpIcon class="w-5 h-5" />
				</button>
			</template>
		</NavigationBar>
		<h1 class="px-6 text-2xl font-bold py-5 text-center" ref="exchangeHeader">
            连接全球顶尖经纪商
			<p class="text-sm font-normal text-grey py-2">实战才是检验真理的唯一标准</p>
		</h1>
		<TabBar :menus="menus" :height="tabbarHeight" />
	</div>
</template>

<style lang="less" scoped>
	:deep(.tabbar-container) {
		.tabbar-header {
			@apply px-4 flex items-center border-b;
			border-color: var(--transparent10);
			overflow-x: unset;
			height: var(--header-height);
			ul {
				li {
					@apply text-base mx-3;
				}
			}
		}
	}
</style>
