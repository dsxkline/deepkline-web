<script lang="ts" setup>
	import { useActivated, useDeactivated, usePush, useRefreshChildEvent, useWillAppear, useWillDisappear } from '~/composable/usePush'
	import MeIndex from '~/pages/me/index.vue'
	import { useSymbolStore } from '~/store/symbol'
	import { useUserStore } from '~/store/user'
	import Notification from './me/notification.vue'
	import { useAccountStore } from '~/store/account'
	const subSymbolCodes = ref(['BTC-USDT', 'ETH-USDT', 'OKB-USDT'])
	let push = usePush()
	function pushMe() {
		push(MeIndex, {})
	}
	function pushNotification() {
		push(Notification)
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

	onMounted(() => {
		subSymbols()
	})

	useWillDisappear(() => {
		console.log('home useWillDisappear....')
		unSubSymbols()
	})
	useWillAppear(() => {
		console.log('home useWillAppear....')
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
		<NavigationBar :hideBack="true">
			<template #left>
				<div class="flex items-center w-full">
					<button @click="pushMe" class="mx-4"><MenuIcon class="w-6 h-6 text-brand" /></button>
					<SymbolSearchBar />
				</div>
			</template>
			<template #right>
				<div class="flex items-center px-2 *:flex *:items-center *:justify-center *:h-10">
					<button class="px-2"><CustomerServiceIcon class="w-5 h-5 text-main" /></button>
					<button class="px-2" @click="pushNotification">
						<el-icon class="!w-6 !h-6 text-main"><Bell class="!w-6 !h-6" /></el-icon>
					</button>
				</div>
			</template>
		</NavigationBar>
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height) - var(--menu-height) - var(--safe-bottom))' }" :always="false">
			<div :style="{ minHeight: 'calc(var(--body-height) - var(--nav-height)  - var(--menu-height) - var(--safe-bottom) + 1px)' }">
				<LoginCard v-if="!useAccountStore().accounts?.length" :title="'连接全球顶尖经纪商'" :desc="'实战才是检验真理的唯一标准'" />
				<SymbolCards />
				<MarketSentiment />
				<MarketCategories />
				<MarketVolatility />
			</div>
		</ScrollBar>
	</div>
</template>
