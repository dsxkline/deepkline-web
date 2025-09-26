<script lang="ts" setup>
	import MarketIndex from '@/pages/market/index.vue'
	import TradeIndex from '@/pages/trade/index.vue'
	import TradeOrders from '@/pages/trade/orders.vue'
	import AccountIndex from '@/pages/account/index.vue'
	import DownloadIndex from '@/pages/download/index.vue'
	import type { MenuModel } from '~/components/common/TabBar.vue'
	import { UserFilled, Histogram, Monitor, Opportunity, HelpFilled, HomeFilled, Download, User } from '@element-plus/icons-vue'
	import { useStore } from '~/store'
	import Logo from '~/components/icons/Logo.vue'
	import AssetsIcon from '~/components/icons/AssetsIcon.vue'
	import TradeIcon from '~/components/icons/TradeIcon.vue'
	import Home from './home.vue'
	import { useAccountStore } from '~/store/account'
	import OrderIcon from '~/components/icons/order/OrderIcon.vue'
	import DownloadIcon from '~/components/icons/DownloadIcon.vue'
	import MenuContent from '~/components/MenuContent.vue'
	import MeIndex from '~/pages/me/index.vue'
	const { t } = useI18n()
	useHead({
		script: [{ src: 'https://turing.captcha.qcloud.com/TCaptcha.js' }]
	})
	// 使用默认布局
	definePageMeta({
		layout: 'main'
	})

	const active = ref(0)
	const activeCard = ref(0)
	const activeMenu = computed(() => menus.value && menus.value[active.value])
	const activeCardMenu = computed(() => menus.value && menus.value[activeCard.value])
	const activeMenuH5 = computed(() => menus5.value && menus5.value[active.value])
	const showLeftCard = ref(false)
	const leftMenu = ref()
	const leftCard = ref()
	const leftCardBg = ref()
	// 定义菜单及对应的组件
	const menus = computed<MenuModel[] | null>(() => [
		{
			name: t('行情'),
			// iconSelected: markRaw(Logo),
			icon: markRaw(Histogram),
			contentComp: markRaw(MarketIndex),
			contentParams: {}
		},
		{
			name: t('订单'),
			icon: markRaw(OrderIcon),
			contentComp: markRaw(TradeOrders),
			isCard: true,
			contentParams: {
				width: 400,
			}
		},
		{
			name: t('资产'),
			icon: markRaw(AssetsIcon),
			contentComp: markRaw(MenuContent),
			isCard: true,
			contentParams: {
				comp: AccountIndex,
				width: 400,
				contentParams: { mode: 'web' }
			}
		},
		{
			name: t('我的'),
			icon: markRaw(User),
			contentComp: markRaw(MenuContent),
			isCard: true,
			contentParams: {
				comp: MeIndex,
				width: 400,
				contentParams: { mode: 'web' }
			}
		},
		{
			name: t('下载简称'),
			icon: markRaw(DownloadIcon),
			contentComp: markRaw(DownloadIndex),
			contentParams: {}
		}
	])

	const menus5 = computed<MenuModel[] | null>(() => [
		{
			name: t('首页'),
			iconSelected: markRaw(Logo),
			icon: markRaw(HomeFilled),
			contentComp: markRaw(Home),
			contentParams: {}
		},
		{
			name: t('行情'),
			// iconSelected: markRaw(Logo),
			icon: markRaw(Histogram),
			contentComp: markRaw(MarketIndex),
			contentParams: {}
		},
		{
			name: t('交易'),
			icon: markRaw(TradeIcon),
			contentComp: markRaw(TradeIndex),

			contentParams: {}
		},
		// {
		// 	name: '策略',
		// 	icon: markRaw(Opportunity),
		// 	contentComp: markRaw(StrategyIndex),
		// 	contentParams: {}
		// },
		{
			name: t('资产'),
			icon: markRaw(AssetsIcon),
			contentComp: markRaw(AccountIndex),
			contentParams: {}
		}
	])
	const menuHandler = (item: MenuModel, index: number) => {
		if (item != activeCardMenu.value) {
			if (!item.isCard) hideLeftCard()
		} else {
			if (index == 0 && active.value == index) {
				useStore().setSplitLeft(0, !useStore().screenDoms[0].hideSplitLeft)
			}
		}

		if (item.isCard) {
			activeCard.value = index
			showLeftCard.value = true
		} else {
			active.value = index
		}
	}

	const hideLeftCard = (event?: MouseEvent) => {
		// 如果点击的元素不在卡片内部，才执行隐藏逻辑
		if (event) {
			const notInLeftCard = leftCard.value && !leftCard.value.contains(event.target as Node)
			const el = (leftMenu.value as any)?.$el as HTMLElement
			const notInLeftMenu = el && !el.contains(event.target as Node)
			if (!(notInLeftMenu && notInLeftCard)) return
		}
		if (showLeftCard.value) {
			showLeftCard.value = false
			setTimeout(() => {
				activeCard.value = -1
			}, 200)
		}
	}

	watch(
		() => useStore().isH5,
		(val, old) => {
			// 从H5切换到web的时候需要重新加载首页
			if (old && !val && menus.value) {
				menuHandler(menus.value[0], 0)
			}
		}
	)

	watch(
		() => useAccountStore().currentAccount?.accountId,
		val => {
			useNuxtApp().$dkws.reconnect(useAccountStore().currentAccount?.accountId)
		}
	)

	onMounted(() => {
		nextTick(()=>{
			// 监听点击事件
			leftCardBg.value && leftCardBg.value.addEventListener('click', hideLeftCard)
		})
	})

	onBeforeUnmount(() => {
		leftCardBg.value && leftCardBg.value.removeEventListener('click', hideLeftCard)
	})
</script>
<template>
	<div class="main-web main-container flex justify-between flex-row w-full h-full" v-if="!useStore().isH5 || !useNuxtApp().$isMobile.value">
		<LeftMenu @menuHandler="menuHandler" :menus="menus" v-if="menus" :active="activeCardMenu ? activeCard : active" class="z-[999999]" ref="leftMenu"></LeftMenu>
		<!-- 使用缓存 -->
		<div class="right-container">
			<KeepAlive>
				<component :is="activeMenu.contentComp" v-if="activeMenu" :key="activeMenu.name" v-bind="activeMenu.contentParams" />
			</KeepAlive>
		</div>
		<!-- 弹出菜单 -->
		<div
			class="left-card"
			ref="leftCard"
			:style="[showLeftCard ? 'transform: translateX(var(--menu-width));' : 'transform: translateX(-100%);', activeCardMenu?.cardWidth ? 'width:' + activeCardMenu?.cardWidth + 'px' : '']"
		>
			<KeepAlive>
				<component :is="activeCardMenu.contentComp" v-if="activeCardMenu" :key="activeCardMenu.name" v-bind="activeCardMenu.contentParams" />
			</KeepAlive>
		</div>
		<div class="left-card-bg" ref="leftCardBg" :style="[showLeftCard ? 'opacity: 1;' : 'opacity: 0;']" v-show="showLeftCard"></div>
	</div>

	<div class="main-h5 main-container flex justify-between flex-row w-full h-full" v-if="useStore().isH5">
		<LeftMenu @menuHandler="menuHandler" :menus="menus5" v-if="menus5" :active="active"></LeftMenu>
		<!-- 使用缓存 -->
		<div class="right-container">
			<KeepAlive>
				<component :is="activeMenuH5.contentComp" v-if="activeMenuH5" :key="activeMenuH5.name"  v-bind="activeMenuH5.contentParams"/>
			</KeepAlive>
		</div>
	</div>

	<Warning />
</template>

<style scoped lang="less">
	.light .main-container {
		&::before {
			background-image: unset;
		}
	}
	.main-container {
		height: calc(var(--body-height) - var(--header-height) - var(--status-bar-height) - var(--title-bar-height) - var(--app-status-bar-height));
		width: var(--body-width);
		position: relative;
		&::before {
			background-image: var(--bg-linear-180);
			// filter: blur(60px);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			z-index: -1;
			opacity: 0.15;
		}
		.right-container {
			width: calc(var(--body-width) - var(--menu-width));
		}
		.left-card {
			border-right: 1px solid var(--transparent10);
			background: rgb(var(--color-bg-base));
			z-index: 100000;
			position: absolute;
			left: 0;
			top: 0;
			min-width: 200px;
			height: 100%;
			transition: all 0.2s ease-in-out;
			transform: translateX(-100%);
		}
		.left-card-bg {
			background: rgba(0, 0, 0, 0.3);
			z-index: 10000;
			position: absolute;
			left: var(--menu-width);
			top: 0;
			width: 100%;
			height: 100%;
			opacity: 0;
		}
	}

	.main-h5 {
		display: none;
	}

	@media (max-width: 999px) {
		.main-h5 {
			display: flex;
		}
		.main-web {
			display: none;
		}
		.main-container {
			height: var(--body-height);
			width: 100%;
			.right-container {
				width: 100%;
			}
		}
	}
</style>
