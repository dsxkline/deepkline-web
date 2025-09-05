<script setup lang="ts">
	import AppStatusBar from '~/components/app/AppStatusBar.vue'
import MacTitleBar from '~/components/mac/MacTitleBar.vue'
	import WinTitleBar from '~/components/win/WinTitleBar.vue'
	import { useStore } from '~/store'
	const isStartup = ref(false)
</script>
<template>
	<div class="app-container flex flex-col justify-between w-full h-full">
		<WinTitleBar v-if="useNuxtApp().$config.public.MODE == 'win'" />
		<MacTitleBar v-if="useNuxtApp().$config.public.MODE == 'mac'" />
		
		<Header />
		<slot v-if="!useStore().unload" />
		<StatusBar v-if="!useStore().unload" />
	</div>
</template>

<style lang="less" scoped>
	@media (max-width: 999px) {
		.app-container {
			.header {
				display: none;
			}
			.status-bar {
				display: none;
			}
		}
	}
</style>
