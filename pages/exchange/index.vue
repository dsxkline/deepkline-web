<script setup lang="ts">
	import type { MenuModel } from '~/components/common/TabBar.vue'
	import { useStore } from '~/store'
	import ExchangeList from './exchange-list.vue'
	import { usePush } from '~/composable/usePush'
	import AccountHelp from '../account/account-help.vue'
	import { getAppStatusBarHeight, getMenuHeight, getNavHeight } from '~/composable/useCommon'
	const props = defineProps<{
		push?: boolean
		height?: number
	}>()
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
		}
		// {
		// 	name: '外汇',
		// 	contentComp: markRaw(ExchangeList)
		// }
	])

	watch(
		() => useStore().bodyHeight,
		(n, o) => {
			setTabbarHeight()
		}
	)

	function setTabbarHeight() {
		tabbarHeight.value = (props.height || useStore().bodyHeight) - (useStore().isH5 ? navbar.value?.clientHeight || getNavHeight() : 0) - getAppStatusBarHeight()
		if (!props.push) {
			tabbarHeight.value -= getMenuHeight() || 55
		}
	}

	function pushHelp() {
		pushLeft(AccountHelp)
	}

	onMounted(() => {
		setTabbarHeight()
	})
	onUnmounted(() => {
		menus.value = []
		navbar.value = null
	})
</script>
<template>
	<div class="exchange-index-container">
		<AppStatusBar/>
		<NavigationBar ref="navbar" title="开设账户" :hideBack="!push">
			<template #right>
				<button class="flex items-center p-2 px-4" @click="pushHelp">
					<HelpIcon class="w-5 h-5" />
				</button>
			</template>
		</NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: tabbarHeight + 'px' }" :always="false">
			<LoginCard :hide-buttons="true" :title="'连接全球顶尖经纪商'" :desc="'实战才是检验真理的唯一标准'" />
			<TabBar :menus="menus" />
		</ScrollBar>
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

	.navbar {
		display: none;
	}

	@media (max-width: 999px) {
		.navbar {
			display: flex;
		}
	}
</style>
