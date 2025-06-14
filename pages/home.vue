<script lang="ts" setup>
	import { usePush, useWillAppear, useWillDisappear } from '~/composable/usePush'
	import MeIndex from '~/pages/me/index.vue'
	import { useSymbolStore } from '~/store/symbol'
	import { useStore } from '~/store'
	import SymbolSearch from '~/components/symbol/SymbolSearch.vue'
	import Notification from './me/notification.vue'
	const subSymbolCodes = ref(["BTC-USDT","ETH-USDT","OKB-USDT"])
	let push = usePush()
	function pushSearch() {
		push(SymbolSearch, {})
	}
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

	onActivated(() => {
        console.log('home onActivated....')
		subSymbols()
	})
	onDeactivated(() => {
        console.log('home onDeactivated....')
		unSubSymbols()
	})

	onBeforeUnmount(() => {
		unSubSymbols()
	})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar :hideBack="true">
			<template #left>
				<div class="flex items-center w-full">
					<button @click="pushMe" class="mx-4"><MenuIcon class="w-6 h-6 text-brand" /></button>
					<SymbolSearchBar/>
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
		<ScrollBar class="w-full h-full" :wrap-style="{ height: 'calc(var(--body-height) - var(--nav-height))' }" :always="false">
			<LoginCard />
			<SymbolCards/>
            <MarketSentiment/>
		</ScrollBar>
	</div>
</template>
