<script lang="ts" setup>
	import { usePush } from '~/composable/usePush'
	import MeIndex from '~/pages/me/index.vue'
	import { useSymbolStore } from '~/store/symbol'
	import { useStore } from '~/store'
	import SymbolSearch from '~/components/symbol/SymbolSearch.vue'
import Notification from './me/notification.vue'
	let push = usePush()
	function pushSearch() {
		push(SymbolSearch, {})
	}
	function pushMe() {
		push(MeIndex, {})
	}
    function pushNotification(){
        push(Notification)
    }
	onMounted(() => {})
</script>
<template>
	<div class="w-full h-full">
		<NavigationBar :hideBack="true">
			<template #left>
				<div class="flex items-center w-full">
					<button @click="pushMe" class="mx-4"><MenuIcon class="w-6 h-6 text-brand" /></button>
					<div class="search-container flex w-full" @click="pushSearch">
						<div ref="search" class="glass flex-1 search-enter bg-[--transparent05] rounded-md overflow-hidden flex items-center justify-between text-grey text-sm h-8 m-3 mx-0 px-3">
							<span class="flex items-center leading-none pr-3"><HotIcon class="w-4 mr-2" />BTC/USDT</span>
							<el-icon class="!w-4 !h-4 !text-main"><Search class="!w-4 !h-4" /></el-icon>
						</div>
					</div>
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
            <LoginCard/>
        </ScrollBar>
		
        
	</div>
</template>
