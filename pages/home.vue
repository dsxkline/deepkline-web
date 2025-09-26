<script lang="ts" setup>
	import { useActivated, useDeactivated, usePush, usePushUp, useRefreshChildEvent, useWillAppear, useWillDisappear } from '~/composable/usePush'
	import MeIndex from '~/pages/me/index.vue'
	import { useSymbolStore } from '~/store/symbol'
	import { useUserStore } from '~/store/user'
	import Notification from './me/notification.vue'
	import { useAccountStore } from '~/store/account'
	import FundCard from '~/components/account/FundCard.vue'
	import { useCurrentPageSubSymbols } from '~/composable/usePageSubSymbols'
	import HotSector from '~/components/sector/HotSector.vue'
	import LoginIndex from './login/index.vue'
	const {t} = useI18n()
	const subSymbolCodes = ref(['BTC-USDT', 'ETH-USDT', 'OKB-USDT'])
	let push = usePush()
	let pushUp = usePushUp()
	const badge = computed(() => useUserStore().unRead?.total || 0)
	function pushMe() {
		push(MeIndex, {})
	}
	

	let subHandle = ''
	function subSymbols() {
		const { $wsb, $ws } = useNuxtApp()
		if (!subSymbolCodes.value?.length) return
		useSymbolStore().setSubSymbols(subSymbolCodes.value)
		subHandle = $ws.subTickers(subSymbolCodes.value, (message, error) => {
			if (message.data)
				message.data.forEach(item => {
					$ws.setTickers(item.instId, item)
				})
		})
	}

	function unSubSymbols() {
		const { $wsb, $ws } = useNuxtApp()
		if (subHandle) {
			$ws.unsubscribe(subHandle)
		}
	}

	const pageSubSymbols = useCurrentPageSubSymbols().subSymbols
	watch(
		() => pageSubSymbols.value,
		val => {
			// console.log('订阅首页的品种变动', val)
			subSymbolCodes.value = val
			unSubSymbols()
			subSymbols()
		},
		{ deep: true }
	)

	function pushNotification() {
		if (!useUserStore().user) {
			pushUp(LoginIndex,{},'100%')
			return
		}
		push(Notification)
	}

	function pushChat() {
		if (!useUserStore().user) {
			pushUp(LoginIndex,{},'100%')
			return
		}
		push(Notification)
	}

	onMounted(() => {
		subSymbols()
	})

	useWillDisappear(() => {
		//console.log('home useWillDisappear....')
		unSubSymbols()
	})
	useWillAppear(() => {
		//console.log('home useWillAppear....')
		subSymbols()
	})

	onBeforeUnmount(() => {
		unSubSymbols()
	})

	defineExpose({
		...useRefreshChildEvent()
	})
</script>
<template>
	<div class="w-full h-full">
		<AppStatusBar />
		<NavigationBar :hideBack="true">
			<template #left>
				<div class="flex items-center w-full">
					<button @click="pushMe" class="mx-4"><MenuIcon class="w-6 h-6 text-brand" /></button>
					<SymbolSearchBar />
				</div>
			</template>
			<template #right>
				<div class="flex items-center px-2 *:flex *:items-center *:justify-center *:h-10">
					<button class="px-2"><CustomerServiceIcon class="w-5 h-5 text-main" @click="pushChat"/></button>
					<button class="px-2 relative" @click="pushNotification">
						<el-icon class="!w-6 !h-6 text-main"><Bell class="!w-6 !h-6" /></el-icon>
						<template v-if="badge">
							<div class="text-xs rounded-full bg-red text-white px-1 h-4 min-w-4 flex items-center leading-normal justify-center absolute right-1 top-1">{{ badge > 99 ? '99+' : badge }}</div>
						</template>
					</button>
				</div>
			</template>
		</NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--menu-height) - var(--safe-bottom) - var(--app-status-bar-height))' }" :always="false">
			<div :style="{ minHeight: 'calc(var(--body-height) - var(--nav-height)  - var(--menu-height) - var(--safe-bottom) - var(--app-status-bar-height) + 1px)' }">
				<LoginCard v-if="!useAccountStore().accounts?.length" :title="t('连接全球顶尖经纪商')" :desc="t('实战才是检验真理的唯一标准')" />
				<FundCard :account="useAccountStore().currentAccount" size="small" v-else class="mb-2" />
				<SymbolCards />
				<MarketSentiment />
				<HotSector />
				<MarketVolatility />
			</div>
		</ScrollBar>
	</div>
</template>
